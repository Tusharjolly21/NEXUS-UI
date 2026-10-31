"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Transition } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Clapperboard,
  Component,
  CornerDownLeft,
  LayoutTemplate,
  Search,
  X,
  type LucideIcon,
} from "lucide-react";
import type { SearchEntry } from "@/lib/catalog/search-index";
import { DOCS_PAGES } from "@/components/docs/docs-nav";
import { DynamicPreview } from "@/components/library/dynamic-preview";
import { cn } from "@/lib/utils";
import { useProAccess } from "@/components/pro/pro-access";

/* ── Index ─────────────────────────────────────────────────────────────────── */

type Kind = SearchEntry["kind"] | "doc";

type Entry = Omit<SearchEntry, "kind" | "keywords"> & {
  kind: Kind;
  haystack: string;
};

const KIND_ICON: Record<Kind, LucideIcon> = {
  component: Component,
  template: LayoutTemplate,
  block: Blocks,
  video: Clapperboard,
  doc: BookOpen,
};

function toEntry({ keywords, ...e }: SearchEntry): Entry {
  return { ...e, haystack: `${e.title} ${keywords} ${e.tags.join(" ")} ${e.subtitle} ${e.description}`.toLowerCase() };
}

/* The catalog rows are fetched, not bundled: the full catalog (with every component's source and
   live preview) is over a megabyte. See src/lib/catalog/search-index.ts. */
type Catalog = Record<"component" | "template" | "block" | "video", Entry[]>;

let catalogPromise: Promise<Catalog | null> | null = null;
function loadCatalog() {
  catalogPromise ??= fetch("/api/search-index")
    .then((res) => (res.ok ? (res.json() as Promise<SearchEntry[]>) : Promise.reject(new Error(String(res.status)))))
    .then((rows) => {
      const catalog: Catalog = { component: [], template: [], block: [], video: [] };
      for (const row of rows) catalog[row.kind].push(toEntry(row));
      return catalog;
    })
    .catch(() => {
      catalogPromise = null; // let the next open try again
      return null;
    });
  return catalogPromise;
}

function useCatalog() {
  const [catalog, setCatalog] = React.useState<Catalog | null>(null);
  React.useEffect(() => {
    let alive = true;
    void loadCatalog().then((c) => {
      if (alive) setCatalog(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return catalog;
}

const DOCS: Entry[] = DOCS_PAGES.map((d, i) => ({
  id: `doc:${d.href}`,
  kind: "doc",
  title: d.label,
  subtitle: "Docs",
  description: "Setup and usage guides for Nexus UI.",
  href: d.href,
  premium: false,
  score: DOCS_PAGES.length - i,
  tags: [],
  haystack: `${d.label} docs documentation guide ${d.href}`.toLowerCase(),
}));

const GROUPS: { kind: Kind; label: string; limit: number }[] = [
  { kind: "component", label: "Components", limit: 8 },
  { kind: "template", label: "Templates", limit: 4 },
  { kind: "block", label: "Blocks", limit: 4 },
  { kind: "video", label: "Videos", limit: 3 },
  { kind: "doc", label: "Docs", limit: 4 },
];

const SUGGESTIONS = ["pricing", "dock", "sidebar", "marquee"];

function rank(entry: Entry, needle: string) {
  const title = entry.title.toLowerCase();
  if (title === needle) return 4;
  if (title.startsWith(needle)) return 3;
  if (title.split(/\s+/).some((w) => w.startsWith(needle))) return 2;
  return entry.haystack.includes(needle) ? 1 : 0;
}

type Section = { id: string; label: string; items: Entry[] };

function buildSections(needle: string, catalog: Catalog | null): Section[] {
  if (!needle) {
    const popular = catalog ? [...catalog.component].sort((a, b) => b.score - a.score).slice(0, 5) : [];
    return [
      { id: "popular", label: "Popular components", items: popular },
      { id: "start", label: "Get started", items: DOCS.slice(0, 3) },
    ].filter((s) => s.items.length > 0);
  }
  return GROUPS.map((g) => ({
    id: g.kind,
    label: g.label,
    items: (g.kind === "doc" ? DOCS : (catalog?.[g.kind] ?? []))
      .map((e) => ({ e, r: rank(e, needle) }))
      .filter((x) => x.r > 0)
      .sort((a, b) => b.r - a.r || b.e.score - a.e.score)
      .slice(0, g.limit)
      .map((x) => x.e),
  })).filter((s) => s.items.length > 0);
}

/* ── Hydration-safe "is client" flag (for the body portal) ─────────────────── */
const noopSubscribe = () => () => {};
function useIsClient() {
  return React.useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] bg-foreground/[0.07] px-1 font-sans text-[11px] font-medium text-foreground/60">
      {children}
    </kbd>
  );
}

/* ── Spotlight-style command palette ───────────────────────────────────────── */
export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  /** `restoreFocus` is false when closing because a result was chosen. */
  onClose: (restoreFocus?: boolean) => void;
}) {
  const router = useRouter();
  const isClient = useIsClient();
  const reduce = useReducedMotion();
  const uid = React.useId();
  const { isPro } = useProAccess();
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback((restoreFocus = true) => onClose(restoreFocus), [onClose]);

  /* Close on click outside */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);

  /* ⌘K / Ctrl+K / "/" while the palette is already open selects the field again. The wrapper
     (search-command.tsx) owns opening and Escape. */
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        ["input", "textarea", "select"].includes(target?.tagName?.toLowerCase() ?? "") || !!target?.isContentEditable;
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  /* Focus the field once the panel is mounted */
  React.useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const needle = query.trim().toLowerCase();
  const catalog = useCatalog();
  const sections = React.useMemo(() => buildSections(needle, catalog), [needle, catalog]);
  const flat = React.useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const active = flat.length ? Math.min(activeIdx, flat.length - 1) : -1;
  const activeItem = active >= 0 ? flat[active] : null;

  /* Keep the highlighted row in view */
  React.useEffect(() => {
    if (!open || active < 0) return;
    const list = listRef.current;
    if (!list) return;
    if (active === 0) {
      list.scrollTop = 0;
      return;
    }
    list.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const go = (href: string) => {
    close(false);
    router.push(href);
  };
  const searchAll = () => go(needle ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");

  const setQueryAndReset = (value: string) => {
    setQuery(value);
    setActiveIdx(0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (flat.length) setActiveIdx(Math.min(active + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length) setActiveIdx(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeItem) go(activeItem.href);
      else if (needle) searchAll();
    }
  };

  const listId = `${uid}-list`;
  const optionId = (i: number) => `${uid}-opt-${i}`;

  // Spotlight-style: the panel grows out of a soft blur with a small spring settle, the contents
  // follow a beat later, and closing is a quick ease-in shrink so it gets out of the way.
  const panelMotion = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0.12 } } }
    : {
        initial: { opacity: 0, scale: 0.92, y: -18, filter: "blur(10px)" },
        animate: { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" },
        exit: {
          opacity: 0,
          scale: 0.96,
          y: -8,
          filter: "blur(6px)",
          transition: { duration: 0.16, ease: [0.4, 0, 1, 1] as const },
        },
      };
  const panelSpring: Transition = reduce
    ? { duration: 0.15 }
    : {
        type: "spring",
        stiffness: 380,
        damping: 28,
        mass: 0.9,
        opacity: { duration: 0.18, ease: "easeOut" },
        filter: { duration: 0.26, ease: "easeOut" },
      };
  const contentMotion = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0, transition: { delay: 0.08, duration: 0.24, ease: [0.16, 1, 0.3, 1] as const } },
      };
  const pillSpring: Transition = reduce ? { duration: 0 } : { type: "spring", stiffness: 560, damping: 40, mass: 0.6 };

  const offsets = sections.reduce<number[]>((acc, s, i) => {
    acc.push(i === 0 ? 0 : acc[i - 1] + sections[i - 1].items.length);
    return acc;
  }, []);

  const palette = (
    <AnimatePresence>
      {open && (
        <motion.div key="search-root" className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] max-sm:pt-4">
          {/* Dimmed, softly blurred backdrop */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: reduce ? "blur(0px)" : "blur(8px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.18 } }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-black/25 dark:bg-black/55"
          />

          {/* Panel */}
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search Nexus UI"
            {...panelMotion}
            transition={panelSpring}
            style={{ transformOrigin: "50% 0%" }}
            className="pg-frost relative z-10 flex w-full max-w-[640px] flex-col overflow-hidden rounded-[22px] text-foreground ring-1 ring-border shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_24px_70px_-12px_rgba(0,0,0,0.38),0_8px_24px_-10px_rgba(0,0,0,0.2)] md:max-w-[860px]"
          >
            {/* Input row */}
            <div className="flex h-[62px] shrink-0 items-center gap-3 px-5">
              <Search className="size-[22px] shrink-0 text-foreground/45" strokeWidth={1.9} aria-hidden />
              <label htmlFor={`${uid}-input`} className="sr-only">
                Search components, templates, blocks, videos and docs
              </label>
              <input
                id={`${uid}-input`}
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={flat.length > 0}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={active >= 0 ? optionId(active) : undefined}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                placeholder="Search Nexus UI"
                value={query}
                onChange={(e) => setQueryAndReset(e.target.value)}
                onKeyDown={onKeyDown}
                className="h-full min-w-0 flex-1 bg-transparent text-[21px] tracking-[-0.015em] text-foreground caret-action outline-none placeholder:text-foreground/35"
              />
              <AnimatePresence initial={false}>
                {query && (
                  <motion.button
                    key="clear"
                    type="button"
                    aria-label="Clear search"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={reduce ? { duration: 0.1 } : { type: "spring", stiffness: 600, damping: 32 }}
                    onClick={() => {
                      setQueryAndReset("");
                      inputRef.current?.focus();
                    }}
                    className="grid size-[22px] shrink-0 place-items-center rounded-full bg-foreground/[0.18] text-background transition-colors hover:bg-foreground/[0.3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <X className="size-3" strokeWidth={3} aria-hidden />
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={() => close()}
                aria-label="Close search"
                className="hidden shrink-0 rounded-[6px] bg-foreground/[0.07] px-1.5 py-0.5 text-[11px] font-medium text-foreground/55 transition-colors hover:bg-foreground/[0.12] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:block"
              >
                esc
              </button>
            </div>

            <div className="h-px shrink-0 bg-foreground/[0.07]" />

            <motion.div {...contentMotion} className="flex min-h-0">
              {/* Results */}
              <motion.div
                ref={listRef}
                layoutScroll
                id={listId}
                role="listbox"
                aria-label="Results"
                className="max-h-[min(420px,calc(100dvh-12vh-140px))] min-w-0 flex-1 overflow-y-auto overscroll-contain p-2 max-sm:max-h-[calc(100dvh-140px)]"
              >
                {!needle && (
                  <div className="flex flex-wrap items-center gap-1.5 px-3 pb-2 pt-1.5 text-[13px] text-muted-foreground">
                    <span className="mr-0.5">Try</span>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setQueryAndReset(s);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-[12.5px] text-foreground/75 transition-colors hover:bg-foreground/[0.1] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {flat.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-12 text-center">
                    <span className="grid size-11 place-items-center rounded-[12px] bg-foreground/[0.06] text-foreground/45">
                      <Search className="size-5" strokeWidth={1.9} aria-hidden />
                    </span>
                    <p className="mt-4 text-[15px] font-semibold text-foreground">
                      No results for &ldquo;{query.trim()}&rdquo;
                    </p>
                    <p className="mt-1 max-w-[340px] text-[13px] leading-[1.5] text-muted-foreground">
                      Try a name like &ldquo;dock&rdquo;, a tag like &ldquo;scroll&rdquo;, or a kind of section like &ldquo;pricing&rdquo;.
                    </p>
                    <button
                      type="button"
                      onClick={searchAll}
                      className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      Search everything <ArrowRight className="size-3.5" aria-hidden />
                    </button>
                  </div>
                ) : (
                  sections.map((section, sectionIdx) => (
                    <div key={section.id} role="group" aria-labelledby={`${uid}-h-${section.id}`} className="pb-1">
                      <div
                        id={`${uid}-h-${section.id}`}
                        className="px-3 pb-1 pt-2.5 text-[12px] font-semibold text-muted-foreground"
                      >
                        {section.label}
                      </div>
                      {section.items.map((item, itemIdx) => {
                        const idx = offsets[sectionIdx] + itemIdx;
                        const isActive = idx === active;
                        const Icon = KIND_ICON[item.kind];
                        return (
                          <div
                            key={item.id}
                            id={optionId(idx)}
                            data-index={idx}
                            role="option"
                            aria-selected={isActive}
                            onMouseMove={() => {
                              if (!isActive) setActiveIdx(idx);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => go(item.href)}
                            className="relative flex h-11 cursor-default select-none items-center gap-3 rounded-[10px] px-2.5"
                          >
                            {isActive && (
                              <motion.span
                                layoutId={`${uid}-highlight`}
                                transition={pillSpring}
                                className="absolute inset-0 rounded-[10px] bg-action"
                                aria-hidden
                              />
                            )}
                            <span
                              className={cn(
                                "relative grid size-7 shrink-0 place-items-center rounded-[8px] transition-colors duration-150",
                                isActive ? "bg-white/20 text-white" : "bg-foreground/[0.06] text-foreground/70",
                              )}
                            >
                              <Icon className="size-4" strokeWidth={1.85} aria-hidden />
                            </span>
                            <span className="relative flex min-w-0 flex-1 items-baseline gap-2">
                              <span
                                className={cn(
                                  "truncate text-[14.5px] font-medium tracking-[-0.01em]",
                                  isActive ? "text-white" : "text-foreground",
                                )}
                              >
                                {item.title}
                              </span>
                              <span
                                className={cn(
                                  "hidden truncate text-[13px] min-[400px]:inline",
                                  isActive ? "text-white/75" : "text-muted-foreground",
                                )}
                              >
                                {item.subtitle}
                              </span>
                            </span>
                            {item.premium && (
                              <span
                                className={cn(
                                  "relative shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-semibold",
                                  isActive ? "bg-white/20 text-white" : "bg-foreground/[0.07] text-foreground/60",
                                )}
                              >
                                Pro
                              </span>
                            )}
                            <CornerDownLeft
                              className={cn(
                                "relative size-3.5 shrink-0 transition-opacity duration-150",
                                isActive ? "text-white/80 opacity-100" : "opacity-0",
                              )}
                              strokeWidth={2}
                              aria-hidden
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </motion.div>

              {/* Preview pane (md+) */}
              {activeItem && (
                <div className="hidden w-[320px] shrink-0 flex-col border-l border-foreground/[0.07] p-3 md:flex">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeItem.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex min-h-0 flex-1 flex-col"
                    >
                      <div className="relative h-[188px] shrink-0 overflow-hidden rounded-[14px] bg-background ring-1 ring-border">
                        {activeItem.exportName ? (
                          <>
                            <div inert aria-hidden className="pointer-events-none absolute inset-x-0 top-0 w-full">
                              <DynamicPreview exportName={activeItem.exportName} compact />
                            </div>
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-background to-transparent" />
                          </>
                        ) : (
                          <div className="grid h-full place-items-center">
                            <span className="grid size-14 place-items-center rounded-[14px] bg-foreground/[0.06] text-foreground/55">
                              {React.createElement(KIND_ICON[activeItem.kind], {
                                className: "size-7",
                                strokeWidth: 1.6,
                                "aria-hidden": true,
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex min-h-0 flex-1 flex-col px-1">
                        <p className="text-[15px] font-semibold leading-snug tracking-[-0.015em] text-foreground">
                          {activeItem.title}
                        </p>
                        <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                          {activeItem.subtitle}
                          {activeItem.kind !== "doc" && <> · {activeItem.premium ? (isPro ? "Unlocked" : "Pro") : "Free"}</>}
                        </p>
                        <p className="mt-2 line-clamp-3 text-[13px] leading-[1.5] text-foreground/75">
                          {activeItem.description}
                        </p>
                        {activeItem.tags.length > 0 && (
                          <div className="mt-2.5 flex flex-wrap gap-1">
                            {activeItem.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-[11.5px] text-foreground/60"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-auto pt-3">
                          <button
                            type="button"
                            onClick={() => go(activeItem.href)}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full bg-action px-4 text-[13px] font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            Open
                            <CornerDownLeft className="size-3.5" strokeWidth={2} aria-hidden />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* Footer */}
            <div className="flex h-10 shrink-0 items-center justify-between gap-4 border-t border-foreground/[0.07] px-4 text-[12px] text-muted-foreground">
              <div className="hidden items-center gap-3 sm:flex">
                <span className="flex items-center gap-1.5">
                  <Key>↑</Key>
                  <Key>↓</Key>
                  Move
                </span>
                <span className="flex items-center gap-1.5">
                  <Key>↵</Key>
                  Open
                </span>
                <span className="flex items-center gap-1.5">
                  <Key>esc</Key>
                  Close
                </span>
              </div>
              {needle ? (
                <button
                  type="button"
                  onClick={searchAll}
                  className="ml-auto inline-flex min-w-0 items-center gap-1 font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="truncate">All results for &ldquo;{query.trim()}&rdquo;</span>
                  <ArrowRight className="size-3.5 shrink-0" aria-hidden />
                </button>
              ) : (
                <span className="ml-auto tabular-nums">
                  {catalog
                    ? `${catalog.component.length} components · ${catalog.template.length} templates · ${catalog.block.length} blocks · ${catalog.video.length} videos`
                    : null}
                </span>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return isClient ? createPortal(palette, document.body) : null;
}
