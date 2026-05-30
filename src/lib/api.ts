const BASE = "";

export async function fetchDocumentByUrl(url: string) {
  const res = await fetch(`${BASE}/api/fetch-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return res.json();
}

export async function fetchDocumentByContent(content: string, title?: string) {
  const res = await fetch(`${BASE}/api/fetch-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, title }),
  });
  return res.json();
}

export async function listDocuments() {
  const res = await fetch(`${BASE}/api/document/list`);
  return res.json();
}

export async function getDocument(id: string) {
  const res = await fetch(`${BASE}/api/document/${id}`);
  return res.json();
}

export async function saveDocument(title: string, content: string) {
  const res = await fetch(`${BASE}/api/document/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  return res.json();
}

export async function getSettings() {
  const res = await fetch(`${BASE}/api/settings`);
  return res.json();
}

export async function saveSettings(settings: Record<string, unknown>) {
  const res = await fetch(`${BASE}/api/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  return res.json();
}

export async function listVoices(type?: string) {
  const res = await fetch(`${BASE}/api/voice/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: type || "all" }),
  });
  return res.json();
}

export async function addVoice(data: { speakerId: string; name: string; tags?: string[]; description?: string; sampleAudioBase64?: string }) {
  const res = await fetch(`${BASE}/api/voice/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function previewVoice(speakerId: string, text?: string) {
  const res = await fetch(`${BASE}/api/voice/preview`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ speakerId, text: text || "你好，这是音色试听效果" }),
  });
  return res.json();
}

export async function synthesizeSpeech(text: string, speaker?: string, speechRate?: number, loudnessRate?: number) {
  const res = await fetch(`${BASE}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, speaker, speechRate, loudnessRate }),
  });
  return res.json();
}

export async function recognizeSpeech(audioData: string) {
  const res = await fetch(`${BASE}/api/asr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioData }),
  });
  return res.json();
}
