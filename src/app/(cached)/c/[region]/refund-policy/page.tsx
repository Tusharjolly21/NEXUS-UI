import { RefundPolicyPageContent } from "@/components/site-pages/refund-policy-page";
import { pricingForRegion } from "@/lib/region";

// The cached copy of /refund-policy for signed-out visitors, with their region's prices. See next.config.mjs.
export { metadata } from "@/components/site-pages/refund-policy-page";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export default async function RefundPolicyPageCached({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <RefundPolicyPageContent pricing={pricingForRegion(region === "in" ? "india" : "global")} />;
}
