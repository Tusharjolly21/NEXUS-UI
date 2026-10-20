"use client";

import { VectorTiltScene } from "@/components/vector-tilt-scene";

export function PreviewVectorTiltSceneRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <VectorTiltScene autoplay className={compact ? "max-w-[330px]" : "max-w-[360px]"} />
    </div>
  );
}
