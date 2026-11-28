"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { LayeredWaveHeroCustomizer } from "@/components/library/layered-wave-hero-customizer";

export function PreviewBlockVariantBackgroundsLayeredWave() {
  return <LayeredWaveHeroCustomizer />;
}
