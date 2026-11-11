"use client";

import * as React from "react";
import { InfiniteSentinel, useInfiniteCount } from "@/components/gallery/infinite-scroll";
import { GallerySearch, matchesWords, searchWords } from "@/components/gallery/gallery-search";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { templateName, templateTagline } from "@/components/templates/template-card";
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
  return matchesWords(HAYSTACK.get(t.slug) ?? "", words);
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

export default function TemplatesGallery({ isPremium = false, afterFilters }: { isPremium?: boolean; afterFilters?: React.ReactNode }) {
  const [categoryParam, setCategoryParam] = useUrlParam("category");
  const [sortParam, setSortParam] = useUrlParam("sort");
  const [query, setQuery] = React.useState("");

  const category = CATEGORIES.find(([c]) => c === categoryParam)?.[0] ?? null;
  const sort = sortParam === "new" ? "new" : "popular";

  const words = searchWords(query);
  const matches = (sort === "new" ? NEWEST : POPULAR).filter(
    (t) => (!category || t.category === category) && matchesQuery(t, words),
  );

  const infinite = useInfiniteCount({
    total: matches.length,
    batch: 9,
    storeKey: `templates|${sort}|${category ?? ""}|${words.join(" ")}`,
  });
  const shown = matches.slice(0, infinite.count);

  const clearAll = () => {
    setQuery("");
    setCategoryParam(null);
  };

  return (
    <>
      <div>
        <div className="flex flex-col gap-3 @[640px]:flex-row @[640px]:items-center">
          <GallerySearch value={query} onChange={setQuery} label="Search templates" placeholder="Search by name, tag or use" className="@[640px]:min-w-0 @[640px]:flex-1 @[640px]:max-w-[380px]" />

          <div className="flex items-center gap-2 @[640px]:ml-auto">
            <Segmented
              label="Sort by"
              value={sort}
              onChange={(v) => setSortParam(v === "popular" ? null : v)}
              options={[
                { value: "popular", label: "Popular" },
                { value: "new", label: "Newest" },
              ]}
            />
          </div>
        </div>

        {/* categories are picked in the names column (and the chips above on phones), one choice in the address */}
      </div>

      {afterFilters}

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
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 @[600px]:grid-cols-2 @[1120px]:grid-cols-3">
          {shown.map((t, i) => (
            <li key={t.slug}>
              <TemplateTile tmpl={t} isPro={isPremium} priority={i < 2} />
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
