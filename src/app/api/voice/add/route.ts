import { NextRequest, NextResponse } from "next/server";
import storage from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { speakerId, name, tags, description, sampleAudioBase64 } = await request.json();
    if (!speakerId || !name) {
      return NextResponse.json({ error: "缺少speakerId或name" }, { status: 400 });
    }

    const voiceId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const voiceData: {
      id: string;
      speakerId: string;
      name: string;
      category: string;
      type: "custom";
      tags: string[];
      description: string;
      createdAt: string;
      sampleUrl?: string;
    } = {
      id: voiceId,
      speakerId,
      name,
      category: "自定义",
      type: "custom" as const,
      tags: tags || [],
      description: description || "",
      createdAt: new Date().toISOString(),
    };

    // Upload sample audio if provided
    if (sampleAudioBase64) {
      const sampleKey = await storage.uploadFile({
        fileContent: Buffer.from(sampleAudioBase64, "base64"),
        fileName: `voice-samples/${voiceId}.mp3`,
        contentType: "audio/mp3",
      });
      voiceData.sampleUrl = sampleKey;
    }

    const key = await storage.uploadFile({
      fileContent: Buffer.from(JSON.stringify(voiceData), "utf-8"),
      fileName: `voice-library/${voiceId}.json`,
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, voiceId, storageKey: key });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "添加音色失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
