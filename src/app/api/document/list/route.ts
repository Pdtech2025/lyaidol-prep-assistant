import { NextResponse } from "next/server";
import { getDocIndex } from "@/lib/storage";

export async function GET() {
  try {
    const index = await getDocIndex();
    const documents = index.map((entry) => ({
      id: entry.id,
      title: entry.title,
      source: entry.source,
      createdAt: entry.createdAt,
    }));

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取文档列表失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
