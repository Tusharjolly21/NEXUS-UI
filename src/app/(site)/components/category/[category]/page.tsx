import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createMetadata, siteConfig } from "@/lib/seo";
import {
  getCategoryComponents,
  getCategoryCopy,
  getPopulatedCategories,
  isComponentCategory,
  isIndexableCategory,
} from "@/lib/catalog/category-seo";
import {
  getComponentCategoryHref,
  getComponentCategoryLabel,
} from "@/lib/catalog/taxonomy";
import { ChevronRight } from "lucide-react";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { getPricing } from "@/lib/region";
import { Band, PillLink } from "@/components/site";
import { allGalleryItems } from "@/lib/catalog/gallery-items";

type Props = { params: Promise<{ category: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getPopulatedCategories().map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isComponentCategory(category)) return {};
  const copy = getCategoryCopy(category);
  return createMetadata({
    title: copy.title,
    description: copy.description,
    alternates: { canonical: getComponentCategoryHref(category) },
    // Single-component categories would duplicate that component's page.
    ...(isIndexableCategory(category) ? {} : { robots: { index: false, follow: true } }),
  });
}

export default async function ComponentCategoryPage({ params }: Props) {
  const pricing = await getPricing();
  const { category } = await params;
  if (!isComponentCategory(category)) notFound();
  const items = getCategoryComponents(category);
  if (items.length === 0) notFound();

  const slugs = new Set(items.map((c) => c.slug));
  // pinned components (Lightfall) appear on every category page, first in the ones that are not their own
  const galleryItems = allGalleryItems()
    .filter((g) => slugs.has(g.slug) || g.pinned)
    .sort((a, b) => Number(!!b.pinned && !slugs.has(b.slug)) - Number(!!a.pinned && !slugs.has(a.slug)));

  const label = getComponentCategoryLabel(category);
  const copy = getCategoryCopy(category);
  const pageUrl = `${siteConfig.url}${getComponentCategoryHref(category)}`;
  const otherCategories = getPopulatedCategories().filter(
    (c) => c.slug !== category && isIndexableCategory(c.slug),
  );

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.heading,
    description: copy.description,
    url: pageUrl,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${siteConfig.url}/components/${c.slug}`,
      })),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Components", item: `${siteConfig.url}/components` },
      { "@type": "ListItem", position: 3, name: label, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Link href="/components" className="hover:text-foreground">
              Components
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {label}
            </span>
          </nav>
          <h1 className="pg-display mt-6 max-w-[900px] text-[clamp(44px,8vw,80px)] text-foreground">{copy.heading}</h1>
          <p className="mt-5 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">{copy.intro}</p>
        </div>
      </section>

      <section aria-label={`${label} gallery`} className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          {/* the For fun group is heavy (canvas, WebGL): its tiles start as posters and run when played */}
          <ComponentGallery items={galleryItems} pricing={pricing} playOnClick={category === "for-fun"} />
        </div>
      </section>

      {/* Server-rendered index: what crawlers and no-JS visitors read for the category. */}
      <Band tint="mint">
        <h2 className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
          All {label.toLowerCase()} in Nexus UI
        </h2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {items.map((c) => (
            <li key={c.slug}>
              <Link href={`/components/${c.slug}`} className="text-[17px] font-semibold text-foreground hover:underline">
                {c.name}
              </Link>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{c.description}</p>
            </li>
          ))}
        </ul>

        {otherCategories.length > 0 && (
          <div className="mt-14">
            <h2 className="text-[17px] font-semibold text-foreground">More component categories</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {otherCategories.map((c) => (
                <PillLink key={c.slug} href={getComponentCategoryHref(c.slug)} variant="white" size="sm">
                  {c.label}
                </PillLink>
              ))}
            </div>
          </div>
        )}
      </Band>
    </>
  );
}
