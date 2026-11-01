"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Blocks, ChevronRight, Component, Heart, LayoutTemplate, Search, Shapes, X, type LucideIcon } from "lucide-react";
import { ICONS, getCategory } from "@/lib/icons/catalog";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { useDiscovery } from "@/hooks/use-discovery";
import { PlanTag } from "@/components/site/pastel-tile";
import { cn } from "@/lib/utils";

type ItemKind = "component" | "template" | "block" | "icon";
type Kind = "all" | ItemKind;

const KIND_LABEL: Record<ItemKind, string> = { component: "Component", template: "Template", block: "Block", icon: "Icon" };
const KIND_ICON: Record<ItemKind, LucideIcon> = { component: Component, template: LayoutTemplate, block: Blocks, icon: Shapes };

function hrefFor(kind: ItemKind, slug: string) {
  if (kind === "component") return `/components/${slug}`;
  if (kind === "template") return `/templates/${slug}`;
  if (kind === "icon") return `/icons/${slug}`;
  return `/blocks/${slug}`;
}

type Result = { kind: ItemKind; slug: string; title: string; meta: string; score: number; premium: boolean; haystack: string };

const ALL: Result[] = [
  ...libraryComponents.map((c) => ({
    kind: "component" as const,
    slug: c.slug,
    title: c.name,
    meta: getComponentCategoryLabel(c.categorySlug),
    score: c.trendingScore,
    premium: c.premium,
    haystack: `${c.name} ${c.description} ${c.tags.join(" ")}`.toLowerCase(),
  })),
  ...templates.map((t) => ({
    kind: "template" as const,
    slug: t.slug,
    title: t.title.split(" — ")[0],
    meta: t.category,
    score: t.trendingScore,
    premium: t.premium,
    haystack: `${t.title} ${t.description} ${t.category} ${t.tags.join(" ")}`.toLowerCase(),
  })),
  ...blocks.map((b) => ({
    kind: "block" as const,
    slug: b.slug,
    title: b.name,
    meta: b.category,
    score: b.premium ? 70 : 50,
    premium: b.premium,
    haystack: `${b.name} ${b.description} ${b.category} ${b.tags.join(" ")}`.toLowerCase(),
  })),
  ...ICONS.map((i) => ({
    kind: "icon" as const,
    slug: i.slug,
    title: `${i.title} icon`,
    meta: getCategory(i.category)?.label ?? "Icons",
    score: 30,
    premium: false,
    haystack: `${i.title} icon animated ${i.description} ${i.tags.join(" ")}`.toLowerCase(),
  })),
].sort((a, b) => b.score - a.score);

const TITLES = new Map(ALL.map((r) => [`${r.kind}:${r.slug}`, r.title]));
const KINDS: { value: Kind; label: string }[] = [
  { value: "all", label: "All" },
  { value: "component", label: "Components" },
  { value: "template", label: "Templates" },
  { value: "block", label: "Blocks" },
  { value: "icon", label: "Icons" },
];

export function SearchExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const uid = React.useId();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [q, setQ] = React.useState(searchParams.get("q") ?? "");
  const kindParam = searchParams.get("kind");
  const kind: Kind = KINDS.some((k) => k.value === kindParam) ? (kindParam as Kind) : "all";
  const { favorites, recent, toggleFavorite } = useDiscovery();

  // keep the field in step with the URL (Back/Forward, links into /search?q=)
  const urlQ = searchParams.get("q") ?? "";
  const [syncedQ, setSyncedQ] = React.useState(urlQ);
  if (urlQ !== syncedQ) {
    setSyncedQ(urlQ);
    setQ(urlQ);
  }

  function pushParams(next: Record<string, string | null>) {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (!v || v === "all") p.delete(k);
      else p.set(k, v);
    });
    p.delete("sort");
    const qs = p.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  const needle = q.trim().toLowerCase();
  const matching = needle ? ALL.filter((r) => r.haystack.includes(needle)) : ALL;
  const counts = {
    all: matching.length,
    component: matching.filter((r) => r.kind === "component").length,
    template: matching.filter((r) => r.kind === "template").length,
    block: matching.filter((r) => r.kind === "block").length,
    icon: matching.filter((r) => r.kind === "icon").length,
  };
  const results = kind === "all" ? matching : matching.filter((r) => r.kind === kind);
  const favSet = new Set(favorites.map((f) => `${f.kind}:${f.slug}`));

  const pillSpring = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 500, damping: 36 };

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-8 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Search</h1>
          <p className="mt-4 max-w-[560px] text-[17px] leading-[1.5] text-muted-foreground">
            Every component, template, block and animated icon in one place. Search by name, tag or the kind of section you need.
          </p>
          <form
            role="search"
            className="mt-8 max-w-[720px]"
            onSubmit={(e) => {
              e.preventDefault();
              pushParams({ q: q.trim() || null });
            }}
          >
            <label htmlFor="search-q" className="sr-only">
              Search components, templates and blocks
            </label>
            <div className="flex h-14 items-center gap-3 rounded-[14px] bg-card px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-20px_rgba(0,0,0,0.3)] ring-1 ring-border transition-[box-shadow] duration-200 focus-within:ring-2 focus-within:ring-action sm:h-[60px] sm:px-5">
              <Search className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.9} aria-hidden />
              <input
                ref={inputRef}
                id="search-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pricing, hero, globe, dock…"
                autoFocus
                autoComplete="off"
                spellCheck={false}
                className="h-full min-w-0 flex-1 bg-transparent text-[17px] tracking-[-0.01em] text-foreground caret-action outline-none placeholder:text-muted-foreground/80 sm:text-[19px] [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQ("");
                    if (urlQ) pushParams({ q: null });
                    inputRef.current?.focus();
                  }}
                  className="grid size-[22px] shrink-0 place-items-center rounded-full bg-foreground/[0.18] text-background transition-colors hover:bg-foreground/[0.3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X className="size-3" strokeWidth={3} aria-hidden />
                </button>
              )}
            </div>
          </form>

          {/* Segmented filter by type */}
          <div className="mt-5 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div
              role="tablist"
              aria-label="Filter by type"
              className="inline-flex rounded-[10px] bg-muted p-[3px] dark:bg-[#3a3a3c]"
            >
              {KINDS.map((k) => {
                const selected = kind === k.value;
                return (
                  <motion.button
                    key={k.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => pushParams({ kind: k.value })}
                    whileTap={reduce ? undefined : { scale: 0.97 }}
                    className={cn(
                      "relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[8px] px-3.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      selected ? "text-foreground" : "text-foreground/60 hover:text-foreground",
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId={`${uid}-seg`}
                        transition={pillSpring}
                        aria-hidden
                        className="absolute inset-0 rounded-[8px] bg-card shadow-[0_2px_6px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.04)] dark:bg-[#636366]"
                      />
                    )}
                    <span className="relative">{k.label}</span>
                    <span className="relative text-[12px] tabular-nums text-muted-foreground">{counts[k.value]}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-[13.5px] text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
              {needle ? ` for “${q.trim()}”` : ""}
            </p>
            {results.length ? (
              <ul className="mt-3 overflow-hidden rounded-[22px] bg-card shadow-[0_12px_32px_-22px_rgba(0,0,0,0.3)] ring-1 ring-border">
                {results.map((r, i) => {
                  const key = `${r.kind}:${r.slug}`;
                  const saved = favSet.has(key);
                  const Icon = KIND_ICON[r.kind];
                  return (
                    <li
                      key={key}
                      className="group relative flex items-center gap-2 pl-3 pr-2 transition-colors hover:bg-foreground/[0.03] sm:gap-3 sm:pl-4 sm:pr-3"
                    >
                      {i > 0 && (
                        <span aria-hidden className="absolute inset-x-0 top-0 ml-[60px] h-px bg-border sm:ml-[68px]" />
                      )}
                      <Link
                        href={hrefFor(r.kind, r.slug)}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-[12px] py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:gap-4"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-muted text-foreground/70 transition-colors group-hover:text-foreground">
                          <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[15.5px] font-semibold tracking-[-0.01em] text-foreground">
                            {r.title}
                          </span>
                          <span className="block truncate text-[13px] text-muted-foreground">
                            {KIND_LABEL[r.kind]} · {r.meta}
                          </span>
                        </span>
                      </Link>
                      <span className="max-[400px]:hidden">
                        <PlanTag pro={r.premium} />
                      </span>
                      {r.kind !== "icon" && (
                      <button
                        type="button"
                        aria-pressed={saved}
                        aria-label={saved ? `Remove ${r.title} from favourites` : `Save ${r.title} to favourites`}
                        onClick={() => r.kind !== "icon" && toggleFavorite(r.kind, r.slug)}
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-foreground/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          saved ? "text-[#ff3b30]" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
                      </button>
                      )}
                      <ChevronRight
                        className="hidden size-4 shrink-0 text-foreground/25 transition-transform duration-200 group-hover:translate-x-0.5 sm:block"
                        aria-hidden
                      />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-3 flex flex-col items-center rounded-[22px] bg-card px-6 py-14 text-center ring-1 ring-border">
                <span className="grid size-12 place-items-center rounded-[14px] bg-muted text-muted-foreground">
                  <Search className="size-5" strokeWidth={1.9} aria-hidden />
                </span>
                <p className="mt-4 text-[17px] font-semibold tracking-[-0.01em] text-foreground">
                  Nothing matches “{q.trim()}”
                </p>
                <p className="mt-1 max-w-[380px] text-[15px] leading-[1.5] text-muted-foreground">
                  Try a shorter word, a tag like “scroll”, or a section like “pricing”.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    pushParams({ q: null, kind: null });
                  }}
                  className="mt-5 h-10 rounded-full bg-action px-5 text-[14px] font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <aside className="grid content-start gap-5">
            <SideCard title="Favourites">
              {favorites.length ? (
                <ul className="-mx-2 mt-2">
                  {favorites.slice(0, 8).map((f) => (
                    <li key={`${f.kind}-${f.slug}`}>
                      <SideLink href={hrefFor(f.kind, f.slug)}>{TITLES.get(`${f.kind}:${f.slug}`) ?? f.slug}</SideLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-[14px] leading-[1.5] text-muted-foreground">
                  Tap the heart on a result to keep it here. Favourites stay in this browser.
                </p>
              )}
            </SideCard>
            <SideCard title="Recently viewed">
              {recent.length ? (
                <ul className="-mx-2 mt-2">
                  {recent.slice(0, 8).map((slug) => (
                    <li key={slug}>
                      <SideLink href={`/components/${slug}`}>{TITLES.get(`component:${slug}`) ?? slug}</SideLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-[14px] leading-[1.5] text-muted-foreground">Components you open show up here.</p>
              )}
            </SideCard>
          </aside>
        </div>
      </section>
    </>
  );
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[22px] bg-card p-5 ring-1 ring-border">
      <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function SideLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-2 rounded-[10px] px-2 py-1.5 text-[14.5px] text-foreground transition-colors hover:bg-foreground/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <span className="truncate">{children}</span>
      <ChevronRight className="size-3.5 shrink-0 text-foreground/25 transition-colors group-hover:text-foreground/50" aria-hidden />
    </Link>
  );
}
