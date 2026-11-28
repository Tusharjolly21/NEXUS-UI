"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { ChatFaqSection } from "@/components/blocks/faq-folder-card";

export function PreviewBlockVariantFaqChat() {
  return <ChatFaqSection />;
}
