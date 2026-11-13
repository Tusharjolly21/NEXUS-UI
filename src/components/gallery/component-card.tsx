"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Lock, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProBadge, useLocked } from "@/components/pro/pro-access";
import { demoScript, FitPreview } from "./fit-preview";
import { PreviewGuard } from "@/components/library/dynamic-preview";
import { TINT_CLASSES, type GalleryItem } from "./types";

/** The even grid the listing pages use: one column on a phone, then up to five as the middle column widens. */
export function CardGrid({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-1 gap-4 @[500px]:grid-cols-2 @[720px]:grid-cols-3 @[1040px]:grid-cols-4 @[1400px]:grid-cols-5",
        className,
      )}
    >
      {children}
    </ul>
  );
}

const tag =
  "rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]";

/**
 * A component as a card: the live component, whole, in a frame of its own above its name. The frame is the same
 * shape on every card and the component is scaled down to fit inside it (never up, never cropped), below the
 * strip that holds its tags, so nothing on the card covers it. The live component stays playable; the caption
 * (name, category and the blue arrow, a lock on a Pro card you don't have yet) opens the component's page.
 */
export function ComponentCard({ item, eager = false }: { item: GalleryItem; eager?: boolean }) {
  const [run, setRun] = React.useState(0);
  const locked = useLocked(item.premium);
  const { fit } = item;
  const dark = fit.dark;
  const href = `/components/${item.slug}`;
  const demo = React.useMemo(
    () =>
      item.demo ? demoScript(item.demo, fit.canvas, fit.focus) : undefined,
    [item.demo, fit.canvas, fit.focus],
  );
  const chip = dark
    ? "bg-white/12 text-white backdrop-blur-md"
    : "bg-white/90 text-[#1d1d1f] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_0_0_0.5px_var(--border)] transition-shadow duration-200 hover:shadow-[0_0_0_0.5px_var(--border),0_18px_40px_-18px_rgba(0,0,0,0.3)]">
      <div
        className={cn(
          "relative aspect-[5/4] overflow-hidden rounded-[22px]",
          !fit.bg && TINT_CLASSES[item.tint],
        )}
        style={fit.bg ? { backgroundColor: fit.bg } : undefined}
      >
        {/* the component's own space: under the tag strip, inside the frame's edges */}
        <div className="absolute inset-x-2.5 bottom-2.5 top-11">
          <PreviewGuard name={item.exportName} resetKey={run}>
            <FitPreview
              key={run}
              exportName={item.exportName}
              canvas={fit.canvas}
              focus={fit.focus}
              demo={demo}
              eager={eager}
              className={cn(
                fit.clearRoot &&
                  "not-dark:[&>div>*]:!rounded-none not-dark:[&>div>*]:!border-0 not-dark:[&>div>*]:!bg-transparent not-dark:[&>div>*]:!shadow-none",
              )}
            />
          </PreviewGuard>
        </div>

        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center gap-1.5">
          {item.isNew ? (
            <span
              className={cn(
                tag,
                dark
                  ? "bg-white/12 text-[#ff9f0a] backdrop-blur-md"
                  : "bg-white/90 text-[#bf4800] shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)]",
              )}
            >
              New
            </span>
          ) : null}
          {item.variants ? (
            <span className={cn(tag, chip)}>{item.variants} variants</span>
          ) : null}
          {item.sound || item.typing ? (
            <span
              title="Makes sound. Off until you switch it on."
              className={cn(tag, chip, "inline-flex items-center gap-1")}
            >
              <Volume2 className="size-3" aria-hidden />
              Sound
            </span>
          ) : null}
          <span className="flex-1" />
          {item.premium ? <ProBadge onDark={dark} /> : null}
        </div>

        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          aria-label={`Replay ${item.name}`}
          title="Replay"
          className={cn(
            "absolute bottom-2.5 right-2.5 grid size-8 place-items-center rounded-full opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:hidden",
            chip,
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden />
        </button>
      </div>

      <div className="relative flex shrink-0 items-center justify-between gap-3 px-3 pb-1.5 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15.5px] font-semibold tracking-[-0.015em] text-foreground">
            {/* the whole caption row opens the component's page; the live component above stays free to play with */}
            <Link
              href={href}
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:rounded-[18px] [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-ring"
            >
              {item.name}
            </Link>
          </h3>
          <p className="truncate text-[13px] text-muted-foreground">
            {item.categoryLabel}
          </p>
        </div>
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-full bg-action text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5",
          )}
        >
          {locked ? <Lock className="size-3.5" /> : <ArrowUpRight className="size-4" />}
        </span>
      </div>
    </article>
  );
}
