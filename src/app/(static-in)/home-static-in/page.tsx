import { HomeContent } from "@/components/home-cinematic/home-content";
import { metadata as homeMetadata } from "@/app/(site)/page";
import { pricingForRegion } from "@/lib/region";

/**
 * The same cached homepage for signed-out visitors in India, with the rupee prices checkout charges them
 * (or the dollar prices, where the India products aren't configured: the rule `getPricing` applies per
 * request). next.config.mjs rewrites "/" here when Cloudflare's country header says "IN".
 */
export const metadata = homeMetadata;
export const revalidate = 3600;

export default function HomeStaticIndia() {
  return <HomeContent pricing={pricingForRegion("india")} />;
}
