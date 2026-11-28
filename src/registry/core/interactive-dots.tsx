"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { InteractiveDots } from "@/components/interactive-dots";

export function PreviewInteractiveDots() {
  return (
    <div className="relative flex h-[220px] w-full items-center justify-center overflow-hidden bg-[#05070d]">
      <InteractiveDots
        mode="lines"
        dotSpacing={30}
        dotSize={2.2}
        interactionRadius={130}
        repulsionStrength={44}
        lineDistance={70}
        lineOpacity={0.32}
        showToggle={false}
        className="!absolute inset-0 h-full min-h-0 rounded-none border-0"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent,rgba(0,0,0,0.55)_80%)]" />
      <div data-tile-focus className="pointer-events-none relative flex h-[820px] w-[560px] shrink-0 flex-col justify-end pb-16">
        <p className="w-fit rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[14px] font-medium text-white/75">
          Fieldwork 2.0 is out
        </p>
        <h2 className="mt-5 text-[52px] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
          See where your users actually look.
        </h2>
        <p className="mt-5 text-[18px] leading-7 text-white/65">
          Attention maps for every page, and which part of the layout is doing the work.
        </p>
        <div className="mt-7 flex gap-3">
          <span className="rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-zinc-950">Start free trial</span>
          <span className="rounded-full border border-white/15 px-5 py-2.5 text-[15px] font-semibold text-white">Watch demo</span>
        </div>
      </div>
    </div>
  );
}
