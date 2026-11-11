"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { SidebarGroup } from "./listing-sidebar";

/**
 * Previous and next at the foot of a single item's page, in the order the names column lists them (each item once,
 * the weekly "New" group left out), so you can walk the whole set without going back to the list.
 */
export function ItemPager({ groups, noun }: { groups: SidebarGroup[]; noun: string }) {
  const pathname = usePathname();
  const seen = new Set<string>();
  // blocks list sections that live inside a block's page, so there the steps are the blocks themselves
  const byGroup = groups.length > 0 && groups.every((g) => g.href);
  const flat = byGroup
    ? groups.map((g) => ({ name: g.label, href: g.href! }))
    : groups
        .filter((g) => g.id !== "new")
        .flatMap((g) => g.items)
        .filter((i) => !i.play && !seen.has(i.href) && seen.add(i.href));
  const at = flat.findIndex((i) => i.href === pathname);
  if (at === -1 || flat.length < 2) return null;
  const prev = flat[(at - 1 + flat.length) % flat.length];
  const next = flat[(at + 1) % flat.length];
  const card =
    "group flex min-w-0 flex-1 flex-col gap-1 rounded-[22px] bg-card px-5 py-4 shadow-[0_0_0_0.5px_var(--border)] transition-shadow hover:shadow-[0_0_0_0.5px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  return (
    <nav aria-label={`More ${noun}`} className="mx-auto flex max-w-[var(--item-w,1152px)] gap-3 px-4 pb-20 pt-4 sm:px-6">
      <Link href={prev.href} className={card} rel="prev">
        <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          Previous
        </span>
        <span className="truncate text-[16px] font-semibold tracking-[-0.015em] text-foreground">{prev.name}</span>
      </Link>
      <Link href={next.href} className={`${card} items-end text-right`} rel="next">
        <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          Next
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
        <span className="max-w-full truncate text-[16px] font-semibold tracking-[-0.015em] text-foreground">{next.name}</span>
      </Link>
    </nav>
  );
}
