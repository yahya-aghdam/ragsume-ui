"use client";

import React from "react";

// Simple orange pulsing dot animation similar to ChatGPT's loading indicator
export function LoadingSpinner() {
  return (
    <div className="flex items-center gap-1" aria-label="Loading">
      <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" />
      <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
      <span className="h-2 w-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: "0.4s" }} />
    </div>
  );
}

