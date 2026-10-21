import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";

const site = getSiteUrl();

export const siteConfig = {
  name: "Nexus UI",
  shortName: "Nexus UI",
  /**
   * The name search engines show above the URL. "Nexus UI" alone collides with other projects, so
   * Google fell back to the bare domain; a distinct site name (also used in WebSite / Organization
   * structured data and og:site_name) gives it one name to trust.
   */
  siteName: "Nexus UI Labs",
  alternateNames: ["Nexus Labs", "Nexus UI"],
  // Shown in the browser tab and Google title link — keep under 60 chars
  tagline: "Animated React Components & Templates",
  // Shown as Google snippet — keep under 155 chars
  description:
    "Free animated React components and Next.js templates built with Tailwind CSS and Framer Motion. Copy-paste, or install with the shadcn CLI.",
  url: site,
  // Official accounts only. Left empty until Nexus UI has its own profiles — a handle owned
  // by someone else would tie the brand to their account in Google and AI answers.
  twitterHandle: null as string | null, // e.g. "@nexusui"
  /** Organization `sameAs` URLs (X, GitHub, 21st.dev, LinkedIn…), also listed in public/llms.txt. */
  socialProfiles: [] as string[],
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
    typeof override.title === "string" ? override.title : siteConfig.siteName;
  const descStr =
    typeof override.description === "string"
      ? override.description
      : siteConfig.tagline;

  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: titleStr,
    description: descStr.slice(0, 120),
  }).toString()}`;
  const ogImages = [{ url: ogImageUrl, width: 1200, height: 630, alt: titleStr }];

  const { openGraph: overrideOg, twitter: overrideTwitter, icons: overrideIcons, alternates, ...rest } = override;

  // Derive canonical path from alternates.canonical so OG URL matches the page, not the homepage.
  const canonicalPath =
    typeof alternates?.canonical === "string" ? alternates.canonical : undefined;
  const pageUrl = canonicalPath
    ? `${siteConfig.url.replace(/\/$/, "")}${canonicalPath}`
    : siteConfig.url;

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
      default: `${siteConfig.siteName} — ${siteConfig.tagline}`,
      template: `%s · ${siteConfig.siteName}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.siteName,
    authors: [{ name: siteConfig.siteName, url: siteConfig.url }],
    creator: siteConfig.siteName,
    publisher: siteConfig.siteName,
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
    alternates,
    ...rest,
    openGraph: {
      title: titleStr,
      description: descStr,
      url: pageUrl,
      siteName: siteConfig.siteName,
      locale: "en_US",
      type: "website",
      images: ogImages,
      ...(overrideOg as object | undefined),
    },
    twitter: {
      card: "summary_large_image",
      ...(siteConfig.twitterHandle
        ? { site: siteConfig.twitterHandle, creator: siteConfig.twitterHandle }
        : {}),
      title: titleStr,
      description: descStr,
      images: [ogImageUrl],
      ...(overrideTwitter as object | undefined),
    },
  };
}
