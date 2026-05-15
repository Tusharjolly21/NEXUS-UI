import fs from "node:fs";
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

export async function getPost(slug: string) {
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
}
