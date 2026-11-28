"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { HoverHighlightText } from "@/components/hover-highlight-text";

export function PreviewHoverHighlightTextBanner() {
  return (
    <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-12 text-center">
      <HoverHighlightText
        text="Polished motion without the noise."
        as="h2"
        spotlightRadius={112}
        spotlightSoftness={0.82}
        baseClassName="max-w-4xl text-4xl font-semibold leading-tight text-white/15 sm:text-5xl md:text-6xl"
        highlightClassName="max-w-4xl text-4xl font-semibold leading-tight text-transparent sm:text-5xl md:text-6xl"
        strokeColor="rgba(255,255,255,0.72)"
      />
    </div>
  );
}
