import { PricingPageContent } from "@/components/site-pages/pricing-page";
import { pricingForRegion } from "@/lib/region";

// The cached copy of /pricing for signed-out visitors, with their region's prices. See next.config.mjs.
export { metadata } from "@/components/site-pages/pricing-page";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export default async function PricingPageCached({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <PricingPageContent pricing={pricingForRegion(region === "in" ? "india" : "global")} />;
}
