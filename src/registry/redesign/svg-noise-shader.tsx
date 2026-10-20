"use client";

import { SvgNoise } from "@/components/svg-noise-shader";

export function PreviewSvgNoiseShaderRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <SvgNoise autoplay className={compact ? "h-[300px]" : "h-[340px]"} />
    </div>
  );
}
