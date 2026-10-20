"use client";

/**
 * Motion Kit previews (set N): bend text, pressure text, morph cursor, split-flap board, command morph, ink theme switch, swipe rows, shatter delete. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { BendText } from "@/components/bend-text";
import { PressureText } from "@/components/pressure-text";
import { MorphCursor } from "@/components/morph-cursor";
import { SplitFlapBoard } from "@/components/animated-countdown";
import { CommandMorph } from "@/components/command-palette";
import { InkThemeSwitch } from "@/components/ink-theme-switch";
import { SwipeRows } from "@/components/swipe-stack";
import { ShatterDelete } from "@/components/crumple-to-trash";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewBendText({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <BendText autoplay />
    </Stage>
  );
}

export function PreviewPressureText({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <PressureText autoplay />
    </Stage>
  );
}

export function PreviewMorphCursor({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[400px]">
      <MorphCursor autoplay />
    </Stage>
  );
}

export function PreviewSplitFlapBoard({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SplitFlapBoard autoplay />
    </Stage>
  );
}

export function PreviewCommandMorph({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <CommandMorph autoplay />
    </Stage>
  );
}

export function PreviewInkThemeSwitch({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[380px]">
      <InkThemeSwitch autoplay />
    </Stage>
  );
}

export function PreviewSwipeRows({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[420px]">
      <SwipeRows autoplay />
    </Stage>
  );
}

export function PreviewShatterDelete({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage className="min-h-[380px]">
      <ShatterDelete autoplay />
    </Stage>
  );
}
