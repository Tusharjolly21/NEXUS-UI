"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { OrbitalLoader } from "@/components/orbital-loader";

export function PreviewLoaderOrbit() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center p-6">
      <OrbitalLoader />
    </div>
  );
}
