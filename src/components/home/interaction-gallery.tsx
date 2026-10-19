"use client";

import * as React from "react";
import Link from "next/link";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { cn } from "@/lib/utils";
import { GalleryTile, SHAPE_CLASSES, type TileShape, type TileTint } from "./gallery-tile";

export type Interaction = "hover" | "scroll" | "spring" | "glow" | "3d";

export type GalleryItem = {
  slug: string;
  name: string;
  exportName: string;
  tint: TileTint;
  shape: TileShape;
  canvas?: number;
  interactions: Interaction[];
};

const FILTERS: { value: Interaction | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "hover", label: "Hover" },
  { value: "scroll", label: "Scroll" },
  { value: "spring", label: "Spring" },
  { value: "glow", label: "Glow" },
  { value: "3d", label: "3D" },
];

/** How many tiles the unfiltered gallery shows (13 pack the 4-column bento exactly). */
const DEFAULT_COUNT = 13;
/** Phones show fewer, to keep the page short; the rest are one tap away. */
const MOBILE_COUNT = 8;

/** The homepage gallery: live components, filtered by how they move. */
export function InteractionGallery({ items, totalComponents }: { items: GalleryItem[]; totalComponents: number }) {
  const [filter, setFilter] = React.useState<Interaction | "all">("all");
  const shown = filter === "all" ? items.slice(0, DEFAULT_COUNT) : items.filter((i) => i.interactions.includes(filter));

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="px-4 pb-24">
      <div className="mx-auto max-w-[1152px]">
        <h2 id="gallery-title" className="sr-only">
          Components by interaction
        </h2>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ChipRail>
            {FILTERS.map((f) => (
              <Chip key={f.value} active={filter === f.value} onClick={() => setFilter(f.value)}>
                {f.label}
              </Chip>
            ))}
          </ChipRail>
          <Link href="/components" className="shrink-0 text-[14px] font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-foreground">
            Browse all {totalComponents} components
          </Link>
        </div>

        <ul className="mt-6 grid grid-flow-dense auto-rows-[190px] grid-cols-2 gap-4 lg:grid-cols-4">
          {shown.map((item, i) => (
            <li key={item.slug} className={cn(SHAPE_CLASSES[item.shape], i >= MOBILE_COUNT && "max-sm:hidden")}>
              <GalleryTile
                slug={item.slug}
                name={item.name}
                exportName={item.exportName}
                tint={item.tint}
                canvas={item.canvas}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
