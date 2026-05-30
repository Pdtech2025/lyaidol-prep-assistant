import { NextRequest, NextResponse } from "next/server";
import storage, { findDocById } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await findDocById(id);

    if (!entry) {
      return NextResponse.json({ error: "文档不存在" }, { status: 404 });
    }

    const buffer = await storage.readFile({ fileKey: entry.key });
    const data = JSON.parse(buffer.toString("utf-8"));

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "加载文档失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
