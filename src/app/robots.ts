import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

/** Never crawled: private areas, render frames, machine endpoints and faceted catalog URLs. */
const PRIVATE_AND_FACETED = [
  "/admin",
  "/dashboard",
  "/api/",
  "/live-preview/",
  "/template-preview/",
  "/auth/",
  "/login",
  "/r/",
  "/sounds/",
  "/registry.json",
  "/world-atlas-110m.json",
  // Catalog filter URL variants (?view=, ?cat=, ?bcat=) — faceted navigation, same page as the
  // base with a canonical already set. Google documents robots.txt as the right way to keep
  // crawlers out of faceted URLs; the clean category pages (/components/category/<slug>) and
  // block pages are what is meant to be indexed and are in the sitemap. These show up in
  // Search Console as "Blocked by robots.txt", which is expected, not an error.
  "/components?",
  "/blocks?",
  "/templates?",
  // Block base search page + all query variants (noindex, no crawl value).
  "/search",
  // Cloudflare rewrites mailto: links into /cdn-cgi/l/email-protection#... redirect-style URLs that
  // 404 when a crawler requests them without the fragment. They are not pages.
  "/cdn-cgi/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // "/api/og" is the share-card image every page names in og:image and twitter:image. Crawlers
        // that obey robots.txt (X, LinkedIn, Google) must be able to fetch it, so it stays open while
        // the rest of /api/ is closed: the longer rule wins.
        allow: ["/", "/api/og"],
        disallow: PRIVATE_AND_FACETED,
      },
      // Googlebot-Image obeys only its own group and ignores "*", so it repeats the shared rules.
      // Globe texture assets are internal canvas images, not meaningful for Google Images.
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/og"],
        disallow: [...PRIVATE_AND_FACETED, "/images/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
