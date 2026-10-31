import fs from "node:fs";
import { cache } from "react";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "@/components/mdx/mdx-components";

export type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
};

const dir = path.join(process.cwd(), "content/blog");

export function getPostSlugs(): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getAllPosts(): Promise<(BlogFrontmatter & { slug: string })[]> {
  return getPostSlugs()
    .map((slug) => {
      const raw = fs.readFileSync(path.join(dir, `${slug}.mdx`), "utf8");
      const { data } = matter(raw);
      const fm = data as BlogFrontmatter;
      return { slug, ...fm };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* Cached per request: generateMetadata and the page both ask for the same post. */
export const getPost = cache(async (slug: string) => {
  // The slug comes from the URL; keep it to a file name inside content/blog.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const full = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { content, data } = matter(raw);
  const frontmatter = data as BlogFrontmatter;
  const { content: mdx } = await compileMDX({
    source: content,
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });
  return { frontmatter, content: mdx, slug };
});

/**
 * Posts that link to a component page, newest first — shown on that component's page so guides
 * and components point at each other. Read once per server process.
 */
let guideIndex: Map<string, { slug: string; title: string }[]> | null = null;

export function getGuidesForComponent(componentSlug: string) {
  if (!guideIndex) {
    guideIndex = new Map();
    const posts = getPostSlugs()
      .map((slug) => {
        const raw = fs.readFileSync(path.join(dir, `${slug}.mdx`), "utf8");
        const { content, data } = matter(raw);
        return { slug, title: String((data as BlogFrontmatter).title ?? slug), date: String((data as BlogFrontmatter).date ?? ""), content };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    for (const post of posts) {
      const linked = new Set([...post.content.matchAll(/\]\(\/components\/([a-z0-9-]+)\)/g)].map((m) => m[1]));
      for (const c of linked) {
        const list = guideIndex.get(c) ?? [];
        list.push({ slug: post.slug, title: post.title });
        guideIndex.set(c, list);
      }
    }
  }
  return (guideIndex.get(componentSlug) ?? []).slice(0, 3);
}
