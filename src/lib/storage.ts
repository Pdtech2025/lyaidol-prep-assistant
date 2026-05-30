import { S3Storage } from "coze-coding-dev-sdk";

const storage = new S3Storage({
  endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
  accessKey: "",
  secretKey: "",
  bucketName: process.env.COZE_BUCKET_NAME,
  region: "cn-beijing",
});

export default storage;

/** Key-based index for document lookup. Stored as JSON files in S3. */
const INDEX_PREFIX = "documents/index";

interface DocIndexEntry {
  id: string;
  key: string;
  title: string;
  source: string;
  createdAt: string;
}

async function loadIndex(): Promise<DocIndexEntry[]> {
  try {
    const listResult = await storage.listFiles({ prefix: INDEX_PREFIX, maxKeys: 10 });
    if (listResult.keys.length === 0) return [];

    // Use the latest index file (last in sorted order)
    const latestKey = listResult.keys[listResult.keys.length - 1];
    const buf = await storage.readFile({ fileKey: latestKey });
    return JSON.parse(buf.toString("utf-8"));
  } catch {
    return [];
  }
}

async function saveIndex(index: DocIndexEntry[]): Promise<void> {
  // Delete old index files
  const listResult = await storage.listFiles({ prefix: INDEX_PREFIX, maxKeys: 10 });
  for (const key of listResult.keys) {
    await storage.deleteFile({ fileKey: key }).catch(() => {});
  }

  // Upload new index
  await storage.uploadFile({
    fileContent: Buffer.from(JSON.stringify(index), "utf-8"),
    fileName: "documents/index.json",
    contentType: "application/json",
  });
}

export async function addDocToIndex(entry: DocIndexEntry): Promise<void> {
  const index = await loadIndex();
  // Remove any existing entry with the same id
  const filtered = index.filter((e) => e.id !== entry.id);
  filtered.push(entry);
  await saveIndex(filtered);
}

export async function getDocIndex(): Promise<DocIndexEntry[]> {
  return loadIndex();
}

export async function findDocById(id: string): Promise<DocIndexEntry | undefined> {
  const index = await loadIndex();
  return index.find((e) => e.id === id);
}
