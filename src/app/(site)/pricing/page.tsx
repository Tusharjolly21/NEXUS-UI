import { PricingSection } from "@/components/pricing/pricing-section";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description: "Compare Nexus-UI plans and unlock premium templates, blocks, and components.",
});

export default function PricingPage() {
  return <PricingSection />;
}
