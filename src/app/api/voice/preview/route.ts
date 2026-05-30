import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { speakerId, text } = await request.json();
    if (!speakerId) {
      return NextResponse.json({ error: "缺少speakerId" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const previewText = text || "你好，这是音色试听效果。欢迎使用云平台开发准备助手。";

    const response = await client.synthesize({
      uid: `preview_${Date.now()}`,
      text: previewText,
      speaker: speakerId,
      audioFormat: "mp3",
      sampleRate: 24000,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "音色试听失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
