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
import { ComponentsCatalog } from "../../_catalog";

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
  const { category } = await params;
  if (!isComponentCategory(category)) notFound();
  const items = getCategoryComponents(category);
  if (items.length === 0) notFound();

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
      <ComponentsCatalog
        categoryIntro={{ label, heading: copy.heading, intro: copy.intro, count: items.length }}
      >
        {/* Server-rendered index — the virtualized grid above renders nothing until hydration,
            so this is what crawlers (and no-JS visitors) see for the category. */}
        <section className="mt-20 border-t border-border/50 pt-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              All {label.toLowerCase()} in Nexus UI
            </h2>
            <ul className="mt-6 divide-y divide-border/50">
              {items.map((c) => (
                <li key={c.slug} className="py-4">
                  <Link
                    href={`/components/${c.slug}`}
                    className="text-base font-semibold text-foreground transition hover:text-primary"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </li>
              ))}
            </ul>

            {otherCategories.length > 0 && (
              <div className="mt-12">
                <h2 className="text-base font-semibold text-foreground">More component categories</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {otherCategories.map((c) => (
                    <Link
                      key={c.slug}
                      href={getComponentCategoryHref(c.slug)}
                      className="inline-flex h-8 items-center rounded-full bg-foreground/[0.06] px-3.5 text-sm text-foreground/80 transition hover:bg-foreground/10 hover:text-foreground"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </ComponentsCatalog>
    </>
  );
}
