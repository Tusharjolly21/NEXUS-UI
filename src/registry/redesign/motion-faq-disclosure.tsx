"use client";

import { MotionFaq } from "@/components/motion-faq-disclosure";

export function PreviewMotionFaqDisclosureRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[480px] w-full items-center justify-center p-6 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <MotionFaq autoplay contact={compact ? null : undefined} className={compact ? "max-w-[560px]" : "max-w-[940px]"} />
    </div>
  );
}
