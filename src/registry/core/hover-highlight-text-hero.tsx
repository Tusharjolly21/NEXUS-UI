"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { HoverHighlightText } from "@/components/hover-highlight-text";

export function PreviewHoverHighlightTextHero() {
  return (
    <div className="flex min-h-[620px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-14 text-center shadow-2xl shadow-black/40">
      <HoverHighlightText
        text="Build beautiful interfaces that users remember."
        as="h1"
        spotlightRadius={130}
        spotlightSoftness={0.82}
        baseClassName="max-w-5xl text-5xl font-semibold leading-[1.04] text-white/15 sm:text-6xl md:text-7xl"
        highlightClassName="max-w-5xl text-5xl font-semibold leading-[1.04] text-transparent sm:text-6xl md:text-7xl"
        strokeColor="rgba(255,255,255,0.72)"
        strokeWidth={0.9}
      />
    </div>
  );
}
