import type { Metadata } from "next";
import { HomeContent } from "@/components/home-cinematic/home-content";
import { getPricing } from "@/lib/region";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata(
    { title: { absolute: `${siteConfig.siteName} — ${siteConfig.tagline}` }, description: siteConfig.description, alternates: { canonical: "/" } },
    { title: "Animated React components, blocks and templates", shot: "wall" },
  ),
};

/**
 * The regular homepage: prices follow the visitor's country, so this route reads the request and is built
 * per visit. Signed-out visitors never get here; next.config.mjs sends them to a cached copy of the same page
 * (src/app/(static)), with the prices already chosen.
 */
export default async function Home() {
  return <HomeContent pricing={await getPricing()} />;
}
