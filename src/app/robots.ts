import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/dashboard/",
          "/api/",
          "/live-preview/",
          "/template-preview/",
          "/auth/",
          "/login",
          "/r/",
          "/sounds/",
          "/registry.json",
          "/world-atlas-110m.json",
          // Catalog filter/sort URL variants — same server HTML as base, canonical already set.
          // Blocking prevents crawl budget waste from additive parameter combinations.
          "/components?",
          "/blocks?",
          "/templates?",
          // Block base search page + all query variants (noindex, no crawl value).
          "/search",
        ],
      },
      // Globe texture assets — internal canvas images, not meaningful for Google Images.
      {
        userAgent: "Googlebot-Image",
        disallow: ["/images/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
