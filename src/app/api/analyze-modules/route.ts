import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage from "@/lib/storage";

const SYSTEM_PROMPT_MODULES = `你是B端云平台架构分析专家。请对提供的开发文档进行模块级分析，按以下JSON格式输出（不要输出其他文字，只输出JSON）：
{
  "modules": [
    {
      "name": "模块名称",
      "description": "一句话描述",
      "features": ["功能1", "功能2"],
      "apiCount": 0,
      "priority": "high/medium/low",
      "dependencies": ["依赖的其他模块"],
      "risks": ["风险点"],
      "prepItems": ["准备工作1", "准备工作2"]
    }
  ],
  "summary": {
    "totalModules": 0,
    "totalFeatures": 0,
    "highPriority": 0,
    "estimatedEffort": "预估工作量描述"
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const { docId } = await request.json();
    if (!docId) {
      return new Response(JSON.stringify({ error: "缺少docId" }), { status: 400 });
    }

    const listResult = await storage.listFiles({ prefix: "documents/", maxKeys: 100 });
    const docKey = listResult.keys.find((k: string) => k.includes(docId));
    if (!docKey) {
      return new Response(JSON.stringify({ error: "文档不存在" }), { status: 404 });
    }

    const docBuffer = await storage.readFile({ fileKey: docKey });
    const docData = JSON.parse(docBuffer.toString("utf-8"));

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT_MODULES },
      { role: "user", content: `请分析以下云平台开发文档的模块结构：\n\n${docData.content}` },
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.2,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk.content.toString() })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        } catch (err: unknown) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" },
    });
  } catch (error: unknown) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "分析失败" }), { status: 500 });
  }
}
