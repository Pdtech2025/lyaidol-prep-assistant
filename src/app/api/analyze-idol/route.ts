import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils, type Message } from "coze-coding-dev-sdk";
import storage from "@/lib/storage";

const SYSTEM_PROMPT_IDOL = `你是智能idol（虚拟数字人）系统架构专家。请对提供的开发文档中关于智能idol配置中心的内容进行专项分析，输出以下JSON格式（不要输出其他文字，只输出JSON）：
{
  "idolConfig": {
    "llmIntegration": {
      "status": "已确认/待确认",
      "models": ["需要对接的模型列表"],
      "prepSteps": ["准备步骤"]
    },
    "agentManagement": {
      "features": ["人设管理", "多语言", "提示词风格"],
      "prepSteps": ["准备步骤"]
    },
    "figureManagement": {
      "states": ["进场", "聆听", "说话", "互动", "待机", "离场"],
      "videoFormat": "mjpeg说明",
      "emotionZones": ["热区说明"],
      "prepSteps": ["准备步骤"]
    },
    "voiceManagement": {
      "features": ["声纹定制", "TTS配置"],
      "speakers": ["预设音色列表"],
      "prepSteps": ["准备步骤"]
    },
    "knowledgeBase": {
      "types": ["文档型", "QA问答型"],
      "prepSteps": ["准备步骤"]
    },
    "conversationHistory": {
      "scope": "租户级/设备级",
      "prepSteps": ["准备步骤"]
    },
    "associationModel": {
      "description": "角色+形象+声纹+知识库关联封装说明",
      "prepSteps": ["准备步骤"]
    }
  },
  "criticalItems": ["关键待确认项"],
  "recommendedOrder": ["建议开发顺序"]
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
      { role: "system", content: SYSTEM_PROMPT_IDOL },
      { role: "user", content: `请分析以下文档中关于智能idol配置中心的完整内容：\n\n${docData.content}` },
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
