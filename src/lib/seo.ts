import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const site = getSiteUrl();

export const siteConfig = {
  name: "Nexus UI",
  shortName: "Nexus UI",
  tagline: "Motion-built UI for ambitious product teams.",
  description:
    "Browse animated React components, production Next.js templates, and UI blocks. Copy-paste TypeScript, ship faster, and unlock premium access.",
  url: site,
  twitterHandle: "@nexus_ui",
  keywords: [
    "React components",
    "Next.js components",
    "animated UI components",
    "Framer Motion",
    "Tailwind CSS",
    "UI library",
    "component library",
    "landing page templates",
    "Next.js templates",
    "TypeScript",
    "shadcn/ui",
    "motion components",
  ],
};

export function createMetadata(override: Metadata = {}): Metadata {
  let metadataBase: URL;
  try {
    metadataBase = new URL(siteConfig.url);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }

  const titleStr =
    typeof override.title === "string" ? override.title : siteConfig.name;
  const descStr =
    typeof override.description === "string"
      ? override.description
      : siteConfig.tagline;

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: titleStr,
    description: descStr.slice(0, 120),
  }).toString()}`;
  const ogImages = [{ url: ogImageUrl, width: 1200, height: 630, alt: titleStr }];

  const { openGraph: overrideOg, twitter: overrideTwitter, ...rest } = override;

  return {
    metadataBase,
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    ...rest,
    openGraph: {
      title: titleStr,
      description: descStr,
      url: siteConfig.url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: ogImages,
      ...(overrideOg as object | undefined),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title: titleStr,
      description: descStr,
      images: [ogImageUrl],
      ...(overrideTwitter as object | undefined),
    },
  };
}
