import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage from "@/lib/storage";

const SYSTEM_PROMPT_SUMMARIZE = `你是云平台开发文档分析专家。请对提供的开发文档进行智能摘要提取，按以下结构输出：

## 项目概览
- 项目名称与定位
- 技术架构一句话总结

## 数据模型
- 核心实体及关系（文字描述）

## API统计
- 按模块分组的接口数量统计
- 已确认/待确认接口比例

## 关键发现
- 文档中最关键的设计决策（3-5条）
- 潜在风险点或需要确认的事项

## 待确认项清单
- 列出所有标记为待确认的接口/功能

请用中文输出，简洁专业，突出重点。`;

export async function POST(request: NextRequest) {
  try {
    const { docId } = await request.json();
    if (!docId) {
      return new Response(JSON.stringify({ error: "缺少docId" }), { status: 400 });
    }

    // Load document from S3
    const listResult = await storage.listFiles({ prefix: "documents/", maxKeys: 100 });
    const docKey = listResult.keys.find((k: string) => k.includes(docId));
    if (!docKey) {
      return new Response(JSON.stringify({ error: "文档不存在" }), { status: 404 });
    }

    const docBuffer = await storage.readFile({ fileKey: docKey });
    const docData = JSON.parse(docBuffer.toString("utf-8"));
    const documentContent = docData.content;

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT_SUMMARIZE },
      { role: "user", content: `请分析以下云平台开发文档并提取摘要：\n\n${documentContent}` },
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "摘要生成失败";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
