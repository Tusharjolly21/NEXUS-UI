"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { RealTimeCursors } from "@/components/real-time-cursors";

export function PreviewRealTimeCursors() {
  return (
    <div className="w-full rounded-3xl">
      <RealTimeCursors className="w-full rounded-3xl" />
    </div>
  );
}
