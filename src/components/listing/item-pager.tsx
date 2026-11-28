"use client";

import Link from "next/link";
import { useCanonicalPathname } from "@/components/layout/canonical-pathname";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { groupOf, LISTING_HOME, type SidebarGroup } from "./listing-sidebar";

/**
 * The foot of a single item's page: a way back to its group on the listing page, then the previous and next item in
 * that same group (alphabetical, as the names column lists them), so you can walk through related items without
 * going back to the list.
 */
export function ItemPager({ groups, title }: { groups: SidebarGroup[]; title: string }) {
  const pathname = useCanonicalPathname();
  const home = LISTING_HOME[title];
  // blocks list sections that live inside a block's page, so there the steps are the blocks themselves
  const byGroup = groups.length > 0 && groups.every((g) => g.href);
  const group = byGroup ? null : groupOf(groups, pathname);
  const flat = byGroup
    ? groups.map((g) => ({ name: g.label, href: g.href! }))
    : (group?.items ?? []).filter((i) => !i.play).sort((a, b) => a.name.localeCompare(b.name));
  const at = flat.findIndex((i) => i.href === pathname);
  if (at === -1 || flat.length < 2) return null;
  const prev = flat[(at - 1 + flat.length) % flat.length];
  const next = flat[(at + 1) % flat.length];
  const where = group ? ` in ${group.label}` : "";
  const back = home && group ? `${home.href}?${home.param}=${encodeURIComponent(group.id)}` : home?.href;
  const card =
    "group flex min-w-0 flex-1 flex-col gap-1 rounded-[22px] bg-card px-5 py-4 shadow-[0_0_0_0.5px_var(--border)] transition-shadow hover:shadow-[0_0_0_0.5px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav aria-label={`More ${title.toLowerCase()}`} className="mx-auto max-w-[var(--item-w,1152px)] px-4 pb-20 pt-4 sm:px-6">
      {back ? (
        <Link
          href={back}
          className="mb-3 inline-flex items-center gap-1 rounded-full py-1 pr-2 text-[14px] font-semibold text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to {group ? group.label : `all ${title.toLowerCase()}`}
        </Link>
      ) : null}
      <div className="flex gap-3">
        <Link href={prev.href} className={card} rel="prev">
          <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <ArrowLeft className="size-3.5 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            <span className="truncate">Previous{where}</span>
          </span>
          <span className="truncate text-[16px] font-semibold tracking-[-0.015em] text-foreground">{prev.name}</span>
        </Link>
        <Link href={next.href} className={`${card} items-end text-right`} rel="next">
          <span className="flex max-w-full items-center gap-1.5 text-[12.5px] text-muted-foreground">
            <span className="truncate">Next{where}</span>
            <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
          <span className="max-w-full truncate text-[16px] font-semibold tracking-[-0.015em] text-foreground">{next.name}</span>
        </Link>
      </div>
    </nav>
  );
}
