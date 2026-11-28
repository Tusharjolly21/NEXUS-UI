"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { MotionFaq } from "@/components/motion-faq-disclosure";

export function PreviewFaq() {
  return (
    <div className="flex h-full min-h-[480px] w-full items-center justify-center p-6">
      <MotionFaq className="max-w-[940px]" />
    </div>
  );
}
