"use client";

import * as React from "react";
import { InfiniteSentinel, useInfiniteCount } from "@/components/gallery/infinite-scroll";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { TemplateTile } from "@/components/templates/template-tile";
import { templates, type TemplateCategory } from "@/lib/catalog/templates";

const SORTED = [...templates].sort((a, b) => b.trendingScore - a.trendingScore);

/** Categories that have templates, biggest first. */
const CATEGORIES = (() => {
  const counts = new Map<TemplateCategory, number>();
  for (const t of templates) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
})();

export default function TemplatesGallery({ isPremium = false }: { isPremium?: boolean }) {
  const [param, setParam] = useUrlParam("category");
  const category = CATEGORIES.find((c) => c === param) ?? null;

  const matches = category ? SORTED.filter((t) => t.category === category) : SORTED;
  const infinite = useInfiniteCount({ total: matches.length, batch: 8, storeKey: `templates|${category ?? ""}` });
  const shown = matches.slice(0, infinite.count);

  return (
    <>
      <ChipRail className="mt-8">
        <Chip active={!category} onClick={() => setParam(null)}>
          All
          <span className="text-[12px] opacity-60">{templates.length}</span>
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setParam(c)}>
            {c}
          </Chip>
        ))}
      </ChipRail>

      <p className="sr-only" aria-live="polite">
        {category ? `${matches.length} ${category} templates` : `All ${matches.length} templates`}
      </p>

      {/* every template shows the same thing (a whole page), so every tile is the same shape */}
      <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
        {shown.map((t, i) => (
          <li key={t.slug}>
            <TemplateTile tmpl={t} isPro={isPremium} priority={i < 2} />
          </li>
        ))}
      </ul>
      {infinite.done ? null : (
        <InfiniteSentinel onMore={infinite.more} shown={shown.length} total={matches.length} noun="templates" className="mt-12" />
      )}
    </>
  );
}
