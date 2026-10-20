"use client";

import { DepthTestimonials } from "@/components/depth-testimonials";

export function PreviewDepthTestimonialsRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <DepthTestimonials autoplay heading={compact ? "" : "Loved by people who ship"} className={compact ? "max-w-[400px]" : ""} />
    </div>
  );
}
