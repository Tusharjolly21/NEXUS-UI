"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { AnimatedBentoGrid } from "@/components/animated-bento-grid";

const BENTO_PREVIEW_ITEMS = [
  { id: "1", label: "Latency", value: "42ms", span: "1x1" as const },
  {
    id: "2",
    label: "Uptime",
    value: "99.99%",
    span: "2x1" as const,
    trend: { value: 0.1, label: "vs last month" },
  },
  { id: "3", label: "Signals", value: "1.2M", span: "1x1" as const },
  {
    id: "4",
    label: "Edge",
    value: "12 regions",
    span: "1x1" as const,
    trend: { value: 20, label: "new this quarter" },
  },
];

export function PreviewAnimatedBentoGrid() {
  return (
    <div className="relative h-[220px] overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
      <div className="lf-grid absolute inset-0 opacity-30" />
      <AnimatedBentoGrid
        items={BENTO_PREVIEW_ITEMS}
        variant="default"
        columns={3}
        className="relative h-full"
        itemClassName="h-full"
      />
    </div>
  );
}
