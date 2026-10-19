"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Search } from "lucide-react";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { blocks } from "@/lib/catalog/blocks";
import { getComponentCategoryLabel } from "@/lib/catalog/taxonomy";
import { useDiscovery } from "@/hooks/use-discovery";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { PlanTag } from "@/components/site/pastel-tile";
import { cn } from "@/lib/utils";

type ItemKind = "component" | "template" | "block";
type Kind = "all" | ItemKind;

const KIND_LABEL: Record<ItemKind, string> = { component: "Component", template: "Template", block: "Block" };
const KIND_TINT: Record<ItemKind, string> = { component: "bg-tint-violet", template: "bg-tint-butter", block: "bg-tint-sky" };

function hrefFor(kind: ItemKind, slug: string) {
  if (kind === "component") return `/components/${slug}`;
  if (kind === "template") return `/templates/${slug}`;
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
].sort((a, b) => b.score - a.score);

const TITLES = new Map(ALL.map((r) => [`${r.kind}:${r.slug}`, r.title]));
const KINDS: { value: Kind; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "component", label: "Components" },
  { value: "template", label: "Templates" },
  { value: "block", label: "Blocks" },
];

export function SearchExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  };
  const results = kind === "all" ? matching : matching.filter((r) => r.kind === kind);
  const favSet = new Set(favorites.map((f) => `${f.kind}:${f.slug}`));

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display text-[clamp(52px,9vw,88px)] text-foreground">Search</h1>
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
            <div className="pg-float flex h-[60px] items-center gap-3 rounded-full bg-card px-6">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
              <input
                id="search-q"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pricing, hero, globe, dock…"
                autoFocus
                className="h-full min-w-0 flex-1 bg-transparent text-[17px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </form>
          <ChipRail className="mt-5">
            {KINDS.map((k) => (
              <Chip key={k.value} active={kind === k.value} onClick={() => pushParams({ kind: k.value })}>
                {k.label}
                <span className="text-[12px] opacity-60">{counts[k.value]}</span>
              </Chip>
            ))}
          </ChipRail>
        </div>
      </section>

      <section className="px-4 pb-24">
        <div className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-[14px] text-muted-foreground" aria-live="polite">
              {results.length} {results.length === 1 ? "result" : "results"}
              {needle ? ` for “${q.trim()}”` : ""}
            </p>
            {results.length ? (
              <ul className="pg-float mt-3 divide-y divide-border/60 overflow-hidden rounded-tile bg-card">
                {results.map((r) => {
                  const key = `${r.kind}:${r.slug}`;
                  const saved = favSet.has(key);
                  return (
                    <li key={key} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                      <Link
                        href={hrefFor(r.kind, r.slug)}
                        className="flex min-w-0 flex-1 items-center gap-4 rounded-xl py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold text-foreground", KIND_TINT[r.kind])}>
                          {KIND_LABEL[r.kind]}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[16px] font-semibold text-foreground">{r.title}</span>
                          <span className="block truncate text-[13.5px] text-muted-foreground">{r.meta}</span>
                        </span>
                      </Link>
                      <PlanTag pro={r.premium} />
                      <button
                        type="button"
                        aria-pressed={saved}
                        aria-label={saved ? `Remove ${r.title} from favourites` : `Save ${r.title} to favourites`}
                        onClick={() => toggleFavorite(r.kind, r.slug)}
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-muted",
                          saved ? "text-[#ff3b8d]" : "text-muted-foreground",
                        )}
                      >
                        <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="pg-float mt-3 rounded-tile bg-card px-6 py-14 text-center">
                <p className="text-[17px] font-semibold text-foreground">Nothing matches “{q.trim()}”</p>
                <p className="mt-1 text-[15px] text-muted-foreground">Try a shorter word, or look through everything instead.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    pushParams({ q: null, kind: null });
                  }}
                  className="pg-glass mt-5 rounded-full bg-card px-4 py-2 text-[13.5px] font-semibold text-foreground"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          <aside className="grid content-start gap-5">
            <div className="rounded-tile bg-tint-pink p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Favourites</h2>
              {favorites.length ? (
                <ul className="mt-3 space-y-1.5">
                  {favorites.slice(0, 8).map((f) => (
                    <li key={`${f.kind}-${f.slug}`}>
                      <Link href={hrefFor(f.kind, f.slug)} className="text-[15px] text-foreground underline-offset-4 hover:underline">
                        {TITLES.get(`${f.kind}:${f.slug}`) ?? f.slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[14.5px] leading-relaxed text-body">
                  Tap the heart on a result to keep it here. Favourites stay in this browser.
                </p>
              )}
            </div>
            <div className="rounded-tile bg-tint-mint p-6">
              <h2 className="text-[17px] font-semibold text-foreground">Recently viewed</h2>
              {recent.length ? (
                <ul className="mt-3 space-y-1.5">
                  {recent.slice(0, 8).map((slug) => (
                    <li key={slug}>
                      <Link href={`/components/${slug}`} className="text-[15px] text-foreground underline-offset-4 hover:underline">
                        {TITLES.get(`component:${slug}`) ?? slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[14.5px] leading-relaxed text-body">Components you open show up here.</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
