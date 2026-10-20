"use client";

/**
 * Motion Kit previews (set M): wake slider, seek search, fold note and assign picker.
 * Every component ships an `autoplay` mode that demonstrates itself until someone takes over,
 * so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { WakeSlider } from "@/components/wake-slider";
import { SeekSearch } from "@/components/seek-search";
import { FoldNote } from "@/components/fold-note";
import { AssignPicker } from "@/components/assign-picker";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewWakeSlider({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <WakeSlider autoplay />
    </Stage>
  );
}

export function PreviewSeekSearch({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SeekSearch autoplay />
    </Stage>
  );
}

export function PreviewFoldNote({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <FoldNote autoplay />
    </Stage>
  );
}

export function PreviewAssignPicker({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <AssignPicker autoplay />
    </Stage>
  );
}
