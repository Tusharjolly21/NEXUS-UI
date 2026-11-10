import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { videos, type FormatId } from "@/lib/catalog/videos";

/** The shape a video is made in first is the one people pick by (a Reel, a square post, a YouTube film). */
const SHAPES: { id: string; label: string; formats: FormatId[] }[] = [
  { id: "tall", label: "Tall, for Reels and Shorts", formats: ["9:16", "4:5", "app"] },
  { id: "square", label: "Square", formats: ["1:1"] },
  { id: "wide", label: "Wide, for YouTube and sites", formats: ["16:9", "21:9"] },
];

/** Videos grouped by their main shape, each linking to its own page. */
export function videoGroups(): SidebarGroup[] {
  return SHAPES.map((s) => ({
    id: s.id,
    label: s.label,
    items: videos.filter((v) => s.formats.includes(v.formats[0])).map((v) => ({ name: v.title, href: `/videos/${v.slug}` })),
  })).filter((g) => g.items.length);
}
