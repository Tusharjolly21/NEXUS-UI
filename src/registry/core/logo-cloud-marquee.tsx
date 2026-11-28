"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import LogoCloudMarquee from "@/components/blocks/logo-clouds/logo-cloud-marquee";

export function PreviewLogoCloudMarquee() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div data-tile-focus className="w-[1040px] shrink-0">
        <LogoCloudMarquee className="py-8 sm:py-8" />
      </div>
    </div>
  );
}
