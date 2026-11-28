"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { DepthTestimonials } from "@/components/depth-testimonials";

export function PreviewTestimonialStack() {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center p-6">
      <DepthTestimonials className="max-w-[760px]" />
    </div>
  );
}
