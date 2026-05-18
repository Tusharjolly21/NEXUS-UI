import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const site = getSiteUrl();

export const siteConfig = {
  name: "Nexus-UI",
  tagline: "Motion-built UI for ambitious product teams.",
  description:
    "Browse animated components, production templates, and blocks. Copy code, ship faster, and upgrade with premium access.",
  url: site,
};

export function createMetadata(override: Metadata = {}): Metadata {
  let metadataBase: URL;
  try {
    metadataBase = new URL(siteConfig.url);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }

  // Extract plain strings for OG image construction
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

  // Separate openGraph and twitter from the rest so we can deep-merge them
  const { openGraph: overrideOg, twitter: overrideTwitter, ...rest } = override;

  return {
    metadataBase,
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
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
      title: titleStr,
      description: descStr,
      images: [ogImageUrl],
      ...(overrideTwitter as object | undefined),
    },
  };
}
