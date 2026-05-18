import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { getPostSlugs } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/components`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blocks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/templates`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/docs/installation`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/docs/install-nextjs`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/install-tailwindcss`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/add-utilities`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/docs/cli`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const componentRoutes: MetadataRoute.Sitemap = libraryComponents.map((c) => ({
    url: `${base}/components/${c.slug}`,
    lastModified: new Date(c.createdAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const templateRoutes: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${base}/templates/${t.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blockRoutes: MetadataRoute.Sitemap = blocks.map((b) => ({
    url: `${base}/blocks/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getPostSlugs().map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...componentRoutes, ...templateRoutes, ...blockRoutes, ...blogRoutes];
}
