"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import CollapsibleSidebar from "@/components/blocks/sidebar/collapsible-sidebar";

export function PreviewBlockVariantSidebarCollapsible() {
  return <CollapsibleSidebar />;
}
