"use client";

import { ShaderFlow } from "@/components/shader-flow";

export function PreviewShaderFlowRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <ShaderFlow autoplay className={compact ? "min-h-[380px] w-full max-w-[960px]" : "min-h-[440px] w-full max-w-[960px]"} />
    </div>
  );
}
