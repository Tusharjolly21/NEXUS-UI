"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface EmptyChartProps {
  /** One value per point, oldest first. Needs at least two. The total counts these up. Defaults to twelve months of revenue in thousands. */
  data?: number[];
  /** A label per point, used for the axis (every second one) and the hover readout. */
  labels?: string[];
  /** The sources offered while the chart is empty. */
  sources?: string[];
  /** Caption above the total. */
  title?: string;
  /** Put before the total and the hover values. */
  prefix?: string;
  /** Put after the total and the hover values. */
  suffix?: string;
  /** Called with the source name when one is connected. Not called by the autoplay demo. */
  onConnect?: (source: string) => void;
  /** Called when Disconnect is pressed. */
  onDisconnect?: () => void;
  /** Connects a source, reads a month and disconnects on a loop until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

export const EMPTY_CHART_MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];
export const EMPTY_CHART_DATA = [12.4, 13.1, 12.8, 15.2, 16.9, 16.1, 18.7, 21.3, 20.6, 24.2, 27.9, 31.4];
export const EMPTY_CHART_SOURCES = ["Payments", "Spreadsheet", "Database"];

const W = 460;
const H = 180;
const PAD = 8;
const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Pt = readonly [number, number];

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/** Smooth path through the points; same command count for any data, so one path can morph into another. */
function curve(p: readonly Pt[]) {
  let d = `M ${p[0][0]} ${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[Math.max(0, i - 1)];
    const b = p[i];
    const c = p[i + 1];
    const e = p[Math.min(p.length - 1, i + 2)];
    d += ` C ${b[0] + (c[0] - a[0]) / 6} ${b[1] + (c[1] - a[1]) / 6}, ${c[0] - (e[0] - b[0]) / 6} ${c[1] - (e[1] - b[1]) / 6}, ${c[0]} ${c[1]}`;
  }
  return d;
}

/**
 * A chart with nothing to show yet that still looks like a chart. A dashed
 * placeholder line breathes on the grid while you pick a source; connect one
 * and it syncs, then the same line bends into your real numbers, the area
 * fills underneath and the total counts up. Hover the chart, or focus it and
 * use the arrow keys, to read any month.
 */
export function EmptyChart({
  data = EMPTY_CHART_DATA,
  labels = EMPTY_CHART_MONTHS,
  sources = EMPTY_CHART_SOURCES,
  title = "Revenue, last 12 months",
  prefix = "$",
  suffix = "k",
  onConnect,
  onDisconnect,
  autoplay = false,
  enableSound = true,
  className,
}: EmptyChartProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const gid = `ec-${useId().replace(/:/g, "")}`;
  const [state, setState] = useState<"empty" | "sync" | "live">("empty");
  const [src, setSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const [total, setTotal] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const touched = useRef(false);
  const syncTimer = useRef<number | undefined>(undefined);
  const count = useRef<AnimationPlaybackControls | null>(null);
  const active = useDemoActive(root, !reduce);

  const n = data.length;
  const max = Math.max(...data, 1) * 1.08;
  const sum = data.reduce((a, b) => a + b, 0);
  const pts = (vals: number[]): Pt[] => vals.map((v, i) => [PAD + (i / Math.max(1, vals.length - 1)) * (W - PAD * 2), H - PAD - (v / max) * (H - PAD * 2)] as const);
  const flat = (ph: number) => data.map((_, i) => max * 0.265 + Math.sin(i * 0.9 + ph) * max * 0.047);
  const fmt = (v: number) => `${prefix}${v.toFixed(1)}${suffix}`;

  // The placeholder line breathes while the chart is empty, only while it is on screen.
  useEffect(() => {
    if (state === "live" || reduce || !active) return;
    const id = window.setInterval(() => setPhase((p) => p + 0.9), 1400);
    return () => window.clearInterval(id);
  }, [state, reduce, active]);

  const stopWork = () => {
    window.clearTimeout(syncTimer.current);
    count.current?.stop();
    count.current = null;
  };
  useEffect(
    () => () => {
      window.clearTimeout(syncTimer.current);
      count.current?.stop();
    },
    [],
  );

  const connect = (s: string, auto = false) => {
    const p = auto ? play.auto : play;
    p("tap", 0.5);
    stopWork();
    setSrc(s);
    setState("sync");
    if (!auto) onConnect?.(s);
    syncTimer.current = window.setTimeout(
      () => {
        setState("live");
        p("done", 0.55);
        if (reduce) setTotal(sum);
        else count.current = animate(0, sum, { duration: 1.4, ease: [0.2, 0, 0, 1], onUpdate: (v) => setTotal(v) });
      },
      reduce ? 500 : 1600,
    );
  };
  const reset = () => {
    stopWork();
    setState("empty");
    setSrc(null);
    setTotal(0);
    setHover(null);
  };

  // The demo reads the latest handlers through a ref.
  const latest = useRef({ connect, reset });
  useEffect(() => {
    latest.current = { connect, reset };
  });

  // Demo: connect the first source, read a month, disconnect.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => ids.push(window.setTimeout(() => !touched.current && fn(), ms));
    const loop = () => {
      if (touched.current) return;
      at(() => latest.current.reset(), 0);
      at(() => latest.current.connect(sources[0] ?? "Source", true), 1800);
      at(() => setHover(Math.min(9, n - 1)), 5600);
      at(() => setHover(null), 6800);
      at(() => latest.current.reset(), 8200);
      ids.push(window.setTimeout(loop, 8600));
    };
    loop();
    return () => ids.forEach((id) => window.clearTimeout(id));
    // `sources` and `n` only pick the demo's source and month; the loop does not need to restart when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, active]);

  const live = state === "live";
  const line = curve(pts(live ? data : flat(phase)));
  const full = pts(data);
  const area = `${curve(full)} L ${W - PAD} ${H} L ${PAD} ${H} Z`;
  const hp = hover !== null ? full[hover] : null;

  const move = (e: ReactPointerEvent) => {
    if (!live || !svg.current) return;
    touched.current = true;
    const r = svg.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((x - PAD) / (W - PAD * 2)) * (n - 1)))));
  };
  const key = (e: KeyboardEvent) => {
    if (!live) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      touched.current = true;
      setHover((h) => Math.max(0, Math.min(n - 1, (h ?? (e.key === "ArrowRight" ? -1 : n)) + (e.key === "ArrowRight" ? 1 : -1))));
    } else if (e.key === "Escape") setHover(null);
  };

  const base = live ? `${title} chart from ${labels[0]} to ${labels[n - 1]}, ending at ${fmt(data[n - 1])}` : "No data yet";
  const label = hover !== null ? `${labels[hover] ?? hover + 1}: ${fmt(data[hover])}` : base;

  return (
    <div
      ref={root}
      className={cn(
        "w-[540px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]",
        className,
      )}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{title}</div>
          <div className={cn("mt-0.5 text-[30px] font-semibold tabular-nums tracking-[-0.03em]", live ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#c7c7cc] dark:text-[#48484a]")}>
            {live ? fmt(total) : <span aria-hidden="true">{prefix}—</span>}
            {!live && <span className="sr-only">No data yet</span>}
          </div>
        </div>
        {live && (
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              play("tap", 0.35);
              reset();
              onDisconnect?.();
            }}
            className={cn("mt-1 h-8 rounded-full bg-[#f5f5f7] px-3.5 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
          >
            Disconnect
          </button>
        )}
      </div>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "sync" ? `Syncing from ${src}` : live ? `Connected. Total ${fmt(sum)}` : ""}
      </span>
      <div className="relative mt-4">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className={cn("block h-auto w-full touch-pan-y rounded-lg", FOCUS)}
          onPointerMove={move}
          onPointerLeave={() => setHover(null)}
          onKeyDown={key}
          onBlur={() => setHover(null)}
          role="img"
          tabIndex={live ? 0 : -1}
          aria-label={label}
          aria-roledescription={live ? "chart, use left and right arrow keys to read each point" : undefined}
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopOpacity=".18" className="[stop-color:#0071e3] dark:[stop-color:#0a84ff]" />
              <stop offset="1" stopOpacity="0" className="[stop-color:#0071e3] dark:[stop-color:#0a84ff]" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((k) => (
            <line key={k} x1={0} x2={W} y1={PAD + (k / 3) * (H - PAD * 2)} y2={PAD + (k / 3) * (H - PAD * 2)} className="stroke-[#f0f0f3] dark:stroke-white/[.08]" />
          ))}
          <motion.path
            d={area}
            fill={`url(#${gid})`}
            aria-hidden="true"
            initial={false}
            animate={{ opacity: live ? 1 : 0, scaleY: live ? 1 : 0.3 }}
            style={{ originY: 1 }}
            transition={reduce ? { duration: 0.2 } : { duration: 0.9, delay: live ? 0.35 : 0, ease: [0.2, 0, 0, 1] }}
          />
          <motion.path
            initial={false}
            animate={{ d: line }}
            fill="none"
            strokeWidth={live ? 2.6 : 2}
            strokeDasharray={live ? undefined : "5 7"}
            strokeLinecap="round"
            className={cn("transition-[stroke] duration-[400ms]", live ? "stroke-[#0071e3] dark:stroke-[#0a84ff]" : "stroke-[#c7c7cc] dark:stroke-[#58585a]")}
            transition={{ d: reduce ? { duration: 0.2 } : live ? { duration: 1.1, ease: [0.34, 1.35, 0.64, 1] } : { duration: 1.3, ease: "easeInOut" } }}
          />
          {hp && (
            <>
              <line x1={hp[0]} x2={hp[0]} y1={0} y2={H} className="stroke-black/15 dark:stroke-white/25" />
              <motion.circle
                cx={hp[0]}
                cy={hp[1]}
                r="5"
                strokeWidth="2.5"
                className="fill-white stroke-[#0071e3] dark:fill-[#1c1c1e] dark:stroke-[#0a84ff]"
                initial={{ scale: reduce ? 1 : 0 }}
                animate={{ scale: 1 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            </>
          )}
        </svg>
        <div className="mt-1 flex justify-between text-[10.5px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
          {labels.filter((_, i) => i % 2 === 0).map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <AnimatePresence>
          {hp && hover !== null && (
            <motion.div
              className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-[10px] bg-[#1d1d1f] px-2.5 py-1.5 text-[12px] text-white dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
              style={{ left: `${(hp[0] / W) * 100}%` }}
              aria-hidden="true"
              initial={{ opacity: 0, y: reduce ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <span className="text-white/70">{labels[hover]}</span> <span className="font-semibold tabular-nums">{fmt(data[hover])}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the empty-state card over the placeholder */}
        <AnimatePresence>
          {!live && (
            <motion.div
              className="absolute inset-x-0 top-[18%] mx-auto w-[300px] max-w-[92%] rounded-[18px] bg-white/90 p-4 text-center shadow-[0_0_0_1px_rgba(0,0,0,.06),0_16px_36px_-18px_rgba(0,0,0,.35)] backdrop-blur dark:bg-[#2c2c2e]/90 dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_16px_36px_-18px_rgba(0,0,0,.9)]"
              initial={{ opacity: 0, y: reduce ? 0 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: -8, scale: 0.96 }}
            >
              <div className="text-[14.5px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{state === "sync" ? `Syncing from ${src}…` : "Connect a source"}</div>
              {state === "sync" ? (
                <div className="mx-auto mt-3 h-1.5 w-[80%] overflow-hidden rounded-full bg-[#ececf0] dark:bg-[#3a3a3c]" aria-hidden="true">
                  <motion.div
                    className="h-full rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
                    initial={{ width: "4%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: reduce ? 0.4 : 1.5, ease: [0.4, 0, 0.2, 1] }}
                  />
                </div>
              ) : (
                <>
                  <div className="mt-0.5 text-[12.5px] text-[#6e6e73] dark:text-[#a1a1a6]">Your numbers show up here in about a minute.</div>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                    {sources.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          touched.current = true;
                          connect(s);
                        }}
                        className={cn("h-8 rounded-full bg-[#f5f5f7] px-3 text-[12.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:hover:bg-[#48484a]", FOCUS)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
