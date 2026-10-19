"use client";

import * as React from "react";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { TemplateCard } from "@/components/templates/template-card";
import { templates, type TemplateCategory } from "@/lib/catalog/templates";

const SORTED = [...templates].sort((a, b) => b.trendingScore - a.trendingScore);

/** Categories that have templates, biggest first. */
const CATEGORIES = (() => {
  const counts = new Map<TemplateCategory, number>();
  for (const t of templates) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
})();

/**
 * Which cards span both columns: the first, plus one in the middle when the rest wouldn't pair up,
 * so the 2-column grid never ends on a lonely card.
 */
function wideIndexes(n: number) {
  const wide = new Set([0]);
  if ((n - 1) % 2 === 1) wide.add(1 + 2 * Math.floor((n - 1) / 4));
  return wide;
}

export default function TemplatesGallery({ isPremium = false, ownedSlugs = [] }: { isPremium?: boolean; ownedSlugs?: string[] }) {
  const owned = React.useMemo(() => new Set(ownedSlugs), [ownedSlugs]);
  const [param, setParam] = useUrlParam("category");
  const category = CATEGORIES.find((c) => c === param) ?? null;

  const shown = category ? SORTED.filter((t) => t.category === category) : SORTED;
  const wide = wideIndexes(shown.length);

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
        {category ? `${shown.length} ${category} templates` : `All ${shown.length} templates`}
      </p>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
        {shown.map((t, i) => (
          <TemplateCard
            key={t.slug}
            tmpl={t}
            owned={isPremium || owned.has(t.slug)}
            wide={wide.has(i)}
            priority={i === 0}
          />
        ))}
      </div>
    </>
  );
}
