"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { FaqFolderCard } from "@/components/blocks/faq-folder-card";

export function PreviewBlockVariantFaqFolder() {
  return <FaqFolderCard />;
}
