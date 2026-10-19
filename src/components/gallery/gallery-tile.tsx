"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { demoScript, FitPreview } from "./fit-preview";
import { TINT_CLASSES, type GalleryItem } from "./types";

/**
 * The bento: four columns of 148px rows. Every tile spans the columns (1–2) and rows (1–3) its own
 * component needs (see `getTileFit`), so a button gets a small tile, a keyboard a wide one and a
 * sidebar a tall one, and the grid packs them densely into even rectangles.
 */
export function TileGrid({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <ul className={cn("grid auto-rows-[148px] grid-cols-1 gap-4 [grid-auto-flow:dense] sm:grid-cols-2 lg:grid-cols-4", className)}>
      {children}
    </ul>
  );
}

/** One grid cell sized from the item's fit. */
export function TileCell({ item, className, children }: { item: GalleryItem; className?: string; children: React.ReactNode }) {
  const { span, rows } = item.fit;
  return (
    <li
      className={cn(
        "[grid-row-end:span_var(--rows-base)]",
        "sm:[grid-column-end:span_var(--span-sm)] sm:[grid-row-end:span_var(--rows-sm)]",
        "lg:[grid-column-end:span_var(--span-lg)] lg:[grid-row-end:span_var(--rows-lg)]",
        className,
      )}
      style={
        {
          "--rows-base": rows.base,
          "--span-sm": span.sm,
          "--rows-sm": rows.sm,
          "--span-lg": span.lg,
          "--rows-lg": rows.lg,
        } as React.CSSProperties
      }
    >
      {children}
    </li>
  );
}

/**
 * A quiet tile: the live component is the thumbnail, framed on the part of the canvas it actually
 * uses. The name, a "new" tag, replay and the inspector appear on hover or keyboard focus, and stay
 * visible on touch screens. The name is a real link to the component's page; `onOpen` turns it into
 * "open the inspector" when JavaScript is running.
 */
export function GalleryTile({ item, onOpen }: { item: GalleryItem; onOpen?: (slug: string) => void }) {
  const [run, setRun] = React.useState(0);
  const href = `/components/${item.slug}`;
  const { fit } = item;
  const dark = fit.dark;
  const demo = React.useMemo(
    () => (item.demo ? demoScript(item.demo, fit.canvas, fit.focus) : undefined),
    [item.demo, fit.canvas, fit.focus],
  );

  const open = (e: React.MouseEvent) => {
    if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(item.slug);
  };

  const chip = dark
    ? "bg-white/12 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md hover:bg-white/20"
    : "bg-white/90 text-[#17171c] shadow-[0_1px_2px_rgba(23,23,28,0.08),0_0_0_1px_rgba(23,23,28,0.06)] backdrop-blur-md hover:bg-white";

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-[28px] transition-shadow duration-200",
        "hover:shadow-[0_0_0_1px_rgba(23,23,28,0.08),0_12px_32px_-12px_rgba(23,23,28,0.25)]",
        !fit.bg && TINT_CLASSES[item.tint],
      )}
      style={fit.bg ? { backgroundColor: fit.bg } : undefined}
    >
      <FitPreview
        key={run}
        exportName={item.exportName}
        canvas={fit.canvas}
        focus={fit.focus}
        demo={demo}
        className={cn(
          fit.clearRoot &&
            // light theme only: in dark, previews without dark styles keep their own light surface so text stays readable
            "not-dark:[&>div>*]:!rounded-none not-dark:[&>div>*]:!border-0 not-dark:[&>div>*]:!bg-transparent not-dark:[&>div>*]:!shadow-none",
        )}
      />

      {item.isNew ? (
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-4 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
            dark ? "bg-white text-[#17171c]" : "bg-[#17171c] text-white",
          )}
        >
          New
        </span>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 transition-[opacity,transform] duration-200 ease-out",
          "translate-y-1 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100",
          "[@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100 motion-reduce:transition-none",
        )}
      >
        <Link
          href={href}
          onClick={open}
          className={cn(
            "pointer-events-auto max-w-[70%] truncate rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            chip,
          )}
        >
          {item.name}
        </Link>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            aria-label={`Replay ${item.name}`}
            title="Replay"
            className={cn("grid size-8 place-items-center rounded-full transition-colors", chip)}
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
          <Link
            href={href}
            onClick={open}
            aria-label={`Open ${item.name} in the inspector`}
            title="Tweak and copy"
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              dark ? "bg-white text-[#17171c] hover:bg-white/90" : "bg-[#17171c] text-white hover:bg-black",
            )}
          >
            <SlidersHorizontal className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
