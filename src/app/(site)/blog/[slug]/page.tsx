import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPost, getPostSlugs } from "@/lib/blog";
import { ArticleChrome } from "@/components/blog/article-chrome";
import { createMetadata, siteConfig } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return createMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.description,
    openGraph: { title: `${post.frontmatter.title} · ${siteConfig.name}` },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <ArticleChrome>
      <article className="mx-auto max-w-3xl px-4 py-14">
        <Link href="/blog" className="text-xs text-primary transition-colors hover:text-foreground">
          ← All guides
        </Link>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{post.frontmatter.date}</p>
        <h1 className="mt-2 text-4xl font-semibold text-foreground">{post.frontmatter.title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{post.frontmatter.description}</p>
        <div className="mt-10">{post.content}</div>
      </article>
    </ArticleChrome>
  );
}
