"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { GooeyInput } from "@/components/gooey-input";

export function PreviewGooeySearch() {
  return (
    <div className="flex min-h-[380px] items-center justify-center">
      <GooeyInput
        placeholder="Search catalog…"
        collapsedWidth={160}
        expandedWidth={260}
        expandedOffset={80}
      />
    </div>
  );
}
