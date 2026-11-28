"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { RadioPlanPricingPreview } from "@/components/blocks/pricing-section";

export function PreviewPricingPlanSelector() {
  return <RadioPlanPricingPreview />;
}
