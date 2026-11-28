import { ComponentsJsonLd } from "@/components/listing/components-jsonld";
import { ComponentsPageContent } from "@/components/listing/components-page-content";
import { metadata as componentsMetadata } from "@/app/(site)/components/page";
import { pricingForRegion } from "@/lib/region";

/** The /components page with rupee prices, for visitors Cloudflare places in India. See components-static for how it is served. */
export const metadata = componentsMetadata;
export const revalidate = 3600;

export default function ComponentsStaticIn() {
  return (
    <>
      <ComponentsJsonLd />
      <ComponentsPageContent pricing={pricingForRegion("india")} />
    </>
  );
}
