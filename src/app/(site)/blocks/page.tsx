import type { Metadata } from "next";
import Link from "next/link";
import type { TileTint } from "@/components/gallery/types";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { blocks } from "@/lib/catalog/blocks";
import { blockVariants, variantAnchor } from "@/lib/catalog/block-variants";
import { getTileFit } from "@/lib/catalog/tile-fit";
import { createMetadata } from "@/lib/seo";
import { BlocksGallery, type BlockFilter, type BlockTileItem } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "UI Blocks for Next.js — Tailwind CSS & Framer Motion",
  description: `${blocks.length} full-section UI blocks for Next.js: heroes, navigation, pricing, testimonials, FAQ, contact and more. Built with Tailwind CSS and Framer Motion.`,
  alternates: { canonical: "/blocks" },
});

/** Wall order: the liveliest blocks first. */
const ORDER = [
  "block-hero",
  "block-pricing-section",
  "block-features",
  "block-checkout-moments",
  "block-why-choose-us",
  "block-social-proof",
  "block-logo-clouds",
  "block-navigation",
  "block-faq-folder-card",
  "block-newsletter",
  "block-sidebar",
  "block-contact-page",
  "block-interactive-dots",
  "block-text-animations",
  "block-blog-content-sections",
];

/** Shorter chip labels than the block names. */
const CHIP_NAME: Record<string, string> = {
  "block-hero": "Heroes",
  "block-navigation": "Navigation",
  "block-features": "Features",
  "block-social-proof": "Social proof",
  "block-newsletter": "Newsletter",
  "block-pricing-section": "Pricing",
  "block-checkout-moments": "Checkout",
  "block-why-choose-us": "Feature bentos",
  "block-logo-clouds": "Logo clouds",
  "block-faq-folder-card": "FAQ",
  "block-sidebar": "Sidebars",
  "block-contact-page": "Contact",
  "block-interactive-dots": "Backgrounds",
  "block-text-animations": "Text animations",
  "block-blog-content-sections": "Blog",
};

const TINTS: TileTint[] = ["violet", "sky", "peach", "mint", "butter", "pink"];

export default function BlocksPage() {
  const bySlug = new Map(blocks.map((b) => [b.slug, b]));
  const rank = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? 99 : i;
  };

  // Interleave the blocks so the wall mixes sections instead of running one block after another.
  const queues = [...new Set(blockVariants.map((v) => v.block))]
    .sort((a, b) => rank(a) - rank(b))
    .map((slug) => blockVariants.filter((v) => v.block === slug));
  const ordered = [];
  for (let round = 0; queues.some((q) => q.length > round); round++) {
    for (const q of queues) if (q[round]) ordered.push(q[round]);
  }

  const items: BlockTileItem[] = ordered.map((v, i) => {
    const block = bySlug.get(v.block)!;
    return {
      slug: v.id,
      name: v.title,
      description: block.description,
      categoryLabel: block.category,
      group: "blocks",
      interactions: [],
      exportName: v.exportName,
      tint: TINTS[i % TINTS.length],
      fit: getTileFit(v.id),
      install: block.registryCliName ?? block.slug,
      isNew: Boolean(v.registryCliName) || v.block === "block-checkout-moments",
      demo: null,
      block: v.block,
      premium: v.premium ?? block.premium,
      blockName: block.name,
      href: `/blocks/${v.block}#${variantAnchor(v.title)}`,
    };
  });

  const filters: BlockFilter[] = queues.map((q) => ({
    slug: q[0].block,
    name: CHIP_NAME[q[0].block] ?? bySlug.get(q[0].block)!.name,
    count: q.length,
  }));
  const free = blocks.filter((b) => !b.premium).length;

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Blocks</h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Whole sections that <RainbowWord>drop</RainbowWord> straight into a page: heroes, navigation, pricing,
            testimonials, FAQ and more. {items.length} sections across {blocks.length} blocks, {free} of them free.
          </p>
        </div>
      </section>

      <section aria-label="Block gallery" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <BlocksGallery items={items} filters={filters} />
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
