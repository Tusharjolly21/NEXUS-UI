"use client";

import * as React from "react";
import { LayoutGrid, List, Search, X } from "lucide-react";
import { InfiniteSentinel, useInfiniteCount } from "@/components/gallery/infinite-scroll";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { templateName, templateTagline } from "@/components/templates/template-card";
import { TemplateRow } from "@/components/templates/template-row";
import { TemplateTile } from "@/components/templates/template-tile";
import { templates, type MarketplaceTemplate, type TemplateCategory } from "@/lib/catalog/templates";
import { cn } from "@/lib/utils";

const POPULAR = [...templates].sort((a, b) => b.trendingScore - a.trendingScore);
const NEWEST = [...templates].sort(
  (a, b) => b.createdAt.localeCompare(a.createdAt) || b.trendingScore - a.trendingScore,
);

/** Categories that have templates, biggest first. */
const CATEGORIES = (() => {
  const counts = new Map<TemplateCategory, number>();
  for (const t of templates) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
})();

/** Lower-cased text a search is matched against. */
const HAYSTACK = new Map<string, string>(
  templates.map((t) => [
    t.slug,
    [templateName(t), templateTagline(t) ?? "", t.category, t.tags.join(" "), t.description].join(" ").toLowerCase(),
  ]),
);

function matchesQuery(t: MarketplaceTemplate, words: string[]) {
  const hay = HAYSTACK.get(t.slug) ?? "";
  return words.every((w) => hay.includes(w));
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (next: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="pg-glass inline-flex rounded-full bg-card p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
            value === o.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function TemplatesGallery({ isPremium = false }: { isPremium?: boolean }) {
  const [categoryParam, setCategoryParam] = useUrlParam("category");
  const [sortParam, setSortParam] = useUrlParam("sort");
  const [viewParam, setViewParam] = useUrlParam("view");
  const [query, setQuery] = React.useState("");

  const category = CATEGORIES.find(([c]) => c === categoryParam)?.[0] ?? null;
  const sort = sortParam === "new" ? "new" : "popular";
  const view = viewParam === "index" ? "index" : "wall";

  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const matches = (sort === "new" ? NEWEST : POPULAR).filter(
    (t) => (!category || t.category === category) && matchesQuery(t, words),
  );

  const infinite = useInfiniteCount({
    total: matches.length,
    batch: view === "wall" ? 9 : 12,
    storeKey: `templates|${view}|${sort}|${category ?? ""}|${words.join(" ")}`,
  });
  const shown = matches.slice(0, infinite.count);
  // The big opening tile needs neighbours to sit beside; with one or two results it would stand alone.
  const hasFeatured = view === "wall" && matches.length >= 3;

  const clearAll = () => {
    setQuery("");
    setCategoryParam(null);
  };

  return (
    <>
      <div className="mt-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-[300px] lg:shrink-0">
            <label htmlFor="template-search" className="sr-only">
              Search templates
            </label>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="template-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag or use"
              autoComplete="off"
              className="pg-glass h-11 w-full rounded-full bg-card pl-10 pr-10 text-[14.5px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 lg:ml-auto">
            <Segmented
              label="Sort by"
              value={sort}
              onChange={(v) => setSortParam(v === "popular" ? null : v)}
              options={[
                { value: "popular", label: "Popular" },
                { value: "new", label: "Newest" },
              ]}
            />
            <Segmented
              label="Layout"
              value={view}
              onChange={(v) => setViewParam(v === "wall" ? null : v)}
              options={[
                { value: "wall", label: "Wall", icon: <LayoutGrid className="size-3.5" aria-hidden /> },
                { value: "index", label: "List", icon: <List className="size-3.5" aria-hidden /> },
              ]}
            />
          </div>
        </div>

        <ChipRail className="mt-3">
          <Chip active={!category} onClick={() => setCategoryParam(null)}>
            All
            <span className="text-[12px] opacity-60">{templates.length}</span>
          </Chip>
          {CATEGORIES.map(([c, n]) => (
            <Chip key={c} active={category === c} onClick={() => setCategoryParam(c)}>
              {c}
              <span className="text-[12px] opacity-60">{n}</span>
            </Chip>
          ))}
        </ChipRail>
      </div>

      <p className="sr-only" aria-live="polite">
        {matches.length} {matches.length === 1 ? "template" : "templates"}
        {category ? ` in ${category}` : ""}
        {words.length ? ` matching ${query.trim()}` : ""}
      </p>

      {matches.length === 0 ? (
        <div className="mt-10 rounded-[28px] bg-card px-6 py-16 text-center pg-glass">
          <p className="text-[20px] font-semibold tracking-[-0.02em] text-foreground">No templates match that</p>
          <p className="mt-2 text-[15px] text-muted-foreground">Try a shorter search, or look at every category.</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[14px] font-semibold text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Show all templates
          </button>
        </div>
      ) : view === "wall" ? (
        <ul className="mt-6 grid grid-flow-dense grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((t, i) => (
            <li key={t.slug} className={cn(hasFeatured && i === 0 && "lg:col-span-2 lg:row-span-2")}>
              <TemplateTile tmpl={t} isPro={isPremium} priority={i < 3} featured={hasFeatured && i === 0} />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 flex flex-col gap-2.5">
          {shown.map((t, i) => (
            <li key={t.slug}>
              <TemplateRow tmpl={t} isPro={isPremium} priority={i < 6} />
            </li>
          ))}
        </ul>
      )}

      {infinite.done ? null : (
        <InfiniteSentinel onMore={infinite.more} shown={shown.length} total={matches.length} noun="templates" className="mt-12" />
      )}
    </>
  );
}
