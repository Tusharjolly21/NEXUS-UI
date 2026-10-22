"use client";

/**
 * Nexus states previews (set C): image generating, all caught up, empty table, voice dictation. Every component ships an
 * `autoplay` mode that demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { ImageGenerating } from "@/components/generate-image";
import { AllCaughtUp } from "@/components/todo-list";
import { EmptyTable } from "@/components/upload-dropzone";
import { VoiceDictation } from "@/components/hold-to-record";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewImageGenerating({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <ImageGenerating autoplay />
    </Stage>
  );
}

export function PreviewAllCaughtUp({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[520px]">
      <AllCaughtUp autoplay />
    </Stage>
  );
}

export function PreviewEmptyTable({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[440px]">
      <EmptyTable autoplay />
    </Stage>
  );
}

export function PreviewVoiceDictation({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[360px]">
      <VoiceDictation autoplay />
    </Stage>
  );
}
