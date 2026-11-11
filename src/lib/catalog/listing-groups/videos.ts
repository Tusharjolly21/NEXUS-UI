import type { SidebarGroup } from "@/components/listing/listing-sidebar";
import { videos } from "@/lib/catalog/videos";
import { madeFor, VIDEO_PLATFORMS } from "@/lib/catalog/video-platforms";

/** Videos by the place they are made for, the same groups the page filters by; each links to its own page. */
export function videoGroups(): SidebarGroup[] {
  return VIDEO_PLATFORMS.map((p) => ({
    id: p.id,
    label: p.label,
    items: videos.filter((v) => madeFor(v.platforms, p.id)).map((v) => ({ name: v.title, href: `/videos/${v.slug}`, pro: v.premium })),
  })).filter((g) => g.items.length);
}
