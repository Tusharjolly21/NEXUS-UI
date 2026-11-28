import { BlocksPageContent } from "@/components/site-pages/blocks-page";
import { getPricing } from "@/lib/region";

export { metadata } from "@/components/site-pages/blocks-page";

export default async function BlocksPage() {
  return <BlocksPageContent pricing={await getPricing()} />;
}
