import { consumeSSEStream } from "./sse";
import type { HistoryTurn, SSEEvent } from "./types";

function getApiUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_RAGSUME_API_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_API_URL (or NEXT_PUBLIC_RAGSUME_API_URL) is not configured",
    );
  }
  return url.replace(/\/$/, "");
}

export interface StreamChatOptions {
  message: string;
  history: HistoryTurn[];
  signal?: AbortSignal;
  onEvent: (event: SSEEvent) => void;
}

export async function streamChat({
  message,
  history,
  signal,
  onEvent,
}: StreamChatOptions): Promise<void> {
  const response = await fetch(`${getApiUrl()}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      detail.trim() || `Request failed (${response.status})`,
    );
  }

  if (!response.body) {
    throw new Error("Response body is empty");
  }

  const reader = response.body.getReader();

  try {
    await consumeSSEStream(reader, onEvent);
  } finally {
    reader.releaseLock();
  }
}

export async function mockStreamChat({
  message,
  onEvent,
  signal,
}: {
  message: string;
  onEvent: (event: SSEEvent) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const mockSources = [
    { project: "Ragsume Core", facet: "decisions" },
    { project: "Ragsume Core", facet: "outcome" },
  ];

  await delay(300, signal);
  onEvent({ event: "sources", data: { sources: mockSources } });

  const response = `Based on ${message.toLowerCase()}, here's a grounded summary from retrieved project chunks [1]. The RAG pipeline uses Qdrant for semantic search [2].`;
  const words = response.split(/(\s+)/);

  for (const chunk of words) {
    await delay(25 + Math.random() * 20, signal);
    onEvent({ event: "token", data: { content: chunk } });
    await nextFrame();
  }

  onEvent({ event: "done", data: {} });
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

export const USE_MOCK_STREAM =
  process.env.NEXT_PUBLIC_USE_MOCK_STREAM === "true";
