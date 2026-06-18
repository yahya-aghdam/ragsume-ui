"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { MessageRole } from "@/lib/types";

interface MessageBubbleProps {
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  activeCitation?: number;
  onCitationHover?: (index: number | undefined) => void;
  onCitationClick?: (index: number) => void;
}

const CITATION_PATTERN = /\[(\d+)\]/g;

function hasCitations(text: string): boolean {
  return /\[(\d+)\]/.test(text);
}

function renderWithCitations(
  text: string,
  activeCitation: number | undefined,
  onCitationHover: ((index: number | undefined) => void) | undefined,
  onCitationClick: ((index: number) => void) | undefined,
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pattern = new RegExp(CITATION_PATTERN.source, "g");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const citationIndex = Number(match[1]);
    const isActive = activeCitation === citationIndex;

    parts.push(
      <button
        key={`cite-${match.index}-${citationIndex}`}
        type="button"
        className={`focus-ring inline font-mono text-xs transition-colors ${
          isActive ? "text-accent underline" : "text-accent/80 hover:text-accent"
        }`}
        onMouseEnter={() => onCitationHover?.(citationIndex)}
        onMouseLeave={() => onCitationHover?.(undefined)}
        onFocus={() => onCitationHover?.(citationIndex)}
        onBlur={() => onCitationHover?.(undefined)}
        onClick={() => onCitationClick?.(citationIndex)}
        aria-label={`Citation ${citationIndex}`}
      >
        [{citationIndex}]
      </button>,
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function CitationAwareMarkdown({
  content,
  activeCitation,
  onCitationHover,
  onCitationClick,
}: {
  content: string;
  activeCitation?: number;
  onCitationHover?: (index: number | undefined) => void;
  onCitationClick?: (index: number) => void;
}) {
  const citationsPresent = hasCitations(content);

  if (!citationsPresent) {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    );
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => {
          if (typeof children === "string") {
            return (
              <p>
                {renderWithCitations(
                  children,
                  activeCitation,
                  onCitationHover,
                  onCitationClick,
                )}
              </p>
            );
          }
          return <p>{children}</p>;
        },
        li: ({ children }) => {
          if (typeof children === "string") {
            return (
              <li>
                {renderWithCitations(
                  children,
                  activeCitation,
                  onCitationHover,
                  onCitationClick,
                )}
              </li>
            );
          }
          return <li>{children}</li>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageBubble({
  role,
  content,
  isStreaming,
  activeCitation,
  onCitationHover,
  onCitationClick,
}: MessageBubbleProps) {
  if (role === "user") {
    return (
      <div className="border-l-2 border-border pl-3 text-text-primary">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    );
  }

  return (
    <div className="prose-ragsume text-text-primary">
      {content ? (
        <CitationAwareMarkdown
          content={content}
          activeCitation={activeCitation}
          onCitationHover={onCitationHover}
          onCitationClick={onCitationClick}
        />
      ) : null}
      {isStreaming && (
        <span
          className="animate-cursor-blink ml-0.5 inline-block h-4 w-0.5 bg-text-muted align-middle"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
