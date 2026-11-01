import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { videos } from "@/lib/catalog/videos";
import { ICONS, ICON_CATEGORIES } from "@/lib/icons/catalog";

/**
 * Real catalogue sizes. Marketing copy reads these instead of hard-coding numbers,
 * so "82 components" can never drift from what actually ships.
 * Server-side only in practice: `libraryComponents` pulls in the preview registry.
 */
export const CATALOG_COUNTS = {
  components: libraryComponents.length,
  freeComponents: libraryComponents.filter((c) => !c.premium).length,
  proComponents: libraryComponents.filter((c) => c.premium).length,
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
