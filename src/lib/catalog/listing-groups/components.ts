import type { GalleryItem } from "@/components/gallery/types";
import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { allGalleryItems } from "@/lib/catalog/gallery-items";
import { COMPONENT_SIDEBAR_SECTIONS } from "@/lib/catalog/taxonomy";

/**
 * The names column for each kind of page, shared by the listing pages and the detail pages, so the list a visitor
 * sees on the listing is the one that stays beside them on every page of one item. One file per kind, so a template
 * page never loads the component catalog (which carries every preview) just for its sidebar.
 */

const FUN_GROUP = "fun";

/** What is new this week first, then each group by size, with the just-for-fun ones last. */
/**
 * `withFun`: the just-for-fun toys have their own page and stay off the /components wall, so its column leaves them
 * out too (and its counts match the wall's); the pages of single components list them, so a toy's page has its group.
 */
export function componentGroups(all: GalleryItem[] = allGalleryItems(), { withFun = true }: { withFun?: boolean } = {}): SidebarGroup[] {
  const toItem = (i: GalleryItem) => ({ name: i.name, href: `/components/${i.slug}`, isNew: !!i.isRecent, pro: i.premium });
  // the same rule as the wall's New tab: the latest week or so of additions, newest first
  const fresh = all.filter((i) => i.isRecent && (withFun || i.group !== FUN_GROUP)).sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
  const groups = COMPONENT_SIDEBAR_SECTIONS.map((sec) => ({
    id: sec.id,
    label: sec.label,
    items: all.filter((i) => i.group === sec.id).map(toItem),
  }))
    .filter((g) => g.items.length && (withFun || g.id !== FUN_GROUP))
    .sort((a, b) => Number(a.id === FUN_GROUP) - Number(b.id === FUN_GROUP) || b.items.length - a.items.length);
  return fresh.length ? [{ id: "new", label: "New this week", short: "New", items: fresh.map(toItem) }, ...groups] : groups;
}

