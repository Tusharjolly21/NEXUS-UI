# Milestone Timeline

Add the "Milestone Timeline" component from Nexus UI to my project.

A roadmap timeline. When it scrolls into view a glowing bead runs down the rail, drawing each finished milestone's check as it passes, overshoots the milestone in progress slightly and settles on it; clicking a milestone or using the arrow keys slides a raised card to it and opens its notes. Also includes Roadmap Scrubber, an edit-style timeline where you drag a playhead and every bar fills to that day. Also includes Commit Graph Roadmap, a roadmap drawn as git log --graph with release tags, branch lanes and a pulsing HEAD.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { MilestoneTimeline } from "@/components/milestone-timeline/milestone-timeline";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/milestone-timeline/milestone-timeline.tsx ---

```tsx
"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

export type Milestone = {
  title: string;
  date?: string;
  description?: string;
  status?: "done" | "current" | "upcoming";
  /** Small label shown on the current milestone, e.g. "In progress". */
  tag?: string;
};

export type MilestoneTimelineProps = {
  /** Rich milestones. Takes priority over `steps`. */
  milestones?: Milestone[];
  /** Plain titles (older API). Everything before the last is treated as done. */
  steps?: string[];
  heading?: string;
  /** Milestone opened first. Defaults to the current one. */
  defaultOpen?: number;
  /** Opens each milestone in turn until someone touches the timeline. */
  autoplay?: boolean;
  className?: string;
};

const MILESTONES: Milestone[] = [
  { title: "Research and discovery", date: "Jan 2026", description: "Twenty customer interviews and a teardown of every onboarding flow we could find.", status: "done" },
  { title: "Design system v1", date: "Mar 2026", description: "Tokens, a type scale and 40 components, documented and shipped to the team.", status: "done" },
  { title: "Private beta", date: "Jun 2026", description: "312 teams onboarded. Activation up 38% after the second iteration.", status: "current", tag: "In progress" },
  { title: "Public launch", date: "Sep 2026", description: "Pricing, docs and the launch film. Then the real work starts.", status: "upcoming" },
];

type Status = "done" | "current" | "upcoming";

/** Rail piece from node i to node i+1, filled by the shared progress value. */
function Segment({ i, fill, still }: { i: number; fill: MotionValue<number>; still: boolean }) {
  const scaleY = useTransform(fill, (f) => Math.max(0, Math.min(1, f - i)));
  const top = useTransform(fill, (f) => `${Math.max(0, Math.min(1, f - i)) * 100}%`);
  const bead = useTransform(fill, (f) => (f > i + 0.02 && f < i + 0.98 ? 1 : 0));
  return (
    <span aria-hidden="true" className="absolute left-1/2 top-[24px] -bottom-[36px] w-[2px] -translate-x-1/2 rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]">
      <motion.span className="absolute inset-0 origin-top rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" style={{ scaleY }} />
      {!still ? (
        <motion.span
          className="absolute left-1/2 size-2.5 rounded-full bg-[#0071e3] shadow-[0_0_0_4px_rgba(0,113,227,.2),0_0_14px_rgba(0,113,227,.7)] dark:bg-[#0a84ff]"
          style={{ top, x: "-50%", y: "-50%", opacity: bead }}
        />
      ) : null}
    </span>
  );
}

function Node({ i, status, fill, still }: { i: number; status: Status; fill: MotionValue<number>; still: boolean }) {
  const reached = useTransform(fill, (f) => (f >= i - 0.04 ? 1 : 0));
  const check = useTransform(fill, (f) => Math.max(0, Math.min(1, (f - i + 0.04) * 3)));
  const pop = useTransform(fill, (f) => {
    const d = f - i;
    return d > -0.05 && d < 0.35 ? 1 + Math.sin(((d + 0.05) / 0.4) * Math.PI) * 0.22 : 1;
  });
  if (status === "current") {
    return (
      <motion.span className="relative grid size-6 place-items-center" style={{ scale: pop }}>
        {!still ? (
          <motion.span
            className="absolute inset-0 rounded-full bg-[#0071e3]/35 dark:bg-[#0a84ff]/40"
            animate={{ scale: [1, 2], opacity: [0.7, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
        <span className="relative grid size-6 place-items-center rounded-full bg-[#0071e3] shadow-[0_0_0_4px_rgba(0,113,227,.16)] dark:bg-[#0a84ff]">
          <span className="size-2 rounded-full bg-white" />
        </span>
      </motion.span>
    );
  }
  if (status === "done") {
    return (
      <motion.span className="relative grid size-6 place-items-center rounded-full bg-white shadow-[inset_0_0_0_2px_#d2d2d7] dark:bg-[#1c1c1e] dark:shadow-[inset_0_0_0_2px_#48484a]" style={{ scale: pop }}>
        <motion.span className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ opacity: reached }} />
        <svg viewBox="0 0 12 12" className="relative size-3" fill="none" aria-hidden="true">
          <motion.path d="M2.5 6.3l2.3 2.2 4.7-5" className="stroke-white dark:stroke-[#1d1d1f]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: check }} />
        </svg>
      </motion.span>
    );
  }
  return <span className="block size-6 rounded-full border-2 border-dashed border-[#c7c7cc] bg-white dark:border-[#48484a] dark:bg-[#1c1c1e]" />;
}

/**
 * A roadmap timeline. When it scrolls into view a glowing bead runs down the
 * rail, drawing each done milestone's check as it passes, overshoots the
 * milestone in progress a touch and settles on it. Click a milestone (or use
 * the arrow keys) and a raised card slides to it and opens its notes.
 */
export function MilestoneTimeline({ milestones, steps, heading = "Roadmap", defaultOpen, autoplay = false, className = "" }: MilestoneTimelineProps) {
  const reduce = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  const list: Milestone[] =
    milestones ?? (steps ? steps.map((title, i) => ({ title, status: i < steps.length - 1 ? "done" : "current" })) : MILESTONES);
  const hasCurrent = list.some((m) => m.status === "current");
  const currentIdx = list.findIndex((m) => m.status === "current");
  const doneCount = list.filter((m) => m.status === "done").length;
  const target = hasCurrent ? currentIdx : Math.max(0, doneCount - 1);
  const statusOf = (m: Milestone, i: number): Status => m.status ?? (i <= target ? "done" : "upcoming");

  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const fill = useMotionValue(reduce ? target : 0);
  const [open, setOpen] = useState(() => Math.min(list.length - 1, Math.max(0, defaultOpen ?? target)));
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      fill.set(target);
      return;
    }
    const run = animate(fill, target, { type: "spring", stiffness: 38, damping: 9, mass: 1.1, restDelta: 0.001, delay: 0.2 });
    return () => run.stop();
  }, [inView, reduce, target, fill]);

  const count = list.length;
  useEffect(() => {
    if (!autoplay || !inView || count < 2) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      setOpen((o) => (o + 1) % count);
    }, 2600);
    return () => window.clearInterval(t);
  }, [autoplay, inView, count]);

  const key = (e: KeyboardEvent, i: number) => {
    let to: number | null = null;
    if (e.key === "ArrowDown") to = Math.min(count - 1, i + 1);
    if (e.key === "ArrowUp") to = Math.max(0, i - 1);
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = count - 1;
    if (to === null) return;
    e.preventDefault();
    touched.current = true;
    btns.current[to]?.focus();
  };

  return (
    <section
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] @min-[480px]:p-8 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{heading}</h2>
        <span className="text-[13px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
          {doneCount} of {list.length} complete
        </span>
      </div>

      <ol ref={ref} className="mt-6">
        {list.map((m, i) => {
          const status = statusOf(m, i);
          const isOpen = open === i;
          const last = i === list.length - 1;
          return (
            <li key={`${m.title}-${i}`} className="relative flex gap-3 pb-3 last:pb-0 @min-[420px]:gap-4">
              {m.date ? (
                <span className="hidden w-[68px] shrink-0 pt-[17px] text-right text-[12px] font-medium tabular-nums text-[#6e6e73] @min-[420px]:block dark:text-[#a1a1a6]">{m.date}</span>
              ) : null}
              <span className="relative flex w-6 shrink-0 justify-center pt-[12px]">
                {!last ? <Segment i={i} fill={fill} still={reduce} /> : null}
                <span className="relative z-10">
                  <Node i={i} status={status} fill={fill} still={reduce} />
                </span>
              </span>
              <div className="relative min-w-0 flex-1">
                {isOpen ? (
                  <motion.span
                    layoutId={`${uid}-card`}
                    aria-hidden="true"
                    className={`absolute inset-0 rounded-[18px] ${
                      status === "current"
                        ? "bg-[#0071e3]/[.06] shadow-[0_0_0_1px_rgba(0,113,227,.18),0_16px_30px_-20px_rgba(0,113,227,.55)] dark:bg-[#0a84ff]/10 dark:shadow-[0_0_0_1px_rgba(10,132,255,.3),0_16px_30px_-20px_rgba(0,0,0,.9)]"
                        : "bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                    }`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <button
                  ref={(el) => {
                    btns.current[i] = el;
                  }}
                  type="button"
                  id={`${uid}-b${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`${uid}-p${i}`}
                  onClick={() => {
                    touched.current = true;
                    setOpen(i);
                  }}
                  onKeyDown={(e) => key(e, i)}
                  className="relative flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-[18px] px-4 py-3 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
                >
                  <span className={`text-[15px] font-semibold tracking-[-0.01em] ${status === "upcoming" ? "text-[#6e6e73] dark:text-[#a1a1a6]" : ""}`}>{m.title}</span>
                  {status === "current" && m.tag ? (
                    <span className="rounded-full bg-[#0071e3] px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-[#0a84ff]">{m.tag}</span>
                  ) : null}
                  {m.date ? <span className="text-[12px] tabular-nums text-[#6e6e73] @min-[420px]:hidden dark:text-[#a1a1a6]">{m.date}</span> : null}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && m.description ? (
                    <motion.div
                      id={`${uid}-p${i}`}
                      role="region"
                      aria-labelledby={`${uid}-b${i}`}
                      className="relative overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reduce ? { duration: 0 } : { height: { type: "spring", stiffness: 320, damping: 32 }, opacity: { duration: 0.18 } }}
                    >
                      <p className="px-4 pb-3.5 text-[13px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{m.description}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
```

# Roadmap Scrubber

Add the "Roadmap Scrubber" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { RoadmapScrubber } from "@/components/milestone-timeline/roadmap-scrubber";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/milestone-timeline/roadmap-scrubber.tsx ---

```tsx
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
```

# Commit Graph Roadmap

Add the "Commit Graph Roadmap" component from Nexus UI to my project.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. The look assumes the Inter font through Tailwind's `font-sans`. If the project uses another font, leave that as it is.
5. Use it like this: `import { CommitGraphRoadmap } from "@/components/milestone-timeline/commit-graph-roadmap";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/milestone-timeline/commit-graph-roadmap.tsx ---

```tsx
"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";

/** One commit row. `lane` 0 is main, 1 is the feature lane, 2 is the lab lane. */
export type RoadmapCommit = {
  lane: 0 | 1 | 2;
  /** Release tag drawn as a pill, e.g. `v2.0`. */
  tag?: string;
  title: string;
  /** Short status line under the title. */
  meta: string;
  /** Text shown in the commit message when the row is open. */
  body: string;
  /** `done` is solid, `head` is the pulsing current work, `next` is hollow. */
  state: "done" | "head" | "next";
};

/** A feature lane that forks off main at row `from` and merges back at row `to`. Row 0 is the top (newest). */
export type RoadmapBranch = { lane: 1 | 2; from: number; to: number; color: string };

export interface CommitGraphRoadmapProps {
  /** Commits, newest first, like `git log --graph`. Defaults to a sample product roadmap. */
  commits?: RoadmapCommit[];
  /** Branch lanes drawn between the commits. Must match the commit rows. */
  branches?: RoadmapBranch[];
  /** Row opened first. Defaults to the HEAD commit. */
  defaultOpen?: number;
  /** Opens each commit in turn, once the graph is on screen, until someone touches it. */
  autoplay?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

// newest at the top, like `git log --graph`
const COMMITS: RoadmapCommit[] = [
  { lane: 0, tag: "v3.0", title: "Motion Kit", meta: "Planned · Q1", body: "Templates, blocks and a tuning panel for every component.", state: "next" },
  { lane: 0, title: "Merge charts and sounds", meta: "Planned · Dec", body: "Both branches land on main together for the 2.5 release.", state: "next" },
  { lane: 1, title: "Charts", meta: "In progress", body: "Animated bar, line and ring charts that build as they enter.", state: "head" },
  { lane: 2, title: "Sounds", meta: "Ready · Oct", body: "Optional click and whoosh sounds, off by default.", state: "done" },
  { lane: 1, title: "Tune panel", meta: "Done · Sep", body: "Change springs and timing live, copy the result.", state: "done" },
  { lane: 0, tag: "v2.0", title: "Nexus Pro", meta: "Shipped · Aug", body: "Pro library with 60 premium blocks.", state: "done" },
  { lane: 1, title: "Origami, vinyl, sand", meta: "Done · Jul", body: "The rare set: odd interactions people stop for.", state: "done" },
  { lane: 0, tag: "v1.4", title: "Blocks", meta: "Shipped · Jun", body: "Hero, pricing, FAQ and footer blocks.", state: "done" },
];
// branch lane spans [from row (older, bottom) to row (newer, top)]
const BRANCHES: RoadmapBranch[] = [
  { lane: 1, from: 7, to: 1, color: "#bf5af2" },
  { lane: 2, from: 5, to: 1, color: "#ff9f0a" },
];

const LANE_COLOR = ["#0a84ff", "#bf5af2", "#ff9f0a"];
const LANE_NAME = ["main", "feature", "lab"];
const RH = 64;
const LX = 22;
const LW = 26;
const lx = (l: number) => LX + l * LW;
const ry = (r: number) => RH / 2 + r * RH;

function branchPath(b: RoadmapBranch) {
  // fork out of main at `from`, run up the lane, merge back at `to`
  const x0 = lx(0);
  const x1 = lx(b.lane);
  const y0 = ry(b.from);
  const y1 = ry(b.to);
  return `M ${x0} ${y0} C ${x0} ${y0 - RH * 0.55}, ${x1} ${y0 - RH * 0.45}, ${x1} ${y0 - RH} L ${x1} ${y1 + RH} C ${x1} ${y1 + RH * 0.45}, ${x0} ${y1 + RH * 0.55}, ${x0} ${y1}`;
}

const slug = (title: string) => title.toLowerCase().split(/[ ,]/)[0];
const branchName = (c: RoadmapCommit) => (c.lane === 0 ? "main" : `${c.lane === 1 ? "feature" : "lab"}/${slug(c.title)}`);

/**
 * A roadmap drawn as a commit graph. Main runs down the left with release
 * tags; feature work forks off on coloured lanes and merges back. The graph
 * draws itself when it scrolls in, the current HEAD pulses, hovering a commit
 * lights its whole branch, and clicking opens the commit message.
 */
export function CommitGraphRoadmap({ commits = COMMITS, branches = BRANCHES, defaultOpen, autoplay = false, className = "" }: CommitGraphRoadmapProps) {
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const seen = useInView(box, { once: true, amount: 0.3 });
  const visible = useInView(box, { amount: 0.3 });
  const headRow = commits.findIndex((c) => c.state === "head");
  const [hoverLane, setHoverLane] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(() => {
    const first = defaultOpen ?? (headRow >= 0 ? headRow : 0);
    return commits.length ? Math.min(commits.length - 1, Math.max(0, first)) : null;
  });

  const count = commits.length;
  useEffect(() => {
    if (!autoplay || reduce || !seen || !visible || count < 2) return;
    const t = setInterval(() => {
      if (touched.current) {
        clearInterval(t);
        return;
      }
      setOpen((o) => (o === null ? 0 : (o + 1) % count));
    }, 2800);
    return () => clearInterval(t);
  }, [autoplay, reduce, seen, visible, count]);

  const H = count * RH;
  const dim = (lane: number) => hoverLane !== null && hoverLane !== lane;
  // drawing order: bottom (oldest) first
  const delayFor = (r: number) => (reduce ? 0 : (count - 1 - r) * 0.12);
  // main is solid up to the HEAD commit (or the newest finished one) and dashed above it
  const done = commits.findIndex((c) => c.state === "done");
  const boundary = headRow >= 0 ? headRow : done >= 0 ? done : 0;
  const openCommit = open !== null ? commits[open] : undefined;
  const panelId = `${uid}-panel`;

  return (
    <div
      ref={box}
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`w-full max-w-[560px] rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] [--surface:#ffffff] sm:p-6 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:[--surface:#1c1c1e] ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h3 className="m-0 font-mono text-[14px] font-semibold">
          git log --graph <span className="text-[#6e6e73] dark:text-[#a1a1a6]">roadmap</span>
        </h3>
        <div className="flex gap-3 text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
          {LANE_NAME.map((n, i) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full" style={{ background: LANE_COLOR[i] }} />
              {n}
            </span>
          ))}
        </div>
      </div>
      <div className="relative" style={{ height: H }} onPointerLeave={() => setHoverLane(null)}>
        <svg className="absolute left-0 top-0" width={lx(2) + 14} height={H} aria-hidden="true">
          {/* main line: past is solid, future is dashed */}
          <motion.line
            x1={lx(0)}
            x2={lx(0)}
            y1={H}
            y2={ry(boundary)}
            stroke={LANE_COLOR[0]}
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: seen ? 1 : 0, opacity: dim(0) ? 0.25 : 1 }}
            transition={{ pathLength: { duration: reduce ? 0 : 1.1, ease: "easeInOut" } }}
          />
          <motion.line
            x1={lx(0)}
            x2={lx(0)}
            y1={ry(boundary)}
            y2={ry(0)}
            stroke={LANE_COLOR[0]}
            strokeWidth="3"
            strokeDasharray="2 6"
            strokeLinecap="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: seen ? (dim(0) ? 0.2 : 0.7) : 0 }}
            transition={{ delay: reduce ? 0 : 1.1 }}
          />
          {branches.map((b) => (
            <motion.path
              key={`${b.lane}-${b.from}-${b.to}`}
              d={branchPath(b)}
              fill="none"
              stroke={b.color}
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: seen ? 1 : 0, opacity: dim(b.lane) ? 0.2 : 1 }}
              transition={{ pathLength: { duration: reduce ? 0 : 1, delay: delayFor(b.from) + (reduce ? 0 : 0.2), ease: "easeInOut" } }}
            />
          ))}
        </svg>
        {commits.map((r, i) => {
          const c = LANE_COLOR[r.lane];
          const isOpen = open === i;
          const wait = seen ? delayFor(i) : 0;
          return (
            <div key={`${r.title}-${i}`} className="absolute inset-x-0" style={{ top: i * RH, height: RH }} onPointerEnter={() => setHoverLane(r.lane)}>
              {/* commit dot */}
              <motion.span
                className="absolute rounded-full"
                style={{
                  left: lx(r.lane) - 8,
                  top: RH / 2 - 8,
                  width: 16,
                  height: 16,
                  background: r.state === "next" ? "var(--surface)" : c,
                  boxShadow: r.state === "next" ? `0 0 0 3px ${c}` : `0 0 0 3px var(--surface), 0 0 0 4.5px ${c}33`,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: seen ? 1 : 0, opacity: dim(r.lane) ? 0.3 : 1 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 22, delay: wait + (seen ? 0.15 : 0) }}
              />
              {r.state === "head" && seen && !reduce && (
                <motion.span
                  className="absolute rounded-full"
                  style={{ left: lx(r.lane) - 8, top: RH / 2 - 8, width: 16, height: 16, border: `2px solid ${c}` }}
                  animate={{ scale: [1, 2.3], opacity: [0.8, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 1.4 }}
                />
              )}
              <motion.button
                type="button"
                onClick={() => {
                  touched.current = true;
                  setOpen(isOpen ? null : i);
                }}
                onFocus={() => setHoverLane(r.lane)}
                onBlur={() => setHoverLane(null)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="absolute inset-y-1 right-0 flex items-center gap-2 rounded-[14px] px-3 py-2 text-left outline-none transition-colors hover:bg-[#f5f5f7] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:hover:bg-[#2c2c2e] dark:focus-visible:outline-[#0a84ff]"
                style={{ left: lx(2) + 24 }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: seen ? (dim(r.lane) ? 0.35 : 1) : 0, x: seen || reduce ? 0 : -10 }}
                transition={reduce ? { duration: 0 } : { delay: wait + (seen ? 0.25 : 0) }}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    {r.tag && (
                      <span className="rounded-full px-2 py-[1px] font-mono text-[11px] font-semibold text-white" style={{ background: LANE_COLOR[0] }}>
                        {r.tag}
                      </span>
                    )}
                    {r.state === "head" && (
                      <span className="rounded-full bg-[#1d1d1f] px-2 py-[1px] font-mono text-[11px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">HEAD</span>
                    )}
                    <span className={`truncate text-[15px] font-semibold tracking-[-0.01em] ${r.state === "next" ? "text-[#6e6e73] dark:text-[#a1a1a6]" : ""}`}>{r.title}</span>
                  </span>
                  <span className="block truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{r.meta}</span>
                </span>
                <motion.svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8e8e93"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  className="flex-none"
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={reduce ? { duration: 0 } : undefined}
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </motion.svg>
              </motion.button>
            </div>
          );
        })}
      </div>
      <div id={panelId} role="region" aria-label="Commit message" aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {open !== null && openCommit && (
            <motion.div
              key={open}
              initial={reduce ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, height: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 rounded-[16px] bg-[#f5f5f7] p-4 font-mono text-[12.5px] leading-[1.6] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
                <div className="text-[#6e6e73] dark:text-[#a1a1a6]">commit {(0x9f3a1c + open * 0x2b17).toString(16)}e{open}</div>
                <div className="break-words">
                  <span className="text-[#6e6e73] dark:text-[#a1a1a6]">branch </span>
                  <span style={{ color: LANE_COLOR[openCommit.lane] }}>{branchName(openCommit)}</span>
                </div>
                <div className="mt-2 font-sans text-[14px]">{openCommit.body}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
```
