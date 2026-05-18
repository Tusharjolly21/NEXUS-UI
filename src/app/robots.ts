import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/", "/live-preview/", "/template-preview/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
