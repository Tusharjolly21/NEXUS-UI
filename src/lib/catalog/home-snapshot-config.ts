import type { GalleryItem } from "@/components/gallery/types";

/**
 * What the homepage reads from the catalog, frozen into src/lib/catalog/home-snapshot.generated.json by
 * scripts/build-home-snapshot.mjs. Kept apart from home-data.ts so the generator can import it before
 * the JSON exists.
 */

/** The gallery-to-repo story: a search to find it, sliders to tweak it, a terminal to add it. */
export const HOME_STORY_SLUGS = ["lens-search", "bolting-sliders", "terminal"] as const;

export type HomeDrop = {
  month: string;
  label: string;
  count: number;
  picks: { slug: string; name: string; premium: boolean }[];
};

export type HomeCategory = { slug: string; label: string; count: number; href: string };

export type HomeSnapshot = {
  /** Every component the homepage may show on its wall, in order (the catalogue's home picks). */
  wall: GalleryItem[];
  /** The story's components, by slug (they need not be among the wall's). */
  story: GalleryItem[];
  /** Component categories with at least one component, busiest first. */
  categories: HomeCategory[];
  /** The most recent months of releases, newest first. */
  drops: HomeDrop[];
};
