"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FitPreview } from "@/components/gallery/fit-preview";
import type { TileFit } from "@/lib/catalog/tile-fit";
import { useUrlParam } from "@/components/gallery/use-url-param";
import { TINT_CLASSES, type TileTint } from "@/components/gallery/types";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { PlanTag } from "@/components/site/pastel-tile";
import { cn } from "@/lib/utils";

/** Bento footprints on the 6-column blocks wall (rows are 88px). */
export type BlockSlot = "big" | "tall" | "wide" | "card" | "half" | "full";

const SLOT_CLASSES: Record<BlockSlot, string> = {
  big: "md:col-span-4 md:row-span-6",
  tall: "md:col-span-2 md:row-span-6",
  wide: "md:col-span-4 md:row-span-4",
  card: "md:col-span-2 md:row-span-4",
  half: "md:col-span-3 md:row-span-5",
  full: "md:col-span-6 md:row-span-5",
};

export type BlockItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  premium: boolean;
  variants: number;
  exportName: string;
  tint: TileTint;
  slot: BlockSlot;
  isNew?: boolean;
  /** Where the section draws on its canvas, so the tile frames the section rather than its stage. */
  fit: TileFit;
};

/** Block gallery: category chips (deep-linked as `?bcat=`, the param older links use) over a bento of live sections. */
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

      <ul className="mt-8 grid grid-cols-1 gap-4 [grid-auto-flow:dense] md:auto-rows-[88px] md:grid-cols-6">
        {shown.map((b, i) => {
          // a filtered set of one or two shouldn't leave half the wall empty
          const slot: BlockSlot = shown.length === 1 ? "full" : shown.length === 2 ? "half" : b.slot;
          const roomy = slot === "big" || slot === "full" || slot === "half";
          return (
            <li key={b.slug} className={SLOT_CLASSES[slot]}>
              <article
                className={cn(
                  "group relative isolate flex h-full min-h-[380px] flex-col overflow-hidden rounded-[28px] p-2.5 transition-shadow duration-200 md:min-h-0",
                  "hover:shadow-[0_0_0_1px_rgba(23,23,28,0.08),0_16px_40px_-16px_rgba(23,23,28,0.3)]",
                  TINT_CLASSES[b.tint],
                )}
              >
                <div
                  className="pointer-events-none relative min-h-[240px] flex-1 overflow-hidden rounded-[20px] bg-card"
                  style={b.fit.bg ? { backgroundColor: b.fit.bg } : undefined}
                  aria-hidden
                >
                  <FitPreview exportName={b.exportName} canvas={b.fit.canvas} focus={b.fit.focus} eager={i < 2} />
                  {b.isNew ? (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-[#bf4800] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md">New</span>
                  ) : null}
                </div>
                <div className="flex items-end justify-between gap-3 px-2.5 pb-1.5 pt-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-[17px] font-semibold tracking-[-0.3px] text-foreground">
                      <Link
                        href={`/blocks/${b.slug}`}
                        className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[28px] [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-2 [&:focus-visible]:after:outline-ring"
                      >
                        {b.name}
                      </Link>
                    </h2>
                    {roomy ? (
                      <p className="mt-0.5 line-clamp-1 text-[13.5px] text-muted-foreground">{b.description}</p>
                    ) : (
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {b.variants} {b.variants === 1 ? "variant" : "variants"}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {roomy ? (
                      <span className="text-[12.5px] text-muted-foreground">
                        {b.variants} {b.variants === 1 ? "variant" : "variants"}
                      </span>
                    ) : null}
                    <PlanTag pro={b.premium} />
                    <span
                      aria-hidden
                      className="grid size-8 place-items-center rounded-full bg-action text-white opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </>
  );
}
