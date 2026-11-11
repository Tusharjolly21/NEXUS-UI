import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { ICON_CATEGORIES, ICONS } from "@/lib/icons/catalog";

/** Icons by their category, in the catalogue's order, each linking to its own page. */
export function iconGroups(): SidebarGroup[] {
  return ICON_CATEGORIES.map((c) => ({
    id: c.slug,
    label: c.label,
    items: ICONS.filter((i) => i.category === c.slug).map((i) => ({ name: i.title, href: `/icons/${i.slug}`, pro: i.premium })),
  })).filter((g) => g.items.length);
}
