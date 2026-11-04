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
  // Official accounts only: a handle owned by someone else would tie the brand to their account
  // in Google and AI answers.
  twitterHandle: "@nexusuilabs" as string | null,
  /** Organization `sameAs` URLs (X, GitHub, 21st.dev, LinkedIn…), also listed in public/llms.txt. */
  socialProfiles: ["https://x.com/nexusuilabs", "https://www.instagram.com/nexusuilabs/"] as string[],
  // NOTE: Google explicitly does NOT use the <meta name="keywords"> tag.
  // Keywords are intentionally omitted — focus effort on titles, descriptions,
  // headings, and structured data instead (per Google SEO Starter Guide).
};

/** What the share card says about a page, where it differs from the page's own title. */
export type ShareCard = {
  /** The big words on the card. Defaults to the page title without the site name. */
  title?: string;
  /** The small pill in the corner. Defaults to the kind of page, from its address. */
  kind?: string;
  /** Adds a Pro pill. */
  pro?: boolean;
};

const KIND_BY_PATH: [RegExp, string][] = [
  [/^\/components\/./, "Component"],
  [/^\/templates\/./, "Template"],
  [/^\/blocks\/./, "Block"],
  [/^\/videos\/./, "Video"],
  [/^\/icons\/./, "Icon"],
  [/^\/blog\/./, "Blog"],
  [/^\/docs(\/|$)/, "Docs"],
];

/** The page title as the card shows it: without the site name or the generic "— Animated React Component" ending. */
function cardTitle(title: string) {
  return title
    .replace(/\s+[·|]\s+Nexus UI( Labs)?$/, "")
    .replace(/\s+—\s+(Nexus UI( Labs)?|Animated React Component|Next\.js Landing Page Template|Next\.js UI Block)$/, "")
    .trim();
}

/**
 * A page description short enough for Google (about 155 characters) and a share card: whole
 * sentences while they fit, otherwise cut at a word with an ellipsis.
 */
export function shortDescription(text: string, max = 155) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  // a sentence ends at . ! or ? followed by a space and a capital or a number, so "Next.js" stays whole
  const sentences = clean.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  if (out.length >= max * 0.5) return out;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,.;:—–-]+$/, "")}…`;
}

export function createMetadata(override: Metadata = {}, card: ShareCard = {}): Metadata {
  let metadataBase: URL;
  try {
    metadataBase = new URL(siteConfig.url);
  } catch {
    metadataBase = new URL("http://localhost:3000");
  }

  const rawTitle = override.title;
  const titleStr =
    typeof rawTitle === "string"
      ? rawTitle
      : rawTitle && typeof rawTitle === "object" && "absolute" in rawTitle && typeof rawTitle.absolute === "string"
        ? rawTitle.absolute
        : siteConfig.siteName;
  const descStr =
    typeof override.description === "string"
      ? override.description
      : siteConfig.tagline;

  const path = typeof override.alternates?.canonical === "string" ? override.alternates.canonical : "";
  const kind = card.kind ?? KIND_BY_PATH.find(([re]) => re.test(path))?.[1];
  const ogImageUrl = `/api/og?${new URLSearchParams({
    title: card.title ?? cardTitle(titleStr),
    description: shortDescription(descStr, 120),
    ...(kind ? { kind } : {}),
    ...(card.pro ? { pro: "1" } : {}),
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
