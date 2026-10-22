"use client";

/**
 * Motion Kit previews (set V): slingshot send, domino select. Both play themselves with `autoplay`
 * until someone touches them, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { SlingshotSend } from "@/components/slingshot-send";
import { DominoSelect } from "@/components/domino-select";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewSlingshotSend({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <SlingshotSend autoplay />
    </Stage>
  );
}

export function PreviewDominoSelect({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <DominoSelect autoplay />
    </Stage>
  );
}
