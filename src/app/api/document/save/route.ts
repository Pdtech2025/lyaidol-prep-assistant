import { NextRequest, NextResponse } from "next/server";
import storage from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { title, content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: "缺少content" }, { status: 400 });
    }

    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const docData = {
      id,
      title: title || "手动保存文档",
      content,
      source: "manual",
      stats: {
        totalLines: content.split("\n").length,
        totalChars: content.length,
      },
      createdAt: new Date().toISOString(),
    };

    const key = await storage.uploadFile({
      fileContent: Buffer.from(JSON.stringify(docData), "utf-8"),
      fileName: `documents/${id}.json`,
      contentType: "application/json",
    });

    return NextResponse.json({ docId: id, key });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "保存失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
