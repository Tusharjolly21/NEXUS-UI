"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import type { LibraryIndexData } from "@/components/site/library-index";
import { HomeIconStrip } from "@/components/nx-icons/home-strip";
import { videoPosterSrc, videoPreviewSrc } from "@/lib/catalog/videos";
import { playSound, type SoundName } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

function Tile({
  href,
  title,
  meta,
  className,
  children,
}: {
  href: string;
  title: string;
  meta: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--gx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--gy", `${e.clientY - r.top}px`);
      }}
      onPointerEnter={(e) => e.currentTarget.style.setProperty("--go", "1")}
      onPointerLeave={(e) => e.currentTarget.style.setProperty("--go", "0")}
      className={cn(
        "cx-glow group/tile flex flex-col overflow-hidden rounded-[24px] bg-card shadow-[0_0_0_0.5px_var(--cx-hairline)]",
        className,
      )}
    >
      <div className="relative z-10 flex items-start justify-between gap-4 p-5 pb-0 sm:p-6 sm:pb-0">
        <div>
          <h3 className="text-[19px] font-semibold tracking-[-0.4px] text-foreground">{title}</h3>
          <p className="mt-0.5 text-[14px] text-muted-foreground">{meta}</p>
        </div>
        <Link
          href={href}
          aria-label={`Open ${title}`}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-all duration-200 group-hover/tile:bg-foreground group-hover/tile:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ArrowUpRight className="size-4 transition-transform duration-200 group-hover/tile:rotate-45" aria-hidden />
        </Link>
      </div>
      <div className="relative z-0 min-h-0 flex-1">{children}</div>
    </li>
  );
}

/** Two rows of category chips drifting in opposite directions. */
function CategoryStream({ cats }: { cats: LibraryIndexData["components"]["categories"] }) {
  const reduce = useReducedMotion();
  const half = Math.ceil(cats.length / 2);
  const rows = [cats.slice(0, half), cats.slice(half)];
  return (
    <div className="flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,#000_10%,#000_90%,transparent)]">
      {rows.map((row, r) => (
        <div key={r} className="flex overflow-hidden">
          <motion.div
            className="flex shrink-0 gap-2.5 pr-2.5"
            animate={reduce ? undefined : { x: r === 0 ? ["0%", "-50%"] : ["-50%", "0%"] }}
            transition={{ duration: 38 + r * 6, repeat: Infinity, ease: "linear" }}
          >
            {[...row, ...row].map((c, i) => (
              <Link
                key={`${c.slug}-${i}`}
                href={c.href}
                tabIndex={i >= row.length ? -1 : undefined}
                aria-hidden={i >= row.length || undefined}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-3.5 py-2 text-[13.5px] font-medium text-foreground shadow-[0_0_0_0.5px_var(--cx-hairline)] transition-colors hover:bg-muted"
              >
                {c.label}
                <span className="text-muted-foreground">{c.count}</span>
              </Link>
            ))}
          </motion.div>
        </div>
      ))}
    </div>
  );
}

const WIRE = [
  { h: 10, w: "100%" },
  { h: 44, w: "100%" },
  { h: 26, w: "100%", cols: 3 },
  { h: 30, w: "100%", cols: 2 },
];

/** A page drawn as wireframe sections that pull apart on hover. */
function BlockStack() {
  return (
    <div className="absolute inset-x-6 bottom-6 top-4 flex flex-col justify-end">
      <div className="flex flex-col gap-1.5 transition-[gap] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/tile:gap-3.5">
        {WIRE.map((b, i) => (
          <div
            key={i}
            className="flex gap-1.5 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ height: b.h }}
          >
            {Array.from({ length: b.cols ?? 1 }).map((_, k) => (
              <span
                key={k}
                className={cn(
                  "flex-1 rounded-md bg-muted shadow-[0_0_0_0.5px_var(--cx-hairline)] transition-colors duration-500",
                  i === 1 && "group-hover/tile:bg-[linear-gradient(120deg,color-mix(in_oklab,var(--cx-blue)_35%,transparent),color-mix(in_oklab,var(--cx-violet)_35%,transparent))]",
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Three template screenshots in a fan that opens on hover. */
function TemplateFan({ items }: { items: LibraryIndexData["templates"]["items"] }) {
  const pose = [
    "-translate-x-[58%] -rotate-[8deg] group-hover/tile:-translate-x-[92%] group-hover/tile:-rotate-[10deg]",
    "-translate-x-1/2 -translate-y-2 z-10 group-hover/tile:-translate-y-5",
    "-translate-x-[42%] rotate-[8deg] group-hover/tile:-translate-x-[8%] group-hover/tile:rotate-[10deg]",
  ];
  return (
    <div className="absolute inset-0">
      {items.slice(0, 3).map((t, i) => (
        <Link
          key={t.slug}
          href={`/templates/${t.slug}`}
          tabIndex={-1}
          className={cn(
            "absolute bottom-[-30px] left-1/2 aspect-[16/10] w-[56%] overflow-hidden rounded-xl bg-muted shadow-[0_0_0_0.5px_var(--cx-hairline),0_20px_40px_-20px_rgba(0,0,0,0.45)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:w-[46%]",
            pose[i],
          )}
        >
          <Image src={t.image} alt={`${t.title} template`} fill sizes="300px" className="object-cover object-top" />
        </Link>
      ))}
    </div>
  );
}

/** A video poster that plays its preview while hovered. */
function VideoPeek({ slug, title }: { slug: string; title: string }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = React.useState(false);
  return (
    <div
      className="absolute inset-x-4 bottom-4 top-3 overflow-hidden rounded-2xl bg-black"
      onPointerEnter={() => {
        const v = ref.current;
        if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        v.play().then(() => setPlaying(true)).catch(() => {});
      }}
      onPointerLeave={() => {
        ref.current?.pause();
        setPlaying(false);
      }}
    >
      <video
        ref={ref}
        src={videoPreviewSrc(slug)}
        poster={videoPosterSrc(slug)}
        muted
        loop
        playsInline
        preload="none"
        aria-label={title}
        className="size-full object-cover"
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 grid place-items-center bg-black/25 transition-opacity duration-300",
          playing && "opacity-0",
        )}
      >
        <span className="grid size-11 place-items-center rounded-full bg-white/90 text-black shadow-lg">
          <Play className="size-4 translate-x-px fill-current" />
        </span>
      </span>
    </div>
  );
}

const PADS: { name: SoundName; label: string; color: string }[] = [
  { name: "pop", label: "Pop", color: "#0090f7" },
  { name: "success", label: "Landed", color: "#6e5bff" },
  { name: "whoosh", label: "Whisk", color: "#ba62fc" },
  { name: "paid", label: "Paid", color: "#f2416b" },
];
const BARS = 36;

/** A waveform that jumps when you press one of the sound pads. */
function SoundPads() {
  const reduce = useReducedMotion();
  const [hit, setHit] = React.useState<{ n: number; color: string }>({ n: 0, color: "#6e5bff" });
  return (
    <div className="absolute inset-x-6 bottom-6 top-3 flex flex-col justify-end gap-4">
      <div className="flex h-16 items-center gap-[3px]" aria-hidden>
        {Array.from({ length: BARS }).map((_, i) => {
          const base = 0.18 + 0.22 * Math.abs(Math.sin(i * 0.7));
          return (
            <motion.span
              key={`${hit.n}-${i}`}
              className="flex-1 rounded-full"
              style={{ background: hit.n ? hit.color : "var(--muted-foreground)", opacity: hit.n ? 0.9 : 0.35 }}
              initial={{ height: `${base * 100}%` }}
              animate={
                reduce || !hit.n
                  ? { height: `${base * 100}%` }
                  : { height: [`${base * 100}%`, `${Math.min(100, (0.5 + 0.5 * Math.abs(Math.sin((i + 1) * hit.n * 12.9898))) * 100)}%`, `${base * 100}%`] }
              }
              transition={{ duration: 0.5, delay: Math.abs(i - BARS / 2) * 0.012, ease: "easeOut" }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2">
        {PADS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              playSound(p.name);
              setHit((h) => ({ n: h.n + 1, color: p.color }));
            }}
            className="inline-flex items-center gap-2 rounded-full bg-background px-3.5 py-2 text-[13px] font-medium text-foreground shadow-[0_0_0_0.5px_var(--cx-hairline)] transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <span className="size-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
            Play {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Everything in the library as one bento: each shelf shows a little of what's on it. */
export function ShelfBento({ data, children }: { data: LibraryIndexData; children?: React.ReactNode }) {
  const video = data.videos.items[0];
  return (
    <section aria-labelledby="shelves-title" className="cx-section px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-[1152px]">
        <div className="max-w-[620px]">
          <h2 id="shelves-title" className="pg-display text-[clamp(38px,6vw,56px)] leading-[1.02] text-foreground">
            Everything a page needs, on one shelf.
          </h2>
          <p className="mt-4 text-[18px] leading-[1.55] text-muted-foreground">
            Components, blocks, templates, videos, icons and sounds. Most install with one command.
          </p>
        </div>

        <ul className="mt-12 grid auto-rows-[240px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile
            href="/components"
            title="Components"
            meta={`${data.components.total} animated, ${data.components.free} free`}
            className="row-span-2 sm:col-span-2"
          >
            <div className="flex h-full flex-col justify-between gap-6 pb-6 pt-4">
              <p className="pg-display cx-spectrum-text px-6 text-[clamp(72px,11vw,148px)] leading-none">{data.components.total}</p>
              <CategoryStream cats={data.components.categories} />
            </div>
          </Tile>

          <Tile
            href="/templates"
            title="Templates"
            meta={`${data.templates.total} full sites`}
            className="sm:col-span-2"
          >
            <TemplateFan items={data.templates.items} />
          </Tile>

          <Tile href="/blocks" title="Blocks" meta={`${data.blocks.sections} across ${data.blocks.total} categories`}>
            <BlockStack />
          </Tile>

          <Tile href="/videos" title="Videos" meta={`${data.videos.total} product films`}>
            {video ? <VideoPeek slug={video.slug} title={video.title} /> : null}
          </Tile>

          <Tile href="/sounds" title="Sounds" meta={`${data.sounds.total} interface sounds`} className="sm:col-span-2">
            <SoundPads />
          </Tile>

          <Tile href="/icons" title="Icons" meta={`${data.icons.total} that move, ${data.icons.free} free`} className="sm:col-span-2">
            <div className="absolute inset-x-5 bottom-5 [&_a]:!aspect-auto [&_a]:!gap-1.5 [&_a]:!py-3 [&_a>span]:!text-[11.5px]">
              <HomeIconStrip count={6} className="!grid-cols-3 sm:!grid-cols-6 lg:!grid-cols-6 !gap-2" />
            </div>
          </Tile>
        </ul>
        {children}
      </div>
    </section>
  );
}
