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
    openGraph: {
      title: `${post.frontmatter.title} · ${siteConfig.name}`,
      type: "article",
      ...(post.frontmatter.date ? { publishedTime: new Date(post.frontmatter.date).toISOString() } : {}),
    },
    alternates: { canonical: `/blog/${slug}` },
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const dateIso = post.frontmatter.date
    ? new Date(post.frontmatter.date).toISOString()
    : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.frontmatter.title,
    description: post.frontmatter.description,
    url: `${siteConfig.url}/blog/${slug}`,
    ...(dateIso && { datePublished: dateIso, dateModified: dateIso }),
    image: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/api/og?${new URLSearchParams({
        title: post.frontmatter.title,
        description: (post.frontmatter.description ?? "").slice(0, 120),
        type: "article",
      }).toString()}`,
      width: 1200,
      height: 630,
    },
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${slug}`,
    },
    isPartOf: {
      "@type": "Blog",
      name: `${siteConfig.name} Blog`,
      url: `${siteConfig.url}/blog`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
      { "@type": "ListItem", position: 3, name: post.frontmatter.title, item: `${siteConfig.url}/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
    </>
  );
}
