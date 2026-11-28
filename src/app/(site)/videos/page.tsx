import { VideosPageContent } from "@/components/site-pages/videos-page";
import { getPricing } from "@/lib/region";

export { metadata } from "@/components/site-pages/videos-page";

export default async function VideosPage() {
  return <VideosPageContent pricing={await getPricing()} />;
}
