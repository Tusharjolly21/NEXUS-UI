import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { SOUNDS } from "@/lib/ui-sounds";
import { PRICES, formatPrice } from "@/lib/pricing";
import { getVideo } from "@/lib/catalog/videos";

/**
 * A video's starting copy with the live numbers swapped in: the real component, block, template
 * and sound counts and the real plan prices. Server-side only (CATALOG_COUNTS pulls in the
 * component registry); pass the result to client components as props.
 */
export function videoDefaults(slug: string): Record<string, string> {
  const base = { ...(getVideo(slug)?.defaults ?? {}) };
  const sounds = Object.keys(SOUNDS).length;
  if (slug === "launch-reel") {
    base.stat = `${CATALOG_COUNTS.components} animated components.`;
  }
  if (slug === "bento-tour") {
    base.n1 = String(CATALOG_COUNTS.components);
    base.n2 = String(sounds);
    base.n3 = String(CATALOG_COUNTS.templates);
  }
  if (slug === "install-seconds") {
    base.sub = `${CATALOG_COUNTS.components} components. One command each.`;
  }
  if (slug === "hero-loop") {
    base.sub = `${CATALOG_COUNTS.components} animated components for React.`;
  }
  if (slug === "price-reveal") {
    base.items = `${CATALOG_COUNTS.components} components, ${CATALOG_COUNTS.blocks} blocks, ${CATALOG_COUNTS.templates} templates, ${sounds} sounds`;
    base.price = formatPrice(PRICES.allAccess);
    base.alt = `or ${formatPrice(PRICES.pro)} a year`;
    base.pill = `${CATALOG_COUNTS.freeComponents} components free to try`;
  }
  return base;
}
