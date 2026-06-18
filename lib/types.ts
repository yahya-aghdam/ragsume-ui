export type ChatMode = "recruiter" | "technical";

export type MessageRole = "user" | "assistant";

export interface Source {
  project: string;
  facet: string;
}

export interface HistoryTurn {
  role: MessageRole;
  content: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  isStreaming?: boolean;
}

export type SSEEvent =
  | { event: "token"; data: { content: string } }
  | { event: "sources"; data: { sources: Source[] } }
  | { event: "error"; data: { error: string } }
  | { event: "done"; data: Record<string, never> };

export type AppTab = "chat" | "jd";
