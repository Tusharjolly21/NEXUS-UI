"use client";

/**
 * Motion Kit previews (set AA): watch countdown, fuse countdown, roadmap scrubber, commit graph roadmap. Components that ship an `autoplay` mode demonstrate themselves until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { FuseCountdown, WatchCountdown } from "@/components/animated-countdown";
import { CommitGraphRoadmap, RoadmapScrubber } from "@/components/milestone-timeline";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewWatchCountdown({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <WatchCountdown />
    </Stage>
  );
}

export function PreviewFuseCountdown({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FuseCountdown autoplay seconds={12} />
    </Stage>
  );
}

export function PreviewRoadmapScrubber({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <RoadmapScrubber autoplay />
    </Stage>
  );
}

export function PreviewCommitGraphRoadmap({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[640px]">
      <CommitGraphRoadmap autoplay />
    </Stage>
  );
}
