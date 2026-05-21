import Link from "next/link";
import { ArrowRight, BookOpen, Rss } from "lucide-react";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = createMetadata({
  title: "Blog",
  description: "Guides on motion design, Tailwind, and shipping SaaS landing pages.",
  alternates: { canonical: "/blog" },
});

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${siteConfig.name} Blog`,
    description: "Guides on motion design, Tailwind, and shipping SaaS landing pages.",
    url: `${siteConfig.url}/blog`,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon.svg`, width: 512, height: 512 },
    },
    ...(posts.length > 0 && {
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.title,
        description: p.description,
        url: `${siteConfig.url}/blog/${p.slug}`,
        ...(p.date && { datePublished: new Date(p.date).toISOString() }),
      })),
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
    <div className="mx-auto max-w-3xl space-y-12 px-4 py-10 md:py-14">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/25 px-6 py-10 dark:bg-white/[0.025] sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-primary/6 blur-[72px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />

        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary ">
            <Rss className="size-3.5" />
            Guides & essays
          </div>

          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Deep dives on{" "}
            <span className="text-foreground">
              motion & shipping
            </span>
          </h1>

          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            In-depth articles on motion design, Tailwind composition, and how we think about
            developer-first marketing pages. We cover Framer Motion patterns, Next.js App Router
            techniques, copy-paste component architecture, and the design decisions behind
            building production SaaS landing pages with TypeScript.
          </p>

          {posts.length > 0 && (
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">{posts.length}</span>{" "}
              {posts.length === 1 ? "article" : "articles"}
            </p>
          )}
        </div>
      </section>

      {/* ── Posts list ── */}
      {posts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-16 text-center dark:bg-white/[0.02]">
          <BookOpen className="mx-auto size-10 text-muted-foreground/40" />
          <p className="mt-4 text-sm font-medium text-foreground">No posts yet</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Check back soon — new guides are on the way.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group block rounded-2xl border border-border/60 bg-background/80 p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:bg-white/[0.03] dark:hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                    {p.date}
                  </p>
                  <h2 className="text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {p.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ── Bottom CTA ── */}
      <div className="flex flex-col items-center gap-3 border-t border-border/50 pt-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted-foreground">
          Want to ship faster? Explore the component catalog.
        </p>
        <Link
          href="/components"
          className={cn(
            buttonVariants({ size: "sm" }),
            "shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90",
          )}
        >
          Browse catalog
          <ArrowRight className="ml-1.5 size-3.5" />
        </Link>
      </div>

    </div>
    </>
  );
}
