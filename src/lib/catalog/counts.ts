import { blocksManifest } from "@/lib/catalog/blocks-manifest";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";

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
  blocks: blocksManifest.length,
} as const;
