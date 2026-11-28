"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";

export function PreviewLogoCloudSpotlight() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-neutral-950">
      <div className="absolute left-1/2 top-1/2 w-[900px] -translate-x-1/2 -translate-y-1/2 scale-[0.6]">
        <LogoCloudSpotlight />
      </div>
    </div>
  );
}
