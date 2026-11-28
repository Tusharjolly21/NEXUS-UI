"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { GlobalSignalContact } from "@/components/blocks/contact-page";

export function PreviewBlockVariantContactGlobalSignal() {
  return <GlobalSignalContact />;
}
