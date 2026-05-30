import { NextResponse } from "next/server";
import storage from "@/lib/storage";

export async function GET() {
  try {
    const listResult = await storage.listFiles({ prefix: "documents/", maxKeys: 100 });
    const documents = [];

    for (const key of listResult.keys) {
      try {
        const buffer = await storage.readFile({ fileKey: key });
        const data = JSON.parse(buffer.toString("utf-8"));
        documents.push({
          id: data.id,
          title: data.title,
          source: data.source,
          stats: data.stats,
          createdAt: data.createdAt,
        });
      } catch {
        // Skip corrupted files
      }
    }

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取文档列表失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
