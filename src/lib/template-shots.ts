import type { MarketplaceTemplate } from "@/lib/catalog/templates";

/**
 * Which screenshots a visitor gets for a template. Safe on client and server.
 *
 * Everyone sees the hero and the first section sharp; that is the free look. For a Pro template the
 * later sections (2 to 4) are not in public/ at all: owners load them through the gated
 * /api/template-shot route, everyone else gets a pre-blurred stand-in (public/templates/<slug>/
 * locked-<n>.webp) that keeps the colours but none of the design.
 */
export type TemplateShot = {
  src: string;
  /** True for a blurred stand-in: draw the lock over it. */
  locked: boolean;
  /** Gated images can't go through the image optimizer (it fetches without the visitor's cookies). */
  unoptimized: boolean;
};

/** Sections from this index on are Pro-only on a Pro template (index 0 is section-1). */
export const FIRST_LOCKED_SECTION = 1;

export function templateSectionShots(tmpl: MarketplaceTemplate, unlocked: boolean): TemplateShot[] {
  const sections = tmpl.previewImages?.sections ?? [];
  return sections.map((src, i) => {
    if (!tmpl.premium || i < FIRST_LOCKED_SECTION) return { src, locked: false, unoptimized: false };
    const n = i + 1;
    if (unlocked) return { src: `/api/template-shot/${encodeURIComponent(tmpl.slug)}/${n}`, locked: false, unoptimized: true };
    return { src: `/templates/${tmpl.slug}/locked-${n}.webp`, locked: true, unoptimized: false };
  });
}

/** Hero first, then the sections, for page tours. */
export function templatePageShots(tmpl: MarketplaceTemplate, unlocked: boolean): TemplateShot[] {
  if (!tmpl.previewImages) return [];
  return [{ src: tmpl.previewImages.hero, locked: false, unoptimized: false }, ...templateSectionShots(tmpl, unlocked)];
}
