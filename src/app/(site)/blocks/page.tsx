import type { Metadata } from "next";
import Link from "next/link";
import type { TileTint } from "@/components/gallery/types";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { blocks } from "@/lib/catalog/blocks";
import { getPreviewExportName } from "@/lib/catalog/library-components";
import { createMetadata } from "@/lib/seo";
import { BlocksGallery, type BlockItem } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "UI Blocks for Next.js — Tailwind CSS & Framer Motion",
  description: `${blocks.length} full-section UI blocks for Next.js: pricing, FAQ, contact, logo clouds, text animations and more. Built with Tailwind CSS and Framer Motion.`,
  alternates: { canonical: "/blocks" },
});

const TINTS: TileTint[] = ["violet", "sky", "peach", "mint", "butter", "pink"];

export default function BlocksPage() {
  const items: BlockItem[] = blocks.map((b, i) => ({
    slug: b.slug,
    name: b.name,
    description: b.description,
    category: b.category,
    premium: b.premium,
    variants: b.variants.length,
    exportName: getPreviewExportName(b.Preview),
    tint: TINTS[i % TINTS.length],
  }));
  const free = items.filter((b) => !b.premium).length;

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Blocks</h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Whole sections that <RainbowWord>drop</RainbowWord> straight into a page: pricing, FAQ, contact, logo
            clouds and more. {free} of the {items.length} are free.
          </p>
        </div>
      </section>

      <section aria-label="Block gallery" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <BlocksGallery items={items} />
        </div>
      </section>

      <Band tint="sky">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Need the whole page?</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              Templates put sections like these together into finished landing pages.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PillLink href="/templates">See templates</PillLink>
            <PillLink href="/components" variant="white">
              Browse components
            </PillLink>
          </div>
        </div>
      </Band>

      {/* every block as a plain link, for crawlers and screen-reader navigation */}
      <nav aria-label="All blocks" className="sr-only">
        <ul>
          {blocks.map((b) => (
            <li key={b.slug}>
              <Link href={`/blocks/${b.slug}`}>{b.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
