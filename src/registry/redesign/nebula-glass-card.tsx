"use client";

import { NebulaGlassCard } from "@/components/nebula-glass-card";

export function PreviewNebulaGlassCardRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <NebulaGlassCard autoplay hint={compact ? "" : undefined} />
    </div>
  );
}
