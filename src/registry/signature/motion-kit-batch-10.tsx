"use client";

/**
 * Motion Kit batch 10 previews: a wall of reviews that drifts in opposite directions. The component
 * drifts by itself, so the preview only adds a light stage around it.
 */

import { TestimonialWall } from "@/components/testimonial-wall";

export function PreviewTestimonialWall({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]">
      <TestimonialWall height={compact ? 380 : 460} />
    </div>
  );
}
