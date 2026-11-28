import { ComponentsPageContent } from "@/components/listing/components-page-content";
import { metadata as componentsMetadata } from "@/app/(site)/components/page";
import { pricingForRegion } from "@/lib/region";

/**
 * The /components page as a signed-out visitor outside India sees it, built once and cached. Visitors never type this URL:
 * next.config.mjs rewrites "/components" here under the same conditions as the homepage (no sign-in cookie, no closed
 * banner, a Cloudflare country header that is not India; see components-static-in for India). The address bar keeps
 * "/components" and the canonical stays "/components".
 *
 * It must read nothing from the request: a cookies() or headers() call anywhere below would make it render on every visit
 * again. The build's route table should list this route as static.
 */
export const metadata = componentsMetadata;
export const revalidate = 3600;

export default function ComponentsStatic() {
  return <ComponentsPageContent pricing={pricingForRegion("global")} />;
}
