"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";

export function PreviewInteractiveGlobeExplorer() {
  return (
    <div className="h-[620px] w-full overflow-hidden rounded-3xl bg-background">
      <InteractiveGlobeExplorer className="h-full rounded-3xl" />
    </div>
  );
}
