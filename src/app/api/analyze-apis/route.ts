import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage, { findDocById } from "@/lib/storage";

const SYSTEM_PROMPT_API_TRACKER = `你是云平台API接口分析专家。请对提供的开发文档中的所有API接口进行系统分析，输出以下JSON格式（不要输出其他文字，只输出JSON）：
{
  "apiGroups": [
    {
      "group": "分组名称",
      "baseUrl": "基础路径",
      "apis": [
        {
          "method": "GET/POST/PUT/DELETE",
          "path": "/api/xxx",
          "description": "接口描述",
          "status": "confirmed/pending",
          "params": ["参数列表（推测）"],
          "responseFields": ["返回字段（推测）"],
          "notes": "补充说明"
        }
      ]
    }
  ],
  "statistics": {
    "total": 0,
    "confirmed": 0,
    "pending": 0,
    "byMethod": {"GET": 0, "POST": 0, "PUT": 0, "DELETE": 0}
  },
  "pendingItems": [
    {"path": "/api/xxx", "question": "需要确认的问题"}
  ]
}`;

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
      { role: "system", content: SYSTEM_PROMPT_API_TRACKER },
      { role: "user", content: `请分析以下云平台开发文档中的所有API接口：\n\n${docData.content}` },
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
