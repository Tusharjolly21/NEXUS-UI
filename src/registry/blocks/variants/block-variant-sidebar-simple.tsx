"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import SimpleSidebar from "@/components/blocks/sidebar/simple-sidebar";

export function PreviewBlockVariantSidebarSimple() {
  return <SimpleSidebar />;
}
