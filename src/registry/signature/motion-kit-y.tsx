"use client";

/**
 * Motion Kit previews (set Y): undo toast, promise toast, elastic tabs, document tabs. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { UndoToast, PromiseToast } from "@/components/toast-stack";
import { ElasticTabs, DocumentTabs } from "@/components/animated-tabs";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewUndoToast({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[460px]">
      <UndoToast autoplay />
    </Stage>
  );
}

export function PreviewPromiseToast({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[400px]">
      <PromiseToast autoplay />
    </Stage>
  );
}

export function PreviewElasticTabs({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <ElasticTabs autoplay />
    </Stage>
  );
}

export function PreviewDocumentTabs({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <DocumentTabs autoplay />
    </Stage>
  );
}
