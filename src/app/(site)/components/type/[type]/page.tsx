import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createMetadata, siteConfig } from "@/lib/seo";
import {
  getIndexableTypes,
  getTypeCollection,
  getTypeComponents,
  getTypeHref,
  isIndexableType,
  TYPE_COLLECTIONS,
} from "@/lib/catalog/type-collections";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { excerpt } from "@/lib/catalog/excerpt";
import { getPricing } from "@/lib/region";
import { Band, PillLink } from "@/components/site";
import { allGalleryItems } from "@/lib/catalog/gallery-items";

type Props = { params: Promise<{ type: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TYPE_COLLECTIONS.map((t) => ({ type: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const collection = getTypeCollection(type);
  if (!collection) return {};
  return createMetadata({
    title: collection.title,
    description: collection.description,
    alternates: { canonical: getTypeHref(collection.slug) },
    ...(isIndexableType(collection) ? {} : { robots: { index: false, follow: true } }),
  });
}

export default async function ComponentTypePage({ params }: Props) {
  const pricing = await getPricing();
  const { type } = await params;
  const collection = getTypeCollection(type);
  if (!collection) notFound();
  const items = getTypeComponents(collection);
  if (items.length === 0) notFound();

  const order = new Map(items.map((c, i) => [c.slug, i]));
  const galleryItems = allGalleryItems()
    .filter((g) => order.has(g.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0));

  const proCount = items.filter((c) => c.premium).length;
  const freeCount = items.length - proCount;
  const pageUrl = `${siteConfig.url}${getTypeHref(collection.slug)}`;
  const others = getIndexableTypes().filter((t) => t.slug !== collection.slug);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.heading,
    description: collection.description,
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
      { "@type": "ListItem", position: 3, name: collection.heading, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[128px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
            <Link href="/components" className="hover:text-foreground">
              Components
            </Link>
            <ChevronRight className="size-3.5" aria-hidden />
            <span aria-current="page" className="font-medium text-foreground">
              {collection.heading}
            </span>
          </nav>
          <h1 className="pg-display mt-6 max-w-[900px] text-[clamp(44px,8vw,80px)] text-foreground">
            {collection.heading}
          </h1>
          <p className="mt-5 max-w-[680px] text-[19px] leading-[1.55] text-muted-foreground">{collection.intro}</p>
          <p className="mt-4 text-[15px] text-muted-foreground">
            {items.length} {collection.noun}: {freeCount} free{proCount > 0 ? ` and ${proCount} Pro` : ""}.
          </p>
        </div>
      </section>

      <section aria-label={`${collection.heading} gallery`} className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 className="sr-only">{`Browse ${collection.heading}`}</h2>
          <ComponentGallery items={galleryItems} pricing={pricing} />
        </div>
      </section>

      {/* Server-rendered index: what crawlers and no-JS visitors read for the collection. */}
      <Band tint="mint">
        <h2 className="pg-display text-[clamp(32px,4.5vw,44px)] leading-[1.02] text-foreground">
          All {collection.noun} in Nexus UI
        </h2>
        <ul className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {items.map((c) => (
            <li key={c.slug}>
              <Link href={`/components/${c.slug}`} className="text-[17px] font-semibold text-foreground hover:underline">
                {c.name}
              </Link>
              <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">{excerpt(c.description)}</p>
            </li>
          ))}
        </ul>

        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="text-[17px] font-semibold text-foreground">More component types</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {others.map((t) => (
                <PillLink key={t.slug} href={getTypeHref(t.slug)} variant="white" size="sm">
                  {t.heading.replace(/^React /, "").replace(/ Components?$/, "").replace(/: .*$/, "")}
                </PillLink>
              ))}
            </div>
          </div>
        )}
      </Band>
    </>
  );
}
