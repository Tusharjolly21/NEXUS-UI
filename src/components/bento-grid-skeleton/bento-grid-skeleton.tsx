"use client";
import { useEffect, useId, useRef, useState, type CSSProperties, type JSX } from "react";
import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";

export type SkeletonType = "chat" | "dashboard" | "avatar" | "workflow" | "calendar" | "code";

export interface BentoSkeletonCard {
  /** Stable key. */
  id: string;
  /** Card title, shown under the scene. */
  title: string;
  /** One line under the title. */
  description: string;
  /** Small chip above the title. */
  tag?: string;
  /** Columns x rows the card covers on wider containers. */
  span?: "1x1" | "2x1" | "1x2" | "2x2";
  /** Which placeholder scene to draw. */
  skeletonType: SkeletonType;
}

export interface BentoGridSkeletonProps {
  /** Cards in reading order. Defaults to one of each scene. */
  cards?: BentoSkeletonCard[];
  /** Run the shimmer and the scene loops. */
  animated?: boolean;
  /** Plays each card's scene in turn until someone points at the grid. */
  autoplay?: boolean;
  /** Extra classes for the grid. */
  className?: string;
}

export const DEFAULT_SKELETON_CARDS: BentoSkeletonCard[] = [
  { id: "chat", title: "Live conversations", description: "Messages stream in while the thread loads.", tag: "Chat", skeletonType: "chat" },
  { id: "dash", title: "Dashboard", description: "Bars settle before the numbers arrive.", tag: "Stats", skeletonType: "dashboard" },
  { id: "team", title: "Your team", description: "Faces fan out as profiles resolve.", tag: "People", skeletonType: "avatar" },
  { id: "flow", title: "Workflows", description: "Steps light up as each one connects.", tag: "Automation", skeletonType: "workflow" },
  { id: "cal", title: "Calendar", description: "The next free slot hops into place.", tag: "Schedule", skeletonType: "calendar" },
  { id: "code", title: "Source", description: "Lines type themselves out.", tag: "Dev", skeletonType: "code" },
];

const SPAN: Record<NonNullable<BentoSkeletonCard["span"]>, string> = {
  "1x1": "",
  "2x1": "@min-[480px]:col-span-2",
  "1x2": "@min-[480px]:row-span-2",
  "2x2": "@min-[480px]:col-span-2 @min-[480px]:row-span-2",
};

/** Placeholder block colour. */
const B = "bg-[#ececf0] dark:bg-[#2c2c2e]";
const B2 = "bg-[#e1e1e6] dark:bg-[#3a3a3c]";
const SPRING = { type: "spring" as const, stiffness: 320, damping: 20 };

type SceneProps = { on: boolean; still: boolean; beat: number };

function Chat({ on, still, beat }: SceneProps) {
  const rows = [
    { me: false, w: "58%" },
    { me: true, w: "46%" },
    { me: false, w: "38%" },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5 py-3">
      {rows.map((r, i) => (
        <motion.div
          key={`${i}-${on ? beat : 0}`}
          className={`flex items-end gap-2 ${r.me ? "flex-row-reverse" : ""}`}
          initial={on && !still ? { opacity: 0, scale: 0.6 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...SPRING, delay: i * 0.35 }}
          style={{ transformOrigin: r.me ? "100% 100%" : "0% 100%" }}
        >
          <span className={`size-5 shrink-0 rounded-full ${B2}`} />
          <span
            className={`h-6 rounded-[12px] ${r.me ? "rounded-br-[4px] bg-[#0071e3]/20 dark:bg-[#0a84ff]/30" : `rounded-bl-[4px] ${B}`}`}
            style={{ width: r.w }}
          />
        </motion.div>
      ))}
      <div className="flex h-3 items-center gap-1 pl-7">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className={`size-1.5 rounded-full ${B2}`}
            animate={on && !still ? { y: [0, -4, 0] } : { y: 0 }}
            transition={on && !still ? { duration: 0.6, repeat: Infinity, delay: 1.1 + d * 0.12, repeatDelay: 0.25 } : { duration: 0.2 }}
          />
        ))}
      </div>
    </div>
  );
}

const HEIGHTS = [
  [40, 62, 48, 78, 56, 88, 70],
  [64, 44, 80, 52, 90, 60, 74],
  [52, 76, 60, 42, 70, 50, 92],
];

function Dashboard({ on, still, beat }: SceneProps) {
  const h = HEIGHTS[on ? beat % HEIGHTS.length : 0];
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-5">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-8 flex-1 rounded-[10px] ${B}`} />
        ))}
      </div>
      <div className="flex h-16 items-end gap-1.5">
        {h.map((v, i) => (
          <motion.span
            key={i}
            className={`flex-1 origin-bottom rounded-[5px] ${i === h.indexOf(Math.max(...h)) ? "bg-[#0071e3]/35 dark:bg-[#0a84ff]/45" : B}`}
            initial={false}
            animate={{ height: `${v}%` }}
            transition={still ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 14, delay: i * 0.04 }}
          />
        ))}
      </div>
    </div>
  );
}

function Avatars({ on, still }: SceneProps) {
  const spread = on && !still;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-5">
      <div className="relative h-11 w-full">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.span
            key={i}
            className={`absolute left-1/2 top-0 -ml-[22px] size-11 rounded-full ring-[3px] ring-white dark:ring-[#1c1c1e] ${i === 2 ? B2 : B}`}
            style={{ zIndex: 5 - Math.abs(i - 2) }}
            initial={false}
            animate={{ x: (i - 2) * (spread ? 34 : 22), scale: i === 2 ? 1.1 : 1 - Math.abs(i - 2) * 0.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: Math.abs(i - 2) * 0.05 }}
          />
        ))}
      </div>
      <span className={`h-2.5 w-24 rounded-full ${B}`} />
      <span className={`h-2 w-16 rounded-full ${B}`} />
    </div>
  );
}

function Workflow({ on, still, beat }: SceneProps) {
  const nodes = [
    { x: 30, y: 30 },
    { x: 110, y: 62 },
    { x: 190, y: 30 },
  ];
  const run = on && !still;
  return (
    <div className="flex h-full items-center justify-center px-4">
      <svg viewBox="0 0 220 92" className="h-full max-h-[110px] w-full" aria-hidden="true">
        {[0, 1].map((i) => {
          const a = nodes[i];
          const b = nodes[i + 1];
          const d = `M${a.x},${a.y} C${a.x + 40},${a.y} ${b.x - 40},${b.y} ${b.x},${b.y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" className="stroke-[#e1e1e6] dark:stroke-[#3a3a3c]" strokeWidth="2" strokeDasharray="4 4" />
              <motion.path
                key={`${i}-${run ? beat : 0}`}
                d={d}
                fill="none"
                className="stroke-[#0071e3] dark:stroke-[#0a84ff]"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: run ? 1 : 0 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.15 + i * 0.6 }}
              />
            </g>
          );
        })}
        {nodes.map((n, i) => (
          <motion.g
            key={`${i}-${run ? beat : 0}`}
            initial={false}
            animate={run ? { scale: [1, 1.18, 1] } : { scale: 1 }}
            transition={{ duration: 0.45, delay: i * 0.6 + 0.1 }}
            style={{ transformOrigin: `${n.x}px ${n.y}px` }}
          >
            <rect x={n.x - 18} y={n.y - 14} width="36" height="28" rx="9" className="fill-[#ececf0] dark:fill-[#2c2c2e]" />
            <rect x={n.x - 9} y={n.y - 2.5} width="18" height="5" rx="2.5" className="fill-[#d2d2d7] dark:fill-[#48484a]" />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

const SLOTS = [9, 17, 12, 24, 4, 19];

function Calendar({ on, still, beat }: SceneProps) {
  const uid = useId().replace(/:/g, "");
  const slot = on ? SLOTS[beat % SLOTS.length] : SLOTS[0];
  return (
    <div className="flex h-full items-center justify-center px-5">
      <div className="grid w-full max-w-[220px] grid-cols-7 gap-1">
        {Array.from({ length: 28 }, (_, i) => (
          <span key={i} className={`relative aspect-square rounded-[5px] ${B}`}>
            {i === slot ? (
              <motion.span
                layoutId={`${uid}-slot`}
                className="absolute -inset-[1px] rounded-[6px] bg-[#0071e3]/35 ring-2 ring-[#0071e3]/60 dark:bg-[#0a84ff]/40 dark:ring-[#0a84ff]/70"
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 22 }}
              />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}

const LINES = [
  { w: 46, indent: 0 },
  { w: 64, indent: 1 },
  { w: 38, indent: 2 },
  { w: 56, indent: 1 },
  { w: 28, indent: 0 },
];

function Code({ on, still, beat }: SceneProps) {
  const run = on && !still;
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-5">
      {LINES.map((l, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-3 text-right text-[9px] tabular-nums text-[#86868b] dark:text-[#636366]">{i + 1}</span>
          <motion.span
            key={`${i}-${run ? beat : 0}`}
            className={`h-2.5 origin-left rounded-full ${i === 1 ? "bg-[#bf5af2]/30 dark:bg-[#bf5af2]/45" : i === 3 ? "bg-[#30d158]/30 dark:bg-[#30d158]/40" : B}`}
            style={{ width: `${l.w}%`, marginLeft: l.indent * 12 }}
            initial={run ? { scaleX: 0 } : false}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.38, ease: [0.3, 0, 0.2, 1], delay: i * 0.32 }}
          />
          {i === LINES.length - 1 ? (
            <motion.span
              className="h-3.5 w-[2px] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
              animate={run ? { opacity: [1, 0, 1] } : { opacity: 0.6 }}
              transition={run ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

const SCENES: Record<SkeletonType, (p: SceneProps) => JSX.Element> = {
  chat: Chat,
  dashboard: Dashboard,
  avatar: Avatars,
  workflow: Workflow,
  calendar: Calendar,
  code: Code,
};

function Card({
  card,
  index,
  on,
  still,
  beat,
  grid,
  onEnter,
  onLeave,
}: {
  card: BentoSkeletonCard;
  index: number;
  on: boolean;
  still: boolean;
  beat: number;
  grid: { w: number; h: number };
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [off, setOff] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setOff({ x: el.offsetLeft, y: el.offsetTop }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [grid.w, grid.h]);
  const Scene = SCENES[card.skeletonType] ?? Chat;
  const tall = card.span === "1x2" || card.span === "2x2";
  // The band is one sheet of light sized to the whole grid; each card shows its own slice of it.
  const sheen: CSSProperties = {
    backgroundImage: "linear-gradient(105deg, transparent 38%, var(--sk-sheen) 50%, transparent 62%)",
    backgroundSize: `${grid.w * 2}px ${grid.h}px`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: `calc(var(--sk-x) - ${off.x}px) ${-off.y}px`,
  };
  return (
    <motion.article
      ref={ref}
      tabIndex={0}
      aria-label={`${card.title}, loading`}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      initial={still ? false : { opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: on && !still ? -4 : 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay: on ? 0 : index * 0.06 }}
      className={`group relative flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] dark:focus-visible:outline-[#0a84ff] ${SPAN[card.span ?? "1x1"]}`}
    >
      <div className={`relative overflow-hidden ${tall ? "min-h-[300px] flex-1" : "h-[132px]"}`}>
        <Scene on={on} still={still} beat={beat} />
        {!still ? <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={sheen} /> : null}
      </div>
      <div className="relative px-5 pb-4 pt-1">
        {card.tag ? (
          <span className="inline-block rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0066cc] dark:bg-[#0a84ff]/15 dark:text-[#64a8ff]">
            {card.tag}
          </span>
        ) : null}
        <p className="mt-1.5 text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{card.title}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{card.description}</p>
      </div>
    </motion.article>
  );
}

/**
 * A bento of loading cards, each with a small placeholder scene: a chat
 * thread, a bar chart, a team, a workflow, a calendar and some code. One sheet
 * of light sweeps across the whole grid at once rather than per card, and
 * pointing at a card plays its scene: bubbles pop in, bars regrow, faces fan
 * out, steps connect, the free slot hops, lines type themselves.
 */
export function BentoGridSkeleton({ cards = DEFAULT_SKELETON_CARDS, animated = true, autoplay = false, className = "" }: BentoGridSkeletonProps) {
  const reduce = useReducedMotion() === true;
  const still = reduce || !animated;
  const gridRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ w: 600, h: 400 });
  const [active, setActive] = useState<string | null>(null);
  const [beat, setBeat] = useState(0);
  const touched = useRef(false);
  const sx = useMotionValue(-1200);
  const sxPx = useMotionTemplate`${sx}px`;

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setGrid({ w: el.offsetWidth, h: el.offsetHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (still) return;
    const run = animate(sx, [-grid.w * 2, grid.w * 0.6], { duration: 2.4, ease: [0.45, 0, 0.25, 1], repeat: Infinity, repeatDelay: 0.5 });
    return () => run.stop();
  }, [still, grid.w, sx]);

  // While a card is active its scene replays every 2.2s.
  useEffect(() => {
    if (!active || still) return;
    const t = window.setInterval(() => setBeat((b) => b + 1), 2200);
    return () => window.clearInterval(t);
  }, [active, still]);

  const ids = cards.map((c) => c.id).join("\u0000");
  useEffect(() => {
    if (!autoplay || still) return;
    const order = ids.split("\u0000");
    let k = 0;
    const step = () => {
      if (touched.current) return false;
      setActive(order[k++ % order.length]);
      setBeat((b) => b + 1);
      return true;
    };
    const first = window.setTimeout(step, 700);
    const t = window.setInterval(() => {
      if (!step()) window.clearInterval(t);
    }, 2400);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [autoplay, still, ids]);

  return (
    <div className={`@container w-full ${className}`}>
      <motion.div
        ref={gridRef}
        aria-busy="true"
        aria-label="Loading content"
        role="group"
        onPointerDown={() => {
          touched.current = true;
        }}
        className="grid grid-cols-1 gap-3 [--sk-sheen:rgba(255,255,255,.75)] @min-[480px]:grid-cols-2 @min-[760px]:grid-cols-3 dark:[--sk-sheen:rgba(255,255,255,.07)]"
        style={{ ["--sk-x" as string]: sxPx }}
      >
        {cards.map((c, i) => (
          <Card
            key={c.id}
            card={c}
            index={i}
            on={active === c.id}
            still={still}
            beat={beat}
            grid={grid}
            onEnter={() => {
              touched.current = true;
              if (active !== c.id) setBeat((b) => b + 1);
              setActive(c.id);
            }}
            onLeave={() => setActive((a) => (a === c.id ? null : a))}
          />
        ))}
      </motion.div>
    </div>
  );
}
