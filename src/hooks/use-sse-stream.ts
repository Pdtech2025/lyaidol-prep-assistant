"use client";

import { useState, useCallback, useRef } from "react";

interface SSEOptions {
  onChunk?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
}

export function useSSEStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const startStream = useCallback(
    async (url: string, body: Record<string, unknown>, options: SSEOptions = {}) => {
      setIsStreaming(true);
      abortRef.current = new AbortController();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({ error: "请求失败" }));
          options.onError?.(errData.error || "请求失败");
          setIsStreaming(false);
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          options.onError?.("无法读取响应流");
          setIsStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("data: ")) {
              try {
                const data = JSON.parse(trimmed.slice(6));
                if (data.done) {
                  options.onDone?.();
                } else if (data.error) {
                  options.onError?.(data.error);
                } else if (data.content) {
                  options.onChunk?.(data.content);
                }
              } catch {
                // Skip malformed data
              }
            }
          }
        }

        options.onDone?.();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // Stream was cancelled
        } else {
          const msg = err instanceof Error ? err.message : "流式请求异常";
          options.onError?.(msg);
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    []
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { isStreaming, startStream, stopStream };
}
