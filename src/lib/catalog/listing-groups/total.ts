import type { SidebarGroup } from "@/components/listing/listing-sidebar";

/** How many different pages a names column lists (an item under "New" and its own group counts once). */
export const totalOf = (groups: SidebarGroup[]) => new Set(groups.flatMap((g) => g.items.map((i) => i.href))).size;
