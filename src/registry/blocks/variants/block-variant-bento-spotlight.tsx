"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { SpotlightBentoGridCustomizer } from "@/components/library/spotlight-bento-grid-customizer";

export function PreviewBlockVariantBentoSpotlight() {
  return <SpotlightBentoGridCustomizer />;
}
