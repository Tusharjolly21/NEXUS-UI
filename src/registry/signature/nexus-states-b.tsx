"use client";

/**
 * Nexus states previews (set B): AI states. Streaming answer, diff review, agent run and ghost autocomplete.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over, so the previews
 * only add the stage around them.
 */

import type { ReactNode } from "react";
import { StreamingAnswer } from "@/components/streaming-answer";
import { DiffReview } from "@/components/diff-review";
import { AgentRun } from "@/components/agent-run";
import { GhostAutocomplete } from "@/components/ghost-autocomplete";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[380px] w-full items-center justify-center p-6 text-[#1d1d1f] sm:p-8 dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewStreamingAnswer({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <StreamingAnswer autoplay />
    </Stage>
  );
}

export function PreviewDiffReview({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[400px]">
      <DiffReview autoplay />
    </Stage>
  );
}

export function PreviewAgentRun({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <AgentRun autoplay />
    </Stage>
  );
}

export function PreviewGhostAutocomplete({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[400px]">
      <GhostAutocomplete autoplay />
    </Stage>
  );
}
