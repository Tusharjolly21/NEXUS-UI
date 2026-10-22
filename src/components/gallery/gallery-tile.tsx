"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Lock, RotateCcw, SlidersHorizontal, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadge, useLocked, useProAccess } from "@/components/pro/pro-access";
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
export function GalleryTile({
  item,
  onOpen,
  href: hrefProp,
  badge,
}: {
  item: GalleryItem;
  onOpen?: (slug: string) => void;
  /** Where the name and the action button go. Defaults to the component page. */
  href?: string;
  /** Small tag shown next to the name, such as Pro. */
  badge?: React.ReactNode;
}) {
  const [run, setRun] = React.useState(0);
  const href = hrefProp ?? `/components/${item.slug}`;
  const opensPage = !!hrefProp && !onOpen;
  const locked = useLocked(item.premium);
  const { requestUpgrade } = useProAccess();
  const { fit } = item;
  const dark = fit.dark;
  const demo = React.useMemo(
    () => (item.demo ? demoScript(item.demo, fit.canvas, fit.focus) : undefined),
    [item.demo, fit.canvas, fit.focus],
  );

  // The name is a plain link to the component's page (props, usage, docs), the same for free and
  // Pro tiles. The blue button beside it is the quick inspector, for tweaking and copying; on a
  // locked tile that button opens the upgrade dialog instead.
  const openName = (e: React.MouseEvent) => {
    if (locked || !onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    onOpen(item.slug);
  };

  const chip = dark
    ? "bg-white/12 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md hover:bg-white/20"
    : "bg-white/90 text-[#1d1d1f] shadow-[0_1px_2px_rgba(23,23,28,0.08),0_0_0_1px_rgba(23,23,28,0.06)] backdrop-blur-md hover:bg-white";

  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-[28px] transition-shadow duration-200",
        "hover:shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_18px_40px_-18px_rgba(0,0,0,0.3)]",
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

      {item.premium ? <ProBadge onDark={dark} className="pointer-events-none absolute right-4 top-4" /> : null}

      {item.isNew || item.variants || item.sound || item.typing ? (
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-1.5">
          {item.isNew ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
                dark ? "bg-white/12 text-[#ff9f0a] backdrop-blur-md" : "bg-white/90 text-[#bf4800] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md",
              )}
            >
              New
            </span>
          ) : null}
          {item.variants ? (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
                dark ? "bg-white/12 text-white backdrop-blur-md" : "bg-white/90 text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md",
              )}
            >
              {item.variants} variants
            </span>
          ) : null}
          {item.sound || item.typing ? (
            <span
              title="Makes sound. Off until you switch it on."
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
                dark ? "bg-white/12 text-white backdrop-blur-md" : "bg-white/90 text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md",
              )}
            >
              <Volume2 className="size-3" aria-hidden />
              Sound
            </span>
          ) : null}
        </div>
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
          className={cn(
            "pointer-events-auto max-w-[70%] truncate rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            chip,
          )}
        >
          {item.name}
          <ArrowUpRight className="ml-1 inline size-3 -translate-y-px opacity-60" aria-hidden />
        </Link>
        <div className="pointer-events-auto flex items-center gap-1.5">
          {badge}
          <button
            type="button"
            onClick={() => setRun((r) => r + 1)}
            aria-label={`Replay ${item.name}`}
            title="Replay"
            className={cn("grid size-8 place-items-center rounded-full transition-colors", chip)}
          >
            <RotateCcw className="size-3.5" aria-hidden />
          </button>
          {locked && !opensPage ? (
            <button
              type="button"
              onClick={() => requestUpgrade(item.name)}
              aria-label={`Unlock ${item.name} with Pro`}
              title="Unlock with Pro"
              className="grid size-8 place-items-center rounded-full bg-action text-white transition-colors hover:bg-action-hover"
            >
              <Lock className="size-3.5" aria-hidden />
            </button>
          ) : (
            <Link
              href={href}
              onClick={openName}
              aria-label={opensPage ? `Open ${item.name}` : `Open ${item.name} in the inspector`}
              title={opensPage ? "Open" : "Tweak and copy"}
              className="grid size-8 place-items-center rounded-full bg-action text-white transition-colors hover:bg-action-hover"
            >
              {opensPage ? <ArrowUpRight className="size-3.5" aria-hidden /> : <SlidersHorizontal className="size-3.5" aria-hidden />}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
