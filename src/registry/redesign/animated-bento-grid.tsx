"use client";

import { AnimatedBentoGrid, type BentoVariant } from "@/components/animated-bento-grid";

function Stage({ variant, compact }: { variant: BentoVariant; compact: boolean }) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <AnimatedBentoGrid autoplay variant={variant} columns={3} className={compact ? "max-w-[620px]" : "max-w-[760px]"} />
    </div>
  );
}

export function PreviewAnimatedBentoGridRedesign({ compact = false }: { compact?: boolean } = {}) {
  return <Stage variant="default" compact={compact} />;
}

export function PreviewAnimatedBentoGridGlassRedesign({ compact = false }: { compact?: boolean } = {}) {
  return <Stage variant="glass" compact={compact} />;
}

export function PreviewAnimatedBentoGridBorderRedesign({ compact = false }: { compact?: boolean } = {}) {
  return <Stage variant="gradient-border" compact={compact} />;
}
