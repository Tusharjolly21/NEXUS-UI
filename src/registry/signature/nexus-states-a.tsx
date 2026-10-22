"use client";

/**
 * Nexus UI state previews (set A): empty projects, no results, empty chart, empty team. Every component ships an `autoplay`
 * mode that demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { EmptyProjects } from "@/components/empty-projects";
import { NoResults } from "@/components/no-results";
import { EmptyChart } from "@/components/empty-chart";
import { EmptyTeam } from "@/components/empty-team";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-6 text-[#1d1d1f] sm:p-8 dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewEmptyProjects({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[470px]">
      <EmptyProjects autoplay />
    </Stage>
  );
}

export function PreviewNoResults({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[480px]">
      <NoResults autoplay />
    </Stage>
  );
}

export function PreviewEmptyChart({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <EmptyChart autoplay />
    </Stage>
  );
}

export function PreviewEmptyTeam({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[470px]">
      <EmptyTeam autoplay />
    </Stage>
  );
}
