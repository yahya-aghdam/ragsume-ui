"use client";

import type { Source } from "@/lib/types";

interface SourceTraceProps {
  sources: Source[];
  activeCitation?: number;
  onChipClick?: (index: number) => void;
}

export function SourceTrace({
  sources,
  activeCitation,
  onChipClick,
}: SourceTraceProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <div
      className="mb-2 overflow-x-auto [-webkit-overflow-scrolling:touch]"
      aria-label="Retrieved sources"
    >
      <div className="flex min-w-min gap-1.5 pb-1">
        {sources.map((source, index) => {
          const isActive = activeCitation === index + 1;
          return (
            <button
              key={`${source.project}-${source.facet}-${index}`}
              type="button"
              id={`source-chip-${index + 1}`}
              onClick={() => onChipClick?.(index + 1)}
              className={`focus-ring animate-chip-in shrink-0 border px-2 py-0.5 font-mono text-xs transition-colors ${
                isActive
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-bg-elevated text-text-muted hover:border-accent/50 hover:text-text-primary"
              }`}
              style={{ animationDelay: `${index * 60}ms` }}
              aria-pressed={isActive}
            >
              {source.project} · {source.facet}
            </button>
          );
        })}
      </div>
    </div>
  );
}
