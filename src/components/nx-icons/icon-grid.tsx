"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { Search } from "lucide-react";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { ICONS, ICON_CATEGORIES, type IconCategory, type IconMeta } from "@/lib/icons/catalog";
import { cn } from "@/lib/utils";
import { NX_ICONS } from "./registry";

/**
 * One tile. Icons that play on hover play while the pointer (or keyboard focus) is on the tile, not just on the
 * drawing; loaders loop, but only while their tile is on screen, so a page of a hundred stays light.
 */
export function IconTile({ icon }: { icon: IconMeta }) {
  const Icon = NX_ICONS[icon.slug];
  const ref = React.useRef<HTMLAnchorElement>(null);
  const near = useInView(ref, { margin: "120px" });
  const [active, setActive] = React.useState(false);
  const play = icon.kind === "loop" ? near : active;
  if (!Icon) return null;
  return (
    <Link
      ref={ref}
      href={`/icons/${icon.slug}`}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="group relative flex aspect-square flex-col items-center justify-center gap-4 rounded-[22px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_36px_-28px_rgba(0,0,0,.35)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,.07),0_24px_44px_-26px_rgba(0,0,0,.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
    >
      <span className="text-foreground">
        <Icon size={40} play={play} />
      </span>
      <span className="text-[13px] font-medium text-muted-foreground transition-colors group-hover:text-foreground">{icon.title}</span>
    </Link>
  );
}

export function IconGrid() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<IconCategory | "all">("all");

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICONS.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.slug.includes(q) || i.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [query, category]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-[420px]">
          <span className="sr-only">Search icons</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${ICONS.length} icons`}
            className="h-12 w-full rounded-full bg-card pl-11 pr-4 text-[15px] text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none placeholder:text-muted-foreground focus-visible:shadow-[0_0_0_2px_var(--ring)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
          />
        </label>
        <p className="text-[14px] text-muted-foreground" aria-live="polite">
          {shown.length} of {ICONS.length} icons
        </p>
      </div>

      <ChipRail className="mt-5">
        <Chip active={category === "all"} onClick={() => setCategory("all")}>
          All <span className="text-muted-foreground/80">{ICONS.length}</span>
        </Chip>
        {ICON_CATEGORIES.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
            {c.label} <span className={cn(category === c.slug ? "opacity-60" : "text-muted-foreground/80")}>{ICONS.filter((i) => i.category === c.slug).length}</span>
          </Chip>
        ))}
      </ChipRail>

      {shown.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
          {shown.map((i) => (
            <li key={i.slug}>
              <IconTile icon={i} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-16 text-center text-[16px] text-muted-foreground">
          No icon matches &ldquo;{query}&rdquo;. Try a broader word like &ldquo;arrow&rdquo; or &ldquo;time&rdquo;.
        </p>
      )}
    </div>
  );
}
