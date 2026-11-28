"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { ParticleNoiseHeroCustomizer } from "@/components/library/particle-noise-hero-customizer";

export function PreviewBlockVariantBackgroundsParticleNoise() {
  return <ParticleNoiseHeroCustomizer />;
}
