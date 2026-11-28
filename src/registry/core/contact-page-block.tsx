"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { ContactPageBlockPreview } from "@/components/blocks/contact-page";

export function PreviewContactPageBlock() {
  return <ContactPageBlockPreview />;
}
