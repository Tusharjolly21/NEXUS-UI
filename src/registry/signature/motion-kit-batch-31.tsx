"use client";

/**
 * Motion Kit previews (batch 31): Dither Field, Count Up Digits, Bento Grid.
 * Each plays its own demo until the visitor touches it, so the previews only add a light stage around them.
 */

import type { ReactNode } from "react";
import { BentoGrid } from "@/components/bento-grid";
import { CountUpDigits } from "@/components/count-up-digits";
import { DitherField } from "@/components/dither-field";

function Stage({ compact, width = 560, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewDitherField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={640}>
      <DitherField autoplay className={compact ? "h-[260px]" : "h-[340px]"}>
        <div className="pointer-events-none relative flex h-full flex-col items-start justify-end p-6 sm:p-8">
          <p className="rounded-xl bg-[#f5f5f7] px-3 py-2 text-2xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-3xl">
            Two colours, every shade.
          </p>
          <p className="mt-2 rounded-lg bg-[#f5f5f7] px-2.5 py-1 text-xs text-[#6e6e73]">Move over it, or press to send a ring.</p>
        </div>
      </DitherField>
    </Stage>
  );
}

const STATS = [
  { label: "Components", value: 334 },
  { label: "Installs", value: 12480 },
  { label: "Rating", value: 4.9, decimals: 1 },
];

export function PreviewCountUpDigits({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={600}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
          >
            <CountUpDigits
              value={s.value}
              decimals={s.decimals ?? 0}
              autoplay={i === 0}
              startOn="mount"
              className="text-4xl font-semibold tracking-[-0.03em] text-[#1d1d1f]"
            />
            <p className="mt-2.5 text-xs text-[#6e6e73]">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-[#6e6e73]">Press a number to count it again.</p>
    </Stage>
  );
}

export function PreviewBentoGrid({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={720}>
      <BentoGrid autoplay />
    </Stage>
  );
}
