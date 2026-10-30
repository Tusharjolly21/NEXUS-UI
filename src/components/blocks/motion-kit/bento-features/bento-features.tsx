"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, LayoutGroup, animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

const SPRING = { type: "spring", stiffness: 380, damping: 32 } as const;
const OPEN = { type: "spring", stiffness: 260, damping: 26 } as const;

// ─── Live demos: each tile shows the feature working, not a picture of it ───────

const WEEK = [32, 41, 38, 52, 47, 63, 71];
const MONTH = [22, 30, 27, 35, 44, 40, 51, 49, 58, 62, 57, 69, 74, 80];

function pathFor(data: number[], w: number, h: number) {
  const max = Math.max(...data) * 1.1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - (v / max) * h] as const);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
  }
  return { line: d, area: `${d} L${w},${h} L0,${h} Z`, pts };
}

function Insights({ big, play }: { big: boolean; play: boolean }) {
  const gid = useId().replace(/:/g, "");
  const [range, setRange] = useState<"week" | "month">("week");
  const [hover, setHover] = useState<number | null>(null);
  const total = useMotionValue(0);
  const shown = useTransform(total, (v) => Math.round(v).toLocaleString("en-US"));
  const data = range === "week" ? WEEK : MONTH;
  const W = 320;
  const H = big ? 150 : 96;
  const { line, area, pts } = pathFor(data, W, H);

  useEffect(() => {
    const c = animate(total, data.reduce((a, b) => a + b, 0) * 37, { type: "spring", stiffness: 60, damping: 18 });
    return () => c.stop();
  }, [data, total]);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setRange((r) => (r === "week" ? "month" : "week")), 3200);
    return () => window.clearInterval(id);
  }, [play]);

  const onMove = (e: RPointerEvent<SVGSVGElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * W;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round((x / W) * (data.length - 1)))));
  };

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[12px] text-[#6e6e73]">Visitors</div>
          <motion.div className="text-[30px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{shown}</motion.div>
        </div>
        <div className="flex rounded-full bg-[#f5f5f7] p-0.5 text-[12px] font-medium" role="radiogroup" aria-label="Range" inert={!big} onClick={(e) => e.stopPropagation()}>
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={range === r}
              onClick={() => setRange(r)}
              className="relative h-7 rounded-full border-0 bg-transparent px-3 text-[#1d1d1f] outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              {range === r && <motion.span layoutId={`rng-${gid}`} className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)]" transition={SPRING} />}
              <span className="relative">{r === "week" ? "Week" : "Month"}</span>
            </button>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 8}`} className="w-full flex-1 overflow-visible" preserveAspectRatio="none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label={`Visitors over the last ${range}, rising`}>
        <defs>
          <linearGradient id={`fill-${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0071e3" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path key={`a-${range}`} d={area} fill={`url(#fill-${gid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.75 }} />
        <motion.path key={`l-${range}`} d={line} fill="none" stroke="#0071e3" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }} />
        {hover !== null && (
          <g>
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={0} y2={H} stroke="#1d1d1f" strokeOpacity="0.15" vectorEffect="non-scaling-stroke" />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r="4" fill="#fff" stroke="#0071e3" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </svg>
      <div className="h-4 text-[12px] tabular-nums text-[#6e6e73]" aria-live="polite">
        {hover !== null ? `Day ${hover + 1}: ${(data[hover] * 37).toLocaleString("en-US")} visitors` : big ? "Move along the chart to read a day." : ""}
      </div>
    </div>
  );
}

function Device({ kind, lit }: { kind: "phone" | "laptop" | "tablet"; lit: boolean }) {
  const dims = kind === "phone" ? { w: 26, h: 46, r: 7 } : kind === "tablet" ? { w: 44, h: 56, r: 7 } : { w: 64, h: 42, r: 5 };
  return (
    <motion.div className="relative flex flex-col items-center" animate={{ y: lit ? -4 : 0 }} transition={{ type: "spring", stiffness: 500, damping: 14 }}>
      <motion.div
        className="relative"
        style={{ width: dims.w, height: dims.h, borderRadius: dims.r }}
        animate={{ backgroundColor: lit ? "#0071e3" : "#e8e8ed", boxShadow: lit ? "0 10px 22px -10px rgba(0,113,227,.8)" : "0 0 0 rgba(0,0,0,0)" }}
        transition={{ duration: 0.25 }}
      >
        <div className="absolute inset-[3px] bg-white/90" style={{ borderRadius: dims.r - 2 }} />
        <AnimatePresence>
          {lit && (
            <motion.svg key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 16 }} viewBox="0 0 16 16" className="absolute left-1/2 top-1/2 h-3.5 w-3.5" style={{ x: "-50%", y: "-50%" }} aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#0071e3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
      {kind === "laptop" && <motion.div className="mt-[2px] h-[4px] w-[78px] rounded-b-[4px]" animate={{ backgroundColor: lit ? "#0071e3" : "#e8e8ed" }} />}
    </motion.div>
  );
}

function Sync({ play }: { play: boolean }) {
  const [at, setAt] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setAt((a) => (a + 1) % 4), 900);
    return () => window.clearInterval(id);
  }, [play]);
  const xs = ["8%", "50%", "92%"];
  return (
    <div className="relative flex h-full w-full items-end justify-between px-2 pb-1" aria-hidden="true">
      <div className="absolute left-[8%] right-[8%] top-[42%] h-[2px] rounded-full bg-[repeating-linear-gradient(90deg,#d2d2d7_0_6px,transparent_6px_11px)]" />
      <motion.div className="absolute top-[42%] h-3 w-3 rounded-full bg-[#0071e3] shadow-[0_0_0_5px_rgba(0,113,227,.15)]" animate={{ left: xs[Math.min(at, 2)], opacity: at === 3 ? 0 : 1 }} transition={{ type: "spring", stiffness: 120, damping: 14 }} style={{ x: "-50%", y: "-40%" }} />
      <Device kind="phone" lit={at >= 0 && at < 3} />
      <Device kind="laptop" lit={at >= 1 && at < 3} />
      <Device kind="tablet" lit={at === 2} />
    </div>
  );
}

function Private({ play }: { play: boolean }) {
  const [locked, setLocked] = useState(true);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setLocked((l) => !l), 2200);
    return () => window.clearInterval(id);
  }, [play]);
  const rows = ["Maya Chen", "maya@inbox.co", "4417 1234 5678"];
  return (
    <div className="flex h-full w-full items-center gap-4" aria-hidden="true">
      <svg width="46" height="56" viewBox="0 0 46 56" className="flex-none overflow-visible">
        <motion.path d="M12 26 V17 a11 11 0 0 1 22 0 V26" fill="none" stroke="#1d1d1f" strokeWidth="4.5" strokeLinecap="round" animate={{ y: locked ? 0 : -8, rotate: locked ? 0 : -14 }} style={{ originX: "34px", originY: "26px" }} transition={{ type: "spring", stiffness: 520, damping: 14 }} />
        <motion.rect x="4" y="24" width="38" height="30" rx="8" animate={{ fill: locked ? "#1d1d1f" : "#86868b" }} />
        <circle cx="23" cy="38" r="3.5" fill="#fff" />
      </svg>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {rows.map((t, i) => (
          <div key={t} className="relative h-4 w-full overflow-hidden text-[12.5px] font-medium text-[#1d1d1f]">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span key={locked ? "l" : "u"} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(4px)" }} transition={{ duration: 0.3, delay: i * 0.06 }} className="absolute whitespace-nowrap tracking-[0.12em]">
                {locked ? "•".repeat(Math.min(10, t.length)) : <span className="tracking-normal">{t}</span>}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fast({ play }: { play: boolean }) {
  const ms = useMotionValue(240);
  const label = useTransform(ms, (v) => `${Math.round(v)}`);
  const sweep = useTransform(ms, [240, 18], [0.12, 0.94]);
  const needle = useTransform(ms, [240, 18], [-80, 80]);
  useEffect(() => {
    if (!play) return;
    let alive = true;
    const run = async () => {
      while (alive) {
        await animate(ms, 18, { type: "spring", stiffness: 40, damping: 9 });
        await new Promise((r) => setTimeout(r, 1400));
        if (!alive) break;
        await animate(ms, 240, { duration: 0.6, ease: "easeInOut" });
      }
    };
    run();
    return () => {
      alive = false;
    };
  }, [play, ms]);
  return (
    <div className="flex h-full w-full flex-col items-center justify-end" aria-hidden="true">
      <svg viewBox="0 0 120 68" className="w-[132px] overflow-visible">
        <path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="#e8e8ed" strokeWidth="9" strokeLinecap="round" />
        <motion.path d="M10 62 A50 50 0 0 1 110 62" fill="none" stroke="#30d158" strokeWidth="9" strokeLinecap="round" style={{ pathLength: sweep }} />
        <motion.g style={{ rotate: needle, originX: "60px", originY: "62px" }}>
          <line x1="60" y1="62" x2="60" y2="24" stroke="#1d1d1f" strokeWidth="3" strokeLinecap="round" />
        </motion.g>
        <circle cx="60" cy="62" r="5" fill="#1d1d1f" />
      </svg>
      <div className="mt-1 flex items-baseline gap-1 text-[#1d1d1f]">
        <motion.span className="text-[24px] font-semibold tabular-nums tracking-[-0.03em]">{label}</motion.span>
        <span className="text-[12px] text-[#6e6e73]">ms</span>
      </div>
    </div>
  );
}

function Automations({ play }: { play: boolean }) {
  const steps = ["A payment fails", "Email the customer", "Retry in 3 days"];
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (!play) return;
    const id = window.setInterval(() => setOn((n) => (n + 1) % (steps.length + 2)), 800);
    return () => window.clearInterval(id);
  }, [play, steps.length]);
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2" aria-hidden="true">
      {steps.map((s, i) => {
        const lit = on > i && on <= steps.length + 1;
        return (
          <div key={s} className="flex items-center gap-3">
            <span className="w-10 flex-none text-[11px] font-medium text-[#86868b]">{i === 0 ? "When" : "Then"}</span>
            <div className="flex flex-1 items-center justify-between rounded-[12px] bg-[#f5f5f7] px-3 py-2">
              <span className="text-[12.5px] font-medium text-[#1d1d1f]">{s}</span>
              <motion.span className="relative h-[18px] w-[30px] rounded-full" animate={{ backgroundColor: lit ? "#30d158" : "#d2d2d7" }} transition={{ duration: 0.2 }}>
                <motion.span className="absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)]" animate={{ left: lit ? 14 : 2 }} transition={{ type: "spring", stiffness: 700, damping: 26 }} />
              </motion.span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PEOPLE = [
  { n: "Ava", c: "#bf5af2" },
  { n: "Leo", c: "#ff9f0a" },
  { n: "Mia", c: "#30d158" },
];

function Collab({ play }: { play: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[14px] bg-[#f5f5f7] p-3" aria-hidden="true">
      <div className="flex flex-col gap-2">
        <div className="h-2.5 w-[55%] rounded-full bg-[#d2d2d7]" />
        <div className="h-2 w-[85%] rounded-full bg-[#e3e3e8]" />
        <div className="h-2 w-[70%] rounded-full bg-[#e3e3e8]" />
        <motion.div className="h-2 rounded-full bg-[#0071e3]/25" animate={play ? { width: ["10%", "62%", "62%", "10%"] } : { width: "40%" }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.8, 1] }} />
      </div>
      {PEOPLE.slice(0, 2).map((p, i) => (
        <motion.div
          key={p.n}
          className="absolute left-0 top-0 flex items-start"
          animate={play ? { x: i ? [150, 60, 120, 150] : [30, 110, 50, 30], y: i ? [60, 30, 70, 60] : [20, 48, 64, 20] } : { x: 40 + i * 80, y: 30 + i * 20 }}
          transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="14" height="16" viewBox="0 0 14 16">
            <path d="M1 1l11 6-5 1.5L5 14z" fill={p.c} stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span className="ml-0.5 mt-3 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold text-white" style={{ background: p.c }}>
            {p.n}
          </span>
        </motion.div>
      ))}
      <div className="absolute bottom-2.5 right-2.5 flex">
        {PEOPLE.map((p, i) => (
          <span key={p.n} className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-[#f5f5f7]" style={{ background: p.c, marginLeft: i ? -6 : 0 }}>
            {p.n[0]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── The grid ────────────────────────────────────────────────────────────────

export type BentoFeaturesProps = {
  /** The tiles to show. Each has its own live demo; see `BentoTile`. */
  tiles?: BentoTile[];
  title?: string;
  subtitle?: string;
  /** Demo itself (open a tile now and then) until the first interaction. Off under reduced motion. */
  autoplay?: boolean;
  className?: string;
};

export type BentoTile = {
  id: string;
  title: string;
  blurb: string;
  detail: string;
  points: string[];
  span: string;
  /** how much to enlarge the demo in the detail view (charts that redraw themselves can stay at 1) */
  zoom?: number;
  demo: (big: boolean, play: boolean) => ReactNode;
};

const TILES: BentoTile[] = [
  {
    id: "insights",
    title: "Insights that update live",
    blurb: "See who is visiting right now.",
    detail: "Every chart updates as people arrive, so you can watch a launch land in real time instead of waiting for a report.",
    points: ["Live visitors and conversions", "Compare any two ranges", "Export to CSV in a click"],
    span: "md:col-span-2 md:row-span-2",
    zoom: 1,
    demo: (big, play) => <Insights big={big} play={play} />,
  },
  {
    id: "sync",
    title: "Syncs everywhere",
    blurb: "Change it on one device, it is already on the others.",
    detail: "Edits reach your phone, laptop and tablet in under a second, and work offline until you reconnect.",
    points: ["Under a second across devices", "Works offline", "Conflict-free merges"],
    span: "md:col-span-2",
    demo: (_b, play) => <Sync play={play} />,
  },
  {
    id: "private",
    title: "Private by default",
    blurb: "Encrypted before it leaves.",
    detail: "Personal fields are encrypted on your device. Not even we can read them.",
    points: ["End-to-end encryption", "No ad tracking", "Delete everything any time"],
    span: "",
    demo: (_b, play) => <Private play={play} />,
  },
  {
    id: "fast",
    title: "Fast",
    blurb: "Pages answer in milliseconds.",
    detail: "An edge network serves every request from the nearest region, so pages answer in tens of milliseconds.",
    points: ["Served from 30 regions", "18 ms median response", "No cold starts"],
    span: "",
    demo: (_b, play) => <Fast play={play} />,
  },
  {
    id: "automations",
    title: "Automations",
    blurb: "When something happens, do the next thing.",
    detail: "Chain triggers and actions in plain language. No code, and every run is logged.",
    points: ["40 built-in triggers", "Retries and delays", "A log for every run"],
    span: "md:col-span-2",
    demo: (_b, play) => <Automations play={play} />,
  },
  {
    id: "collab",
    title: "Made for teams",
    blurb: "Work on the same page at the same time.",
    detail: "See who is here, follow their cursor and leave comments right where the work is.",
    points: ["Live cursors", "Comments and mentions", "Roles for every member"],
    span: "md:col-span-2",
    demo: (_b, play) => <Collab play={play} />,
  },
];

/** A tile with a soft spotlight that follows the cursor. */
function Tile({ tile, uid, onOpen, play }: { tile: BentoTile; uid: string; onOpen: (el: HTMLElement) => void; play: boolean }) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const glow = useMotionTemplate`radial-gradient(260px circle at ${mx}px ${my}px, rgba(0,113,227,.08), transparent 70%)`;
  const edge = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, rgba(0,113,227,.45), transparent 70%)`;
  return (
    <motion.div
      layoutId={`tile-${uid}-${tile.id}`}
      transition={OPEN}
      role="button"
      tabIndex={0}
      data-tile={tile.id}
      aria-haspopup="dialog"
      aria-label={`${tile.title}. Open details.`}
      onClick={(e) => onOpen(e.currentTarget)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(e.currentTarget);
        }
      }}
      onPointerMove={(e) => {
        const b = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - b.left);
        my.set(e.clientY - b.top);
      }}
      onPointerLeave={() => {
        mx.set(-400);
        my.set(-400);
      }}
      whileHover={{ y: -3 }}
      className={`group relative flex min-h-[200px] cursor-pointer flex-col overflow-hidden md:min-h-0 rounded-[24px] bg-white p-5 outline-none shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] focus-visible:ring-2 focus-visible:ring-[#0071e3] ${tile.span}`}
      style={{ borderRadius: 24 }}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[24px]"
        style={{ background: edge, padding: 1, WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
      />
      <motion.div layout="position" className="relative flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{tile.title}</h3>
          <p className="m-0 mt-1 text-[13px] leading-[1.4] text-[#6e6e73]">{tile.blurb}</p>
        </div>
        <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </span>
      </motion.div>
      <div className="relative mt-3 flex min-h-[90px] flex-1 md:min-h-0">{tile.demo(false, play)}</div>
    </motion.div>
  );
}

/**
 * Bento Features: an Apple-style feature grid where every tile shows its feature
 * working (a chart drawing, devices syncing, a lock closing, a gauge dropping,
 * switches flipping, cursors moving). A soft spotlight follows the cursor across
 * each tile. Tap one and it grows out of the grid into a detail view with a
 * bigger, interactive demo; Escape or Close folds it back into place.
 */
export function BentoFeatures({
  tiles = TILES,
  title = "Everything you need. Nothing you don’t.",
  subtitle = "Tap any tile to see more.",
  autoplay = true,
  className = "",
}: BentoFeaturesProps) {
  const reduce = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touched = useRef(false);
  const inView = useInView(root, { amount: 0.3 });
  const [open, setOpen] = useState<string | null>(null);
  const active = tiles.find((t) => t.id === open) ?? null;

  const close = useCallback(() => {
    setOpen(null);
    // the tile is re-created when it folds back, so find it again by its id
    if (touched.current && open) window.setTimeout(() => root.current?.querySelector<HTMLElement>(`[data-tile="${open}"]`)?.focus({ preventScroll: true }), 80);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // move focus into the dialog only when a person opened it, never during the demo
    const t = touched.current ? window.setTimeout(() => closeBtn.current?.focus({ preventScroll: true }), 60) : 0;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // the demo: open a tile, let it play, fold it back, move on to the next
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const order = [tiles[0]?.id, tiles[3]?.id, tiles[1]?.id].filter(Boolean) as string[];
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) return;
      setOpen((o) => {
        if (o) return null;
        const next = order[k % order.length];
        k += 1;
        return next;
      });
    }, 3600);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, inView, tiles]);

  return (
    <div
      ref={root}
      onPointerDown={() => {
        touched.current = true;
      }}
      onPointerMove={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
      className={`flex w-full max-w-[1040px] flex-col gap-5 rounded-[32px] bg-[#f5f5f7] p-5 md:p-8 ${className}`}
    >
      {title && (
        <div className="px-1">
          <h3 className="m-0 text-[clamp(24px,3.2vw,34px)] font-semibold leading-[1.1] tracking-[-0.03em] text-[#1d1d1f]">{title}</h3>
          {subtitle && <p className="m-0 mt-1.5 text-[14px] text-[#6e6e73]">{subtitle}</p>}
        </div>
      )}
      <LayoutGroup id={`bento-${uid}`}>
        <div className="relative">
          <motion.div
            className="grid grid-cols-1 gap-3 md:auto-rows-[214px] md:grid-cols-4"
            animate={{ opacity: open ? 0.35 : 1, filter: open ? "blur(2px)" : "blur(0px)", scale: open ? 0.985 : 1 }}
            transition={{ duration: 0.35 }}
            inert={open ? true : undefined}
          >
            {tiles.map((t) =>
              open === t.id ? (
                <div key={t.id} className={`min-h-[200px] md:min-h-0 ${t.span}`} />
              ) : (
                <Tile
                  key={t.id}
                  tile={t}
                  uid={uid}
                  play={inView && !open && !reduce}
                  onOpen={(el) => {
                    touched.current = true;
                    opener.current = el;
                    setOpen(t.id);
                  }}
                />
              ),
            )}
          </motion.div>

          <AnimatePresence>
            {active && (
              <motion.div
                key={active.id}
                layoutId={`tile-${uid}-${active.id}`}
                transition={OPEN}
                role="dialog"
                aria-modal="true"
                aria-label={active.title}
                className="absolute inset-0 z-10 flex flex-col overflow-hidden bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_40px_80px_-30px_rgba(0,0,0,.45)] md:p-8"
                style={{ borderRadius: 28 }}
              >
                <motion.div layout="position" className="flex items-start justify-between gap-4">
                  <div className="max-w-[460px]">
                    <h3 className="m-0 text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-[#1d1d1f]">{active.title}</h3>
                    <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, ...SPRING }} className="m-0 mt-2 text-[15px] leading-[1.5] text-[#6e6e73]">
                      {active.detail}
                    </motion.p>
                  </div>
                  <motion.button
                    ref={closeBtn}
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      touched.current = true;
                      close();
                    }}
                    className="flex h-9 flex-none items-center gap-1.5 rounded-full border-0 bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] outline-none [font-family:inherit] hover:bg-[#e8e8ed] focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                  >
                    Close
                  </motion.button>
                </motion.div>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.12, duration: 0.3 }} className="mt-6 grid min-h-0 flex-1 grid-cols-1 gap-6 md:grid-cols-[1fr_1.5fr]">
                  <ul className="m-0 flex list-none flex-col gap-3 p-0">
                    {active.points.map((pt, i) => (
                      <motion.li key={pt} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.06, ...SPRING }} className="flex items-center gap-3 rounded-[14px] bg-[#f5f5f7] px-4 py-3 text-[14px] font-medium text-[#1d1d1f]">
                        <span className="h-1.5 w-1.5 flex-none rounded-full bg-[#0071e3]" />
                        {pt}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="flex min-h-[180px] items-center justify-center overflow-hidden rounded-[20px] bg-[#fbfbfd] p-4">
                    {(() => {
                      const z = active.zoom ?? 1.6;
                      return (
                        <div className="flex items-center justify-center" style={{ width: `${100 / z}%`, height: `${100 / z}%`, minHeight: 120, transform: `scale(${z})` }}>
                          {active.demo(true, true)}
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
      <p className="m-0 px-1 text-[12.5px] text-[#6e6e73]">Move across a tile, then tap it to open it. Escape closes.</p>
    </div>
  );
}
