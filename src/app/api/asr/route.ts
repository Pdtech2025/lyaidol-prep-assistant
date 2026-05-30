import { NextRequest, NextResponse } from "next/server";
import { ASRClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

export async function POST(request: NextRequest) {
  try {
    const { audioData, audioUrl } = await request.json();
    if (!audioData && !audioUrl) {
      return NextResponse.json({ error: "缺少audioData或audioUrl" }, { status: 400 });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new ASRClient(config, customHeaders);

    const result = await client.recognize({
      uid: `user_${Date.now()}`,
      ...(audioUrl ? { url: audioUrl } : { base64Data: audioData }),
    });

    return NextResponse.json({
      text: result.text,
      duration: result.duration,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ASR识别失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
