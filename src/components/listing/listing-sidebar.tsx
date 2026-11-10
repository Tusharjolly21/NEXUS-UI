"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SidebarItem = { name: string; href: string; isNew?: boolean };
export type SidebarGroup = { id: string; label: string; items: SidebarItem[] };

/** One dot colour per group, in turn, so the list reads in the site's spectrum. */
const DOTS = ["#ff7a1a", "#0a7aff", "#30d158", "#8b5cf6", "#ff3b8d", "#ffcc00"];

/** Names shown in an open group before its "N more". */
const PEEK = 8;

/** How many groups start open. */
const OPEN_AT_START = 2;

const subscribeNever = () => () => {};

/**
 * Every name on the page, grouped, with a "Find by name" box. A group opens to its first few names and a "N more"
 * shows the rest. Each name is an ordinary link to the page it already had.
 */
function SidebarBody({
  title,
  total,
  groups,
  onNavigate,
  autoFocus = false,
}: {
  title: string;
  total: number;
  groups: SidebarGroup[];
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(groups.slice(0, OPEN_AT_START).map((g) => g.id)));
  const [full, setFull] = React.useState<Set<string>>(() => new Set());
  const id = React.useId();
  const needle = query.trim().toLowerCase();

  const matches = React.useMemo(() => {
    if (!needle) return [];
    const seen = new Set<string>();
    const out: (SidebarItem & { group: string })[] = [];
    for (const g of groups)
      for (const i of g.items)
        if (!seen.has(i.href) && i.name.toLowerCase().includes(needle)) {
          seen.add(i.href);
          out.push({ ...i, group: g.label });
        }
    return out;
  }, [groups, needle]);

  const toggle = (set: Set<string>, key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    return next;
  };

  const link =
    "flex min-w-0 items-center justify-between gap-2 rounded-xl px-3 py-[7px] text-[14px] text-foreground/70 transition-colors hover:bg-foreground/[0.05] hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

  return (
    <>
      <div className="flex items-baseline justify-between px-2 pt-1">
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-foreground">{title}</p>
        <span className="text-[13px] tabular-nums text-muted-foreground">{total}</span>
      </div>
      <label className="mt-3 flex h-10 items-center gap-2 rounded-full bg-foreground/[0.05] px-3.5 focus-within:outline-2 focus-within:outline-ring">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="sr-only">Find {title.toLowerCase()} by name</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find by name"
          autoFocus={autoFocus}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="grid size-6 place-items-center rounded-full text-muted-foreground hover:text-foreground">
            <X className="size-3.5" aria-hidden />
          </button>
        ) : null}
      </label>

      {needle ? (
        <div className="mt-3">
          <p className="px-3 pb-1 text-[12.5px] text-muted-foreground" aria-live="polite">
            {matches.length ? `${matches.length} found` : "Nothing by that name"}
          </p>
          <ul>
            {matches.slice(0, 60).map((m) => (
              <li key={m.href}>
                <Link href={m.href} onClick={onNavigate} className={link}>
                  <span className="truncate">{m.name}</span>
                  <span className="shrink-0 text-[12px] text-muted-foreground">{m.group}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-0.5">
          {groups.map((g, gi) => {
            const isOpen = open.has(g.id);
            const shown = full.has(g.id) ? g.items : g.items.slice(0, PEEK);
            const rest = g.items.length - shown.length;
            const listId = `${id}-${g.id}`;
            return (
              <li key={g.id}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={listId}
                  onClick={() => setOpen((s) => toggle(s, g.id))}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left text-[14.5px] font-semibold tracking-[-0.01em] text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                >
                  <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: DOTS[gi % DOTS.length] }} />
                  <span className="min-w-0 flex-1 truncate">{g.label}</span>
                  <span className="text-[12.5px] font-normal tabular-nums text-muted-foreground">{g.items.length}</span>
                  {isOpen ? <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden /> : <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />}
                </button>
                {isOpen ? (
                  <ul id={listId} className="mb-2 ml-[13px] border-l border-foreground/10 pl-1.5">
                    {shown.map((i) => (
                      <li key={i.href}>
                        <Link href={i.href} onClick={onNavigate} className={link}>
                          <span className="truncate">{i.name}</span>
                          {i.isNew ? (
                            <span className="shrink-0 rounded-full bg-[#ff9f0a]/14 px-2 py-px text-[11px] font-semibold text-[#bf4800] dark:text-[#ffb340]">New</span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                    {rest > 0 ? (
                      <li>
                        <button
                          type="button"
                          onClick={() => setFull((s) => toggle(s, g.id))}
                          className="rounded-xl px-3 py-[7px] text-[14px] font-medium text-link hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring"
                        >
                          {rest} more
                        </button>
                      </li>
                    ) : null}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

/** The names column for wide screens: it stays in view while the page scrolls, and scrolls on its own when long. */
export function ListingSidebar({ title, total, groups }: { title: string; total: number; groups: SidebarGroup[] }) {
  return (
    <nav
      aria-label={`${title} by name`}
      className="pg-float sticky top-[88px] max-h-[calc(100dvh-104px)] overflow-y-auto overscroll-contain rounded-[24px] bg-card p-3 [scrollbar-width:thin]"
    >
      <SidebarBody title={title} total={total} groups={groups} />
    </nav>
  );
}

/**
 * The same names for phones and tablets: a "Browse by name" button that opens them in a sheet from the bottom.
 * The sheet closes on a pick, on Close, on the backdrop or on Escape, and gives focus back to the button.
 */
export function ListingBrowse({ title, total, groups, className }: { title: string; total: number; groups: SidebarGroup[]; className?: string }) {
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

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          "pg-float flex h-12 w-full items-center gap-3 rounded-full bg-card px-5 text-left text-[15px] font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden",
          className,
        )}
      >
        <span aria-hidden className="size-2 rounded-full bg-[#0a7aff]" />
        <span className="flex-1">
          Browse all {total} by name
        </span>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </button>
      {mounted && open
        ? createPortal(
            <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={`${title} by name`}>
              <button type="button" aria-label="Close" tabIndex={-1} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
              <div className="absolute inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-[28px] bg-card shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.45)] [padding-bottom:env(safe-area-inset-bottom)]">
                <div className="flex items-center justify-between px-4 pb-1 pt-3">
                  <span aria-hidden className="mx-auto h-1 w-10 rounded-full bg-foreground/15" />
                </div>
                <div className="absolute right-3 top-3">
                  <button
                    ref={closeBtn}
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="grid size-9 place-items-center rounded-full bg-foreground/[0.06] text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-5 pt-2">
                  <SidebarBody title={title} total={total} groups={groups} onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
