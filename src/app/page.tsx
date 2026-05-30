"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  FileText, Brain, ClipboardList, MessageSquare, Mic, Volume2,
  LayoutGrid, Bot, Route, Settings, ChevronLeft, ChevronRight,
  Upload, Play, Square, CheckCircle2, Circle, AlertCircle, Clock,
  Loader2, Send, X, Plus, Headphones, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRESET_VOICES, type VoiceItem, type ChecklistGroup, type SettingsData, DEFAULT_SETTINGS } from "@/lib/types";

// ==================== SSE Hook ====================
function useSSE() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async (url: string, body: Record<string, unknown>) => {
    setOutput("");
    setLoading(true);
    abortRef.current = new AbortController();

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "请求失败" }));
        setOutput(`错误: ${err.error || resp.statusText}`);
        setLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) { setLoading(false); return; }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) { setLoading(false); return; }
              if (data.error) { setOutput((p) => p + `\n错误: ${data.error}`); setLoading(false); return; }
              if (data.content) setOutput((p) => p + data.content);
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setOutput((p) => p + `\n请求失败: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
  }, []);

  return { output, loading, start, stop, setOutput };
}

// ==================== Sidebar Nav ====================
const NAV_ITEMS = [
  { id: "parser", icon: FileText, label: "文档解析" },
  { id: "summary", icon: Brain, label: "智能摘要" },
  { id: "checklist", icon: ClipboardList, label: "准备清单" },
  { id: "chat", icon: MessageSquare, label: "AI 问答" },
  { id: "voice", icon: Volume2, label: "音色管理" },
  { id: "modules", icon: LayoutGrid, label: "模块矩阵" },
  { id: "idol", icon: Bot, label: "Idol 专项" },
  { id: "api-tracker", icon: Route, label: "API 追踪" },
  { id: "settings", icon: Settings, label: "设置" },
];

// ==================== Document Parser View ====================
function ParserView({ onDocLoaded }: { onDocLoaded: (id: string, title: string, content: string) => void }) {
  const [url, setUrl] = useState("");
  const [pasteContent, setPasteContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [docContent, setDocContent] = useState("");
  const [docStats, setDocStats] = useState<{ totalLines: number; totalChars: number; modules: number; apis: number } | null>(null);
  const [docId, setDocId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [mode, setMode] = useState<"url" | "paste">("url");

  const handleParse = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "url" ? { url } : { content: pasteContent, title: "粘贴文档" }),
      });
      const data = await resp.json();
      if (data.error) { alert(data.error); return; }
      setDocContent(data.content);
      setDocStats(data.stats);
      setDocId(data.docId);
      setDocTitle(data.title);
      onDocLoaded(data.docId, data.title, data.content);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "解析失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">文档解析</h2>
        <div className="flex gap-2 mb-4">
          <Button variant={mode === "url" ? "default" : "outline"} size="sm" onClick={() => setMode("url")}>URL 抓取</Button>
          <Button variant={mode === "paste" ? "default" : "outline"} size="sm" onClick={() => setMode("paste")}>粘贴文本</Button>
        </div>

        {mode === "url" ? (
          <div className="flex gap-2">
            <Input placeholder="输入文档URL（支持MD/PDF/Office）" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Button onClick={handleParse} disabled={loading || !url}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              解析
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea placeholder="粘贴文档内容..." value={pasteContent} onChange={(e) => setPasteContent(e.target.value)} rows={6} className="font-mono text-sm" />
            <Button onClick={handleParse} disabled={loading || !pasteContent.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              解析
            </Button>
          </div>
        )}
      </div>

      {docStats && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4" /> {docTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>{docStats.totalLines} 行</span>
              <span>{docStats.totalChars} 字符</span>
              <span>{docStats.modules} 模块</span>
              <span>{docStats.apis} API</span>
            </div>
          </CardContent>
        </Card>
      )}

      {docContent && (
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[60vh] overflow-auto text-muted-foreground leading-relaxed">
              {docContent.substring(0, 10000)}{docContent.length > 10000 ? "\n\n... (内容过长已截断)" : ""}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== Summary View ====================
function SummaryView({ docId }: { docId: string }) {
  const { output, loading, start, stop } = useSSE();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">智能摘要</h2>
        {!docId ? (
          <Badge variant="secondary">请先解析文档</Badge>
        ) : (
          <Button onClick={() => start("/api/summarize", { docId })} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Brain className="w-4 h-4 mr-1" />}
            {loading ? "分析中..." : "开始摘要"}
          </Button>
        )}
      </div>
      {loading && (
        <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>
      )}
      {output && (
        <Card>
          <CardContent className="pt-4">
            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap leading-relaxed">
              {output}
              {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />}
            </div>
          </CardContent>
        </Card>
      )}
      {!output && !loading && (
        <Card><CardContent className="pt-4 text-center text-muted-foreground text-sm py-12">解析文档后，AI 将自动提取项目架构、数据模型、API统计和待确认项</CardContent></Card>
      )}
    </div>
  );
}

// ==================== Checklist View ====================
function ChecklistView({ docId }: { docId: string }) {
  const { output, loading, start, stop } = useSSE();
  const [groups, setGroups] = useState<ChecklistGroup[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handleGenerate = () => start("/api/checklist", { docId });

  useEffect(() => {
    if (!loading && output) {
      try {
        const cleanOutput = output.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleanOutput);
        if (parsed.groups) setGroups(parsed.groups);
      } catch {
        // Not complete JSON yet
      }
    }
  }, [output, loading]);

  const toggleCheck = (id: string) => {
    setCheckedItems((p) => ({ ...p, [id]: !p[id] }));
  };

  const totalTasks = groups.reduce((s, g) => s + g.tasks.length, 0);
  const checkedCount = groups.reduce((s, g) => s + g.tasks.filter((t) => checkedItems[t.id]).length, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">准备清单</h2>
        <div className="flex items-center gap-2">
          {totalTasks > 0 && <Badge variant="secondary">{checkedCount}/{totalTasks} 已完成</Badge>}
          {!docId ? (
            <Badge variant="secondary">请先解析文档</Badge>
          ) : (
            <Button onClick={handleGenerate} disabled={loading} size="sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <ClipboardList className="w-4 h-4 mr-1" />}
              {loading ? "生成中..." : "生成清单"}
            </Button>
          )}
        </div>
      </div>

      {loading && <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>}

      {groups.length > 0 ? (
        <div className="space-y-3">
          {totalTasks > 0 && (
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${(checkedCount / totalTasks) * 100}%` }} />
            </div>
          )}
          {groups.map((group) => (
            <Card key={group.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-2 text-sm">
                    <Checkbox
                      checked={checkedItems[task.id] || false}
                      onCheckedChange={() => toggleCheck(task.id)}
                      className="mt-0.5"
                    />
                    <span className={checkedItems[task.id] ? "line-through text-muted-foreground" : ""}>{task.content}</span>
                    <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"} className="text-[10px] ml-auto shrink-0">
                      {task.priority === "high" ? "高" : task.priority === "medium" ? "中" : "低"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : output && !loading ? (
        <Card><CardContent className="pt-4"><pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">{output}</pre></CardContent></Card>
      ) : !output && !loading ? (
        <Card><CardContent className="pt-4 text-center text-muted-foreground text-sm py-12">解析文档后，AI 将生成结构化的开发前期准备任务清单</CardContent></Card>
      ) : null}
    </div>
  );
}

// ==================== Chat View ====================
function ChatView({ docId }: { docId: string }) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const { output, loading, start, stop } = useSSE();
  const [streamingIdx, setStreamingIdx] = useState(-1);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user" as const, content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreamingIdx(newMessages.length);
    start("/api/chat", { docId, messages: newMessages });
  };

  useEffect(() => {
    if (output && streamingIdx >= 0) {
      setMessages((prev) => {
        const next = [...prev];
        next[streamingIdx] = { role: "assistant", content: output };
        return next;
      });
    }
  }, [output, streamingIdx]);

  useEffect(() => {
    if (!loading && streamingIdx >= 0) {
      setStreamingIdx(-1);
    }
  }, [loading, streamingIdx]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">AI 问答</h2>
        {loading && <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>}
      </div>

      <div className="flex-1 overflow-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-12">
            {docId ? "输入你关于文档的疑问，AI 将给出针对性建议" : "请先解析文档，AI 将基于文档内容回答问题"}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
              msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {loading && i === streamingIdx && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder={docId ? "输入你的问题..." : "请先解析文档"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          disabled={loading || !docId}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={loading || !input.trim() || !docId} size="icon">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

// ==================== Voice Management View ====================
function VoiceView() {
  const [voices, setVoices] = useState<VoiceItem[]>(PRESET_VOICES);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newVoice, setNewVoice] = useState({ speakerId: "", name: "", tags: "", description: "" });
  const [category, setCategory] = useState<"all" | "preset" | "custom">("all");

  useEffect(() => {
    fetch("/api/voice/list", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: category }) })
      .then((r) => r.json())
      .then((data) => { if (data.voices) setVoices(data.voices); })
      .catch(() => {});
  }, [category, addDialogOpen]);

  const handlePreview = async (speakerId: string, voiceId: string) => {
    if (playingId === voiceId) {
      audioEl?.pause();
      setPlayingId(null);
      return;
    }
    try {
      const resp = await fetch("/api/voice/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speakerId }),
      });
      const data = await resp.json();
      if (data.audioUri) {
        const audio = new Audio(data.audioUri);
        audio.onended = () => setPlayingId(null);
        audioEl?.pause();
        audio.play();
        setAudioEl(audio);
        setPlayingId(voiceId);
      }
    } catch { /* ignore */ }
  };

  const handleAddVoice = async () => {
    if (!newVoice.speakerId || !newVoice.name) return;
    await fetch("/api/voice/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        speakerId: newVoice.speakerId,
        name: newVoice.name,
        tags: newVoice.tags.split(",").map((t) => t.trim()).filter(Boolean),
        description: newVoice.description,
      }),
    });
    setAddDialogOpen(false);
    setNewVoice({ speakerId: "", name: "", tags: "", description: "" });
  };

  const categories = ["all", "preset", "custom"] as const;
  const categoryLabels = { all: "全部", preset: "预设", custom: "自定义" };

  const grouped = voices.reduce<Record<string, VoiceItem[]>>((acc, v) => {
    const cat = v.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(v);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">音色管理</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />添加自定义音色</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>添加自定义音色</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Speaker ID (从扣子平台音色复刻获取)</Label>
                <Input placeholder="输入复刻后的speaker_id" value={newVoice.speakerId} onChange={(e) => setNewVoice((p) => ({ ...p, speakerId: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>音色名称</Label>
                <Input placeholder="如：小美元气" value={newVoice.name} onChange={(e) => setNewVoice((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>标签 (逗号分隔)</Label>
                <Input placeholder="如：二次元,温柔" value={newVoice.tags} onChange={(e) => setNewVoice((p) => ({ ...p, tags: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea placeholder="音色描述" value={newVoice.description} onChange={(e) => setNewVoice((p) => ({ ...p, description: e.target.value }))} rows={2} />
              </div>
              <div className="bg-muted/50 rounded-md p-3 text-xs text-muted-foreground">
                如何获取 Speaker ID: 登录扣子平台 → 资源库 → 音色复刻 → 上传音频样本完成训练 → 复制生成的 Speaker ID
              </div>
              <Button onClick={handleAddVoice} disabled={!newVoice.speakerId || !newVoice.name} className="w-full">保存</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        {categories.map((c) => (
          <Button key={c} variant={category === c ? "default" : "outline"} size="sm" onClick={() => setCategory(c)}>
            {categoryLabels[c]}
          </Button>
        ))}
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <Card key={cat}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{cat}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {items.map((v) => (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-accent/50 transition-colors">
                  <Button variant="ghost" size="icon" className="w-7 h-7 shrink-0" onClick={() => handlePreview(v.speakerId, v.id)}>
                    {playingId === v.id ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  </Button>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{v.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{v.speakerId.substring(0, 20)}...</div>
                  </div>
                  {v.type === "custom" && <Badge variant="outline" className="text-[10px] ml-auto shrink-0">自定义</Badge>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ==================== Module Matrix View ====================
function ModuleMatrixView({ docId }: { docId: string }) {
  const { output, loading, start, stop } = useSSE();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">模块矩阵</h2>
        <Button onClick={() => start("/api/analyze-modules", { docId })} disabled={loading || !docId} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <LayoutGrid className="w-4 h-4 mr-1" />}
          {loading ? "分析中..." : "分析模块"}
        </Button>
      </div>
      {loading && <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>}
      {output ? (
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[70vh] overflow-auto text-muted-foreground">{output}</pre>
            {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse" />}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="pt-4 text-center text-muted-foreground text-sm py-12">解析文档后，AI 将对14个功能模块进行全景分析</CardContent></Card>
      )}
    </div>
  );
}

// ==================== Idol Prep View ====================
function IdolPrepView({ docId }: { docId: string }) {
  const { output, loading, start, stop } = useSSE();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Idol 专项准备</h2>
        <Button onClick={() => start("/api/analyze-idol", { docId })} disabled={loading || !docId} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Bot className="w-4 h-4 mr-1" />}
          {loading ? "分析中..." : "分析Idol配置"}
        </Button>
      </div>
      {loading && <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>}
      {output ? (
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[70vh] overflow-auto text-muted-foreground">{output}</pre>
            {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse" />}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="pt-4 text-center text-muted-foreground text-sm py-12">
          解析文档后，AI 将对智能idol配置中心的30项功能进行专项分析<br />
          <span className="text-xs mt-2 inline-block">涵盖：大模型对接 / 智能体管理 / 形象管理(6种状态机) / 声纹定制 / 知识库 / 历史对话 / 关联设置</span>
        </CardContent></Card>
      )}
    </div>
  );
}

// ==================== API Tracker View ====================
function APITrackerView({ docId }: { docId: string }) {
  const { output, loading, start, stop } = useSSE();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">API 追踪器</h2>
        <Button onClick={() => start("/api/analyze-apis", { docId })} disabled={loading || !docId} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Route className="w-4 h-4 mr-1" />}
          {loading ? "追踪中..." : "追踪API"}
        </Button>
      </div>
      {loading && <Button variant="ghost" size="sm" onClick={stop}><Square className="w-3 h-3 mr-1" />停止</Button>}
      {output ? (
        <Card>
          <CardContent className="pt-4">
            <pre className="text-xs font-mono whitespace-pre-wrap max-h-[70vh] overflow-auto text-muted-foreground">{output}</pre>
            {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse" />}
          </CardContent>
        </Card>
      ) : (
        <Card><CardContent className="pt-4 text-center text-muted-foreground text-sm py-12">
          解析文档后，AI 将对105个API接口进行系统追踪<br />
          <span className="text-xs mt-2 inline-block">包含：27个已确认接口 + 78个待确认接口的参数推测与追访建议</span>
        </CardContent></Card>
      )}
    </div>
  );
}

// ==================== Settings View ====================
function SettingsView() {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then(setSettings).catch(() => {});
  }, []);

  const handleSave = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-xl font-semibold">设置</h2>

      <Card>
        <CardHeader><CardTitle className="text-sm">大模型配置</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>提供方</Label>
            <Select value={settings.llm.provider} onValueChange={(v) => setSettings((p) => ({ ...p, llm: { ...p.llm, provider: v as "builtin" | "custom" } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="builtin">扣子内置 SDK (默认)</SelectItem>
                <SelectItem value="custom">自定义</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {settings.llm.provider === "custom" && (
            <>
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <Input value={settings.llm.baseUrl || ""} onChange={(e) => setSettings((p) => ({ ...p, llm: { ...p.llm, baseUrl: e.target.value } }))} />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input type="password" value={settings.llm.apiKey || ""} onChange={(e) => setSettings((p) => ({ ...p, llm: { ...p.llm, apiKey: e.target.value } }))} />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label>模型</Label>
            <Select value={settings.llm.model} onValueChange={(v) => setSettings((p) => ({ ...p, llm: { ...p.llm, model: v } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="doubao-seed-2-0-pro-260215">Doubao Seed 2.0 Pro (旗舰)</SelectItem>
                <SelectItem value="doubao-seed-2-0-lite-260215">Doubao Seed 2.0 Lite (均衡)</SelectItem>
                <SelectItem value="doubao-seed-2-0-mini-260215">Doubao Seed 2.0 Mini (轻量)</SelectItem>
                <SelectItem value="deepseek-v3-2-251201">DeepSeek V3</SelectItem>
                <SelectItem value="kimi-k2-5-260127">Kimi K2.5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">语音配置 (扣子 SDK)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>默认音色</Label>
            <Select value={settings.voice.speaker} onValueChange={(v) => setSettings((p) => ({ ...p, voice: { ...p.voice, speaker: v } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRESET_VOICES.map((v) => (
                  <SelectItem key={v.id} value={v.speakerId}>{v.name} ({v.category})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>语速 ({settings.voice.speechRate})</Label>
            <Slider min={-50} max={100} step={5} value={[settings.voice.speechRate]} onValueChange={([v]) => setSettings((p) => ({ ...p, voice: { ...p.voice, speechRate: v } }))} />
          </div>
          <div className="space-y-2">
            <Label>音量 ({settings.voice.loudnessRate})</Label>
            <Slider min={-50} max={100} step={5} value={[settings.voice.loudnessRate]} onValueChange={([v]) => setSettings((p) => ({ ...p, voice: { ...p.voice, loudnessRate: v } }))} />
          </div>
          <div className="space-y-2">
            <Label>音频格式</Label>
            <Select value={settings.voice.audioFormat} onValueChange={(v) => setSettings((p) => ({ ...p, voice: { ...p.voice, audioFormat: v as "mp3" | "pcm" | "ogg_opus" } }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mp3">MP3</SelectItem>
                <SelectItem value="pcm">PCM</SelectItem>
                <SelectItem value="ogg_opus">OGG Opus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Lyaidol 后端对接 (可选)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={settings.backend.baseUrl} onChange={(e) => setSettings((p) => ({ ...p, backend: { ...p.backend, baseUrl: e.target.value } }))} />
          </div>
          <div className="space-y-2">
            <Label>Token</Label>
            <Input type="password" value={settings.backend.token} onChange={(e) => setSettings((p) => ({ ...p, backend: { ...p.backend, token: e.target.value } }))} placeholder="输入后端API Token" />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={handleSave}>{saved ? "已保存" : "保存设置"}</Button>
        <Button variant="outline" onClick={() => setSettings(DEFAULT_SETTINGS)}>重置默认</Button>
      </div>
    </div>
  );
}

// ==================== Main Page ====================
export default function HomePage() {
  const [activeView, setActiveView] = useState("parser");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [docId, setDocId] = useState("");
  const [docTitle, setDocTitle] = useState("");
  const [docContent, setDocContent] = useState("");

  const handleDocLoaded = (id: string, title: string, content: string) => {
    setDocId(id);
    setDocTitle(title);
    setDocContent(content);
  };

  const renderView = () => {
    switch (activeView) {
      case "parser": return <ParserView onDocLoaded={handleDocLoaded} />;
      case "summary": return <SummaryView docId={docId} />;
      case "checklist": return <ChecklistView docId={docId} />;
      case "chat": return <ChatView docId={docId} />;
      case "voice": return <VoiceView />;
      case "modules": return <ModuleMatrixView docId={docId} />;
      case "idol": return <IdolPrepView docId={docId} />;
      case "api-tracker": return <APITrackerView docId={docId} />;
      case "settings": return <SettingsView />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-card border-r flex flex-col transition-all duration-200 ${sidebarCollapsed ? "w-14" : "w-56"}`}>
        <div className="flex items-center gap-2 p-3 border-b h-12">
          {!sidebarCollapsed && <span className="font-semibold text-sm truncate">Lyaidol 准备助手</span>}
          <Button variant="ghost" size="icon" className="ml-auto w-7 h-7" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
        <nav className="flex-1 py-2 space-y-0.5 px-1.5">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-2 h-9 text-sm ${sidebarCollapsed ? "px-2" : ""}`}
              onClick={() => setActiveView(item.id)}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Button>
          ))}
        </nav>
        {docId && !sidebarCollapsed && (
          <div className="p-3 border-t">
            <div className="text-[10px] text-muted-foreground mb-1">当前文档</div>
            <div className="text-xs font-medium truncate">{docTitle}</div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-5xl mx-auto">
          {renderView()}
        </div>
      </main>
    </div>
  );
}
