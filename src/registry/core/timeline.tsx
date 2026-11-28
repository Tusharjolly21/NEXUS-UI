"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { MilestoneTimeline } from "@/components/milestone-timeline";

export function PreviewTimeline() {
  return (
    <div className="flex h-full min-h-[520px] w-full items-center justify-center p-6">
      <MilestoneTimeline className="max-w-[720px]" />
    </div>
  );
}
