"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import LogoCloudSpotlight from "@/components/blocks/logo-clouds/logo-cloud-spotlight";

export function PreviewBlockVariantLogosSpotlight() {
  return <LogoCloudSpotlight autoplay />;
}
