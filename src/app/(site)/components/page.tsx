import type { Metadata } from "next";
import Link from "next/link";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { getPopulatedCategories, isIndexableCategory } from "@/lib/catalog/category-seo";
import { allGalleryItems, galleryCategories } from "@/lib/catalog/gallery-items";
import { getComponentCategoryHref } from "@/lib/catalog/taxonomy";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Animated React Components with Tailwind CSS",
  description:
    "Free animated React components for Next.js, built with Tailwind CSS and Framer Motion: text effects, backgrounds, sidebars, cards and more. Copy-paste or install with the shadcn CLI.",
  alternates: { canonical: "/components" },
});

export default function ComponentsPage() {
  const items = allGalleryItems();

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(48px,8vw,84px)] leading-[1.02] text-foreground">
            Components that feel <RainbowWord>alive</RainbowWord>.
          </h1>
          <p className="mt-5 max-w-[600px] text-[19px] leading-[1.55] text-muted-foreground">
            Springs, physics and the small details that usually take a week to get right. Play with any of them below, then add it
            to your React app with one command.
          </p>
        </div>
      </section>

      <section aria-label="Component gallery" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <ComponentGallery items={items} categories={galleryCategories(items)} searchable />

          <nav aria-labelledby="by-category" className="mt-20">
            <h2 id="by-category" className="text-[17px] font-semibold text-foreground">
              Browse by category
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {getPopulatedCategories()
                .filter((c) => isIndexableCategory(c.slug))
                .map((c) => (
                  <li key={c.slug}>
                    <PillLink href={getComponentCategoryHref(c.slug)} variant="white" size="sm">
                      {c.label}
                    </PillLink>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      </section>

      <Band tint="mint">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Can&apos;t find the one you need?</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              Tell us what you&apos;re building and we&apos;ll consider it for the next drop. Or start from a whole page.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PillLink href="/contact">Ask for a component</PillLink>
            <PillLink href="/templates" variant="white">
              See templates
            </PillLink>
          </div>
        </div>
      </Band>

      {/* every component as a plain link, for crawlers and screen-reader navigation */}
      <nav aria-label="All components" className="sr-only">
        <ul>
          {items.map((i) => (
            <li key={i.slug}>
              <Link href={`/components/${i.slug}`}>{i.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
