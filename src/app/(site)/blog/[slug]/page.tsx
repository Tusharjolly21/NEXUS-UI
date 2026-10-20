import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getPost, getPostSlugs } from "@/lib/blog";
import { ChevronRight } from "lucide-react";
import { ArticleChrome } from "@/components/blog/article-chrome";
import { PillLink } from "@/components/site";
import { formatPostDate } from "@/lib/format-post-date";
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
      title: `${post.frontmatter.title} · ${siteConfig.siteName}`,
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
      name: siteConfig.siteName,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.siteName,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/nexus-ui-logo.png`,
        width: 192,
        height: 192,
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
        <article>
          <header className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-14 pt-[136px]">
            <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
            <div className="relative mx-auto max-w-[760px]">
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
                <Link href="/blog" className="hover:text-foreground">
                  Guides
                </Link>
                {post.frontmatter.date ? (
                  <>
                    <ChevronRight className="size-3.5" aria-hidden />
                    <time dateTime={post.frontmatter.date}>{formatPostDate(post.frontmatter.date)}</time>
                  </>
                ) : null}
              </nav>
              <h1 className="pg-display mt-6 text-[clamp(38px,6vw,60px)] leading-[1.04] text-foreground">
                {post.frontmatter.title}
              </h1>
              {post.frontmatter.description ? (
                <p className="mt-5 text-[19px] leading-[1.55] text-muted-foreground">{post.frontmatter.description}</p>
              ) : null}
            </div>
          </header>
          <div className="px-4 pb-24">
            <div className="mx-auto max-w-[760px] [&>*:first-child]:mt-0">{post.content}</div>
          </div>
        </article>
      </ArticleChrome>

      <section className="px-4 pb-24">
        <div className="mx-auto flex max-w-[760px] flex-col gap-4 rounded-tile bg-tint-sky p-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[17px] font-semibold text-foreground">Build it with the components from this guide.</p>
          <div className="flex shrink-0 gap-2">
            <PillLink href="/components" size="sm">
              Browse components
            </PillLink>
            <PillLink href="/blog" variant="white" size="sm">
              More guides
            </PillLink>
          </div>
        </div>
      </section>
    </>
  );
}
