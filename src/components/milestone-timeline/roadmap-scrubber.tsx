"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";

/** A bar on a track. Dates are calendar days written as `YYYY-MM-DD`. */
export type RoadmapScrubberBar = { label: string; start: string; end: string };
/** A milestone diamond on a track. */
export type RoadmapScrubberMark = { label: string; date: string };
export type RoadmapScrubberTrack = { name: string; bars?: RoadmapScrubberBar[]; marks?: RoadmapScrubberMark[] };

export interface RoadmapScrubberProps {
  /** Tracks to draw. Defaults to a Design, Engineering and Launch roadmap for 2026. */
  tracks?: RoadmapScrubberTrack[];
  /** The calendar year the chart spans, January to December. Dates outside it are clamped to the edges. */
  year?: number;
  /** The date marked as today, `YYYY-MM-DD`. The component never reads the real clock, so it always renders the same. */
  today?: string;
  /** Heading. Defaults to `Roadmap <year>`. */
  title?: string;
  /** After the opening sweep, glides the playhead through the year by itself until someone touches the chart. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const ROW = 52;
const LABEL = 108;

const DEFAULT_TRACKS: RoadmapScrubberTrack[] = [
  {
    name: "Design",
    bars: [
      { label: "Design system", start: "2026-01-01", end: "2026-03-26" },
      { label: "Motion tokens", start: "2026-04-07", end: "2026-06-07" },
      { label: "Pro templates", start: "2026-08-01", end: "2026-11-01" },
    ],
  },
  {
    name: "Engineering",
    bars: [
      { label: "Core library", start: "2026-02-01", end: "2026-07-01" },
      { label: "Pro blocks", start: "2026-07-13", end: "2026-11-19" },
    ],
  },
  {
    name: "Launch",
    bars: [{ label: "Private beta", start: "2026-05-17", end: "2026-08-17" }],
    marks: [
      { label: "Public launch", date: "2026-09-16" },
      { label: "v2", date: "2026-12-13" },
    ],
  },
];

const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** A date as a position in months from January 1 (0) to the end of December (12). Every month is one equal column. */
function posOf(iso: string, year: number): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return 0;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  return clamp((y - year) * 12 + mo + (d - 1) / daysIn(y, mo), 0, 12);
}

function labelOf(p: number, year: number): string {
  const m = Math.min(11, Math.max(0, Math.floor(p)));
  const n = daysIn(year, m);
  return `${MONTHS[m]} ${Math.min(n, Math.floor((p - m) * n + 1e-9) + 1)}`;
}

type Bar = { label: string; from: number; to: number };
type Track = { name: string; bars: Bar[]; marks: { label: string; at: number }[] };

/**
 * The roadmap as an edit timeline. Drag the playhead through the year and
 * every bar fills to that day, milestones tick over as you pass them, and the
 * summary underneath says what is in flight and what is next. It opens by
 * sweeping from January to today.
 */
export function RoadmapScrubber({
  tracks = DEFAULT_TRACKS,
  year = 2026,
  today = "2026-06-15",
  title,
  autoplay = false,
  className = "",
}: RoadmapScrubberProps) {
  const reduce = useReducedMotion() ?? false;
  const [p, setP] = useState(0);
  const pos = useRef(0);
  const area = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const touched = useRef(false);
  const run = useRef<AnimationPlaybackControls | undefined>(undefined);
  const [swept, setSwept] = useState(false);
  const seen = useInView(area, { once: true, amount: 0.1 });
  const visible = useInView(area, { amount: 0.1 });

  const model: Track[] = useMemo(
    () =>
      tracks.map((t) => ({
        name: t.name,
        bars: (t.bars ?? []).map((b) => ({ label: b.label, from: posOf(b.start, year), to: posOf(b.end, year) })),
        marks: (t.marks ?? []).map((m) => ({ label: m.label, at: posOf(m.date, year) })),
      })),
    [tracks, year],
  );
  const todayPos = posOf(today, year);
  const heading = title ?? `Roadmap ${year}`;

  const set = useCallback((v: number) => {
    pos.current = v;
    setP(v);
  }, []);
  const stop = useCallback(() => {
    run.current?.stop();
    run.current = undefined;
  }, []);

  // On narrow screens the chart scrolls sideways; keep the playhead in view unless you are dragging it.
  useEffect(() => {
    const sc = scroller.current;
    const el = area.current;
    if (!sc || !el || dragging.current || sc.scrollWidth <= sc.clientWidth) return;
    const x = el.offsetLeft + (p / 12) * el.offsetWidth;
    sc.scrollLeft = x - sc.clientWidth / 2;
  }, [p]);

  // Opening sweep from January to today, once the chart is on screen.
  useEffect(() => {
    if (!seen || touched.current) return;
    if (reduce) {
      const id = requestAnimationFrame(() => {
        set(todayPos);
        setSwept(true);
      });
      return () => cancelAnimationFrame(id);
    }
    const c = animate(pos.current, todayPos, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: set, onComplete: () => setSwept(true) });
    run.current = c;
    return () => c.stop();
  }, [seen, reduce, todayPos, set]);

  // Autoplay: wander to the end of the year and back to today, on a loop, while on screen and untouched.
  useEffect(() => {
    if (!autoplay || reduce || !swept || !visible) return;
    let dead = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hold = (ms: number) =>
      new Promise<void>((resolve) => {
        timer = setTimeout(resolve, ms);
      });
    const glide = (to: number, duration: number) =>
      new Promise<void>((resolve) => {
        run.current = animate(pos.current, to, { duration, ease: [0.45, 0, 0.25, 1], onUpdate: set, onComplete: resolve });
      });
    void (async () => {
      while (!dead && !touched.current) {
        await hold(1500);
        if (dead || touched.current) return;
        await glide(11.6, 4.2);
        if (dead || touched.current) return;
        await hold(900);
        if (dead || touched.current) return;
        await glide(todayPos, 3.2);
      }
    })();
    return () => {
      dead = true;
      if (timer) clearTimeout(timer);
      run.current?.stop();
    };
  }, [autoplay, reduce, swept, visible, todayPos, set]);

  const toP = (clientX: number) => {
    const r = area.current!.getBoundingClientRect();
    return clamp((clientX - r.left) / r.width) * 12;
  };
  const take = () => {
    touched.current = true;
    stop();
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    take();
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    set(toP(e.clientX));
  };
  const move = (e: ReactPointerEvent) => {
    if (dragging.current) set(toP(e.clientX));
  };
  const up = () => {
    dragging.current = false;
  };
  const key = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 : 0.25;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      take();
      set(Math.min(12, pos.current + step));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      take();
      set(Math.max(0, pos.current - step));
    } else if (e.key === "Home") {
      e.preventDefault();
      take();
      set(todayPos);
    } else if (e.key === "End") {
      e.preventDefault();
      take();
      set(12);
    }
  };
  const jump = () => {
    take();
    if (reduce) {
      set(todayPos);
      return;
    }
    run.current = animate(pos.current, todayPos, { type: "spring", stiffness: 120, damping: 22, onUpdate: set });
  };

  const bars = model.flatMap((t) => t.bars);
  const live = bars.filter((b) => p >= b.from && p < b.to);
  const marks = model.flatMap((t) => t.marks);
  const next = [...bars.map((b) => ({ label: `${b.label} starts`, at: b.from })), ...marks].filter((m) => m.at > p).sort((a, b) => a.at - b.at)[0];
  const weeks = next ? Math.max(1, Math.round((next.at - p) * 4.35)) : 0;

  return (
    <div
      className={`w-full max-w-[860px] rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] sm:p-7 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em]">{heading}</h3>
        <button
          type="button"
          onClick={jump}
          className="h-8 flex-none rounded-full bg-[#f5f5f7] px-3.5 text-[13px] font-medium text-[#1d1d1f] outline-none hover:bg-[#ececf0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] dark:focus-visible:outline-[#0a84ff]"
        >
          Jump to today
        </button>
      </div>
      <div ref={scroller} className="-mx-1 mt-5 overflow-x-auto px-1 pb-1">
        <div className="relative min-w-[640px]" style={{ paddingLeft: LABEL }}>
          {/* month ruler */}
          <div className="grid h-7 grid-cols-12 text-[11px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
            {MONTHS.map((m, i) => (
              <span key={m} className={`border-l pl-1.5 ${i === 0 ? "border-transparent" : "border-[#ececf0] dark:border-[#2c2c2e]"}`}>
                {m}
              </span>
            ))}
          </div>
          {/* tracks */}
          <div
            ref={area}
            className="relative cursor-ew-resize touch-pan-y select-none outline-none focus-visible:rounded-[12px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
            style={{ height: model.length * ROW }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onLostPointerCapture={up}
            tabIndex={0}
            role="slider"
            aria-label="Roadmap date"
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={12}
            aria-valuenow={Number(p.toFixed(2))}
            aria-valuetext={labelOf(p, year)}
            onKeyDown={key}
          >
            <div className="pointer-events-none absolute inset-0 grid grid-cols-12">
              {MONTHS.map((m, i) => (
                <span key={m} className={`border-l ${i === 0 ? "border-transparent" : "border-[#f3f3f5] dark:border-[#2c2c2e]"}`} />
              ))}
            </div>
            {model.map((t, r) => (
              <div key={`${t.name}-${r}`} className="absolute inset-x-0" style={{ top: r * ROW, height: ROW }}>
                <span className="absolute top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]" style={{ left: -LABEL }}>
                  {t.name}
                </span>
                {t.bars.map((b) => {
                  const fill = clamp((p - b.from) / (b.to - b.from || 1));
                  return (
                    <div
                      key={b.label}
                      className="absolute top-[10px] h-8 overflow-hidden rounded-[10px] bg-[#eef1f6] dark:bg-[#2c2c2e]"
                      style={{ left: `${(b.from / 12) * 100}%`, width: `${((b.to - b.from) / 12) * 100}%` }}
                    >
                      <span className="absolute inset-0 flex items-center truncate px-3 text-[12.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{b.label}</span>
                      <span
                        className="absolute inset-0 flex items-center truncate bg-[#0071e3] px-3 text-[12.5px] font-medium text-white dark:bg-[#0a84ff]"
                        style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
                        aria-hidden="true"
                      >
                        {b.label}
                      </span>
                    </div>
                  );
                })}
                {t.marks.map((m) => {
                  const hit = p >= m.at;
                  return (
                    <div key={m.label} className="absolute top-1/2 flex -translate-x-[9px] -translate-y-1/2 items-center gap-2" style={{ left: `${(m.at / 12) * 100}%` }}>
                      <motion.span
                        className={`h-[18px] w-[18px] rounded-[4px] border-2 transition-colors duration-300 ${
                          hit
                            ? "border-[#0071e3] bg-[#0071e3] dark:border-[#0a84ff] dark:bg-[#0a84ff]"
                            : "border-[#c7c7cc] bg-white dark:border-[#48484a] dark:bg-[#1c1c1e]"
                        }`}
                        style={{ rotate: 45 }}
                        animate={{ scale: hit && !reduce ? [1, 1.35, 1] : 1 }}
                        transition={{ duration: reduce ? 0 : 0.35 }}
                      />
                      <span className={`whitespace-nowrap text-[12.5px] font-medium ${hit ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            {/* playhead */}
            <div className="pointer-events-none absolute -top-7 bottom-0" style={{ left: `${(p / 12) * 100}%` }}>
              <span className="absolute left-0 top-0 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#1d1d1f] px-2 py-[3px] text-[11px] font-semibold tabular-nums text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,.4)] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
                {labelOf(p, year)}
              </span>
              <span className="absolute bottom-0 left-0 top-[22px] w-[2px] -translate-x-1/2 bg-[#1d1d1f] dark:bg-[#f5f5f7]" />
            </div>
            {/* today marker */}
            <span
              className="pointer-events-none absolute bottom-[-3px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#ff3b30] dark:bg-[#ff453a]"
              style={{ left: `${(todayPos / 12) * 100}%` }}
              title="Today"
            />
          </div>
        </div>
      </div>
      <div aria-live="polite" className="mt-5 grid gap-3 rounded-[18px] bg-[#f5f5f7] p-4 sm:grid-cols-[1fr_auto] sm:items-center dark:bg-[#2c2c2e]">
        <div className="flex min-h-[28px] flex-wrap items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] dark:text-[#a1a1a6]">In flight</span>
          <AnimatePresence mode="popLayout" initial={false}>
            {live.length === 0 && (
              <motion.span key="none" className="text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Nothing this week
              </motion.span>
            )}
            {live.map((b) => (
              <motion.span
                key={b.label}
                layout={!reduce}
                className="inline-flex items-center gap-2 rounded-full bg-white py-1 pl-3 pr-1 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.85 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
              >
                {b.label}
                <span className="rounded-full bg-[#eef5ff] px-2 py-[1px] text-[12px] tabular-nums text-[#0071e3] dark:bg-[#0a84ff]/20 dark:text-[#0a84ff]">
                  {Math.round(clamp((p - b.from) / (b.to - b.from || 1)) * 100)}%
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <span className="text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">
          {next ? (
            <>
              Next: <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{next.label}</span> in {weeks} {weeks === 1 ? "week" : "weeks"}
            </>
          ) : (
            "Year complete"
          )}
        </span>
      </div>
    </div>
  );
}
