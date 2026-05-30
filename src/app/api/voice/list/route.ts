import { NextRequest, NextResponse } from "next/server";
import { PRESET_VOICES, VoiceItem } from "@/lib/types";
import storage from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    const voices: VoiceItem[] = [...PRESET_VOICES];

    // Load custom voices from S3
    if (type === "custom" || type === "all" || !type) {
      try {
        const listResult = await storage.listFiles({ prefix: "voice-library/", maxKeys: 100 });
        for (const key of listResult.keys) {
          const buffer = await storage.readFile({ fileKey: key });
          const voiceData = JSON.parse(buffer.toString("utf-8"));
          voices.push(voiceData);
        }
      } catch {
        // No custom voices yet
      }
    }

    const filtered = type === "preset" ? voices.filter((v) => v.type === "preset")
      : type === "custom" ? voices.filter((v) => v.type === "custom")
      : voices;

    return NextResponse.json({ voices: filtered });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取音色列表失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
