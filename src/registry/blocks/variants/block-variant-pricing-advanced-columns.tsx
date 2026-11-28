"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { AdvancedPricingColumns } from "@/components/blocks/pricing-section";

export function PreviewBlockVariantPricingAdvancedColumns() {
  return <AdvancedPricingColumns />;
}
