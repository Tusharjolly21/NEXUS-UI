"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { BentoShowcase } from "@/components/registry/bento-showcase";

export function PreviewBentoShowcase() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <BentoShowcase className="h-full" />
    </div>
  );
}
