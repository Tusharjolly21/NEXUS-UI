"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronRight, Copy, ExternalLink } from "lucide-react";
import { playSound, type SoundName } from "@/lib/ui-sounds";
import { videoPosterSrc, videoPreviewSrc } from "@/lib/catalog/videos";
import { cn } from "@/lib/utils";

export type LibraryIndexData = {
  components: { total: number; free: number; categories: { slug: string; label: string; count: number; href: string }[] };
  blocks: { total: number; sections: number; items: { slug: string; label: string }[] };
  templates: { total: number; items: { slug: string; title: string; image: string }[] };
  videos: { total: number; items: { slug: string; title: string; purpose: string }[] };
  sounds: { total: number };
};

type ShelfId = "components" | "blocks" | "templates" | "videos" | "sounds";

const CYCLE_MS = 6500;

/**
 * The library as an index: four shelves on the left, a look inside the picked one on the right,
 * and the command that installs from it. It steps through the shelves by itself until someone
 * picks one (never with reduced motion).
 */
export function LibraryIndex({ data }: { data: LibraryIndexData }) {
  const reduce = useReducedMotion();
  const uid = React.useId().replace(/:/g, "");
  const [active, setActive] = React.useState<ShelfId>("components");
  const [touched, setTouched] = React.useState(false);
  const [hovering, setHovering] = React.useState(false);
  const [cycle, setCycle] = React.useState(0);
  const auto = !touched && !reduce && !hovering;

  const shelves: { id: ShelfId; name: string; line: string; count: string; note: string; href: string; cta: string; command?: string; noInstall?: string }[] = [
    {
      id: "components",
      name: "Components",
      line: "Inputs, docks, decks, charts and 3D, each with its own physics.",
      count: String(data.components.total),
      note: `${data.components.free} free`,
      href: "/components",
      cta: "Browse components",
      command: "npx shadcn@latest add @nexus-labs/otp-input",
    },
    {
      id: "blocks",
      name: "Blocks",
      line: "Whole sections, from the nav to the footer, ready to drop in.",
      count: String(data.blocks.sections),
      note: `in ${data.blocks.total} blocks`,
      href: "/blocks",
      cta: "Browse blocks",
      command: "npx shadcn@latest add @nexus-labs/hero-blocks",
    },
    {
      id: "templates",
      name: "Templates",
      line: "Complete landing pages built from those pieces. Open any one live.",
      count: String(data.templates.total),
      note: "landing pages",
      href: "/templates",
      cta: "See templates",
      noInstall: "No install: open any template live in your browser",
    },
    {
      id: "videos",
      name: "Videos",
      line: "Vertical product videos with their own soundtracks. Edit the words, then render.",
      count: String(data.videos.total),
      note: "with sound",
      href: "/videos",
      cta: "Watch the videos",
      noInstall: "No install: watch and edit any video in your browser",
    },
    {
      id: "sounds",
      name: "Sounds",
      line: "Interface sounds made in code, so there is nothing to download.",
      count: String(data.sounds.total),
      note: "free",
      href: "/sounds",
      cta: "Hear them all",
      command: "npx shadcn@latest add @nexus-labs/ui-sounds",
    },
  ];
  const current = shelves.find((s) => s.id === active)!;

  // Step to the next shelf on a timer; restarting the key restarts the progress bar too.
  React.useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      setActive((a) => shelves[(shelves.findIndex((s) => s.id === a) + 1) % shelves.length].id);
      setCycle((c) => c + 1);
    }, CYCLE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- shelves is rebuilt each render; the order never changes
  }, [auto, active, cycle]);

  const pick = (id: ShelfId) => {
    setTouched(true);
    setActive(id);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (i + 1) % shelves.length
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i - 1 + shelves.length) % shelves.length
      : e.key === "Home" ? 0
      : e.key === "End" ? shelves.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    pick(shelves[next].id);
    document.getElementById(`${uid}-tab-${shelves[next].id}`)?.focus();
  };

  return (
    <div
      className="grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-6"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setTouched(true)}
    >
      <div className="flex min-w-0 flex-col">
        <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">What&apos;s on the shelves</h2>
        <p className="mt-4 max-w-[440px] text-[18px] text-muted-foreground">
          Five kinds of thing, most with one command to install. Pick a shelf to look inside.
        </p>

        <div role="tablist" aria-orientation="vertical" aria-label="Library" className="mt-8 grid grid-cols-2 gap-2 max-lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:grid-cols-1 lg:gap-1">
          {shelves.map((s, i) => {
            const on = s.id === active;
            return (
              <button
                key={s.id}
                id={`${uid}-tab-${s.id}`}
                type="button"
                role="tab"
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                onClick={() => pick(s.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "group relative isolate flex min-h-[64px] flex-col items-start gap-0.5 rounded-[20px] px-4 py-3 text-left lg:flex-row lg:items-center lg:gap-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:px-5 lg:py-4",
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {on ? (
                  <motion.span
                    layoutId={`${uid}-row`}
                    aria-hidden
                    className="absolute inset-0 -z-10 overflow-hidden rounded-[20px] bg-card shadow-[0_0_0_0.5px_var(--border),0_14px_34px_-22px_rgba(0,0,0,0.35)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38 }}
                  >
                    {auto ? (
                      <motion.span
                        key={`${active}-${cycle}`}
                        className="absolute bottom-0 left-0 h-[2px] bg-foreground/25"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                      />
                    ) : null}
                  </motion.span>
                ) : null}
                <span className="min-w-0 lg:flex-1">
                  <span className="block text-[18px] font-semibold tracking-[-0.02em] lg:text-[22px]">{s.name}</span>
                  <span className="mt-1 hidden text-[14.5px] leading-snug text-muted-foreground lg:block">{s.line}</span>
                </span>
                <span className="shrink-0 lg:text-right">
                  <span className="text-[14px] font-semibold tabular-nums tracking-[-0.02em] lg:block lg:text-[28px]">{s.count}</span>
                  <span className="ml-1 text-[12.5px] text-muted-foreground lg:ml-0 lg:block">{s.note}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 lg:mt-auto lg:pt-6">
          {current.command ? (
            <CommandLine command={current.command} />
          ) : (
            <Link
              href={current.href}
              className="flex min-h-12 items-center justify-between gap-3 rounded-[24px] bg-[#1d1d1f] py-1.5 pl-5 pr-2 text-[14px] text-white/80 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.08]"
            >
              <span>{current.noInstall}</span>
              <span className="grid size-8 place-items-center rounded-full bg-white/15" aria-hidden>
                <ExternalLink className="size-3.5" />
              </span>
            </Link>
          )}
        </div>
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        className="relative flex flex-col overflow-hidden rounded-tile bg-card shadow-[0_0_0_0.5px_var(--border),0_30px_60px_-40px_rgba(0,0,0,0.35)] lg:min-h-[500px]"
      >
        <div className="relative flex flex-1 flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active}
              className="flex min-h-[340px] flex-1 flex-col [&>*]:flex-1"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {active === "components" ? <ComponentsShelf data={data.components} /> : null}
              {active === "blocks" ? <BlocksShelf data={data.blocks} /> : null}
              {active === "templates" ? <TemplatesShelf data={data.templates} /> : null}
              {active === "videos" ? <VideosShelf data={data.videos} /> : null}
              {active === "sounds" ? <SoundsShelf onPlay={() => setTouched(true)} /> : null}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="relative flex items-center justify-between gap-3 border-t border-border px-5 py-3.5">
          <p className="text-[13.5px] text-muted-foreground">
            {current.id === "blocks" ? `${current.count} sections in ${data.blocks.total} blocks` : `${current.count} ${current.name.toLowerCase()}`}
          </p>
          <Link
            href={current.href}
            className="inline-flex min-h-10 items-center gap-0.5 text-[15px] font-medium text-link hover:underline hover:underline-offset-4"
          >
            {current.cta}
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CommandLine({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-[24px] bg-[#1d1d1f] py-1.5 pl-5 pr-1.5 dark:bg-white/[0.08]">
      <span className="font-mono text-[13px] text-white/40" aria-hidden>
        $
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.code
          key={command}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
          className="min-w-0 flex-1 break-all font-mono text-[13px] text-white lg:truncate lg:break-normal"
        >
          {command}
        </motion.code>
      </AnimatePresence>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(command).then(() => setCopied(true), () => {})}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3.5 text-[13px] font-medium text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>
  );
}

// ── shelves ─────────────────────────────────────────────────────────

function ComponentsShelf({ data }: { data: LibraryIndexData["components"] }) {
  const reduce = useReducedMotion();
  const max = Math.max(...data.categories.map((c) => c.count));
  return (
    <div className="flex h-full flex-col justify-center p-5 sm:p-8">
      <p className="text-[13px] font-medium text-muted-foreground">By category</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {data.categories.map((c, i) => (
          <motion.li
            key={c.slug}
            className={i >= 10 ? "max-sm:hidden" : undefined}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduce ? 0 : 0.03 * i, type: "spring", stiffness: 500, damping: 30 }}
          >
            <Link
              href={c.href}
              className="group inline-flex h-10 items-center gap-2 rounded-full bg-[#f5f5f7] px-3.5 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.07]"
              style={{ fontSize: `${13 + Math.round((c.count / max) * 4)}px` }}
            >
              {c.label}
              <span className="text-[12px] tabular-nums text-muted-foreground group-hover:text-background/70">{c.count}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** A page assembling itself from section types, top to bottom; each strip opens its block. */
function BlocksShelf({ data }: { data: LibraryIndexData["blocks"] }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full items-center justify-center bg-[#f5f5f7] p-5 sm:p-8 dark:bg-black/40">
      <ol className="w-full max-w-[420px] overflow-hidden rounded-[18px] bg-card shadow-[0_0_0_0.5px_var(--border),0_20px_40px_-26px_rgba(0,0,0,0.35)]">
        {data.items.map((b, i) => (
          <motion.li
            key={b.slug}
            initial={reduce ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.07 * i, type: "spring", stiffness: 380, damping: 30 }}
            className="border-b border-border last:border-0"
          >
            <Link
              href={`/blocks/${b.slug}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/[0.03] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              <SectionSketch index={i} />
              <span className="flex-1 text-[14px] font-medium text-foreground">{b.label}</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
            </Link>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** Tiny wireframes so each strip reads as a different kind of section. */
function SectionSketch({ index }: { index: number }) {
  const bar = "rounded-full bg-foreground/15";
  const box = "rounded-[3px] bg-foreground/10";
  const sketches = [
    <div key="nav" className="flex h-full items-center justify-between px-1"><span className={cn(bar, "h-1.5 w-3")} /><span className="flex gap-1"><span className={cn(bar, "h-1 w-2")} /><span className={cn(bar, "h-1 w-2")} /><span className={cn(bar, "h-1 w-2")} /></span></div>,
    <div key="hero" className="flex h-full flex-col items-center justify-center gap-1"><span className={cn(bar, "h-1.5 w-8")} /><span className={cn(bar, "h-1 w-5")} /></div>,
    <div key="features" className="grid h-full grid-cols-3 gap-0.5 p-1"><span className={box} /><span className={box} /><span className={box} /></div>,
    <div key="proof" className="flex h-full items-center justify-around"><span className="size-1.5 rounded-full bg-foreground/20" /><span className="size-1.5 rounded-full bg-foreground/20" /><span className="size-1.5 rounded-full bg-foreground/20" /></div>,
    <div key="pricing" className="grid h-full grid-cols-3 items-end gap-0.5 p-1"><span className={cn(box, "h-3")} /><span className={cn(box, "h-full bg-foreground/20")} /><span className={cn(box, "h-3")} /></div>,
    <div key="faq" className="flex h-full flex-col justify-center gap-0.5 px-1"><span className={cn(bar, "h-1 w-full")} /><span className={cn(bar, "h-1 w-full")} /><span className={cn(bar, "h-1 w-4/5")} /></div>,
    <div key="cta" className="flex h-full items-center justify-center gap-0.5"><span className={cn(bar, "h-2 w-6")} /><span className="h-2 w-3 rounded-full bg-foreground/30" /></div>,
  ];
  return (
    <span aria-hidden className="h-7 w-12 shrink-0 rounded-[6px] bg-[#f5f5f7] dark:bg-white/[0.06]">
      {sketches[index % sketches.length]}
    </span>
  );
}

function TemplatesShelf({ data }: { data: LibraryIndexData["templates"] }) {
  const reduce = useReducedMotion();
  const fan = [
    { rotate: -7, x: "-34%", y: 18, z: 1 },
    { rotate: 0, x: "0%", y: 0, z: 3 },
    { rotate: 7, x: "34%", y: 18, z: 2 },
  ];
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#f5f5f7] to-card px-4 dark:from-black/40">
      <ul className="relative h-[260px] w-full max-w-[560px] sm:h-[300px]">
        {data.items.slice(0, 3).map((t, i) => (
          <motion.li
            key={t.slug}
            className="absolute left-1/2 top-1/2 w-[62%] max-w-[330px]"
            style={{ zIndex: fan[i].z }}
            initial={reduce ? false : { opacity: 0, rotate: 0, x: "-50%", y: "-40%" }}
            animate={{ opacity: 1, rotate: fan[i].rotate, x: `calc(-50% + ${fan[i].x})`, y: `calc(-50% + ${fan[i].y}px)` }}
            whileHover={reduce ? undefined : { y: `calc(-50% + ${fan[i].y - 10}px)`, zIndex: 5 }}
            transition={{ delay: reduce ? 0 : 0.06 * i, type: "spring", stiffness: 260, damping: 24 }}
          >
            <Link
              href={`/templates/${t.slug}`}
              className="block overflow-hidden rounded-[14px] bg-card shadow-[0_0_0_0.5px_var(--border),0_24px_44px_-22px_rgba(0,0,0,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <span className="flex gap-1 border-b border-border px-2.5 py-2" aria-hidden>
                <span className="size-1.5 rounded-full bg-[#ff605c]" />
                <span className="size-1.5 rounded-full bg-[#ffbd44]" />
                <span className="size-1.5 rounded-full bg-[#00ca4e]" />
              </span>
              <span className="relative block aspect-[16/10] bg-muted">
                <Image src={t.image} alt={`${t.title} template`} fill sizes="330px" className="object-cover object-top" />
              </span>
              <span className="block truncate px-3 py-2 text-[13px] font-semibold text-foreground">{t.title}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** Three vertical videos playing silently side by side; each opens its page. */
function VideosShelf({ data }: { data: LibraryIndexData["videos"] }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-b from-[#f5f5f7] to-card px-4 py-6 dark:from-black/40">
      <ul className="grid w-full max-w-[520px] grid-cols-3 gap-3 sm:gap-4">
        {data.items.slice(0, 3).map((v, i) => (
          <motion.li
            key={v.slug}
            className={i === 1 ? "sm:-translate-y-3" : "sm:translate-y-3"}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.07 * i, type: "spring", stiffness: 300, damping: 26 }}
          >
            <Link
              href={`/videos/${v.slug}`}
              className="group block overflow-hidden rounded-[18px] bg-black shadow-[0_0_0_0.5px_var(--border),0_24px_44px_-22px_rgba(0,0,0,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <span className="relative block aspect-[9/16]">
                <video
                  src={videoPreviewSrc(v.slug)}
                  poster={videoPosterSrc(v.slug)}
                  autoPlay={!reduce}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden
                  className="absolute inset-0 size-full object-cover"
                />
              </span>
              <span className="sr-only">{v.title}: {v.purpose}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

const ORBS: { name: SoundName; label: string; bg: string }[] = [
  { name: "pop", label: "Pop", bg: "radial-gradient(circle at 32% 28%, #e9d5ff 0%, #c084fc 28%, #7c3aed 70%, #4c1d95 100%)" },
  { name: "success", label: "Landed", bg: "radial-gradient(circle at 32% 28%, #d1fae5 0%, #34d399 30%, #14b8a6 68%, #0f766e 100%)" },
  { name: "glide", label: "Glide", bg: "radial-gradient(circle at 32% 28%, #dbeafe 0%, #60a5fa 30%, #1d4ed8 72%, #1e3a8a 100%)" },
  { name: "chime", label: "Chime", bg: "radial-gradient(circle at 32% 28%, #fef9c3 0%, #fde047 30%, #f59e0b 70%, #b45309 100%)" },
  { name: "on", label: "Latch", bg: "radial-gradient(circle at 32% 28%, #fce7f3 0%, #f472b6 30%, #a855f7 70%, #6b21a8 100%)" },
  { name: "drop", label: "Drop", bg: "radial-gradient(circle at 32% 28%, #ccfbf1 0%, #5eead4 30%, #22c55e 70%, #15803d 100%)" },
  { name: "done", label: "Complete", bg: "radial-gradient(circle at 32% 28%, #ffedd5 0%, #fb923c 30%, #ef4444 70%, #b91c1c 100%)" },
  { name: "boot", label: "Boot", bg: "radial-gradient(circle at 32% 28%, #f3f4f6 0%, #9ca3af 30%, #4b5563 70%, #1f2937 100%)" },
];

function SoundsShelf({ onPlay }: { onPlay: () => void }) {
  const reduce = useReducedMotion();
  const [hits, setHits] = React.useState<Record<string, number>>({});
  return (
    <div className="flex h-full flex-col items-center justify-center p-5 sm:p-8">
      <ul className="grid grid-cols-4 gap-x-4 gap-y-6 sm:gap-x-8">
        {ORBS.map((o, i) => (
          <motion.li
            key={o.name}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.04 * i, type: "spring", stiffness: 420, damping: 26 }}
          >
            <button
              type="button"
              aria-label={`Play ${o.label}`}
              onClick={() => {
                onPlay();
                setHits((h) => ({ ...h, [o.name]: (h[o.name] ?? 0) + 1 }));
                playSound(o.name);
              }}
              className="flex flex-col items-center gap-2 rounded-2xl p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <motion.span
                key={hits[o.name] ?? 0}
                aria-hidden
                className="block size-12 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.18),0_10px_22px_-12px_rgba(0,0,0,0.45)] sm:size-14"
                style={{ background: o.bg }}
                initial={hits[o.name] && !reduce ? { scale: 0.8 } : false}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 14 }}
              />
              <span className="text-[13px] font-medium text-foreground">{o.label}</span>
            </button>
          </motion.li>
        ))}
      </ul>
      <p className="mt-7 text-[13.5px] text-muted-foreground">Tap one. Every sound is generated in your browser.</p>
    </div>
  );
}
