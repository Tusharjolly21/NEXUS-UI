"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCanonicalPathname } from "@/components/layout/canonical-pathname";
import { ChevronDown, ChevronRight, Gift, LayoutGrid, Lock, Search, Sparkles, Volume2, X } from "lucide-react";
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
/** The weekly group of additions: shown as a filter at the top of the column, not as a group of its own. */
const NEW = "new";

/** The listing page's results: picking a group brings them into view if they are off screen. */
export const RESULTS_ID = "listing-results";

/** Each kind of page: its listing page and the address value that filters it, for "Back to <group>" links. */
export const LISTING_HOME: Record<string, { href: string; param: string; one: string }> = {
  Components: { href: "/components", param: "group", one: "component" },
  Blocks: { href: "/blocks", param: "block", one: "block" },
  Templates: { href: "/templates", param: "category", one: "template" },
  Icons: { href: "/icons", param: "category", one: "icon" },
  Videos: { href: "/videos", param: "for", one: "video" },
};

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
 */
function useGroupChoice(param: string | undefined, groups: SidebarGroup[]) {
  const [value, setValue] = useUrlParam(param ?? "__no_param");
  const chosen = param && value && groups.some((g) => g.id === value) ? value : ALL;
  return [chosen, (id: string) => (setValue(id === ALL ? null : id), revealResults())] as const;
}

const subscribeNever = () => () => {};

/** "Inputs & controls" → "Inputs"; short labels stay as they are. */
function chipLabel(g: SidebarGroup) {
  if (g.short) return g.short;
  const first = g.label.split(/ & |, | \/ /)[0];
  return first.length <= 16 ? first : first.split(" ")[0];
}

/** The group a page belongs to: its own group, not "New this week", which changes every week. */
export function groupOf(groups: SidebarGroup[], pathname: string) {
  const holds = (g: SidebarGroup) => g.href === pathname || g.items.some((i) => i.href === pathname);
  return groups.find((g) => g.id !== NEW && holds(g)) ?? null;
}

/** The name with the part that matches the search lit. */
function Lit({ text, needle }: { text: string; needle: string }) {
  const at = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent font-semibold text-link">{text.slice(at, at + needle.length)}</mark>
      {text.slice(at + needle.length)}
    </>
  );
}

const rowBase =
  "relative flex min-h-[32px] w-full items-center gap-2.5 rounded-[10px] px-2.5 py-[6px] text-left text-[13.5px] leading-snug transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";
const rowIdle = "text-foreground/70 hover:bg-foreground/[0.045] hover:text-foreground";
// the page you are on, or the filter that is on: the link colour on a soft tint, with a short bar at its left edge
const rowOn =
  "bg-link/[0.09] font-semibold text-link before:absolute before:-left-[9px] before:top-[7px] before:bottom-[7px] before:w-[3px] before:rounded-full before:bg-link dark:bg-link/[0.15]";

/**
 * Every name, in one plain list down the side, the way documentation sites keep theirs: a search field, a few
 * quick filters (everything, what is new this week, what is free), then every group with all of its names under a
 * heading that stays pinned while you scroll through it and folds the group away when pressed. Names are ordinary
 * links, alphabetical within their group; the page you are on is lit in the link colour.
 *
 * On a listing page (`param`) the quick filters and the group names filter the page's results instead, the same
 * value as the page's own chips, and the column follows them.
 */
function RailBody({
  title,
  total,
  groups,
  onNavigate,
  scrolls = false,
  listRef,
  searchRef,
  closeButton,
  param,
  layout = "names",
  foldOthers = false,
}: {
  title: string;
  total: number;
  groups: SidebarGroup[];
  onNavigate?: () => void;
  /** The names scroll inside a fixed height (the wide-screen column) while the search and filters stay put. */
  scrolls?: boolean;
  listRef?: React.Ref<HTMLDivElement>;
  searchRef?: React.Ref<HTMLInputElement>;
  /** The sheet's Close, set in its title row. */
  closeButton?: React.ReactNode;
  /** On a listing page: the address value the page filters by. */
  param?: string;
  /** "groups": the column lists the groups themselves (icons, where names alone say little); "names": every name. */
  layout?: "names" | "groups";
  /** Start with every group folded but the one you are in (the phone sheet, where the list would be very long). */
  foldOthers?: boolean;
}) {
  const pathname = useCanonicalPathname();
  const { isPro } = useProAccess();
  const home = LISTING_HOME[title];
  const one = home?.one ?? "item";
  const here = groupOf(groups, pathname);
  const [chip, setChip] = useGroupChoice(param, groups);
  const [query, setQuery] = React.useState("");
  const [only, setOnly] = React.useState<"all" | "new" | "free">("all");
  const [folded, setFolded] = React.useState<Set<string>>(() => new Set(foldOthers ? groups.filter((g) => g.id !== here?.id).map((g) => g.id) : []));
  const needle = query.trim().toLowerCase();

  const fresh = groups.find((g) => g.id === NEW);
  const named = groups.filter((g) => g.id !== NEW);
  const hasPro = named.some((g) => g.items.some((i) => i.pro));
  const freeCount = new Set(named.flatMap((g) => g.items.filter((i) => !i.pro).map((i) => i.href))).size;
  const byName = (a: SidebarItem, b: SidebarItem) => a.name.localeCompare(b.name);

  // what the list shows: on a listing page the chosen group (or all), on an item page the quick filter
  const pick = param ? chip : only;
  const shown: SidebarGroup[] = needle
    ? named.map((g) => ({ ...g, items: g.items.filter((i) => i.name.toLowerCase().includes(needle)).sort(byName) })).filter((g) => g.items.length)
    : pick === NEW && fresh
      ? [{ ...fresh, label: "New this week" }]
      : pick === "free"
        ? named.map((g) => ({ ...g, items: g.items.filter((i) => !i.pro).sort(byName) })).filter((g) => g.items.length)
        : param && pick !== ALL
          ? named.filter((g) => g.id === pick).map((g) => ({ ...g, items: [...g.items].sort(byName) }))
          : named.map((g) => ({ ...g, items: [...g.items].sort(byName) }));
  const found = needle ? shown.reduce((n, g) => n + g.items.length, 0) : 0;

  const quick: { id: string; label: string; count: number; Icon: typeof LayoutGrid; href?: string }[] = [
    { id: ALL, label: `All ${title.toLowerCase()}`, count: total, Icon: LayoutGrid, href: param ? undefined : home?.href },
    ...(fresh ? [{ id: NEW, label: "New this week", count: fresh.items.length, Icon: Sparkles }] : []),
    ...(hasPro && !param ? [{ id: "free", label: "Free", count: freeCount, Icon: Gift }] : []),
  ];
  const quickOn = (id: string) => (param ? chip === id : id !== ALL && only === id);
  const choose = (id: string) => (param ? setChip(id) : setOnly((v) => (v === id ? "all" : (id as "new" | "free"))));
  const toggle = (id: string) =>
    setFolded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className={cn("flex flex-col", scrolls && "min-h-0 flex-1")}>
      <div className="shrink-0">
        {closeButton ? (
          <div className="mb-3 flex items-center gap-2 px-1">
            <p className="min-w-0 flex-1 text-[17px] font-semibold tracking-[-0.02em] text-foreground">{title}</p>
            {closeButton}
          </div>
        ) : null}
        {layout === "names" ? (
          <label className="flex h-[38px] items-center gap-2 rounded-[12px] bg-card px-3 shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.04)] focus-within:outline-2 focus-within:outline-ring">
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <span className="sr-only">Find a {one} by name</span>
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && query) {
                  e.stopPropagation();
                  setQuery("");
                }
              }}
              placeholder={`Find a ${one}`}
              className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-foreground">
                <X className="size-3.5" aria-hidden />
              </button>
            ) : null}
          </label>
        ) : null}

        {needle ? null : (
          <ul className="mt-3 flex flex-col gap-px pl-[9px]">
            {quick.map((q) => {
              const on = quickOn(q.id);
              const body = (
                <>
                  <q.Icon className={cn("size-4 shrink-0", on ? "text-link" : "text-muted-foreground")} aria-hidden />
                  <span className="min-w-0 flex-1">{q.label}</span>
                  <span className={cn("text-[12px] font-normal tabular-nums", on ? "text-link/80" : "text-muted-foreground")}>{q.count}</span>
                </>
              );
              return (
                <li key={q.id}>
                  {q.href ? (
                    <Link href={q.href} onClick={onNavigate} className={cn(rowBase, rowIdle)}>
                      {body}
                    </Link>
                  ) : (
                    <button type="button" aria-pressed={on} onClick={() => choose(q.id)} className={cn(rowBase, on ? rowOn : rowIdle)}>
                      {body}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div
        ref={listRef}
        className={cn(
          "mt-3 pl-[9px]",
          // the names scroll on their own with no scrollbar of their own; the bottom edge fades instead
          scrolls &&
            "min-h-0 flex-1 overflow-y-auto overscroll-contain pb-10 [mask-image:linear-gradient(to_bottom,black_calc(100%-40px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {needle ? (
          <p className="px-2.5 pb-1 text-[12px] text-muted-foreground" aria-live="polite">
            {found ? `${found} ${found === 1 ? "match" : "matches"}` : "Nothing by that name"}
          </p>
        ) : null}

        {layout === "groups" && !needle ? (
          <ul className="flex flex-col gap-px">
            {named.map((g) => {
              const on = chip === g.id;
              return (
                <li key={g.id}>
                  <button type="button" aria-pressed={on} onClick={() => setChip(g.id)} className={cn(rowBase, on ? rowOn : rowIdle)}>
                    <span className="min-w-0 flex-1 break-words">{g.label}</span>
                    <span className="text-[12px] font-normal tabular-nums text-muted-foreground">{g.items.length}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          shown.map((g) => {
            const closed = !needle && folded.has(g.id);
            const lit = param && chip === g.id;
            return (
              <section key={g.id} aria-label={g.label} className="pb-2">
                {/* the group's heading stays pinned at the top of the list while you scroll through its names */}
                <div className="sticky top-0 z-10 flex items-center bg-background py-0.5 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-3 after:bg-gradient-to-b after:from-background after:to-transparent">
                  <button
                    type="button"
                    aria-expanded={!closed}
                    onClick={() => (param && !lit ? setChip(g.id) : toggle(g.id))}
                    className={cn(
                      "flex min-h-[32px] min-w-0 flex-1 items-center gap-2 rounded-[10px] px-2.5 text-left text-[13px] font-semibold tracking-[-0.005em] transition-colors hover:bg-foreground/[0.045] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                      lit ? "text-link" : "text-foreground",
                    )}
                  >
                    <span className="min-w-0 flex-1 break-words">{g.label}</span>
                    <span className="text-[12px] font-medium tabular-nums text-muted-foreground">{g.items.length}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={closed ? `Show ${g.label}` : `Fold ${g.label}`}
                    aria-expanded={!closed}
                    onClick={() => toggle(g.id)}
                    className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    {closed ? <ChevronRight className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />}
                  </button>
                </div>
                {closed ? null : (
                  <ul className="ml-[17px] flex flex-col gap-px border-l border-foreground/[0.08] pl-[9px] pt-0.5">
                    {g.items.map((i) => {
                      const current = i.href === pathname;
                      return (
                        <li key={i.href}>
                          {i.play ? (
                            <button type="button" onClick={() => playSound(i.play!, 1, true)} className={cn(rowBase, rowIdle, "justify-between")} aria-label={`Play ${i.name}`}>
                              <span className="min-w-0 break-words">
                                <Lit text={i.name} needle={needle} />
                              </span>
                              <Volume2 className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                            </button>
                          ) : (
                            <Link href={i.href} onClick={onNavigate} aria-current={current ? "page" : undefined} className={cn(rowBase, current ? rowOn : rowIdle)}>
                              <span className="min-w-0 break-words">
                                <Lit text={i.name} needle={needle} />
                              </span>
                              {i.isNew && g.id !== NEW ? (
                                <span className="shrink-0 rounded-full bg-link/10 px-1.5 text-[10.5px] font-semibold leading-[17px] text-link">New</span>
                              ) : null}
                              {i.pro && !isPro ? <Lock className="ml-auto size-3 shrink-0 text-muted-foreground/60" aria-label="Pro" /> : null}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * The names column for wide screens: no panel of its own, just the list beside the page, which stays in view while
 * the page scrolls. Its names scroll inside it, and the page you are on is kept in sight. The "/" key stays with the site search.
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
  const search = React.useRef<HTMLInputElement>(null);
  const pathname = useCanonicalPathname();
  React.useEffect(() => {
    const box = list.current;
    const here = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!box || !here) return;
    const b = box.getBoundingClientRect();
    const h = here.getBoundingClientRect();
    if (h.top < b.top + 44 || h.bottom > b.bottom - 48) box.scrollTop += h.top - b.top - b.height * 0.4;
  }, [pathname]);
  return (
    <nav aria-label={`${title} by name`} className="sticky top-[88px] flex h-[calc(100dvh-104px)] flex-col border-r border-foreground/[0.07] pr-4 pt-1">
      <RailBody title={title} total={total} groups={groups} scrolls listRef={list} searchRef={search} param={param} layout={layout} />
    </nav>
  );
}

/** The sheet of names for phones and tablets: closes on a pick, on Close, on the backdrop or on Escape. */
function BrowseSheet({ title, total, groups, onClose, floating }: { title: string; total: number; groups: SidebarGroup[]; onClose: () => void; floating: boolean }) {
  const closeBtn = React.useRef<HTMLButtonElement>(null);
  const scroller = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus({ preventScroll: true });
    // open at the page you are on
    const box = scroller.current;
    const here = box?.querySelector<HTMLElement>('[aria-current="page"]');
    if (box && here) box.scrollTop = here.getBoundingClientRect().top - box.getBoundingClientRect().top - box.clientHeight * 0.4;
    return () => {
      html.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);
  return createPortal(
    <div className={cn("fixed inset-0 z-[70]", floating ? "xl:hidden" : "lg:hidden")} role="dialog" aria-modal="true" aria-label={`${title} by name`}>
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[26px] bg-background shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.45)] [padding-bottom:env(safe-area-inset-bottom)]">
        <span aria-hidden className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15" />
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-3">
          <RailBody
            title={title}
            total={total}
            groups={groups}
            onNavigate={onClose}
            foldOthers
            closeButton={
              <button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full bg-foreground/[0.06] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            }
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}

/**
 * The same names for phones and tablets. On a listing page a "Browse all by name" button; on the page of one item a
 * bar at the top that says where you are (its group and name) and opens the names, plus a small pill at the bottom
 * left once that bar has scrolled away. Closing the sheet gives focus back to whatever opened it.
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
  /** The page of one item: the "where you are" bar, and the pill once it has scrolled away (until the column appears at 1280px). */
  floating?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const opener = React.useRef<HTMLButtonElement | null>(null);
  const bar = React.useRef<HTMLButtonElement>(null);
  const [barGone, setBarGone] = React.useState(false);
  const mounted = React.useSyncExternalStore(subscribeNever, () => true, () => false);
  const pathname = useCanonicalPathname();
  const here = groupOf(groups, pathname);
  const item = here?.items.find((i) => i.href === pathname);

  React.useEffect(() => {
    if (!floating || !bar.current) return;
    const io = new IntersectionObserver(([e]) => setBarGone(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(bar.current);
    return () => io.disconnect();
  }, [floating]);

  const show = (el: HTMLButtonElement | null) => {
    opener.current = el;
    setOpen(true);
  };
  const close = React.useCallback(() => {
    setOpen(false);
    opener.current?.focus({ preventScroll: true });
  }, []);

  const glass =
    "bg-white/75 shadow-[0_0_0_0.5px_rgba(0,0,0,0.07),inset_0_1px_0_rgba(255,255,255,0.9),0_12px_32px_-18px_rgba(0,0,0,0.35)] backdrop-blur-2xl backdrop-saturate-[1.8] dark:bg-[#1c1c1e]/75 dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1)]";

  return (
    <>
      {floating ? (
        <>
          {/* above the page's first section, which pulls itself up under the header and would otherwise take the taps */}
          <div className="relative z-20 px-4 pt-3 sm:px-6 xl:hidden">
            <button
              ref={bar}
              type="button"
              aria-haspopup="dialog"
              onClick={(e) => show(e.currentTarget)}
              className={cn(glass, "flex h-12 w-full items-center gap-2.5 rounded-[16px] px-4 text-left text-[14px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
            >
              <span className="min-w-0 flex-1 truncate">
                {here ? <span className="text-muted-foreground">{here.label} / </span> : null}
                <span className="font-semibold text-foreground">{item?.name ?? `All ${title.toLowerCase()}`}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[13.5px] font-semibold text-link">
                Browse
                <ChevronDown className="size-4" aria-hidden />
              </span>
            </button>
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            tabIndex={barGone ? 0 : -1}
            aria-hidden={!barGone}
            onClick={(e) => show(e.currentTarget)}
            className={cn(
              glass,
              "fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-40 inline-flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-[14px] font-semibold text-foreground transition-[opacity,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:hidden",
              barGone ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0",
            )}
          >
            <LayoutGrid className="size-4 text-link" aria-hidden />
            Browse {title.toLowerCase()}
          </button>
        </>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={(e) => show(e.currentTarget)}
          className={cn(
            glass,
            "flex h-12 w-full items-center gap-3 rounded-full px-5 text-left text-[15px] font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden",
            className,
          )}
        >
          <LayoutGrid className="size-4 text-link" aria-hidden />
          <span className="flex-1">Browse all {total} by name</span>
          <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
        </button>
      )}
      {mounted && open ? <BrowseSheet title={title} total={total} groups={groups} onClose={close} floating={floating} /> : null}
    </>
  );
}

/**
 * The listing page's groups for phones and tablets, where the names column is hidden: the same choice as the
 * column (one value in the address), as a row of chips over the results.
 */
export function ListingGroupChips({ groups, total, param, className }: { groups: SidebarGroup[]; total: number; param: string; className?: string }) {
  const [chip, setChip] = useGroupChoice(param, groups);
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
