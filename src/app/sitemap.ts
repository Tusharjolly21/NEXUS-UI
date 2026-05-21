import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { getAllPosts } from "@/lib/blog";

const DEMO_SLUGS = [
  "background-boxes", "background-gradient", "encrypted-text",
  "floating-dock", "glowing-effect-cards", "gooey-input",
  "image-trail", "infinite-moving-cards", "keyboard",
  "meteors", "signup-form", "sparkles", "squiggly-text",
  "stateful-button", "terminal", "text-generate-effect",
  "text-reveal-card", "typewriter-effect",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/components`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blocks`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/templates`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/template`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
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

  const allPosts = await getAllPosts();
  const blogRoutes: MetadataRoute.Sitemap = allPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const demoRoutes: MetadataRoute.Sitemap = DEMO_SLUGS.map((slug) => ({
    url: `${base}/demos/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...componentRoutes, ...templateRoutes, ...blockRoutes, ...blogRoutes, ...demoRoutes];
}
