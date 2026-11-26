"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { demoScript, FitPreview } from "@/components/gallery/fit-preview";
import { TINT_CLASSES, type GalleryItem } from "@/components/gallery/types";
import { PillLink } from "@/components/site";
import { cn } from "@/lib/utils";

const COLUMNS = 4;
/** Each column starts at its own height, so the wall reads as masonry and not a grid. */
const STAGGER = [0, 96, 36, 148];
/** How far each column travels while the section scrolls past: neighbours go opposite ways. */
const DRIFT: [number, number][] = [
  [40, -160],
  [-90, 70],
  [30, -200],
  [-120, 40],
];
/** Dashed blueprint lines, a little stronger than the page hairline so they read in dark mode too. */
const DASH = "border-dashed border-[color-mix(in_oklab,var(--foreground)_13%,transparent)]";

function Tile({ item }: { item: GalleryItem }) {
  // shape the tile like the component itself (plus a little air), so there are no empty bands
  const [, , fw, fh] = item.fit.focus;
  const ratio = Math.min(1.9, Math.max(0.62, (fw * 1.12) / (fh * 1.18)));
  return (
    <div className={cn("border-b p-3", DASH)}>
      <div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
          e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
        }}
        onPointerEnter={(e) => e.currentTarget.style.setProperty("--go", "1")}
        onPointerLeave={(e) => e.currentTarget.style.setProperty("--go", "0")}
        className={cn(
          "cx-glow group relative overflow-hidden rounded-[18px] shadow-[0_0_0_0.5px_var(--cx-hairline)]",
          !item.fit.bg && TINT_CLASSES[item.tint],
        )}
        style={{ aspectRatio: ratio, ...(item.fit.bg ? { backgroundColor: item.fit.bg } : {}) }}
      >
        <div className="relative z-0 size-full">
          <FitPreview
            exportName={item.exportName}
            canvas={item.fit.canvas}
            focus={item.fit.focus}
            demo={item.demo ? demoScript(item.demo, item.fit.canvas, item.fit.focus) : undefined}
            className={cn(
              item.fit.clearRoot &&
                "not-dark:[&>div>*]:!rounded-none not-dark:[&>div>*]:!border-0 not-dark:[&>div>*]:!bg-transparent not-dark:[&>div>*]:!shadow-none",
            )}
          />
        </div>
        <Link
          href={`/components/${item.slug}`}
          className="pg-frost absolute bottom-2.5 left-2.5 z-10 inline-flex max-w-[calc(100%-20px)] translate-y-1 items-center gap-1.5 rounded-full py-1 pl-2.5 pr-2 text-[12.5px] font-medium text-foreground opacity-0 shadow-[0_0_0_0.5px_var(--border)] transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span className="truncate">{item.name}</span>
          <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function Column({ items, index, progress }: { items: GalleryItem[]; index: number; progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const [from, to] = DRIFT[index];
  const raw = useTransform(progress, [0, 1], reduce ? [0, 0] : [from, to]);
  const y = useSpring(raw, { stiffness: 80, damping: 24, mass: 0.6 });
  return (
    <div
      className={cn(
        "border-l first:border-l-0",
        DASH,
        index === 2 && "hidden md:block",
        index === 3 && "hidden lg:block",
      )}
    >
      <motion.div style={{ y, paddingTop: STAGGER[index] }} className="will-change-transform">
        {items.map((it) => (
          <Tile key={it.slug} item={it} />
        ))}
      </motion.div>
    </div>
  );
}

/**
 * Straight under the hero: a wall of real components, all running, set out as masonry in a dashed
 * blueprint grid that runs past the edge of the page. Neighbouring columns drift opposite ways as you
 * scroll, every tile can be touched, and the wall fades out into the way to see the rest.
 */
export function LiveWall({ items, total }: { items: GalleryItem[]; total: number }) {
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const columns = Array.from({ length: COLUMNS }, (_, c) => items.filter((_, i) => i % COLUMNS === c));

  return (
    <section ref={ref} aria-labelledby="wall-title" className="cx-section relative overflow-hidden">
      <div className="mx-auto flex max-w-[1152px] flex-col gap-8 px-4 pt-24 sm:pt-28 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-[600px]">
          <h2 id="wall-title" className="pg-display text-[clamp(38px,5.6vw,60px)] leading-[1.02] text-foreground">
            Every piece on this wall is running.
          </h2>
          <p className="mt-5 max-w-[520px] text-[18px] leading-[1.55] text-muted-foreground">
            Press, drag and type on any of them. Copy one into your repo with one command, or let Claude Code and
            Cursor fetch it for you through the{" "}
            <Link href="/mcp" className="text-link hover:underline hover:underline-offset-4">
              Nexus MCP server
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <PillLink href="/components">Browse all {total}</PillLink>
          <PillLink href="/mcp" variant="white">
            Use with your agent
          </PillLink>
        </div>
      </div>

      <div className={cn("relative mt-14 h-[880px] overflow-hidden border-t sm:h-[1000px] lg:h-[1080px]", DASH)}>
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-2 px-1 md:grid-cols-3 lg:grid-cols-4">
          {columns.map((col, i) => (
            <Column key={i} items={col} index={i} progress={scrollYProgress} />
          ))}
        </div>
        {/* edges fade into the page, the bottom deepest, where the way onward sits */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-background to-transparent xl:block" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-background to-transparent xl:block" />
        <div className="absolute inset-x-0 bottom-0 flex h-64 items-end justify-center bg-gradient-to-t from-background via-background/85 to-transparent pb-12">
          <PillLink href="/components" variant="white" className="shadow-[0_20px_50px_-20px_rgba(0,0,0,0.45)]">
            See all {total} components
          </PillLink>
        </div>
      </div>
    </section>
  );
}
