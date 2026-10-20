"use client";

import { GlassLogin } from "@/components/glass-login-stack";

export function PreviewGlassLoginStackRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[720px] flex-col items-center gap-3">
        <GlassLogin autoplay onSignUp={compact ? undefined : () => {}} />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Move across the card to tilt the stack.</span>
      </div>
    </div>
  );
}
