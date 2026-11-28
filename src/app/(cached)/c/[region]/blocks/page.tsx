import { BlocksPageContent } from "@/components/site-pages/blocks-page";
import { pricingForRegion } from "@/lib/region";

// The cached copy of /blocks for signed-out visitors, with their region's prices. See next.config.mjs.
export { metadata } from "@/components/site-pages/blocks-page";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export default async function BlocksPageCached({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <BlocksPageContent pricing={pricingForRegion(region === "in" ? "india" : "global")} />;
}
