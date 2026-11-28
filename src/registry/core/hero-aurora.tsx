"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { HeroAurora } from "@/components/hero-aurora-spotlight";

export function PreviewHeroAurora() {
  return (
    <div className="flex h-full min-h-[560px] w-full items-center justify-center p-6">
      <HeroAurora className="max-w-[980px]" />
    </div>
  );
}
