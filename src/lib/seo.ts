import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const site = getSiteUrl();

export const siteConfig = {
  name: "Nexus UI",
  shortName: "Nexus UI",
  // Shown in the browser tab and Google title link — keep under 60 chars
  tagline: "Free React UI Components & Next.js Templates",
  // Shown as Google snippet — keep under 155 chars
  description:
    "Free React components and Next.js templates built with Tailwind CSS and Framer Motion. Copy-paste animated UI blocks and ship faster.",
  url: site,
  twitterHandle: "@nexus_ui",
  // NOTE: Google explicitly does NOT use the <meta name="keywords"> tag.
  // Keywords are intentionally omitted — focus effort on titles, descriptions,
  // headings, and structured data instead (per Google SEO Starter Guide).
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

  const { openGraph: overrideOg, twitter: overrideTwitter, icons: overrideIcons, ...rest } = override;

  const icons = overrideIcons ?? {
    shortcut: [{ url: "/favicon.ico" }],
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon", sizes: "32x32", type: "image/png" },
      { url: "/icon2", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  };

  return {
    metadataBase,
    title: {
      default: `${siteConfig.name} — ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.name}`,
    },
    description: siteConfig.description,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: "technology",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons,
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
