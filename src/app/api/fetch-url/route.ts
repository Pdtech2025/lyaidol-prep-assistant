import { NextRequest, NextResponse } from "next/server";
import { FetchClient, Config, HeaderUtils, type FetchContentItem } from "coze-coding-dev-sdk";
import storage, { addDocToIndex } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, content: pastedContent, title: customTitle } = body;

    let content = pastedContent || "";
    let title = customTitle || "未命名文档";
    let source = "paste" as "url" | "paste";

    if (url && !pastedContent) {
      source = "url";
      const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
      const config = new Config();
      const client = new FetchClient(config, customHeaders);
      const response = await client.fetch(url);

      content = response.content
        .filter((item: FetchContentItem) => item.type === "text" && item.text)
        .map((item: FetchContentItem) => item.text as string)
        .join("\n");

      title = response.title || customTitle || url.split("/").pop() || "远程文档";
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "文档内容为空" }, { status: 400 });
    }

    const id = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const lines = content.split("\n");
    const modules = (content.match(/^## /gm) || []).length;
    const apis = (content.match(/^(GET|POST|PUT|DELETE|PATCH)\s/im) || []).length;

    const docData = {
      id,
      title,
      content,
      source,
      stats: {
        totalLines: lines.length,
        totalChars: content.length,
        modules,
        apis,
      },
      createdAt: new Date().toISOString(),
    };

    // Auto-save to S3
    const key = await storage.uploadFile({
      fileContent: Buffer.from(JSON.stringify(docData), "utf-8"),
      fileName: `documents/${id}.json`,
      contentType: "application/json",
    });

    // Add to document index
    await addDocToIndex({ id, key, title, source, createdAt: docData.createdAt });

    return NextResponse.json({
      docId: id,
      title,
      content,
      stats: docData.stats,
      storageKey: key,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "文档解析失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
