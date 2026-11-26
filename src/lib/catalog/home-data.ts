import type { GalleryItem } from "@/components/gallery/types";
import snapshot from "./home-snapshot.generated.json";
import type { HomeCategory, HomeDrop, HomeSnapshot } from "./home-snapshot-config";

/**
 * What the homepage reads from the component catalogue. It comes from a small generated file instead of
 * library-components.ts, because importing that file ships the whole live-preview registry (1.9 MB of
 * script) to every visitor. See scripts/build-home-snapshot.mjs; scripts/check-client-reach.mjs guards this.
 */
const data = snapshot as unknown as HomeSnapshot;

/** The first `count` components of the homepage wall. */
export function homeWallItems(count: number): GalleryItem[] {
  return data.wall.slice(0, count);
}

/** The gallery-to-repo story's components, in story order. */
export function homeStoryItems(): GalleryItem[] {
  return data.story;
}

export function homeCategories(): HomeCategory[] {
  return data.categories;
}

export function homeDrops(): HomeDrop[] {
  return data.drops;
}
