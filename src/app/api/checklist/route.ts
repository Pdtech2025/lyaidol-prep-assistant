import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage, { findDocById } from "@/lib/storage";

const SYSTEM_PROMPT_CHECKLIST = `你是云平台开发前期准备专家。根据提供的开发文档，生成结构化的准备工作清单。

你必须严格按照以下JSON格式输出（不要输出任何其他文字，只输出JSON）：
{
  "groups": [
    {
      "title": "分组名称",
      "tasks": [
        {"id": "t1", "content": "任务描述", "priority": "high", "checked": false},
        {"id": "t2", "content": "任务描述", "priority": "medium", "checked": false}
      ]
    }
  ]
}

分组建议（可根据文档内容调整）：
1. 环境搭建 - 项目初始化、依赖安装、开发环境配置
2. 后端对接 - API Base URL、认证流程、通用请求封装
3. 数据模型设计 - 数据库表设计、实体关系梳理
4. API接口梳理 - 按模块分批开发计划
5. 页面开发 - 布局框架、各功能模块页面
6. 智能idol配置 - 大模型对接、形象管理、声纹定制
7. 语音能力 - TTS/ASR集成、音色管理
8. 待确认项追访 - 所有待确认接口/功能的追访计划

优先级：high(必须先做) / medium(重要但不阻塞) / low(可后续补充)
每个分组至少2个任务，总数不少于15个。`;

export async function POST(request: NextRequest) {
  try {
    const { docId } = await request.json();
    if (!docId) {
      return new Response(JSON.stringify({ error: "缺少docId" }), { status: 400 });
    }

    const entry = await findDocById(docId);
    if (!entry) {
      return new Response(JSON.stringify({ error: "文档不存在" }), { status: 404 });
    }

    const docBuffer = await storage.readFile({ fileKey: entry.key });
    const docData = JSON.parse(docBuffer.toString("utf-8"));

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT_CHECKLIST },
      { role: "user", content: `请根据以下云平台开发文档生成准备工作清单：\n\n${docData.content}` },
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
    const message = error instanceof Error ? error.message : "清单生成失败";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
