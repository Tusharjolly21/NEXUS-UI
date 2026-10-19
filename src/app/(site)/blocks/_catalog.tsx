"use client";

import Link from "next/link";
import { ScaledPreview } from "@/components/gallery/scaled-preview";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { TINT_CLASSES, type TileTint } from "@/components/gallery/types";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { PlanTag } from "@/components/site/pastel-tile";
import { cn } from "@/lib/utils";

export type BlockItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  premium: boolean;
  variants: number;
  exportName: string;
  tint: TileTint;
};

/** Block gallery: category chips (deep-linked as `?bcat=`, the param older links use) over live tiles. */
export function BlocksGallery({ items }: { items: BlockItem[] }) {
  const categories = [...new Set(items.map((b) => b.category))];
  const [param, setParam] = useUrlParam("bcat");
  const category = categories.find((c) => c === param) ?? null;
  const shown = category ? items.filter((b) => b.category === category) : items;

  return (
    <>
      <ChipRail>
        <Chip active={!category} onClick={() => setParam(null)}>
          All
          <span className="text-[12px] opacity-60">{items.length}</span>
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={category === c} onClick={() => setParam(c)}>
            {c}
          </Chip>
        ))}
      </ChipRail>

      <p className="sr-only" aria-live="polite">
        {category ? `${shown.length} ${category}` : `All ${shown.length} blocks`}
      </p>

      <ul className="mt-10 grid gap-5 md:grid-cols-2">
        {shown.map((b, i) => (
          <li key={b.slug} className={cn(shown.length % 2 === 1 && i === shown.length - 1 && "md:col-span-2")}>
            <Link
              href={`/blocks/${b.slug}`}
              className={cn(
                "group block rounded-tile p-3 transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                TINT_CLASSES[b.tint],
              )}
            >
              <div className="pointer-events-none h-[300px] overflow-hidden rounded-[20px] bg-card" aria-hidden>
                <ScaledPreview exportName={b.exportName} canvas={860} eager={i < 2} />
              </div>
              <div className="flex items-start justify-between gap-4 px-3 pb-2 pt-4">
                <div className="min-w-0">
                  <h2 className="text-[19px] font-semibold tracking-[-0.4px] text-foreground">{b.name}</h2>
                  <p className="mt-1 line-clamp-2 text-[14.5px] leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <PlanTag pro={b.premium} />
                  <span className="text-[12.5px] text-muted-foreground">
                    {b.variants} {b.variants === 1 ? "variant" : "variants"}
                  </span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
