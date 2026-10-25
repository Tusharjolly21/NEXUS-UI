"use client";

/**
 * Motion Kit batch 10 previews: a wall of reviews that drifts in opposite directions. The component
 * drifts by itself, so the preview only adds a light stage around it.
 */

import { TestimonialWall } from "@/components/testimonial-wall";
import { ShredderDelete } from "@/components/shredder-delete";

export function PreviewTestimonialWall({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]">
      <TestimonialWall height={compact ? 380 : 460} />
    </div>
  );
}

/** Shredder Delete previews: the card plays its own demo (the Auto switch inside it turns that off). */
export function PreviewShredderDelete({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center bg-[#f5f5f7] p-4 sm:p-6 dark:bg-[#f5f5f7]">
      <div className={compact ? "w-full max-w-[400px]" : "w-full max-w-[440px]"}>
        <ShredderDelete autoplay />
      </div>
    </div>
  );
}
