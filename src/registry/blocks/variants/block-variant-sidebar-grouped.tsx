"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import GroupedSidebar from "@/components/blocks/sidebar/grouped-sidebar";

export function PreviewBlockVariantSidebarGrouped() {
  return <GroupedSidebar />;
}
