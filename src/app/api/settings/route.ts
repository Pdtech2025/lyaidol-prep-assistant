import { NextRequest, NextResponse } from "next/server";
import storage from "@/lib/storage";
import { DEFAULT_SETTINGS } from "@/lib/types";

const SETTINGS_KEY = "settings/app-settings.json";

export async function GET() {
  try {
    const listResult = await storage.listFiles({ prefix: "settings/", maxKeys: 10 });
    const settingsKey = listResult.keys.find((k: string) => k.includes("app-settings"));

    if (!settingsKey) {
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const buffer = await storage.readFile({ fileKey: settingsKey });
    const data = JSON.parse(buffer.toString("utf-8"));
    return NextResponse.json({ ...DEFAULT_SETTINGS, ...data });
  } catch {
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json();

    const key = await storage.uploadFile({
      fileContent: Buffer.from(JSON.stringify(settings), "utf-8"),
      fileName: SETTINGS_KEY,
      contentType: "application/json",
    });

    return NextResponse.json({ success: true, key });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "保存设置失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
