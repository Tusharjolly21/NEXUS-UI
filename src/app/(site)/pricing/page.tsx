import { PricingPageContent } from "@/components/site-pages/pricing-page";
import { getPricing } from "@/lib/region";

export { metadata } from "@/components/site-pages/pricing-page";

export default async function PricingPage() {
  return <PricingPageContent pricing={await getPricing()} />;
}
