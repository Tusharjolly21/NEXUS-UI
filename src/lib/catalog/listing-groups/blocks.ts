import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { blocksManifest as blocks } from "@/lib/catalog/blocks-manifest";
import { blockVariants, variantAnchor } from "@/lib/catalog/block-variants";

/** Wall order for blocks: the liveliest first. */
export const BLOCK_ORDER = [
  "block-hero",
  "block-gallery",
  "block-pricing-section",
  "block-features",
  "block-checkout-moments",
  "block-why-choose-us",
  "block-social-proof",
  "block-changelog",
  "block-logo-clouds",
  "block-navigation",
  "block-faq-folder-card",
  "block-newsletter",
  "block-signup",
  "block-comparison",
  "block-cta",
  "block-footer",
  "block-404",
  "block-sidebar",
  "block-contact-page",
  "block-interactive-dots",
  "block-text-animations",
  "block-blog-content-sections",
];

/** Shorter names for blocks, for chips and the names column. */
export const BLOCK_SHORT_NAME: Record<string, string> = {
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
  "block-gallery": "Gallery",
  "block-changelog": "Changelog",
  "block-404": "404 pages",
  "block-comparison": "Comparison",
  "block-cta": "CTA",
  "block-footer": "Footers",
  "block-signup": "Sign-up",
};

const blockRank = (slug: string) => {
  const i = BLOCK_ORDER.indexOf(slug);
  return i === -1 ? 99 : i;
};

/** Each block, in the wall's order, with its sections; every section links to its place on the block's page. */
export function blockGroups(): SidebarGroup[] {
  const bySlug = new Map(blocks.map((b) => [b.slug, b]));
  return [...new Set(blockVariants.map((v) => v.block))]
    .filter((slug) => bySlug.has(slug))
    .sort((a, b) => blockRank(a) - blockRank(b))
    .map((slug) => ({
      id: slug,
      label: BLOCK_SHORT_NAME[slug] ?? bySlug.get(slug)!.name,
      href: `/blocks/${slug}`,
      items: blockVariants
        .filter((v) => v.block === slug)
        .map((v) => ({
          name: v.title,
          href: `/blocks/${slug}#${variantAnchor(v.title)}`,
          isNew: Boolean(v.registryCliName) || slug === "block-checkout-moments",
        })),
    }));
}

