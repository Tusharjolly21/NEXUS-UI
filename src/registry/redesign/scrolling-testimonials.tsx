"use client";

import { ScrollingTestimonials } from "@/components/scrolling-testimonials";

export function PreviewScrollingTestimonialsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="w-full max-w-[640px]">
        <ScrollingTestimonials autoplay showHeader={!compact} height={compact ? 330 : 380} />
      </div>
    </div>
  );
}
