/**
 * search-index.ts — SERVER ONLY
 *
 * The search palette's catalog, reduced to what it shows and matches on. The full catalog carries
 * every component's source and a live Preview, so importing it into the browser costs well over a
 * megabyte; this is a few hundred rows of text, served as static JSON from /api/search-index.
 * Previews are not in here: the palette loads one by `exportName` only for the highlighted row.
 */

import { libraryComponents, getPreviewExportName } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { videos } from "@/lib/catalog/videos";
import { getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { ICONS, getCategory } from "@/lib/icons/catalog";
import { ICON_USES } from "@/lib/icons/uses";

export type SearchEntryKind = "component" | "template" | "block" | "video" | "icon";

export type SearchEntry = {
  id: string;
  kind: SearchEntryKind;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  premium: boolean;
  score: number;
  tags: string[];
  /** Extra words the entry should match on that aren't in the fields above (slug, full title, …). */
  keywords: string;
  /** Name of the export in component-previews.tsx, for entries that have a live preview. */
  exportName?: string;
};

export function buildSearchIndex(): SearchEntry[] {
  const components: SearchEntry[] = libraryComponents.map((c) => ({
    id: `component:${c.slug}`,
    kind: "component",
    title: c.name,
    subtitle: getComponentCategoryLabel(c.categorySlug),
    description: c.description,
    href: `/components/${c.slug}`,
    premium: c.premium,
    score: c.trendingScore,
    tags: c.tags,
    keywords: `${c.slug} ${c.categorySlug}`,
    exportName: getPreviewExportName(c.Preview) || undefined,
  }));

  const templateEntries: SearchEntry[] = templates.map((t) => ({
    id: `template:${t.slug}`,
    kind: "template",
    title: t.title.split(" — ")[0],
    subtitle: t.category,
    description: t.description,
    href: `/templates/${t.slug}`,
    premium: t.premium,
    score: t.trendingScore,
    tags: t.tags,
    keywords: t.title,
  }));

  const blockEntries: SearchEntry[] = blocks.map((b) => ({
    id: `block:${b.slug}`,
    kind: "block",
    title: b.name,
    subtitle: b.category,
    description: b.description,
    href: `/blocks/${b.slug}`,
    premium: b.premium,
    score: b.premium ? 70 : 50,
    tags: b.tags,
    keywords: "",
    exportName: getPreviewExportName(b.Preview) || undefined,
  }));

  const videoEntries: SearchEntry[] = videos.map((v, i) => ({
    id: `video:${v.slug}`,
    kind: "video",
    title: v.title,
    subtitle: v.purpose,
    description: v.blurb,
    href: `/videos/${v.slug}`,
    premium: v.premium,
    score: 60 - i,
    tags: [v.app, v.purpose],
    keywords: `${v.motion} ${v.platforms.join(" ")} ${v.formats.join(" ")} video reel`,
  }));

  // Every animated icon: matched on its name, tags and the places it is used ("tab bar", "toast", "player").
  const iconEntries: SearchEntry[] = ICONS.map((i) => ({
    id: `icon:${i.slug}`,
    kind: "icon",
    title: i.title,
    subtitle: `${getCategory(i.category)?.label ?? "Icon"} icon`,
    description: i.description,
    href: `/icons/${i.slug}`,
    premium: false,
    score: 40,
    tags: i.tags.slice(0, 5),
    keywords: `${i.slug} animated icon react ${(ICON_USES[i.slug] ?? []).map((u) => u.title).join(" ")}`,
  }));

  return [...components, ...templateEntries, ...blockEntries, ...videoEntries, ...iconEntries];
}
