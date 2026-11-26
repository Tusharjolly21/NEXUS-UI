/**
 * How the homepage snapshot is computed. ONLY scripts/build-home-snapshot.mjs imports this file: it pulls in
 * library-components.ts, and with it the live-preview registry (about 1.9 MB of script), which a page must not
 * do (see scripts/check-client-reach.mjs). The site itself reads the result from home-data.ts.
 */
import { getCategoryComponents, getPopulatedCategories } from "@/lib/catalog/category-seo";
import { allGalleryItems, homeGalleryItems } from "@/lib/catalog/gallery-items";
import { HOME_STORY_SLUGS, type HomeSnapshot } from "@/lib/catalog/home-snapshot-config";
import { libraryComponents } from "@/lib/catalog/library-components";
import { getComponentCategoryHref } from "@/lib/catalog/taxonomy";

const DROP_MONTHS = 3;
const DROP_PICKS = 4;
const CATEGORY_LIMIT = 16;

/** Groups the catalogue by the month each component shipped, newest first. */
function recentDrops(): HomeSnapshot["drops"] {
  const byMonth = new Map<string, typeof libraryComponents>();
  for (const c of libraryComponents) {
    const month = c.createdAt.slice(0, 7);
    byMonth.set(month, [...(byMonth.get(month) ?? []), c]);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, DROP_MONTHS)
    .map(([month, items]) => ({
      month,
      label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }),
      count: items.length,
      picks: [...items]
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, DROP_PICKS)
        .map(({ slug, name, premium }) => ({ slug, name, premium })),
    }));
}

export function buildHomeSnapshot(): HomeSnapshot {
  const everything = new Map(allGalleryItems().map((i) => [i.slug, i]));
  const story = HOME_STORY_SLUGS.map((slug) => {
    const item = everything.get(slug);
    if (!item) throw new Error(`home snapshot: story component "${slug}" is not in the catalogue`);
    return item;
  });
  return {
    wall: homeGalleryItems(),
    story,
    categories: getPopulatedCategories()
      .map((c) => ({ slug: c.slug, label: c.label, count: getCategoryComponents(c.slug).length, href: getComponentCategoryHref(c.slug) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, CATEGORY_LIMIT),
    drops: recentDrops(),
  };
}
