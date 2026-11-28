"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { CenteredContactForm } from "@/components/blocks/contact-page";

export function PreviewBlockVariantContactCentered() {
  return <CenteredContactForm />;
}
