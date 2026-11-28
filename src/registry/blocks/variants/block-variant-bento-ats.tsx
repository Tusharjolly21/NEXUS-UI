"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { AtsBentoGridHeroCustomizer } from "@/components/library/ats-bento-grid-hero-customizer";

export function PreviewBlockVariantBentoAts() {
  return <AtsBentoGridHeroCustomizer />;
}
