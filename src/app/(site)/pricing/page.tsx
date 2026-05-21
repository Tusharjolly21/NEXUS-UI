import { PricingSection } from "@/components/pricing/pricing-section";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    description: "Free and premium plans for the Nexus UI React component library. Unlock animated Next.js components, full-page templates, and UI blocks with a one-time license.",
    alternates: { canonical: "/pricing" },
  }),
  title: { absolute: "Pricing — Nexus UI React Component Library" },
};

export default function PricingPage() {
  return <PricingSection />;
}
