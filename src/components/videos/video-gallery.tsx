"use client";

import { madeFor, VIDEO_PLATFORMS } from "@/lib/catalog/video-platforms";
import { useUrlParam } from "@/components/gallery/use-url-param";
import * as React from "react";
import Link from "next/link";
import { AccessTag, IfPro } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";
import { videoFormat, videoPosterSrc, videoPreviewSrc, type VideoEntry } from "@/lib/catalog/videos";

/** Only what the grid needs, so the page does not ship every prompt and field to the browser. */
export type GalleryVideo = Pick<VideoEntry, "slug" | "title" | "purpose" | "motion" | "app" | "platforms" | "formats" | "duration" | "loop" | "premium">;

/** Videos that get the big tile. */
const FEATURED = new Set(["launch-film"]);

function inChip(v: GalleryVideo, chip: string) {
  if (chip === "all") return true;
  if (chip === "free") return !v.premium;
  return madeFor(v.platforms, chip);
}

type Kind = "feature" | "wide" | "tall" | "square" | "portrait";

/** How big a video's tile is, from the shape it opens in. */
function kindOf(v: GalleryVideo): Kind {
  const f = videoFormat(v);
  if (FEATURED.has(v.slug) && f.w > f.h) return "feature";
  if (f.w / f.h > 1.4) return "wide";
  if (f.w / f.h < 0.7) return "tall";
  if (f.w === f.h) return "square";
  return "portrait";
}

/**
 * The grid is built from half-column rows (see the wrapper), so every tile can be a whole number of rows
 * and still sit close to its own shape: a landscape film is two columns wide, a reel is a tall single column.
 */
const SPAN: Record<Kind, string> = {
  feature: "col-span-2 row-span-2 md:col-span-3 md:row-span-3",
  wide: "col-span-2 row-span-2",
  tall: "row-span-3",
  square: "row-span-2",
  portrait: "row-span-3",
};


/**
 * Puts the videos in an order that tiles the four-column grid with no gaps: the big film beside a reel, then
 * rows of two landscape tiles, rows of four reels, a landscape tile with two squares, and a last landscape tile
 * beside the "get every video" card. Free videos come first inside each kind so they sit near the top. If a kind
 * runs out (a filter, a new video) the rest simply follow and the dense grid fills what it can.
 */
function arrange(list: GalleryVideo[], withCta: boolean): (GalleryVideo | "cta")[] {
  const pools: Record<"feature" | "wide" | "tall" | "square", GalleryVideo[]> = { feature: [], wide: [], tall: [], square: [] };
  for (const v of list) {
    const k = kindOf(v);
    pools[k === "portrait" ? "tall" : k].push(v);
  }
  for (const k of Object.keys(pools) as (keyof typeof pools)[]) pools[k] = [...pools[k]].sort((a, b) => Number(a.premium) - Number(b.premium));
  const out: (GalleryVideo | "cta")[] = [];
  const take = (k: keyof typeof pools, n: number) => out.push(...pools[k].splice(0, n));
  const left = () => pools.feature.length + pools.wide.length + pools.tall.length + pools.square.length;
  take("feature", 1);
  take("tall", 1);
  for (const row of [
    [["wide", 2]],
    [["tall", 4]],
    [["wide", 2]],
    [["tall", 4]],
    [["wide", 1], ["square", 2]],
    [["tall", 4]],
    [["wide", 1]],
  ] as [keyof typeof pools, number][][])
    for (const [k, n] of row) take(k, n);
  if (withCta) out.push("cta");
  // whatever is left, in the same rhythm
  while (left() > 0) {
    take("feature", 1);
    take("wide", 2);
    take("tall", 4);
    take("square", 2);
  }
  return out;
}

/** The card that closes the grid: what Pro adds to every video. */
function ProTile() {
  return (
    <div className="relative flex size-full flex-col justify-between overflow-hidden rounded-[22px] bg-[#1d1d1f] p-5 text-white sm:rounded-[28px] sm:p-7">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[radial-gradient(circle,rgba(120,119,255,.55),rgba(120,119,255,0)_70%)]" />
      <div className="relative">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">Every video</p>
        <IfPro
          pro={<p className="mt-2 text-[clamp(20px,2.4vw,30px)] font-semibold leading-[1.08] tracking-[-0.5px]">Open one, edit it, make it yours.</p>}
          otherwise={<p className="mt-2 text-[clamp(20px,2.4vw,30px)] font-semibold leading-[1.08] tracking-[-0.5px]">Take the prompt, the code and the render script.</p>}
        />
        <p className="mt-2 hidden max-w-[360px] text-[14px] text-white/70 sm:block">Change the words and colours, then render an MP4 in the shape each platform wants.</p>
      </div>
      <IfPro
        pro={null}
        otherwise={
          <Link href="/pricing" data-plans-source="videos" className="relative w-fit rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-[#1d1d1f] transition-opacity hover:opacity-90">
            Compare plans
          </Link>
        }
      />
    </div>
  );
}

function Tile({ video, kind, priority }: { video: GalleryVideo; kind: Kind; priority?: boolean }) {
  const ref = React.useRef<HTMLVideoElement>(null);
  const [on, setOn] = React.useState(false);
  const shape = videoFormat(video);
  const big = kind === "feature";

  const play = React.useCallback(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setOn(true);
    void v.play().catch(() => {});
  }, []);
  const stop = React.useCallback(() => {
    const v = ref.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setOn(false);
  }, []);

  // Touch screens have no hover: play while the tile is mostly in view instead.
  React.useEffect(() => {
    const v = ref.current;
    if (!v || !window.matchMedia("(hover: none)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.intersectionRatio > 0.6 ? play() : stop()), { threshold: [0, 0.6] });
    io.observe(v);
    return () => io.disconnect();
  }, [play, stop]);

  return (
    <Link
      href={`/videos/${video.slug}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && play()}
      onPointerLeave={(e) => e.pointerType === "mouse" && stop()}
      onFocus={play}
      onBlur={stop}
      aria-label={`${video.title}: ${video.purpose}, ${video.duration} seconds, ${video.premium ? "Pro" : "Free"}`}
      className="group relative block size-full overflow-hidden rounded-[22px] bg-muted shadow-[0_1px_2px_rgba(0,0,0,.06),0_8px_24px_-12px_rgba(0,0,0,.25)] ring-1 ring-black/[.06] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(0,0,0,.08),0_22px_44px_-18px_rgba(0,0,0,.4)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:rounded-[28px] dark:ring-white/10"
    >
      <video
        ref={ref}
        src={videoPreviewSrc(video.slug)}
        poster={videoPosterSrc(video.slug)}
        muted
        loop
        playsInline
        preload={priority ? "metadata" : "none"}
        aria-hidden
        className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      <span className="absolute left-3 top-3 sm:left-4 sm:top-4">
        <AccessTag premium={video.premium} />
      </span>
      <span
        className={cn(
          "absolute right-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white backdrop-blur-md transition-opacity sm:right-4 sm:top-4",
          on ? "opacity-0" : "opacity-100",
        )}
      >
        {shape.label} · {video.duration}s{video.loop ? " loop" : ""}
      </span>

      <div className={cn("absolute inset-x-0 bottom-0 p-3.5 text-white sm:p-5", big && "sm:p-7")}>
        {big && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">The flagship film</p>}
        <p className={cn("font-semibold leading-[1.1] tracking-[-0.3px]", big ? "text-[clamp(24px,3.2vw,38px)]" : "text-[15px] sm:text-[18px]")}>{video.title}</p>
        <p className={cn("mt-1 line-clamp-2 text-white/75", big ? "max-w-[460px] text-[14px] sm:text-[15px]" : "text-[12px] sm:text-[13px]")}>
          {big ? video.motion : video.purpose}
        </p>
      </div>
    </Link>
  );
}

export function VideoGallery({ videos }: { videos: GalleryVideo[] }) {
  // the place a video is made for lives in the address, shared with the names column and the phone chips
  const [forParam, setForParam] = useUrlParam("for");
  const platform = forParam && VIDEO_PLATFORMS.some((p) => p.id === forParam) ? forParam : "all";
  const [freeOnly, setFreeOnly] = React.useState(false);
  const [q, setQ] = React.useState("");
  const freeCount = React.useMemo(() => videos.filter((v) => !v.premium).length, [videos]);
  const chip = freeOnly ? "free" : platform;

  const shown = React.useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = videos.filter((v) => {
      if (!inChip(v, platform)) return false;
      if (freeOnly && v.premium) return false;
      if (!words.length) return true;
      const hay = [v.title, v.purpose, v.motion, v.app, ...v.platforms, ...v.formats, v.premium ? "pro" : "free"].join(" ").toLowerCase();
      return words.every((w) => hay.includes(w));
    });
    return arrange(list, platform === "all" && !freeOnly && words.length === 0);
  }, [videos, platform, freeOnly, q]);

  const filtered = chip !== "all" || q.trim() !== "";

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* the places live in the names column (and the chips above on phones); Free is not a place, so it stays here */}
        <button
          type="button"
          aria-pressed={freeOnly}
          onClick={() => setFreeOnly((v) => !v)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-4 py-2 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:self-auto",
            freeOnly ? "bg-foreground text-background" : "bg-muted text-foreground/80 hover:bg-foreground/10 hover:text-foreground",
          )}
        >
          Free only
          <span className={cn("text-[12px] tabular-nums", freeOnly ? "text-background/60" : "text-muted-foreground")}>{freeCount}</span>
        </button>
        <label className="relative block w-full lg:w-[280px]">
          <span className="sr-only">Search videos</span>
          <svg aria-hidden viewBox="0 0 20 20" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3.5 3.5" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search: launch, price, reels…"
            className="h-10 w-full rounded-full bg-muted pl-10 pr-4 text-[14px] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <p aria-live="polite" className="mt-5 text-[13px] text-muted-foreground">
        {filtered ? `${shown.length} of ${videos.length} videos` : `${videos.length} videos`}
        {filtered && (
          <>
            {" · "}
            <button
              type="button"
              onClick={() => {
                setForParam(null);
                setFreeOnly(false);
                setQ("");
              }}
              className="font-medium text-foreground underline underline-offset-4"
            >
              Clear
            </button>
          </>
        )}
      </p>

      {shown.length === 0 ? (
        <p className="mt-16 text-center text-[16px] text-muted-foreground">No video matches that. Try another word, or clear the filter.</p>
      ) : (
        // The wrapper is a size container so one row can be half a column: (width - gaps) / columns / 2.
        <div className="mt-4 [container-type:inline-size]">
          <ul
            className={cn(
              "grid grid-flow-dense grid-cols-2 gap-[var(--g)] md:grid-cols-3 lg:grid-cols-4",
              "[--g:12px] [--n:2] sm:[--g:16px] md:[--n:3] lg:[--n:4]",
              "auto-rows-[calc((100cqw-(var(--n)-1)*var(--g))/var(--n)/2)]",
            )}
          >
            {shown.map((v, i) => {
              if (v === "cta")
                return (
                  <li key="cta" className="col-span-2 row-span-2">
                    <ProTile />
                  </li>
                );
              const kind = kindOf(v);
              return (
                <li key={v.slug} className={SPAN[kind]}>
                  <Tile video={v} kind={kind} priority={i === 0} />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
