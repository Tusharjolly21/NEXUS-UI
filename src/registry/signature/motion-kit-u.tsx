"use client";

/**
 * Motion Kit previews (set U): sand timer, zipper reveal. Both play themselves with `autoplay`
 * until someone takes over.
 */

import * as React from "react";
import type { ReactNode } from "react";

import { SandTimer } from "@/components/sand-timer";
import { ZipperReveal } from "@/components/zipper-reveal";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewSandTimer({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <SandTimer autoplay />
    </Stage>
  );
}

export function PreviewZipperReveal({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage className={compact ? "p-3" : "p-8"}>
      <ZipperReveal autoplay />
    </Stage>
  );
}
