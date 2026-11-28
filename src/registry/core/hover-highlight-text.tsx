"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { HoverHighlightText } from "@/components/hover-highlight-text";

function PreviewHoverHighlightTextHero() {
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

function PreviewHoverHighlightTextBanner() {
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

export function PreviewHoverHighlightText({
  compact = true,
}: { compact?: boolean } = {}) {
  return compact ? (
    <div className="flex min-h-[280px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black px-5 text-center">
      <HoverHighlightText
        text="Hover highlight reveal"
        as="h2"
        spotlightRadius={88}
        spotlightSoftness={0.82}
        baseClassName="text-4xl font-semibold leading-tight text-white/15 sm:text-5xl"
        highlightClassName="text-4xl font-semibold leading-tight text-transparent sm:text-5xl"
        strokeColor="rgba(255,255,255,0.72)"
      />
    </div>
  ) : (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4">
      <PreviewHoverHighlightTextHero />
      <PreviewHoverHighlightTextBanner />
    </div>
  );
}
