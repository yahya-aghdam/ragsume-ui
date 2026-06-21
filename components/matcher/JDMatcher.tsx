"use client";

import { useCallback, useRef, useState } from "react";
import { streamChat } from "@/lib/api";
import { MessageBubble } from "@/components/chat/MessageBubble";

export function JDMatcher() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = jd.trim();
    if (!trimmed || isStreaming) {
      return;
    }

    setResult("");
    setError(null);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamChat({
        message: `Match this job description:\n\n${trimmed}`,
        history: [],
        signal: controller.signal,
        onEvent: (event) => {
          if (event.event === "token") {
            setResult((prev) => prev + event.data.content);
            resultRef.current?.scrollTo({
              top: resultRef.current.scrollHeight,
              behavior: "smooth",
            });
          } else if (event.event === "error") {
            setError(event.data.error);
            setIsStreaming(false);
          } else if (event.event === "done") {
            setIsStreaming(false);
          }
        },
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [jd, isStreaming]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && isStreaming) {
      event.preventDefault();
      cancelStream();
    }
  };

  return (
    <div className="flex h-full flex-col py-3 sm:py-4">
      <form
        className="flex shrink-0 flex-col gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}
      >
        <label
          htmlFor="jd-input"
          className="font-mono text-xs text-text-muted"
        >
          Job description
        </label>
        <textarea
          id="jd-input"
          rows={8}
          value={jd}
          onChange={(event) => setJd(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Paste a job description to evaluate fit…"
          className="focus-ring resize-y border border-border bg-bg-surface px-3 py-2 text-base text-text-primary placeholder:text-text-muted disabled:opacity-50 sm:text-sm"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isStreaming || !jd.trim()}
            className="focus-ring border border-border bg-bg-elevated px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-bg-surface disabled:opacity-50"
          >
            {isStreaming ? "Analyzing…" : "Match"}
          </button>
          {isStreaming && (
            <button
              type="button"
              onClick={cancelStream}
              className="focus-ring font-mono text-xs text-text-muted hover:text-text-primary"
            >
              Cancel (Esc)
            </button>
          )}
        </div>
      </form>

      {(result || error || isStreaming) && (
        <div
          ref={resultRef}
          role="region"
          aria-live="polite"
          aria-busy={isStreaming}
          aria-label="Fit summary"
          className="mt-4 min-h-0 flex-1 overflow-y-auto border border-border bg-bg-surface p-4"
        >
          {error ? (
            <p className="font-mono text-xs text-red-400">Error: {error}</p>
          ) : (
            <MessageBubble
              role="assistant"
              content={result}
              isStreaming={isStreaming}
            />
          )}
        </div>
      )}
    </div>
  );
}
