import type { Metadata } from "next";
import type { TileTint } from "@/components/gallery/types";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { blocks } from "@/lib/catalog/blocks";
import { blockVariants, variantAnchor } from "@/lib/catalog/block-variants";
import { getTileFit } from "@/lib/catalog/tile-fit";
import { createMetadata } from "@/lib/seo";
import { getPricing } from "@/lib/region";
import { ListingShell } from "@/components/listing/listing-shell";
import { ListingGroupChips, ListingSidebar, RESULTS_ID, type SidebarGroup } from "@/components/listing/listing-sidebar";
import { BLOCK_ORDER as ORDER, BLOCK_SHORT_NAME as CHIP_NAME, blockGroups } from "@/lib/catalog/listing-groups/blocks";
import { ProBand, ProRail, type PromoCopy } from "@/components/listing/pro-promo";
import { BlocksGallery, type BlockFilter, type BlockTileItem } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "Animated React Blocks for Next.js",
  description: `${blocks.length} animated section blocks for React and Next.js: heroes, navigation, pricing, testimonials, FAQ, footers and more. Built with Tailwind CSS and Framer Motion.`,
  alternates: { canonical: "/blocks" },
});

const TINTS: TileTint[] = ["violet", "sky", "peach", "mint", "butter", "pink"];

/** The wall's New tab lists what was added in the last week of additions, counted back from the newest one (the same rule as the components wall). */
const NEW_TAB_DAYS = 7;
const day = (iso?: string) => (iso ? Date.parse(iso) || 0 : 0);

export default async function BlocksPage() {
  const pricing = await getPricing();
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

  const newest = Math.max(...blockVariants.map((v) => day(v.addedAt)));

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
      isRecent: day(v.addedAt) > 0 && newest - day(v.addedAt) <= NEW_TAB_DAYS * 24 * 60 * 60 * 1000,
      addedAt: day(v.addedAt),
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
  const free = items.filter((i) => !i.premium).length;

  const pro = items.length - free;
  // the same New tab the page always had (the latest additions), first, then every block
  const fresh = items.filter((i) => i.isRecent);
  const groups: SidebarGroup[] = [
    ...(fresh.length ? [{ id: "new", label: "New", items: fresh.map((i) => ({ name: i.name, href: i.href, pro: i.premium })) }] : []),
    ...blockGroups(),
  ];
  const copy: PromoCopy = {
    title: ["Every block with ", "Pro", ""],
    body: `${pro} Pro sections across ${blocks.length} blocks: heroes, pricing, checkout, navigation and more. Paste one in and make it yours.`,
    band: "Every block with Pro",
  };

  return (
    <>
      <ListingShell
        sidebar={<ListingSidebar title="Blocks" total={items.length} groups={groups} param="block" />}
        rail={<ProRail copy={copy} pricing={pricing} />}
      >
        <h1 className="pg-display text-[clamp(52px,7vw,84px)] text-foreground">Blocks</h1>
        <p className="mt-5 max-w-[640px] text-[18px] leading-[1.55] text-muted-foreground">
          Whole sections that <RainbowWord>drop</RainbowWord> straight into a page: heroes, navigation, pricing,
          testimonials, FAQ and more. {items.length} sections across {blocks.length} blocks, {free} of them free.
        </p>

        <section id={RESULTS_ID} aria-label="Block gallery" className="mt-10 scroll-mt-24">
          <ListingGroupChips groups={groups} total={items.length} param="block" className="mb-4" />
          <BlocksGallery items={items} filters={filters} afterFilters={<ProBand copy={copy} pricing={pricing} className="mt-5" />} />
        </section>
      </ListingShell>

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

    </>
  );
}
