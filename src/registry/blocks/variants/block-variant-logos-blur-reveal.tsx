"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import LogoCloudBlur from "@/components/blocks/logo-clouds/logo-cloud-blur";

export function PreviewBlockVariantLogosBlurReveal() {
  return <LogoCloudBlur autoplay />;
}
