"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";

const WhyChooseUsBento = React.lazy(
  () => import("@/components/blocks/animated-bento-grid"),
);

export function PreviewWhyChooseUs() {
  return (
    <div className="relative flex h-[220px] w-full items-start justify-center overflow-hidden bg-white dark:bg-zinc-950">
      <div data-tile-focus className="pointer-events-none mt-6 h-[820px] w-[1180px] shrink-0 overflow-hidden">
        <React.Suspense fallback={null}>
          <WhyChooseUsBento />
        </React.Suspense>
      </div>
    </div>
  );
}
