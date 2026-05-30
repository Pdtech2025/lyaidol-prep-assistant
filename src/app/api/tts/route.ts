import { NextRequest, NextResponse } from "next/server";
import { TTSClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { text, speaker, speechRate, loudnessRate, audioFormat, sampleRate } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "缺少text参数" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new TTSClient(config, customHeaders);

    const response = await client.synthesize({
      uid: `user_${Date.now()}`,
      text,
      speaker: speaker || "zh_female_xiaohe_uranus_bigtts",
      audioFormat: audioFormat || "mp3",
      sampleRate: sampleRate || 24000,
      speechRate: speechRate ?? 0,
      loudnessRate: loudnessRate ?? 0,
    });

    return NextResponse.json({
      audioUri: response.audioUri,
      audioSize: response.audioSize,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "TTS合成失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
