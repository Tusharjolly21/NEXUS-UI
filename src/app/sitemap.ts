import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { getAllPosts } from "@/lib/blog";

// Demo pages that have dedicated full-page routes.
const DEMO_SLUGS = [
  "background-boxes", "background-gradient", "cursor-text-reveal", "encrypted-text",
  "floating-dock", "glowing-effect-cards", "gooey-input",
  "image-trail", "infinite-moving-cards", "keyboard",
  "meteors", "signup-form", "sparkles", "squiggly-text",
  "stateful-button", "terminal", "text-generate-effect",
  "text-reveal-card", "typewriter-effect",
];

// Slug → lastmod for demo pages (matches the corresponding component's createdAt).
const DEMO_DATES: Record<string, string> = {
  "background-boxes":      "2026-01-15",
  "background-gradient":   "2026-01-15",
  "cursor-text-reveal":    "2026-05-22",
  "encrypted-text":        "2026-02-01",
  "floating-dock":         "2026-01-20",
  "glowing-effect-cards":  "2026-02-10",
  "gooey-input":           "2026-02-15",
  "image-trail":           "2026-03-01",
  "infinite-moving-cards": "2026-01-20",
  "keyboard":              "2026-03-10",
  "meteors":               "2026-01-15",
  "signup-form":           "2026-02-01",
  "sparkles":              "2026-01-15",
  "squiggly-text":         "2026-03-15",
  "stateful-button":       "2026-02-20",
  "terminal":              "2026-03-05",
  "text-generate-effect":  "2026-01-25",
  "text-reveal-card":      "2026-02-05",
  "typewriter-effect":     "2026-02-25",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // NOTE: Google ignores <priority> and <changefreq> — omitted intentionally.
  // <lastmod> is only emitted when it reflects a real content change date.

  const allPosts = await getAllPosts();

  // Catalog listing pages — lastmod is the most recent item added to each catalog.
  const latestComponent = libraryComponents.reduce((a, b) => a.createdAt > b.createdAt ? a : b);
  const latestTemplate  = templates.reduce((a, b) => a.createdAt > b.createdAt ? a : b);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                              lastModified: latestComponent.createdAt },
    { url: `${base}/components`,              lastModified: latestComponent.createdAt },
    { url: `${base}/blocks`,                  lastModified: latestTemplate.createdAt },
    { url: `${base}/templates`,               lastModified: latestTemplate.createdAt },
    { url: `${base}/pricing`,                 lastModified: "2026-04-01" },
    { url: `${base}/contact`,                 lastModified: "2026-01-01" },
    { url: `${base}/blog`,                    lastModified: allPosts[0]?.date ?? "2026-01-01" },
    { url: `${base}/template`,                lastModified: "2026-05-21" },
    { url: `${base}/docs/installation`,       lastModified: "2026-03-01" },
    { url: `${base}/docs/install-nextjs`,     lastModified: "2026-03-01" },
    { url: `${base}/docs/install-tailwindcss`,lastModified: "2026-03-01" },
    { url: `${base}/docs/add-utilities`,      lastModified: "2026-03-01" },
    { url: `${base}/docs/cli`,                lastModified: "2026-03-01" },
  ];

  const componentRoutes: MetadataRoute.Sitemap = libraryComponents.map((c) => ({
    url: `${base}/components/${c.slug}`,
    lastModified: c.createdAt,
  }));

  const templateRoutes: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${base}/templates/${t.slug}`,
    lastModified: t.createdAt,
  }));

  const blockRoutes: MetadataRoute.Sitemap = blocks.map((b) => ({
    url: `${base}/blocks/${b.slug}`,
    lastModified: "2026-04-01",
  }));

  const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ?? "2026-01-01",
  }));

  const demoRoutes: MetadataRoute.Sitemap = DEMO_SLUGS.map((slug) => ({
    url: `${base}/demos/${slug}`,
    lastModified: DEMO_DATES[slug] ?? "2026-01-15",
  }));

  return [...staticRoutes, ...componentRoutes, ...templateRoutes, ...blockRoutes, ...blogRoutes, ...demoRoutes];
}
