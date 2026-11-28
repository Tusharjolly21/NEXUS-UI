"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { cn } from "@/lib/utils";
import { CursorTextReveal } from "@/components/cursor-text-reveal";

export function PreviewCursorTextReveal({ compact = true }: { compact?: boolean } = {}) {
  return (
    <div className={cn("w-full", compact ? "h-[420px]" : "h-[560px]")}>
      <CursorTextReveal
        baseText="The first rule of motion is clarity."
        revealText="The second rule is feeling."
        maskSize={compact ? 190 : 310}
        initialMaskSize={compact ? 92 : 0}
        smoothness={0.16}
        enableGlow={false}
        showAmbient={false}
        showGrid={false}
        fontSize={compact ? "clamp(2rem, 7vw, 4.8rem)" : "clamp(3rem, 7vw, 7rem)"}
        revealBackgroundClassName="bg-black"
        baseTextClassName="text-zinc-950"
        revealTextClassName="text-white"
        containerClassName="h-full min-h-0 rounded-3xl border-zinc-200 bg-white text-zinc-950 shadow-sm"
      />
    </div>
  );
}
