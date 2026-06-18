import type { Source, SSEEvent } from "./types";

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseSSEFrame(raw: string): SSEEvent | null {
  let eventName = "message";
  const dataLines: string[] = [];

  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) {
      eventName = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trimStart());
    }
  }

  if (dataLines.length === 0) {
    return null;
  }

  const payload = dataLines.join("\n");

  try {
    const data = JSON.parse(payload) as Record<string, unknown>;

    if (eventName === "token" && typeof data.content === "string") {
      return { event: "token", data: { content: data.content } };
    }

    if (eventName === "sources" && Array.isArray(data.sources)) {
      return {
        event: "sources",
        data: { sources: data.sources as Source[] },
      };
    }

    if (eventName === "error" && typeof data.error === "string") {
      return { event: "error", data: { error: data.error } };
    }

    if (eventName === "done") {
      return { event: "done", data: {} };
    }
  } catch {
    return null;
  }

  return null;
}

export async function* readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SSEEvent> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += normalizeNewlines(decoder.decode(value, { stream: true }));

    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary).trim();
      buffer = buffer.slice(boundary + 2);

      if (frame) {
        const parsed = parseSSEFrame(frame);
        if (parsed) {
          yield parsed;
        }
      }

      boundary = buffer.indexOf("\n\n");
    }
  }

  const trailing = buffer.trim();
  if (trailing) {
    const parsed = parseSSEFrame(trailing);
    if (parsed) {
      yield parsed;
    }
  }
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

export async function consumeSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  for await (const event of readSSEStream(reader)) {
    onEvent(event);

    if (event.event === "token") {
      await nextFrame();
    }
  }
}
