import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { templates } from "@/lib/catalog/templates";
import { templateName } from "@/components/templates/template-card";

/** One group per category, biggest first, each template under its own name. */
export function templateGroups(): SidebarGroup[] {
  const by = new Map<string, SidebarGroup>();
  for (const t of templates) {
    const g = by.get(t.category) ?? { id: t.category, label: t.category, items: [] };
    g.items.push({ name: templateName(t), href: `/templates/${t.slug}`, pro: t.premium });
    by.set(t.category, g);
  }
  return [...by.values()].sort((a, b) => b.items.length - a.items.length);
}

