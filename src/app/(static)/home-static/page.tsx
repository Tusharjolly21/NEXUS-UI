import { HomeContent } from "@/components/home-cinematic/home-content";
import { metadata as homeMetadata } from "@/app/(site)/page";
import { pricingForRegion } from "@/lib/region";

/**
 * The homepage as a signed-out visitor outside India sees it, built once and cached. Visitors never type this
 * URL: next.config.mjs rewrites "/" here when the request has no sign-in cookie and Cloudflare says the visitor
 * is not in India (see home-static-in for India). The address bar keeps "/" and the canonical stays "/", so
 * there is no second page to index (no noindex either: crawlers fetch "/" and are served this very HTML, so
 * noindex here would hide the homepage).
 *
 * It must read nothing from the request: a cookies() or headers() call anywhere below would make it render on
 * every visit again, which is what made the homepage slow to open (scripts/check-client-reach.mjs and the
 * build's route table, which should list this route as static, catch that).
 */
export const metadata = homeMetadata;
export const revalidate = 3600;

export default function HomeStatic() {
  return <HomeContent pricing={pricingForRegion("global")} />;
}
