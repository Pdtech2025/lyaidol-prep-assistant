"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSSEStream } from "@/hooks/use-sse-stream";
import {
  fetchDocumentByUrl,
  fetchDocumentByContent,
  listDocuments,
  getDocument,
  listVoices,
  addVoice,
  previewVoice,
  synthesizeSpeech,
  getSettings,
  saveSettings,
} from "@/lib/api";

// ===================== ICONS =====================
function IconDoc() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
function IconSummary() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7h10" /><path d="M7 12h10" /><path d="M7 17h6" />
    </svg>
  );
}
function IconChecklist() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconVoice() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
function IconModules() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconIdol() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" /><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
    </svg>
  );
}
function IconApi() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconStop() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}
function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function IconChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
function IconMic() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    </svg>
  );
}

// ===================== NAV CONFIG =====================
type ViewKey = "document" | "summary" | "checklist" | "chat" | "voice" | "modules" | "idol" | "api-tracker" | "settings";

interface NavItem {
  key: ViewKey;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { key: "document", label: "文档解析", icon: <IconDoc /> },
  { key: "summary", label: "智能摘要", icon: <IconSummary /> },
  { key: "checklist", label: "准备清单", icon: <IconChecklist /> },
  { key: "chat", label: "AI 问答", icon: <IconChat /> },
  { key: "voice", label: "音色管理", icon: <IconVoice /> },
  { key: "modules", label: "模块矩阵", icon: <IconModules /> },
  { key: "idol", label: "Idol 专项", icon: <IconIdol /> },
  { key: "api-tracker", label: "API 追踪", icon: <IconApi /> },
  { key: "settings", label: "设置", icon: <IconSettings /> },
];

// ===================== SHARED TYPES =====================
interface DocInfo {
  docId: string;
  title: string;
  content: string;
  stats: { totalLines: number; totalChars: number; modules: number; apis: number };
}

// ===================== DOCUMENT PARSE VIEW =====================
function DocumentView({ onDocumentLoaded }: { onDocumentLoaded: (doc: DocInfo) => void }) {
  const [mode, setMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [textContent, setTextContent] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [docList, setDocList] = useState<Array<{ id: string; title: string; createdAt: string }>>([]);
  const [currentDoc, setCurrentDoc] = useState<DocInfo | null>(null);

  useEffect(() => {
    listDocuments().then((data) => {
      if (data.documents) setDocList(data.documents);
    });
  }, []);

  const handleParse = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let result;
      if (mode === "url" && url.trim()) {
        result = await fetchDocumentByUrl(url.trim());
      } else if (mode === "text" && textContent.trim()) {
        result = await fetchDocumentByContent(textContent.trim(), title.trim() || undefined);
      } else {
        setError("请输入URL或粘贴文档内容");
        setLoading(false);
        return;
      }
      if (result.error) {
        setError(result.error);
      } else {
        setCurrentDoc(result);
        onDocumentLoaded(result);
        // Refresh list
        const listData = await listDocuments();
        if (listData.documents) setDocList(listData.documents);
      }
    } catch {
      setError("解析失败，请检查输入");
    }
    setLoading(false);
  }, [mode, url, textContent, title, onDocumentLoaded]);

  const handleLoadDoc = useCallback(async (docId: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await getDocument(docId);
      if (result.error) {
        setError(result.error);
      } else {
        setCurrentDoc(result);
        onDocumentLoaded(result);
      }
    } catch {
      setError("加载文档失败");
    }
    setLoading(false);
  }, [onDocumentLoaded]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-medium text-foreground">文档解析</h2>
        <span className="text-xs text-muted-foreground">输入URL或粘贴文本，自动解析文档结构</span>
      </div>

      {/* Input Area */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMode("url")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            URL 抓取
          </button>
          <button
            onClick={() => setMode("text")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              mode === "text" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            文本粘贴
          </button>
        </div>

        {mode === "url" ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="输入文档URL（支持MD/PDF/Office等格式）"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleParse()}
            />
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文档标题（可选）"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="粘贴文档内容..."
              rows={8}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono resize-y"
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleParse}
            disabled={loading}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "解析中..." : "解析文档"}
          </button>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </div>

      {/* Document Stats */}
      {currentDoc && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">{currentDoc.title}</h3>
          <div className="flex gap-4">
            <span className="text-xs text-muted-foreground">行数: <span className="text-foreground">{currentDoc.stats?.totalLines}</span></span>
            <span className="text-xs text-muted-foreground">字符: <span className="text-foreground">{currentDoc.stats?.totalChars}</span></span>
            <span className="text-xs text-muted-foreground">模块: <span className="text-foreground">{currentDoc.stats?.modules}</span></span>
            <span className="text-xs text-muted-foreground">API: <span className="text-foreground">{currentDoc.stats?.apis}</span></span>
          </div>
          <pre className="text-xs text-muted-foreground bg-background rounded-md p-3 overflow-auto max-h-96 font-mono whitespace-pre-wrap">
            {currentDoc.content?.substring(0, 3000)}
            {currentDoc.content?.length > 3000 && "\n... (内容过长，已截断显示)"}
          </pre>
        </div>
      )}

      {/* Document History */}
      {docList.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          <h3 className="text-sm font-medium text-foreground mb-2">已存文档</h3>
          {docList.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleLoadDoc(doc.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-left transition-colors"
            >
              <span className="text-sm text-foreground">{doc.title}</span>
              <span className="text-xs text-muted-foreground">{doc.createdAt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ===================== SUMMARY VIEW =====================
function SummaryView({ docId, docTitle }: { docId: string | null; docTitle: string | null }) {
  const [content, setContent] = useState("");
  const { isStreaming, startStream, stopStream } = useSSEStream();

  const handleStart = useCallback(() => {
    if (!docId) return;
    setContent("");
    startStream("/api/summarize", { docId }, {
      onChunk: (text) => setContent((prev) => prev + text),
      onError: (err) => setContent((prev) => prev + `\n\n**错误**: ${err}`),
    });
  }, [docId, startStream]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">智能摘要</h2>
          <span className="text-xs text-muted-foreground">
            {docTitle ? `当前文档: ${docTitle}` : "请先解析文档"}
          </span>
        </div>
        <div className="flex gap-2">
          {isStreaming ? (
            <button onClick={stopStream} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white text-xs font-medium">
              <IconStop /> 停止
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!docId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
            >
              生成摘要
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 min-h-[400px]">
        {content ? (
          <div className={`sse-content text-sm text-foreground leading-relaxed ${isStreaming ? "typing-cursor" : ""}`}>
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            {docId ? "点击「生成摘要」开始分析" : "请先在「文档解析」中加载文档"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== CHECKLIST VIEW =====================
interface TaskGroup {
  title: string;
  tasks: Array<{ id: string; content: string; priority: string; checked: boolean }>;
}

function ChecklistView({ docId, docTitle }: { docId: string | null; docTitle: string | null }) {
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [rawContent, setRawContent] = useState("");
  const [parseMode, setParseMode] = useState(false);
  const { isStreaming, startStream, stopStream } = useSSEStream();

  const handleStart = useCallback(() => {
    if (!docId) return;
    setGroups([]);
    setRawContent("");
    setParseMode(false);
    startStream("/api/checklist", { docId }, {
      onChunk: (text) => {
        setRawContent((prev) => prev + text);
      },
      onDone: () => {
        setParseMode(true);
      },
    });
  }, [docId, startStream]);

  // Parse structured JSON from LLM output when stream completes
  useEffect(() => {
    if (!parseMode || !rawContent) return;
    try {
      // Try to extract JSON from the content
      const jsonMatch = rawContent.match(/\{[\s\S]*"groups"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.groups) {
          setGroups(parsed.groups.map((g: TaskGroup, gi: number) => ({
            ...g,
            tasks: g.tasks.map((t: TaskGroup["tasks"][0], ti: number) => ({
              ...t,
              id: t.id || `t${gi}_${ti}`,
              checked: t.checked || false,
            })),
          })));
        }
      }
    } catch {
      // JSON parse failed, show raw content
    }
    setParseMode(false);
  }, [parseMode, rawContent]);

  const toggleTask = useCallback((groupIdx: number, taskIdx: number) => {
    setGroups((prev) => {
      const next = [...prev];
      next[groupIdx] = { ...next[groupIdx], tasks: [...next[groupIdx].tasks] };
      next[groupIdx].tasks[taskIdx] = { ...next[groupIdx].tasks[taskIdx], checked: !next[groupIdx].tasks[taskIdx].checked };
      return next;
    });
  }, []);

  const totalTasks = groups.reduce((sum, g) => sum + g.tasks.length, 0);
  const checkedTasks = groups.reduce((sum, g) => sum + g.tasks.filter((t) => t.checked).length, 0);

  const priorityColor = (p: string) => {
    switch (p) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-green-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">准备清单</h2>
          <span className="text-xs text-muted-foreground">
            {docTitle ? `当前文档: ${docTitle}` : "请先解析文档"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {totalTasks > 0 && (
            <span className="text-xs text-muted-foreground">{checkedTasks}/{totalTasks} 已完成</span>
          )}
          {isStreaming ? (
            <button onClick={stopStream} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white text-xs font-medium">
              <IconStop /> 停止
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={!docId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
            >
              生成清单
            </button>
          )}
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${totalTasks > 0 ? (checkedTasks / totalTasks) * 100 : 0}%` }}
          />
        </div>
      )}

      <div className="space-y-4">
        {groups.map((group, gi) => (
          <div key={gi} className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">{group.title}</h3>
            <div className="space-y-2">
              {group.tasks.map((task, ti) => (
                <label key={task.id} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={task.checked}
                    onChange={() => toggleTask(gi, ti)}
                    className="mt-0.5 rounded border-border"
                  />
                  <span className={`text-sm flex-1 ${task.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {task.content}
                  </span>
                  <span className={`text-xs ${priorityColor(task.priority)}`}>
                    {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {rawContent && groups.length === 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className={`sse-content text-sm text-foreground leading-relaxed ${isStreaming ? "typing-cursor" : ""}`}>
              {rawContent}
            </div>
          </div>
        )}

        {!rawContent && groups.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm rounded-lg border border-border bg-card">
            {docId ? "点击「生成清单」开始分析" : "请先在「文档解析」中加载文档"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== CHAT VIEW =====================
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  audioUri?: string;
}

function ChatView({ docId, docTitle }: { docId: string | null; docTitle: string | null }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [currentResponse, setCurrentResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { isStreaming, startStream, stopStream } = useSSEStream();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentResponse]);

  const handleSend = useCallback(() => {
    if (!input.trim() || !docId) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setCurrentResponse("");

    startStream("/api/chat", {
      docId,
      messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
    }, {
      onChunk: (text) => setCurrentResponse((prev) => prev + text),
      onDone: () => {
        setCurrentResponse((prev) => {
          setMessages((prevMsgs) => [...prevMsgs, { role: "assistant", content: prev }]);
          return "";
        });
      },
      onError: (err) => {
        setMessages((prevMsgs) => [...prevMsgs, { role: "assistant", content: `错误: ${err}` }]);
      },
    });
  }, [input, docId, messages, startStream]);

  const handleSpeak = useCallback(async (text: string) => {
    try {
      const result = await synthesizeSpeech(text);
      if (result.audioUri) {
        const audio = new Audio(result.audioUri);
        audio.play();
      }
    } catch {
      // TTS failed silently
    }
  }, []);

  const handleVoiceInput = useCallback(async () => {
    if (isRecording) return;
    setIsRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const result = await fetch("/api/asr", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioData: base64 }),
            }).then((r) => r.json());
            if (result.text) {
              setInput(result.text);
            }
          } catch {
            // ASR failed silently
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000);
    } catch {
      // Microphone access denied
    }
    setIsRecording(false);
  }, [isRecording]);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-medium text-foreground">AI 问答</h2>
        <span className="text-xs text-muted-foreground">
          {docTitle ? `基于: ${docTitle}` : "请先解析文档"}
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && !currentResponse && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            输入关于文档的问题，AI将基于文档内容回答
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground"
            }`}>
              <div className="sse-content">{msg.content}</div>
              {msg.role === "assistant" && (
                <button
                  onClick={() => handleSpeak(msg.content)}
                  className="mt-1.5 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <IconPlay /> 语音播报
                </button>
              )}
            </div>
          </div>
        ))}
        {currentResponse && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg px-4 py-2.5 text-sm bg-card border border-border text-foreground typing-cursor">
              <div className="sse-content">{currentResponse}</div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <button
          onClick={handleVoiceInput}
          disabled={isRecording || !docId}
          className={`shrink-0 p-2.5 rounded-md border border-border transition-colors ${
            isRecording ? "bg-destructive text-white border-destructive" : "hover:bg-accent text-muted-foreground"
          }`}
          title="语音输入"
        >
          <IconMic />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder={docId ? "输入关于文档的问题..." : "请先解析文档"}
          disabled={!docId || isStreaming}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
        />
        <button
          onClick={isStreaming ? stopStream : handleSend}
          disabled={!docId || (!isStreaming && !input.trim())}
          className={`shrink-0 p-2.5 rounded-md text-white transition-colors disabled:opacity-50 ${
            isStreaming ? "bg-destructive" : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isStreaming ? <IconStop /> : <IconSend />}
        </button>
      </div>
    </div>
  );
}

// ===================== VOICE MANAGEMENT VIEW =====================
function VoiceView() {
  const [voices, setVoices] = useState<Array<{ id: string; speakerId: string; name: string; category: string; type: string; description?: string }>>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ speakerId: "", name: "", tags: "", description: "" });

  useEffect(() => {
    listVoices().then((data) => {
      if (data.voices) setVoices(data.voices);
    });
  }, []);

  const handlePreview = useCallback(async (speakerId: string) => {
    setPreviewLoading(speakerId);
    try {
      const result = await previewVoice(speakerId);
      if (result.audioUri) {
        setPreviewUrl(result.audioUri);
        const audio = new Audio(result.audioUri);
        audio.play();
      }
    } catch {
      // Preview failed
    }
    setPreviewLoading(null);
  }, []);

  const handleAddVoice = useCallback(async () => {
    if (!addForm.speakerId || !addForm.name) return;
    try {
      await addVoice({
        speakerId: addForm.speakerId,
        name: addForm.name,
        tags: addForm.tags ? addForm.tags.split(",").map((t) => t.trim()) : undefined,
        description: addForm.description || undefined,
      });
      setShowAddForm(false);
      setAddForm({ speakerId: "", name: "", tags: "", description: "" });
      // Refresh
      const data = await listVoices();
      if (data.voices) setVoices(data.voices);
    } catch {
      // Add failed
    }
  }, [addForm]);

  const presetVoices = voices.filter((v) => v.type === "preset");
  const customVoices = voices.filter((v) => v.type === "custom");
  const categories = [...new Set(presetVoices.map((v) => v.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">音色管理</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium"
        >
          <IconPlus /> 添加自定义音色
        </button>
      </div>

      {/* Add Custom Voice Form */}
      {showAddForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <h3 className="text-sm font-medium text-foreground">添加自定义音色</h3>
          <p className="text-xs text-muted-foreground">
            在扣子平台完成音色复刻后，将获得的 Speaker ID 填入下方
          </p>
          <input
            type="text"
            value={addForm.speakerId}
            onChange={(e) => setAddForm((f) => ({ ...f, speakerId: e.target.value }))}
            placeholder="Speaker ID（从扣子平台复制）"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <input
            type="text"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="音色名称（如：小美元气）"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <input
            type="text"
            value={addForm.tags}
            onChange={(e) => setAddForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="标签（逗号分隔，如：二次元,温柔）"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
          />
          <textarea
            value={addForm.description}
            onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="音色描述（可选）"
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-y"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddVoice}
              disabled={!addForm.speakerId || !addForm.name}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
            >
              保存
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* Preset Voices by Category */}
      {categories.map((cat) => (
        <div key={cat} className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">{cat}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {presetVoices.filter((v) => v.category === cat).map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between px-3 py-2 rounded-md border border-border hover:bg-accent transition-colors"
              >
                <span className="text-sm text-foreground">{voice.name}</span>
                <button
                  onClick={() => handlePreview(voice.speakerId)}
                  disabled={previewLoading === voice.speakerId}
                  className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary disabled:opacity-50"
                  title="试听"
                >
                  {previewLoading === voice.speakerId ? (
                    <span className="text-xs">...</span>
                  ) : (
                    <IconPlay />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Custom Voices */}
      {customVoices.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="text-sm font-medium text-foreground mb-3">自定义音色</h3>
          <div className="space-y-2">
            {customVoices.map((voice) => (
              <div key={voice.id} className="flex items-center justify-between px-3 py-2 rounded-md border border-border">
                <div>
                  <span className="text-sm text-foreground">{voice.name}</span>
                  {voice.description && <span className="text-xs text-muted-foreground ml-2">{voice.description}</span>}
                </div>
                <button
                  onClick={() => handlePreview(voice.speakerId)}
                  className="p-1 rounded hover:bg-primary/20 text-muted-foreground hover:text-primary"
                  title="试听"
                >
                  <IconPlay />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      {previewUrl && <audio src={previewUrl} className="hidden" />}
    </div>
  );
}

// ===================== MODULE MATRIX VIEW =====================
function ModulesView({ docId }: { docId: string | null }) {
  const [content, setContent] = useState("");
  const { isStreaming, startStream, stopStream } = useSSEStream();

  const handleStart = useCallback(() => {
    if (!docId) return;
    setContent("");
    startStream("/api/analyze-modules", { docId }, {
      onChunk: (text) => setContent((prev) => prev + text),
      onError: (err) => setContent((prev) => prev + `\n\n**错误**: ${err}`),
    });
  }, [docId, startStream]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">模块矩阵</h2>
          <span className="text-xs text-muted-foreground">14个功能模块全景分析</span>
        </div>
        {isStreaming ? (
          <button onClick={stopStream} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white text-xs font-medium">
            <IconStop /> 停止
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!docId}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
          >
            分析模块
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 min-h-[400px]">
        {content ? (
          <div className={`sse-content text-sm text-foreground leading-relaxed ${isStreaming ? "typing-cursor" : ""}`}>
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            {docId ? "点击「分析模块」开始分析14个功能模块的覆盖情况" : "请先在「文档解析」中加载文档"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== IDOL SPECIAL VIEW =====================
function IdolView({ docId }: { docId: string | null }) {
  const [content, setContent] = useState("");
  const { isStreaming, startStream, stopStream } = useSSEStream();

  const handleStart = useCallback(() => {
    if (!docId) return;
    setContent("");
    startStream("/api/analyze-idol", { docId }, {
      onChunk: (text) => setContent((prev) => prev + text),
      onError: (err) => setContent((prev) => prev + `\n\n**错误**: ${err}`),
    });
  }, [docId, startStream]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">Idol 专项准备</h2>
          <span className="text-xs text-muted-foreground">智能idol配置中心30项深度分析</span>
        </div>
        {isStreaming ? (
          <button onClick={stopStream} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white text-xs font-medium">
            <IconStop /> 停止
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!docId}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
          >
            分析 Idol
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 min-h-[400px]">
        {content ? (
          <div className={`sse-content text-sm text-foreground leading-relaxed ${isStreaming ? "typing-cursor" : ""}`}>
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            {docId ? "点击「分析 Idol」开始智能idol配置中心的30项准备分析" : "请先在「文档解析」中加载文档"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== API TRACKER VIEW =====================
function ApiTrackerView({ docId }: { docId: string | null }) {
  const [content, setContent] = useState("");
  const { isStreaming, startStream, stopStream } = useSSEStream();

  const handleStart = useCallback(() => {
    if (!docId) return;
    setContent("");
    startStream("/api/analyze-apis", { docId }, {
      onChunk: (text) => setContent((prev) => prev + text),
      onError: (err) => setContent((prev) => prev + `\n\n**错误**: ${err}`),
    });
  }, [docId, startStream]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-medium text-foreground">API 追踪器</h2>
          <span className="text-xs text-muted-foreground">105个接口确认进度追踪</span>
        </div>
        {isStreaming ? (
          <button onClick={stopStream} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-destructive text-white text-xs font-medium">
            <IconStop /> 停止
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={!docId}
            className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50"
          >
            分析接口
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-4 min-h-[400px]">
        {content ? (
          <div className={`sse-content text-sm text-foreground leading-relaxed ${isStreaming ? "typing-cursor" : ""}`}>
            {content}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            {docId ? "点击「分析接口」开始追踪105个API的确认状态" : "请先在「文档解析」中加载文档"}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== SETTINGS VIEW =====================
function SettingsView() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = useCallback(async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  if (loading) return <div className="text-muted-foreground text-sm">加载配置...</div>;

  const voice = (settings.voice as Record<string, unknown>) || {};
  const backend = (settings.backend as Record<string, unknown>) || {};

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-foreground">设置</h2>

      {/* LLM Config */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-foreground">大模型配置</h3>
        <p className="text-xs text-muted-foreground">默认使用扣子内置SDK，无需手动配置</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">提供方</label>
            <select
              value={String((settings.llm as Record<string, unknown>)?.provider || "builtin")}
              onChange={(e) => setSettings((s) => ({ ...s, llm: { ...(s.llm as Record<string, unknown>), provider: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="builtin">扣子内置SDK</option>
              <option value="openai">OpenAI 兼容</option>
              <option value="custom">自定义</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">模型</label>
            <input
              type="text"
              value={String((settings.llm as Record<string, unknown>)?.model || "doubao-seed-2-0-pro-260215")}
              onChange={(e) => setSettings((s) => ({ ...s, llm: { ...(s.llm as Record<string, unknown>), model: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
        </div>
        {String((settings.llm as Record<string, unknown>)?.provider) !== "builtin" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">API Base URL</label>
              <input
                type="text"
                value={String((settings.llm as Record<string, unknown>)?.baseUrl || "")}
                onChange={(e) => setSettings((s) => ({ ...s, llm: { ...(s.llm as Record<string, unknown>), baseUrl: e.target.value } }))}
                placeholder="https://api.example.com/v1"
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">API Key</label>
              <input
                type="password"
                value={String((settings.llm as Record<string, unknown>)?.apiKey || "")}
                onChange={(e) => setSettings((s) => ({ ...s, llm: { ...(s.llm as Record<string, unknown>), apiKey: e.target.value } }))}
                placeholder="sk-..."
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
              />
            </div>
          </div>
        )}
      </div>

      {/* Voice Config */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-foreground">语音配置</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">默认音色</label>
            <input
              type="text"
              value={String(voice.speaker || "zh_female_xiaohe_uranus_bigtts")}
              onChange={(e) => setSettings((s) => ({ ...s, voice: { ...(s.voice as Record<string, unknown>), speaker: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">音频格式</label>
            <select
              value={String(voice.audioFormat || "mp3")}
              onChange={(e) => setSettings((s) => ({ ...s, voice: { ...(s.voice as Record<string, unknown>), audioFormat: e.target.value } }))}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            >
              <option value="mp3">MP3</option>
              <option value="pcm">PCM</option>
              <option value="ogg_opus">OGG Opus</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">语速 ({String(voice.speechRate ?? 0)})</label>
            <input
              type="range"
              min={-50}
              max={100}
              value={Number(voice.speechRate ?? 0)}
              onChange={(e) => setSettings((s) => ({ ...s, voice: { ...(s.voice as Record<string, unknown>), speechRate: Number(e.target.value) } }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">音量 ({String(voice.loudnessRate ?? 0)})</label>
            <input
              type="range"
              min={-50}
              max={100}
              value={Number(voice.loudnessRate ?? 0)}
              onChange={(e) => setSettings((s) => ({ ...s, voice: { ...(s.voice as Record<string, unknown>), loudnessRate: Number(e.target.value) } }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Backend Config */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-medium text-foreground">Lyaidol 后端对接（可选）</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">Base URL</label>
            <input
              type="text"
              value={String(backend.baseUrl || "")}
              onChange={(e) => setSettings((s) => ({ ...s, backend: { ...(s.backend as Record<string, unknown>), baseUrl: e.target.value } }))}
              placeholder="https://lyaidol.leyard.com"
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Token</label>
            <input
              type="password"
              value={String(backend.token || "")}
              onChange={(e) => setSettings((s) => ({ ...s, backend: { ...(s.backend as Record<string, unknown>), token: e.target.value } }))}
              placeholder="Bearer token..."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          保存配置
        </button>
        {saved && <span className="text-xs text-green-400">已保存</span>}
      </div>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function HomePage() {
  const [activeView, setActiveView] = useState<ViewKey>("document");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<DocInfo | null>(null);

  const renderView = () => {
    switch (activeView) {
      case "document":
        return <DocumentView onDocumentLoaded={setCurrentDoc} />;
      case "summary":
        return <SummaryView docId={currentDoc?.docId ?? null} docTitle={currentDoc?.title ?? null} />;
      case "checklist":
        return <ChecklistView docId={currentDoc?.docId ?? null} docTitle={currentDoc?.title ?? null} />;
      case "chat":
        return <ChatView docId={currentDoc?.docId ?? null} docTitle={currentDoc?.title ?? null} />;
      case "voice":
        return <VoiceView />;
      case "modules":
        return <ModulesView docId={currentDoc?.docId ?? null} />;
      case "idol":
        return <IdolView docId={currentDoc?.docId ?? null} />;
      case "api-tracker":
        return <ApiTrackerView docId={currentDoc?.docId ?? null} />;
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar transition-all duration-200 ${
          sidebarCollapsed ? "w-16" : "w-56"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-border">
          {!sidebarCollapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
              Lyaidol 准备助手
            </span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveView(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
                title={item.label}
              >
                <span className={isActive ? "text-sidebar-primary" : ""}>{item.icon}</span>
                {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
                {!sidebarCollapsed && isActive && <IconChevronRight />}
              </button>
            );
          })}
        </nav>

        {/* Current Doc Indicator */}
        {currentDoc && !sidebarCollapsed && (
          <div className="px-4 py-3 border-t border-border">
            <p className="text-xs text-sidebar-foreground/50 mb-1">当前文档</p>
            <p className="text-xs text-sidebar-foreground truncate">{currentDoc.title}</p>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="px-4 py-2.5 text-xs text-sidebar-foreground/50 hover:text-sidebar-foreground border-t border-border transition-colors"
        >
          {sidebarCollapsed ? ">" : "< 收起"}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-4">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
