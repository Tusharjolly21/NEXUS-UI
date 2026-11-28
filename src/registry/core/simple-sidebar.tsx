"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";

export function PreviewSimpleSidebar() {
  // real size; the tall gallery tile frames the left of it (tile-fit.config.json focus): the sidebar and the first cards
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <div data-tile-focus className="w-[1000px] shrink-0 [&>div]:!h-[800px] [&>div]:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.35)]">
        <SimpleSidebar />
      </div>
    </div>
  );
}
