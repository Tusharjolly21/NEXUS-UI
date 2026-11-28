import { VideosPageContent } from "@/components/site-pages/videos-page";
import { pricingForRegion } from "@/lib/region";

// The cached copy of /videos for signed-out visitors, with their region's prices. See next.config.mjs.
export { metadata } from "@/components/site-pages/videos-page";

export const revalidate = 3600;

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export default async function VideosPageCached({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  return <VideosPageContent pricing={pricingForRegion(region === "in" ? "india" : "global")} />;
}
