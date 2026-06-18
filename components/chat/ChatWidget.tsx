"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { mockStreamChat, streamChat, USE_MOCK_STREAM } from "@/lib/api";
import type {
  AppTab,
  ChatMode,
  HistoryTurn,
  Message,
  SSEEvent,
} from "@/lib/types";
import { JDMatcher } from "@/components/matcher/JDMatcher";
import { MessageBubble } from "./MessageBubble";
import { SourceTrace } from "./SourceTrace";
import { ExampleQuestions } from "./ExampleQuestions";
import Image from "next/image";

function createId(): string {
  return crypto.randomUUID();
}

function buildHistory(messages: Message[]): HistoryTurn[] {
  return messages
    .filter((m) => !m.isStreaming && m.content)
    .map(({ role, content }) => ({ role, content }));
}

export function ChatWidget() {
  const [activeTab, setActiveTab] = useState<AppTab>("chat");
  const [mode, setMode] = useState<ChatMode>("recruiter");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeCitation, setActiveCitation] = useState<number | undefined>();

  const abortRef = useRef<AbortController | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "prefers-reduced-motion" in window &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [messages]);

  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setMessages((prev) =>
      prev.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
    );
  }, []);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) {
      return;
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
    };

    const assistantId = createId();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      sources: [],
      isStreaming: true,
    };

    const history = buildHistory(messages);

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsStreaming(true);
    setActiveCitation(undefined);

    const controller = new AbortController();
    abortRef.current = controller;

    const updateAssistant = (patch: Partial<Message>) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)),
      );
    };

    const onEvent = (event: SSEEvent) => {
      if (event.event === "sources") {
        updateAssistant({ sources: event.data.sources });
      } else if (event.event === "token") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + event.data.content }
              : m,
          ),
        );
      } else if (event.event === "error") {
        updateAssistant({
          content: `Error: ${event.data.error}`,
          isStreaming: false,
        });
        setIsStreaming(false);
      } else if (event.event === "done") {
        updateAssistant({ isStreaming: false });
        setIsStreaming(false);
      }
    };

    try {
      if (USE_MOCK_STREAM) {
        await mockStreamChat({
          message: trimmed,
          onEvent,
          signal: controller.signal,
        });
      } else {
        await streamChat({
          message: trimmed,
          history,
          signal: controller.signal,
          onEvent,
        });
      }

      updateAssistant({ isStreaming: false });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message =
        error instanceof Error ? error.message : "Something went wrong";
      updateAssistant({
        content: `Error: ${message}`,
        isStreaming: false,
      });
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
        // Refocus the textarea after the state updates have been applied
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
            const length = inputRef.current.value.length;
            inputRef.current.setSelectionRange(length, length);
          }
        }, 0);
      }
  }, [input, isStreaming, messages, mode]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
    if (event.key === "Escape" && isStreaming) {
      event.preventDefault();
      cancelStream();
    }
  };

  const scrollToCitation = (index: number) => {
    setActiveCitation(index);
    document
      .getElementById(`source-chip-${index}`)
      ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="mx-auto flex h-dvh w-full max-w-3xl flex-col">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
        <Image src="/logo.svg" alt="RAGsume logo" width={300} height={150} loading="eager"/>

          <nav
            className="flex gap-0 border border-border"
            role="tablist"
            aria-label="Main sections"
          >
            {(
              [
                ["chat", "Chat"],
                ["jd", "JD Match"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`panel-${tab}`}
                id={`tab-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`focus-ring px-3 py-1 font-mono text-xs transition-colors ${
                  activeTab === tab
                    ? "bg-accent/15 text-accent"
                    : "bg-bg-surface text-text-muted hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === "chat" && (
          <div
            className="mt-3 flex gap-0 border border-border w-fit"
            role="group"
            aria-label="Response mode"
          >
            {(
              [
                ["recruiter", "Recruiter"],
                ["technical", "Technical"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                disabled={isStreaming}
                onClick={() => setMode(value)}
                className={`focus-ring px-3 py-1 font-mono text-xs transition-colors disabled:opacity-50 ${
                  mode === value
                    ? "bg-accent/15 text-accent"
                    : "bg-bg-surface text-text-muted hover:text-text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {activeTab === "chat" ? (
        <div
          id="panel-chat"
          role="tabpanel"
          aria-labelledby="tab-chat"
          className="flex min-h-0 flex-1 flex-col"
        >
          <div
            ref={listRef}
            role="log"
            aria-live="polite"
            aria-busy={isStreaming}
            aria-label="Chat messages"
            className="flex-1 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 ? (
                <ExampleQuestions />
            ) : (
              <ul className="flex flex-col gap-6">
                {messages.map((message) => (
                  <li key={message.id}>
                    {message.role === "assistant" && message.sources && (
                      <SourceTrace
                        sources={message.sources}
                        activeCitation={activeCitation}
                        onChipClick={scrollToCitation}
                      />
                    )}
                    <MessageBubble
                      role={message.role}
                      content={message.content}
                      isStreaming={message.isStreaming}
                      activeCitation={
                        message.role === "assistant" ? activeCitation : undefined
                      }
                      onCitationHover={setActiveCitation}
                      onCitationClick={scrollToCitation}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form
            className="shrink-0 border-t border-border px-4 py-3"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSend();
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label htmlFor="chat-input" className="sr-only">
                Message
              </label>
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  rows={2}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  placeholder="Ask a question…"
                  autoFocus
                  className="focus-ring min-h-[2.75rem] flex-1 resize-none border border-border bg-bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-muted disabled:opacity-50"
                />
                  <button
                    type="submit"
                    disabled={isStreaming || !input.trim()}
                    onMouseDown={(e) => e.preventDefault()}
                    className="focus-ring shrink-0 border border-border bg-bg-elevated px-4 py-2 font-mono text-xs text-text-primary transition-colors hover:bg-bg-surface disabled:opacity-50 sm:py-2.5"
                  >
                {isStreaming ? "Streaming…" : "Send"}
              </button>
            </div>
            {isStreaming && (
              <button
                type="button"
                onClick={cancelStream}
                className="focus-ring mt-2 font-mono text-xs text-text-muted hover:text-text-primary"
              >
                Cancel (Esc)
              </button>
            )}
          </form>
        </div>
      ) : (
        <div
          id="panel-jd"
          role="tabpanel"
          aria-labelledby="tab-jd"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <JDMatcher />
        </div>
      )}
    </div>
  );
}
