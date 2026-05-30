import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage from "@/lib/storage";

const SYSTEM_PROMPT_CHAT = `你是云平台开发前期准备助手。你精通B端SaaS平台开发、云平台架构设计、前后端分离项目开发流程。

你的职责：
1. 解答用户关于云平台开发前期准备的问题
2. 基于提供的文档内容给出针对性建议
3. 帮助梳理开发计划、风险评估、技术选型
4. 对未确认的接口/功能提供专业建议

回答要求：
- 用中文回答
- 专业、简洁、有实操性
- 如果文档中有相关信息，优先引用
- 如果涉及不确定的内容，明确标注"需确认"`;

export async function POST(request: NextRequest) {
  try {
    const { docId, messages: chatMessages } = await request.json();
    if (!chatMessages || !Array.isArray(chatMessages)) {
      return new Response(JSON.stringify({ error: "缺少messages" }), { status: 400 });
    }

    let documentContext = "";
    if (docId) {
      try {
        const listResult = await storage.listFiles({ prefix: "documents/", maxKeys: 100 });
        const docKey = listResult.keys.find((k: string) => k.includes(docId));
        if (docKey) {
          const docBuffer = await storage.readFile({ fileKey: docKey });
          const docData = JSON.parse(docBuffer.toString("utf-8"));
          documentContext = docData.content;
        }
      } catch {
        // Document not found, continue without context
      }
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const systemContent = documentContext
      ? `${SYSTEM_PROMPT_CHAT}\n\n以下是需要分析的文档内容（请基于此回答用户问题）：\n\n${documentContext}`
      : SYSTEM_PROMPT_CHAT;

    const messages: Message[] = [
      { role: "system", content: systemContent },
      ...chatMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-pro-260215",
      temperature: 0.7,
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
    const message = error instanceof Error ? error.message : "问答失败";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
