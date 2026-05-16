"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HoverHighlightText } from "./hover-highlight-text";

export function HoverHighlightTextDemo() {
  return (
    <section className="mx-auto flex min-h-[680px] max-w-6xl flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-black px-6 py-16 text-center">
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

      <p className="mt-8 max-w-2xl text-balance text-sm leading-6 text-zinc-400 sm:text-base">
        Move your cursor across the headline to reveal the stroked highlight layer.
      </p>

      <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
        <Link
          href="/components"
          className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950"
        >
          Browse Components
          <ArrowRight className="ml-2 size-4" />
        </Link>
        <Link
          href="/templates"
          className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur"
        >
          View Templates
        </Link>
      </div>
    </section>
  );
}
