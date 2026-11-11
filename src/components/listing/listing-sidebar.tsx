"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Lock, Search, Volume2, X } from "lucide-react";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { useProAccess } from "@/components/pro/pro-access";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { playSound, type SoundName } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export type SidebarItem = {
  name: string;
  /** Where the name goes. For a sound it is only its key: the name plays the sound instead of opening a page. */
  href: string;
  isNew?: boolean;
  /** A sound to play when the name is pressed (the sounds page lists sounds, which have no pages of their own). */
  play?: SoundName;
  /** Pro: visitors without Pro see a small lock beside the name. */
  pro?: boolean;
};
export type SidebarGroup = {
  id: string;
  label: string;
  items: SidebarItem[];
  /** A shorter name for the group's chip, where the label is long ("Inputs" for "Inputs & controls"). */
  short?: string;
  /** The group's own page, if it has one. */
  href?: string;
};

const ALL = "all";

/** The listing page's results: picking a group brings them into view if they are off screen. */
export const RESULTS_ID = "listing-results";

function revealResults() {
  const el = document.getElementById(RESULTS_ID);
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  if (top < 0 || top > window.innerHeight * 0.7) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
}

/**
 * The group a listing page is filtered to, kept in the address (`?block=pricing-section`) so the names column, the
 * phone chips and the page's own results all read and write the same value, and a filtered view can be shared.
 * Without a `param` (the pages of single items) it is only the column's own choice.
 */
function useGroupChoice(param: string | undefined, groups: SidebarGroup[], fallback: string) {
  const [value, setValue] = useUrlParam(param ?? "__no_param");
  const [picked, setPicked] = React.useState<string | null>(null);
  if (param) {
    const chosen = value && groups.some((g) => g.id === value) ? value : ALL;
    return [chosen, (id: string) => (setValue(id === ALL ? null : id), revealResults())] as const;
  }
  return [picked ?? fallback, (id: string) => setPicked(id)] as const;
}

/** Chips shown before "N more", so a long set of groups (icons have two dozen) doesn't push the names out of view. */
const CHIP_PEEK = 9;

const subscribeNever = () => () => {};

/** One colour per group, in turn, from the site's spectrum: the dot and soft tint on its heading. */
const HUES = ["#ff7a1a", "#0a84ff", "#30d158", "#bf5af2", "#ff375f", "#ffb300"];

/** "Inputs & controls" → "Inputs"; short labels stay as they are. */
function chipLabel(g: SidebarGroup) {
  if (g.short) return g.short;
  const first = g.label.split(/ & |, | \/ /)[0];
  return first.length <= 16 ? first : first.split(" ")[0];
}

/**
 * Every name on the page, in the site's own look: a title and count, a "Find by name" pill, one chip per group (the
 * same chips as the page's filters) and the names under them. "All" lists every group with a small heading; a
 * group's chip lists only its names. On the page of one item, its group is chosen and the item wears the rainbow
 * ring the Pro card wears. Each name is an ordinary link to the page it already had (a sound plays instead).
 */
function RailBody({
  title,
  total,
  groups,
  onNavigate,
  scrolls = false,
  listRef,
  closeButton,
  param,
  layout = "names",
}: {
  title: string;
  total: number;
  groups: SidebarGroup[];
  onNavigate?: () => void;
  /** The names scroll inside a fixed height (the wide-screen column) while the title, search and chips stay put. */
  scrolls?: boolean;
  listRef?: React.Ref<HTMLDivElement>;
  /** The sheet's Close, set in the title row after the count so the two never sit on top of each other. */
  closeButton?: React.ReactNode;
  /** On a listing page: the address value the page filters by. The column then drives the page's results and has no
   * search of its own (the page's search is the one). */
  param?: string;
  /** "groups": the column lists the groups themselves (icons, where names alone say little); "names": chips over names. */
  layout?: "names" | "groups";
}) {
  const pathname = usePathname();
  const { isPro } = useProAccess();
  const holds = (g: SidebarGroup) => g.href === pathname || g.items.some((i) => i.href === pathname);
  // an item's own group, not "New this week", which changes every week
  const activeId = (groups.find((g) => g.id !== "new" && holds(g)) ?? groups.find(holds))?.id ?? null;
  const [chip, setChip] = useGroupChoice(param, groups, activeId ?? ALL);
  const searchable = !param;
  const [allChips, setAllChips] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const needle = searchable ? query.trim().toLowerCase() : "";

  const chosen = chip === ALL ? groups : groups.filter((g) => g.id === chip);
  const lists: { label: string; id: string; items: SidebarItem[] }[] = needle
    ? [
        {
          id: "found",
          label: "",
          items: [...new Map(groups.flatMap((g) => g.items).filter((i) => i.name.toLowerCase().includes(needle)).map((i) => [i.href, i])).values()],
        },
      ]
    : chosen;
  const found = needle ? lists[0].items.length : 0;
  const hue = (id: string) => HUES[Math.max(0, groups.findIndex((g) => g.id === id)) % HUES.length];

  // the chosen chip always shows, even when it is past the first few
  const chosenAt = groups.findIndex((g) => g.id === chip);
  const chips = allChips || groups.length <= CHIP_PEEK + 1 ? groups : groups.filter((g, i) => i < CHIP_PEEK || i === chosenAt);
  const hidden = groups.length - chips.length;

  const chipClass = (on: boolean) =>
    cn(
      "inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full px-[11px] text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
      on ? "bg-foreground text-background" : "bg-card text-foreground shadow-[0_0_0_0.5px_var(--border)] hover:bg-foreground/[0.04]",
    );
  const count = (on: boolean) => cn("text-[11px] tabular-nums", on ? "text-background/60" : "text-muted-foreground");
  const row =
    "flex min-h-[34px] w-full items-center justify-between gap-2 rounded-xl px-2.5 py-[7px] text-left text-[13.5px] leading-snug text-foreground/70 transition-colors hover:bg-foreground/[0.04] hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
  // the page you are on: the rainbow ring the Pro card wears, on a white pill
  const here =
    "border-[1.5px] border-transparent font-semibold text-foreground [background:linear-gradient(var(--card),var(--card))_padding-box,linear-gradient(120deg,#0090f7,#6e5bff_35%,#ba62fc_55%,#f2416b_78%,#f55600)_border-box] shadow-[0_6px_16px_-10px_rgba(110,91,255,0.55)] hover:bg-transparent";

  return (
    <div className={cn("flex flex-col", scrolls && "min-h-0 flex-1")}>
      <div className="shrink-0">
        <div className="flex items-center gap-2 px-2">
          <p className="min-w-0 flex-1 text-[15px] font-semibold tracking-[-0.015em] text-foreground">{title}</p>
          <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[12px] font-semibold tabular-nums text-muted-foreground">{total}</span>
          {closeButton}
        </div>
        {searchable ? (
        <label className="mt-3 flex h-[38px] items-center gap-2 rounded-full bg-card px-3.5 shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.04)] focus-within:outline-2 focus-within:outline-ring">
          <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="sr-only">Find {title.toLowerCase()} by name</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find by name"
            className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query ? (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-foreground">
              <X className="size-3.5" aria-hidden />
            </button>
          ) : null}
        </label>
        ) : null}

        {needle || layout === "groups" ? null : (
          <div role="group" aria-label={`Show ${title.toLowerCase()} by group`} className="flex flex-wrap gap-1.5 border-b border-foreground/[0.07] pb-3 pt-3.5">
            <button type="button" aria-pressed={chip === ALL} onClick={() => setChip(ALL)} className={chipClass(chip === ALL)}>
              All <span className={count(chip === ALL)}>{total}</span>
            </button>
            {chips.map((g) => (
              <button key={g.id} type="button" aria-pressed={chip === g.id} onClick={() => setChip(g.id)} title={g.label} className={chipClass(chip === g.id)}>
                {chipLabel(g)} <span className={count(chip === g.id)}>{g.items.length}</span>
              </button>
            ))}
            {hidden > 0 || allChips ? (
              <button type="button" aria-expanded={allChips} onClick={() => setAllChips((v) => !v)} className="inline-flex h-7 items-center gap-1 rounded-full px-2.5 text-[12.5px] font-medium text-link hover:underline hover:underline-offset-4">
                {allChips ? "Fewer" : `${hidden} more`}
                <ChevronRight className={cn("size-3 transition-transform", allChips && "rotate-90")} aria-hidden />
              </button>
            ) : null}
          </div>
        )}
      </div>

      <div
        ref={listRef}
        className={cn(
          "pt-2",
          // the names scroll on their own with no scrollbar of their own; the bottom edge fades instead
          scrolls &&
            "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-8 [mask-image:linear-gradient(to_bottom,black_calc(100%-48px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {needle ? (
          <p className="px-2.5 pb-1 pt-1 text-[12px] text-muted-foreground" aria-live="polite">
            {found ? `${found} found` : "Nothing by that name"}
          </p>
        ) : null}
        {layout === "groups" && !needle ? (
          <ul className="flex flex-col gap-px pt-1">
            {[{ id: ALL, label: `All ${title.toLowerCase()}`, items: [] as SidebarItem[], count: total }, ...groups.map((g) => ({ ...g, count: g.items.length }))].map((g) => {
              const on = chip === g.id;
              return (
                <li key={g.id}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setChip(g.id)}
                    className={cn(row, "gap-2.5", on && "font-semibold text-foreground")}
                    style={on ? { backgroundColor: `color-mix(in srgb, ${g.id === ALL ? "#8e8e93" : hue(g.id)} 14%, var(--card))` } : undefined}
                  >
                    <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: g.id === ALL ? "currentColor" : hue(g.id), opacity: g.id === ALL ? 0.35 : 1 }} />
                    <span className="min-w-0 flex-1 break-words">{g.label}</span>
                    <span className="text-[12px] font-normal tabular-nums text-muted-foreground">{g.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {(layout === "groups" && !needle ? [] : lists).map((g) => (
          <section key={g.id} aria-label={g.label || undefined} className="pb-3">
            {g.label ? (
              // the group's heading: its colour, bold, and pinned at the top of the list while you scroll through it
              <div className="sticky top-0 z-10 bg-[color-mix(in_srgb,var(--card)_96%,transparent)] pb-1 pt-1.5 backdrop-blur-md">
                <p
                  className="flex items-center gap-2 rounded-xl px-2.5 py-[7px] text-[13.5px] font-semibold tracking-[-0.01em] text-foreground"
                  style={{ backgroundColor: `color-mix(in srgb, ${hue(g.id)} 13%, var(--card))` }}
                >
                  <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: hue(g.id), boxShadow: `0 0 0 3px color-mix(in srgb, ${hue(g.id)} 22%, transparent)` }} />
                  <span className="min-w-0 flex-1 break-words">{g.label}</span>
                  <span className="text-[12px] font-medium tabular-nums text-muted-foreground">{g.items.length}</span>
                </p>
              </div>
            ) : null}
            <ul className="flex flex-col gap-px">
              {g.items.map((i) => {
                const current = i.href === pathname;
                const tag =
                  i.pro && !isPro ? (
                    <Lock className="size-3 shrink-0 text-muted-foreground" aria-label="Pro" />
                  ) : i.isNew && g.id !== "new" ? (
                    <span className="shrink-0 text-[10.5px] font-semibold text-[#bf4800] dark:text-[#ffb340]">New</span>
                  ) : null;
                return (
                  <li key={i.href}>
                    {i.play ? (
                      <button type="button" onClick={() => playSound(i.play!, 1, true)} className={row} aria-label={`Play ${i.name}`}>
                        <span className="min-w-0 break-words">{i.name}</span>
                        <Volume2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                      </button>
                    ) : (
                      <Link href={i.href} onClick={onNavigate} aria-current={current ? "page" : undefined} className={cn(row, current && here)}>
                        <span className="min-w-0 break-words">{i.name}</span>
                        {tag}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * The names column for wide screens: a frosted panel in the nav's own glass, which stays in view while the page
 * scrolls. Its names scroll inside it, and the page you are on is kept in sight.
 */
export function ListingSidebar({
  title,
  total,
  groups,
  param,
  layout,
}: {
  title: string;
  total: number;
  groups: SidebarGroup[];
  /** On a listing page, the address value the page filters by (see RailBody). */
  param?: string;
  layout?: "names" | "groups";
}) {
  const list = React.useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  React.useEffect(() => {
    const box = list.current;
    const here = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !here) return;
    const b = box.getBoundingClientRect();
    const h = here.getBoundingClientRect();
    if (h.top < b.top + 20 || h.bottom > b.bottom - 48) box.scrollTop += h.top - b.top - b.height / 3;
  }, [pathname]);
  return (
    <nav
      aria-label={`${title} by name`}
      className="sticky top-[88px] flex h-[calc(100dvh-104px)] flex-col rounded-[28px] bg-white/65 px-2.5 pt-3.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9),0_18px_40px_-22px_rgba(0,0,0,0.32)] backdrop-blur-2xl backdrop-saturate-[1.8] dark:bg-[#1c1c1e]/65 dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_18px_40px_-22px_rgba(0,0,0,0.8)]"
    >
      <RailBody title={title} total={total} groups={groups} scrolls listRef={list} param={param} layout={layout} />
    </nav>
  );
}

/**
 * The same names for phones and tablets: a button that opens them in a sheet from the bottom. The sheet closes on a
 * pick, on Close, on the backdrop or on Escape, and gives focus back to the button.
 */
export function ListingBrowse({
  title,
  total,
  groups,
  className,
  floating = false,
}: {
  title: string;
  total: number;
  groups: SidebarGroup[];
  className?: string;
  /** A small glass pill fixed at the bottom left, for the pages of single items (until the column appears at 1280px). */
  floating?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const button = React.useRef<HTMLButtonElement>(null);
  const closeBtn = React.useRef<HTMLButtonElement>(null);
  const mounted = React.useSyncExternalStore(subscribeNever, () => true, () => false);

  React.useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const opener = button.current;
    closeBtn.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [open]);

  const glass =
    "bg-white/70 shadow-[0_0_0_0.5px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9),0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-[1.8] dark:bg-[#1c1c1e]/70 dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)]";

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          glass,
          "items-center rounded-full font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          floating
            ? "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 inline-flex h-11 gap-2 pl-3.5 pr-4 text-[14px] xl:hidden"
            : "flex h-12 w-full gap-3 px-5 text-left text-[15px] lg:hidden",
          className,
        )}
      >
        <span aria-hidden className="size-2 rounded-full bg-[linear-gradient(135deg,#0090f7,#ba62fc,#f55600)]" />
        {floating ? (
          <span>All {title.toLowerCase()}</span>
        ) : (
          <>
            <span className="flex-1">Browse all {total} by name</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
          </>
        )}
      </button>
      {mounted && open
        ? createPortal(
            <div className={cn("fixed inset-0 z-[70]", floating ? "xl:hidden" : "lg:hidden")} role="dialog" aria-modal="true" aria-label={`${title} by name`}>
              <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" />
              <div className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-[30px] bg-background shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.45)] [padding-bottom:env(safe-area-inset-bottom)]">
                <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15" />
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
                  <RailBody
                    title={title}
                    total={total}
                    groups={groups}
                    onNavigate={() => setOpen(false)}
                    closeButton={
                      <button
                        ref={closeBtn}
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close"
                        className="-mr-1 ml-1 grid size-9 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                      >
                        <X className="size-4" aria-hidden />
                      </button>
                    }
                  />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/**
 * The listing page's groups for phones and tablets, where the names column is hidden: the same choice as the
 * column (one value in the address), as a row of chips over the results.
 */
export function ListingGroupChips({ groups, total, param, className }: { groups: SidebarGroup[]; total: number; param: string; className?: string }) {
  const [chip, setChip] = useGroupChoice(param, groups, ALL);
  return (
    <ChipRail className={cn("lg:hidden", className)}>
      <Chip active={chip === ALL} onClick={() => setChip(ALL)}>
        All <span className={cn("text-[12px] tabular-nums", chip === ALL ? "text-background/60" : "text-muted-foreground")}>{total}</span>
      </Chip>
      {groups.map((g) => (
        <Chip key={g.id} active={chip === g.id} onClick={() => setChip(g.id)}>
          {chipLabel(g)} <span className={cn("text-[12px] tabular-nums", chip === g.id ? "text-background/60" : "text-muted-foreground")}>{g.items.length}</span>
        </Chip>
      ))}
    </ChipRail>
  );
}
