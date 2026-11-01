# Empty Chart

Add the "Empty Chart" component from Nexus UI to my project.

A chart with no data yet, drawn as a dashed placeholder line that breathes on the grid. Connect a source and the same line bends into the real numbers while the area fills in and the total counts up.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { EmptyChart, EMPTY_CHART_DATA, EMPTY_CHART_MONTHS, EMPTY_CHART_SOURCES } from "@/components/empty-chart";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/empty-chart/empty-chart.tsx ---

```tsx
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
```

--- components/empty-chart/index.ts ---

```ts
export { EmptyChart, EMPTY_CHART_DATA, EMPTY_CHART_MONTHS, EMPTY_CHART_SOURCES } from "./empty-chart";
export type { EmptyChartProps } from "./empty-chart";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen the first tap anywhere on the page
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  const touch = (navigator.maxTouchPoints ?? 0) > 0 || window.matchMedia?.("(pointer: coarse)").matches;
  if (!touch) return;
  const wake = () => {
    if (ctx && ctx.state === "running") return;
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
