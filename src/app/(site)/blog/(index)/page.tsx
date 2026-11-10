import Link from "next/link";
import type { Metadata } from "next";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { getAllPosts } from "@/lib/blog";
import { formatPostDate } from "@/lib/format-post-date";
import { createMetadata, siteConfig } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = createMetadata({
  title: "Blog: Framer Motion & Next.js Guides",
  description: "Guides on Framer Motion, Tailwind CSS, and shipping Next.js SaaS landing pages. Motion design patterns, copy-paste components, and developer tips.",
  alternates: { canonical: "/blog" },
});

const TINTS = ["bg-tint-violet", "bg-tint-sky", "bg-tint-peach", "bg-tint-mint", "bg-tint-butter", "bg-tint-pink"];

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
      name: siteConfig.siteName,
      url: siteConfig.url,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/icon2`, width: 192, height: 192 },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }} />

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Guides</h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">
            How to build landing pages with real <RainbowWord>motion</RainbowWord>: Framer Motion patterns, Tailwind
            layouts and the Next.js details that make them ship.
          </p>
        </div>
      </section>

      <section aria-label="Articles" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          {posts.length === 0 ? (
            <p className="rounded-tile bg-card px-6 py-16 text-center text-[17px] text-muted-foreground">
              No guides yet. In the meantime,{" "}
              <Link href="/components" className="font-semibold text-foreground underline underline-offset-4">
                browse the components
              </Link>
              .
            </p>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2">
              {posts.map((p, i) => (
                <li key={p.slug} className={cn(i === 0 && "md:col-span-2")}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="pg-float group flex h-full flex-col rounded-tile bg-card p-3 transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <div className={cn("rounded-[20px] px-6 pb-6 pt-16", TINTS[i % TINTS.length], i === 0 && "md:pt-28")}>
                      <h2
                        className={cn(
                          "pg-display text-foreground",
                          i === 0 ? "max-w-[760px] text-[clamp(30px,4vw,44px)] leading-[1.05]" : "text-[26px] leading-[1.1]",
                        )}
                      >
                        {p.title}
                      </h2>
                    </div>
                    <div className="flex flex-1 flex-col px-4 pb-3 pt-5">
                      <p className={cn("leading-relaxed text-muted-foreground", i === 0 ? "max-w-[720px] text-[17px]" : "text-[15px]")}>
                        {p.description}
                      </p>
                      {p.date ? (
                        <p className="mt-auto pt-5 text-[13.5px] font-medium text-muted-foreground">
                          <time dateTime={p.date}>{formatPostDate(p.date)}</time>
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Band tint="mint">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Read enough?</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              Every technique in these guides has a component you can install in one line.
            </p>
          </div>
          <PillLink href="/components" className="shrink-0">
            Browse components
          </PillLink>
        </div>
      </Band>
    </>
  );
}
