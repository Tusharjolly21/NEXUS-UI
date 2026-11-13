import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { videos } from "@/lib/catalog/videos";
import { getAllPosts } from "@/lib/blog";
import { alternatives } from "@/lib/alternatives";
import { getCategoryComponents, getPopulatedCategories, isIndexableCategory } from "@/lib/catalog/category-seo";
import { getComponentCategoryHref } from "@/lib/catalog/taxonomy";
import { ICONS } from "@/lib/icons/catalog";

// Every page's markup changed on this date (component redesign, Pro-only templates, new pricing),
// so no lastmod is older than it.
// (/demos/* pages are full-screen versions of component pages and canonicalise to them, so they
// are left out of the sitemap.)
const REDESIGN = "2026-10-20";
const since = (date: string | undefined) => (date && date > REDESIGN ? date : REDESIGN);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;

  // NOTE: Google ignores <priority> and <changefreq> — omitted intentionally.
  // <lastmod> is only emitted when it reflects a real content change date.

  const allPosts = await getAllPosts();

  // Catalog listing pages — lastmod is the most recent item added to each catalog.
  const latestComponent = libraryComponents.reduce((a, b) => a.createdAt > b.createdAt ? a : b);
  const latestTemplate  = templates.reduce((a, b) => a.createdAt > b.createdAt ? a : b);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                              lastModified: since(latestComponent.createdAt) },
    { url: `${base}/components`,              lastModified: since(latestComponent.createdAt) },
    { url: `${base}/icons`,                   lastModified: since(ICONS.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt) },
    { url: `${base}/icons/sounds`,            lastModified: since(ICONS.reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt) },
    { url: `${base}/blocks`,                  lastModified: since("2026-10-20") },
    { url: `${base}/sounds`,                  lastModified: since("2026-10-20") },
    { url: `${base}/videos`,                  lastModified: since("2026-10-22") },
    { url: `${base}/templates`,               lastModified: since(latestTemplate.createdAt) },
    { url: `${base}/pricing`,                 lastModified: since("2026-04-01") },
    { url: `${base}/contact`,                 lastModified: since("2026-01-01") },
    { url: `${base}/privacy`,                 lastModified: since("2026-10-19") },
    { url: `${base}/terms`,                   lastModified: since("2026-10-19") },
    { url: `${base}/refund-policy`,           lastModified: since("2026-10-21") },
    { url: `${base}/blog`,                    lastModified: since(allPosts[0]?.date ?? "2026-01-01") },
    { url: `${base}/docs/introduction`,        lastModified: since("2026-03-01") },
    { url: `${base}/docs/installation`,       lastModified: since("2026-03-01") },
    { url: `${base}/docs/video-tutorial`,     lastModified: since("2026-11-02") },
    { url: `${base}/docs/install-nextjs`,     lastModified: since("2026-03-01") },
    { url: `${base}/docs/install-tailwindcss`,lastModified: since("2026-03-01") },
    { url: `${base}/docs/add-utilities`,      lastModified: since("2026-10-20") },
    { url: `${base}/docs/cli`,                lastModified: since("2026-10-21") },
    { url: `${base}/docs/videos`,             lastModified: since("2026-10-22") },
    { url: `${base}/docs/icons`,              lastModified: since("2026-11-01") },
    { url: `${base}/claude-code`,             lastModified: since("2026-10-21") },
    { url: `${base}/mcp`,                     lastModified: since("2026-11-08") },
    { url: `${base}/impact`,                  lastModified: since("2026-11-10") },
    { url: `${base}/alternatives`,            lastModified: since("2026-10-21") },
    ...alternatives.map((a) => ({ url: `${base}/alternatives/${a.slug}`, lastModified: since("2026-10-21") })),
  ];

  const componentRoutes: MetadataRoute.Sitemap = libraryComponents.map((c) => ({
    url: `${base}/components/${c.slug}`,
    lastModified: since(c.createdAt),
  }));

  const iconRoutes: MetadataRoute.Sitemap = ICONS.map((i) => ({
    url: `${base}/icons/${i.slug}`,
    lastModified: since(i.createdAt),
  }));

  // Category landing pages — lastmod is the newest component in the category.
  const categoryRoutes: MetadataRoute.Sitemap = getPopulatedCategories()
    .filter((c) => isIndexableCategory(c.slug))
    .map((c) => ({
      url: `${base}${getComponentCategoryHref(c.slug)}`,
      lastModified: since(getCategoryComponents(c.slug).reduce((a, b) => (a.createdAt > b.createdAt ? a : b)).createdAt),
    }));

  const templateRoutes: MetadataRoute.Sitemap = templates.map((t) => ({
    url: `${base}/templates/${t.slug}`,
    lastModified: since(t.createdAt),
  }));

  const blockRoutes: MetadataRoute.Sitemap = blocks.map((b) => ({
    url: `${base}/blocks/${b.slug}`,
    lastModified: since("2026-10-20"),
  }));

  const videoRoutes: MetadataRoute.Sitemap = videos.map((v) => ({
    url: `${base}/videos/${v.slug}`,
    lastModified: since(v.createdAt),
  }));

  const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: since(post.date ?? "2026-01-01"),
  }));

  return [...staticRoutes, ...categoryRoutes, ...componentRoutes, ...iconRoutes, ...templateRoutes, ...blockRoutes, ...videoRoutes, ...blogRoutes];
}
