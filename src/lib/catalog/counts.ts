import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import componentCounts from "@/lib/catalog/component-counts.generated.json";
import { templates } from "@/lib/catalog/templates";
import { videos } from "@/lib/catalog/videos";
import { ICONS, ICON_CATEGORIES } from "@/lib/icons/catalog";

/**
 * Real catalogue sizes. Marketing copy reads these instead of hard-coding numbers,
 * so "82 components" can never drift from what actually ships.
 * The component numbers come from component-counts.generated.json (scripts/scan-catalog-counts.mjs, run
 * before every build and dev start), not from `libraryComponents`: importing that pulls the whole live-preview
 * registry into the layout, and every page then downloads it.
 */
export const CATALOG_COUNTS = {
  components: componentCounts.components,
  freeComponents: componentCounts.components - componentCounts.pro,
  proComponents: componentCounts.pro,
  templates: templates.length,
  freeTemplates: templates.filter((t) => !t.premium).length,
  blocks: blocksManifest.length,
  videos: videos.length,
  freeVideos: videos.filter((v) => !v.premium).length,
  icons: ICONS.length,
  freeIcons: ICONS.filter((i) => !i.premium).length,
  proIcons: ICONS.filter((i) => i.premium).length,
  iconCategories: ICON_CATEGORIES.length,
} as const;
