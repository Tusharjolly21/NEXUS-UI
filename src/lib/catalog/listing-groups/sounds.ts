import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { SOUNDS, type SoundName } from "@/lib/ui-sounds";

/**
 * The free sounds by category. Sounds have no pages of their own, so each name plays its sound when pressed; the
 * Pro and recorded ones live on the board, where they load on demand.
 */
export function soundGroups(): SidebarGroup[] {
  const by = new Map<string, SidebarGroup>();
  for (const name of Object.keys(SOUNDS) as SoundName[]) {
    const { category, label } = SOUNDS[name];
    const g = by.get(category) ?? { id: category, label: category, items: [] };
    g.items.push({ name: label, href: `sound:${name}`, play: name });
    by.set(category, g);
  }
  return [...by.values()];
}
