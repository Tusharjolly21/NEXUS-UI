import type { ComponentType } from "react";
import * as Previews from "@/registry/component-previews";
import { blocksManifest, type BlockCategory, type BlockManifestEntry } from "./blocks-manifest";

export type { BlockCategory, BlockManifestEntry };

export type MarketplaceBlock = BlockManifestEntry & { Preview: ComponentType };

const PREVIEW_BY_SLUG: Record<string, ComponentType> = {
  "block-hero-beam": Previews.PreviewBeamSweep,
  "block-bento-signals": Previews.PreviewBentoMetrics,
  "block-pricing-toggle": Previews.PreviewPricingToggle,
  "block-testimonial-depth": Previews.PreviewTestimonialStack,
  "block-logo-orbit": Previews.PreviewNavbarFloating,
  "block-stats-kpi": Previews.PreviewDashboardKpi,
  "block-cta-nebula": Previews.PreviewCtaGlow,
  "block-faq-motion": Previews.PreviewFaq,
  "block-blog-editorial": Previews.PreviewBlogRail,
};

export const blocks: MarketplaceBlock[] = blocksManifest.map((b) => {
  const Preview = PREVIEW_BY_SLUG[b.slug];
  if (!Preview) throw new Error(`Missing block preview for slug: ${b.slug}`);
  return { ...b, Preview };
});

export function getBlock(slug: string) {
  return blocks.find((b) => b.slug === slug) ?? null;
}
