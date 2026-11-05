# Vine Progress

Add the "Vine Progress" component from Nexus UI to my project.

An onboarding checklist with a vine for a progress bar. The vine grows down to the step you're on, unfurling a leaf for every step behind it; untick one and it pulls back and the leaves drop. Finish them all and it reaches the bottom and flowers. Brush the leaves with the pointer and they rustle.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { VineProgress } from "@/components/vine-progress";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/vine-progress/index.ts ---

```ts
export { VineProgress } from "./vine-progress";
export type { VineStep, VineProgressProps } from "./vine-progress";
```

--- components/vine-progress/vine-progress.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  motionValue,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type VineStep = { id: string; title: string; description?: string };

export type VineProgressProps = {
  steps?: VineStep[];
  /** ids of steps that start out done */
  defaultDone?: string[];
  title?: string;
  /** Called with the ids of every done step whenever one is ticked or unticked. */
  onChange?: (done: string[]) => void;
  autoplay?: boolean;
  className?: string;
};

// Framework7 (via Iconify), inlined
const ICON: Record<"check", { vb: number; body: string }> = {
  check: { vb: 56, body: "<path fill=\"currentColor\" d=\"m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0\"/>" },
};

const DEFAULT_STEPS: VineStep[] = [
  { id: "account", title: "Create your account", description: "Name, email and a password." },
  { id: "photo", title: "Add a profile photo", description: "Help your team recognise you." },
  { id: "calendar", title: "Connect your calendar", description: "We'll find times that work." },
  { id: "invite", title: "Invite a teammate", description: "Work goes better together." },
  { id: "alerts", title: "Turn on notifications", description: "Know when something needs you." },
];

const X0 = 44; // where the stem runs, from the list's left edge
const BULGE = 15;
const COL = 80; // width of the vine column
const STOP = Symbol("stop");
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type LeafSpot = { x: number; y: number; angle: number; side: 1 | -1; len: number; at: number };
type Curl = { d: string; x: number; y: number; at: number };
type Geo = { d: string; total: number; nodes: number[]; ys: number[]; yEnd: number; leaves: LeafSpot[]; curls: Curl[] };

/**
 * An onboarding checklist with a vine for a progress bar. The vine grows down to the step you're on,
 * unfurling a leaf for every step behind it; untick one and it pulls back and the leaves drop. Finish
 * them all and it reaches the bottom and flowers. Brush the leaves with the pointer and they rustle.
 */
export function VineProgress({
  steps = DEFAULT_STEPS,
  defaultDone = ["account"],
  title = "Get set up",
  onChange,
  autoplay = false,
  className = "",
}: VineProgressProps) {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLElement | null)[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const stemRef = useRef<SVGPathElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [done, setDone] = useState<Set<string>>(() => new Set(defaultDone));
  const doneRef = useRef(done);
  doneRef.current = done;
  const N = steps.length;
  const current = useMemo(() => {
    const i = steps.findIndex((s) => !done.has(s.id));
    return i < 0 ? N : i;
  }, [steps, done, N]);

  // ─── geometry: rows are measured, the stem snakes between their tick circles ───
  const [ys, setYs] = useState<{ ys: number[]; yEnd: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const base = list.getBoundingClientRect().top;
      const out = rowRefs.current.slice(0, N).map((r) => (r ? r.getBoundingClientRect().top - base + 23 : 0));
      const e = endRef.current ? endRef.current.getBoundingClientRect().top - base + 26 : 0;
      setYs((p) => (p && p.h === list.offsetHeight && p.yEnd === e && p.ys.every((y, i) => y === out[i]) ? p : { ys: out, yEnd: e, h: list.offsetHeight }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [N]);

  const d = useMemo(() => {
    if (!ys) return "";
    const pts = [...ys.ys, ys.yEnd];
    let s = `M ${X0 - 6} ${pts[0] - 34} C ${X0 - 6} ${pts[0] - 20}, ${X0} ${pts[0] - 14}, ${X0} ${pts[0]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const k = (b - a) * 0.36;
      const sd = i % 2 === 0 ? 1 : -1;
      s += ` C ${X0 + sd * BULGE} ${a + k}, ${X0 + sd * BULGE} ${b - k}, ${X0} ${b}`;
    }
    return s;
  }, [ys]);

  // lengths along the stem (found by searching the rendered path), leaf and tendril spots
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const p = stemRef.current;
    if (!p || !ys || !d) return;
    const total = p.getTotalLength();
    const lenAtY = (y: number) => {
      let lo = 0;
      let hi = total;
      for (let i = 0; i < 26; i++) {
        const m = (lo + hi) / 2;
        if (p.getPointAtLength(m).y < y) lo = m;
        else hi = m;
      }
      return (lo + hi) / 2;
    };
    const nodes = ys.ys.map(lenAtY);
    const pts = [...ys.ys, ys.yEnd];
    const leaves: LeafSpot[] = [];
    const curls: Curl[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const side: 1 | -1 = i % 2 === 0 ? 1 : -1;
      const at = lenAtY(pts[i] + (pts[i + 1] - pts[i]) * 0.47);
      const q = p.getPointAtLength(at);
      leaves.push({ x: q.x, y: q.y, side, angle: side > 0 ? -30 : 210, len: side > 0 ? 25 : 31, at });
      if (i % 2 === 1 || i === pts.length - 2) {
        // a small tendril curling off the inside of the bend
        const at2 = lenAtY(pts[i] + (pts[i + 1] - pts[i]) * 0.72);
        const c = p.getPointAtLength(at2);
        const sd = -side;
        const ptsC: string[] = [];
        for (let k = 0; k <= 28; k++) {
          const u = k / 28;
          const th = u * Math.PI * 2.3;
          const r = 8 * (1 - u * 0.8);
          const x = sd * (u * 13 + Math.sin(th) * r * 0.6);
          const y = u * 4 - (1 - Math.cos(th)) * r * 0.45;
          ptsC.push(`${k ? "L" : "M"} ${x.toFixed(2)} ${y.toFixed(2)}`);
        }
        curls.push({ d: ptsC.join(" "), x: c.x, y: c.y, at: at2 });
      }
    }
    setGeo({ d, total, nodes, ys: ys.ys, yEnd: ys.yEnd, leaves, curls });
  }, [d, ys]);

  // ─── the vine's length, on a slow organic spring ───
  const L = useMotionValue(0);
  const grownOnce = useRef(false);
  const [reach, setReach] = useState({ nodes: 0, leaves: 0, curls: 0, bloom: false });
  const tipX = useMotionValue(X0);
  const tipY = useMotionValue(0);
  const tipR = useMotionValue(90);
  const tipO = useMotionValue(0);
  const geoRef = useRef<Geo | null>(null);
  geoRef.current = geo;

  const targetLen = useCallback((g: Geo, cur: number) => (cur >= N ? g.total : g.nodes[cur]), [N]);

  useEffect(() => {
    const draw = (l: number) => {
      const g = geoRef.current;
      const p = stemRef.current;
      if (!g || !p) return;
      p.style.strokeDasharray = `${Math.max(0.01, l)} ${g.total + 10}`;
      const q = p.getPointAtLength(clamp(l, 0, g.total));
      const q2 = p.getPointAtLength(clamp(l - 3, 0, g.total));
      tipX.set(q.x);
      tipY.set(q.y);
      tipR.set((Math.atan2(q.y - q2.y, q.x - q2.x) * 180) / Math.PI);
      tipO.set(l > 2 && l < g.total - 1.5 ? 1 : 0);
      const nodes = g.nodes.filter((n) => n <= l + 1.5).length;
      const leaves = g.leaves.filter((f) => f.at <= l).length;
      const curls = g.curls.filter((c) => c.at <= l).length;
      const bloom = l >= g.total - 1.5;
      setReach((r) => (r.nodes === nodes && r.leaves === leaves && r.curls === curls && r.bloom === bloom ? r : { nodes, leaves, curls, bloom }));
    };
    draw(L.get());
    return L.on("change", draw);
  }, [L, geo, tipX, tipY, tipR, tipO]);

  const growAnim = useRef<AnimationPlaybackControls | null>(null);
  useEffect(() => {
    if (!geo) return;
    const to = targetLen(geo, current);
    growAnim.current?.stop();
    if (reduced || !grownOnce.current) {
      // first paint: already grown to where you are, no animation
      grownOnce.current = true;
      L.jump(to);
      return;
    }
    const back = to < L.get();
    growAnim.current = animate(L, to, back ? { type: "spring", stiffness: 70, damping: 17 } : { type: "spring", stiffness: 34, damping: 11, mass: 1.2, restDelta: 0.05 });
  }, [geo, current, reduced, L, targetLen]);

  // ─── ticking steps ───
  const toggle = useCallback(
    (id: string) => {
      const next = new Set(doneRef.current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      doneRef.current = next;
      setDone(next);
      onChangeRef.current?.(steps.filter((s) => next.has(s.id)).map((s) => s.id));
    },
    [steps],
  );

  // ─── brushing the leaves ───
  const rust = useRef<MotionValue<number>[]>([]);
  if (rust.current.length < N) rust.current = Array.from({ length: N }, (_, i) => rust.current[i] ?? motionValue(0));
  const lastP = useRef<{ x: number; y: number; t: number } | null>(null);
  const onListMove = (e: RPointerEvent<HTMLDivElement>) => {
    const g = geoRef.current;
    const list = listRef.current;
    if (!g || !list || reduced) return;
    const b = list.getBoundingClientRect();
    const x = e.clientX - b.left;
    const y = e.clientY - b.top;
    const now = performance.now();
    const lp = lastP.current;
    lastP.current = { x, y, t: now };
    if (!lp || now - lp.t > 80) return;
    const vx = (x - lp.x) / Math.max(8, now - lp.t);
    const vy = (y - lp.y) / Math.max(8, now - lp.t);
    const speed = Math.hypot(vx, vy);
    if (speed < 0.15) return;
    g.leaves.forEach((f, i) => {
      if (i >= reach.leaves) return;
      const a = (f.angle * Math.PI) / 180;
      const mx = f.x + Math.cos(a) * f.len * 0.55;
      const my = f.y + Math.sin(a) * f.len * 0.55;
      if (Math.hypot(x - mx, y - my) > 24) return;
      const mv = rust.current[i];
      const kick = clamp((vy * f.side - vx * 0.4) * 22, -26, 26);
      animate(mv, [clamp(mv.get() + kick, -30, 30), 0], { type: "spring", stiffness: 140, damping: 5 });
    });
  };

  // ─── autoplay: tick through the steps, watch it flower, untick one and tick it again ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, to: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - to) < 0.01) return res();
        const c = animate(mv, to, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const tap = async (i: number) => {
      const row = rowRefs.current[i];
      if (!row) return;
      const r = row.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      const tx = r.left - b.left + Math.min(150, r.width * 0.5);
      const ty = r.top - b.top + 24;
      if (go.get() < 0.5) {
        gx.set(tx + 40);
        gy.set(ty + 50);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, tx, 0.5), run(gy, ty, 0.5)]);
      await run(gs, 0.8, 0.1);
      toggle(steps[i].id);
      await run(gs, 1, 0.12);
    };
    (async () => {
      await wait(1100);
      // tick the rest in order
      for (let i = 0; i < N; i++) {
        if (doneRef.current.has(steps[i].id)) continue;
        await tap(i);
        await wait(i === N - 1 ? 300 : 1150);
      }
      await run(go, 0, 0.3);
      await wait(2600);
      while (alive) {
        // untick the middle step: the vine pulls back and drops its leaves
        const mid = Math.min(2, N - 1);
        await tap(mid);
        await run(go, 0, 0.3);
        await wait(1900);
        // and tick it again: it grows all the way through and flowers
        await tap(mid);
        await run(go, 0, 0.3);
        await wait(3600);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const count = done.size;
  const all = current >= N;

  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[400px] select-none overflow-hidden rounded-[32px] bg-white px-5 pb-5 pt-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      <div className="flex items-end justify-between px-1">
        <div>
          <h3 className="m-0 text-[22px] font-semibold leading-tight tracking-[-0.025em]">{title}</h3>
          <p className="m-0 mt-0.5 text-[13px] text-[#6e6e73]" aria-live="polite">
            <span className="tabular-nums">{Math.min(count, N)}</span> of {N} done
          </p>
        </div>
        <div className="mb-1 h-[6px] w-[72px] overflow-hidden rounded-full bg-[#f0f0f3]" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-[#30d158]" initial={false} animate={{ width: `${(Math.min(count, N) / N) * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
        </div>
      </div>

      <div ref={listRef} onPointerMove={onListMove} className="relative mt-6">
        {/* the vine */}
        <svg className="pointer-events-none absolute left-0 top-0 z-[1] overflow-visible" width={COL} height={ys?.h ?? 0} aria-hidden="true">
          <defs>
            <linearGradient id={`${uid}-stem`} x1="0" y1="0" x2="0" y2={ys?.h ?? 400} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#2f9e44" />
              <stop offset="1" stopColor="#51cf66" />
            </linearGradient>
          </defs>
          {d && (
            <>
              <path d={d} fill="none" stroke="#e3e3e8" strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />
              <path ref={stemRef} d={d} fill="none" stroke={`url(#${uid}-stem)`} strokeWidth={3.6} strokeLinecap="round" style={{ strokeDasharray: "0.01 99999", filter: "drop-shadow(0 1px 1px rgba(0,60,20,.18))" }} />
            </>
          )}
        </svg>

        {/* leaves, tendrils, the growing tip and the flower */}
        <div className="pointer-events-none absolute left-0 top-0 z-[2] h-0 w-0" aria-hidden="true">
          <AnimatePresence>
            {geo?.leaves.slice(0, reach.leaves).map((f, i) => <Leaf key={`l${i}`} spot={f} rust={rust.current[i]} reduced={reduced} i={i} uid={uid} />)}
          </AnimatePresence>
          <AnimatePresence>
            {geo?.curls.slice(0, reach.curls).map((c, i) => (
              <motion.svg
                key={`c${i}`}
                className="absolute overflow-visible"
                style={{ left: c.x, top: c.y }}
                width={1}
                height={1}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
              >
                <motion.path d={c.d} fill="none" stroke="#51cf66" strokeWidth={1.2} strokeLinecap="round" initial={{ pathLength: reduced ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: [0.3, 0, 0.2, 1] }} />
              </motion.svg>
            ))}
          </AnimatePresence>
          <motion.div className="absolute left-0 top-0" style={{ x: tipX, y: tipY, rotate: tipR, opacity: tipO }}>
            <svg width={14} height={10} viewBox="0 0 14 10" className="absolute -top-[5px] left-[-3px] overflow-visible">
              <path d="M0 5 C 3 0.5, 9 0.5, 14 5 C 9 9.5, 3 9.5, 0 5 Z" fill="#8ce99a" />
              <path d="M1 5 L 12 5" stroke="#40c057" strokeWidth={0.8} strokeLinecap="round" />
            </svg>
          </motion.div>
          {geo && <Flower x={X0} y={geo.yEnd} open={reach.bloom} reduced={reduced} uid={uid} />}
        </div>

        <ul className="m-0 list-none p-0">
          {steps.map((s, i) => {
            const isDone = done.has(s.id);
            const isCurrent = i === current;
            const reached = i < reach.nodes;
            return (
              <li key={s.id} className="relative">
                <button
                  type="button"
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  role="checkbox"
                  aria-checked={isDone}
                  onClick={() => toggle(s.id)}
                  className="group relative block w-full rounded-[18px] py-3 pl-[84px] pr-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
                  style={{ minHeight: 70 }}
                >
                  <motion.span
                    className="absolute inset-y-1 left-[70px] right-0 rounded-[16px] bg-[#f5f5f7]"
                    initial={false}
                    animate={{ opacity: isCurrent ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                  <span className="absolute inset-y-1 left-[70px] right-0 rounded-[16px] bg-[#f5f5f7] opacity-0 transition-opacity group-hover:opacity-60" />
                  <span className={`relative block text-[15px] font-semibold leading-[20px] tracking-[-0.01em] transition-colors duration-300 ${isDone ? "text-[#86868b]" : "text-[#1d1d1f]"}`}>{s.title}</span>
                  {s.description && <span className="relative mt-0.5 block text-[13px] leading-[18px] text-[#6e6e73]">{s.description}</span>}
                  {/* the tick circle the stem runs through */}
                  <span className="absolute z-[3]" style={{ left: X0 - 12, top: 11 }}>
                    <Node done={isDone} reached={reached} current={isCurrent} reduced={reduced} />
                  </span>
                </button>
              </li>
            );
          })}
          <li className="relative">
            <div ref={endRef} className="relative py-3 pl-[84px] pr-3" style={{ minHeight: 64 }}>
              <AnimatePresence mode="popLayout" initial={false}>
                {all ? (
                  <motion.div key="all" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 26, delay: reduced ? 0 : 0.5 }}>
                    <span className="block text-[15px] font-semibold leading-[20px] tracking-[-0.01em]">You&apos;re all set</span>
                    <span className="mt-0.5 block text-[13px] leading-[18px] text-[#6e6e73]">Everything&apos;s ready to go.</span>
                  </motion.div>
                ) : (
                  <motion.div key="todo" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                    <span className="block pt-[11px] text-[13px] leading-[18px] text-[#86868b]">Finish every step to see it bloom.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </li>
        </ul>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

/** A leaf that unfurls off the stem, sways a little, rustles when brushed and drops when the vine pulls back. */
function Leaf({ spot, rust, reduced, i, uid }: { spot: LeafSpot; rust: MotionValue<number>; reduced: boolean; i: number; uid: string }) {
  const rot = useTransform(rust, (r) => spot.angle + r);
  const id = `${uid}-leaf-${i}`;
  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x: spot.x, y: spot.y }}
      exit={reduced ? { opacity: 0 } : { x: spot.x + spot.side * 16, y: spot.y + 64, opacity: 0, transition: { duration: 1.1, ease: [0.45, 0, 0.75, 0.55] } }}
    >
      <motion.div style={{ rotate: rot }}>
        <motion.div
          initial={reduced ? { scale: 1, rotate: 0 } : { scale: 0.08, rotate: spot.side * 55 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={reduced ? undefined : { rotate: spot.side * 85, scale: 0.85, transition: { duration: 1.1, ease: [0.3, 0, 0.6, 1] } }}
          transition={{ type: "spring", stiffness: 150, damping: 11 }}
        >
          <motion.div
            animate={reduced ? undefined : { rotate: [0, 3.5, 0, -2.5, 0] }}
            transition={{ duration: 4.6 + (i % 3) * 0.9, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            <svg width={spot.len} height={16} viewBox={`0 0 ${spot.len} 16`} className="absolute left-0 top-[-8px] overflow-visible">
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#69db7c" />
                  <stop offset="1" stopColor="#2b8a3e" />
                </linearGradient>
              </defs>
              <path
                d={`M0 8 C ${spot.len * 0.22} -0.5, ${spot.len * 0.72} -1, ${spot.len} 7.2 C ${spot.len * 0.7} 15.5, ${spot.len * 0.22} 15.5, 0 8 Z`}
                fill={`url(#${id})`}
              />
              <path d={`M1.5 8 Q ${spot.len * 0.5} 6.6, ${spot.len - 2} 7.3`} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth={0.9} strokeLinecap="round" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** The tick circle on the stem. Done but not yet reached by the vine shows as a seed: a green ring. */
function Node({ done, reached, current, reduced }: { done: boolean; reached: boolean; current: boolean; reduced: boolean }) {
  const filled = done && reached;
  return (
    <span className="relative block h-6 w-6">
      {current && !reduced && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-[#30d158]"
          animate={{ scale: [1, 1.65], opacity: [0.55, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <motion.span
        className="absolute inset-0 rounded-full"
        initial={false}
        animate={{
          backgroundColor: filled ? "#30d158" : "#ffffff",
          boxShadow: filled ? "inset 0 0 0 2px #30d158, 0 2px 6px -1px rgba(48,209,88,.55)" : done || current ? "inset 0 0 0 2px #30d158, 0 0 0 0 rgba(0,0,0,0)" : "inset 0 0 0 2px #d2d2d7, 0 0 0 0 rgba(0,0,0,0)",
          scale: filled ? [1, 1.22, 1] : 1,
        }}
        transition={{ duration: reduced ? 0 : 0.45, ease: "easeOut" }}
      />
      <span className="absolute inset-[4px] transition-colors duration-300" style={{ color: filled ? "#ffffff" : "#30d158" }}>
        <AnimatePresence>
          {done && (
            <motion.svg
              key="tick"
              viewBox={`0 0 ${ICON.check.vb} ${ICON.check.vb}`}
              className="absolute inset-0 h-full w-full"
              initial={reduced ? { opacity: 0 } : { scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0, rotate: 30 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              dangerouslySetInnerHTML={{ __html: ICON.check.body }}
            />
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}

const PETALS = 5;
/** The flower at the end of the vine: a bud that opens petal by petal, then sheds a little pollen. */
function Flower({ x, y, open, reduced, uid }: { x: number; y: number; open: boolean; reduced: boolean; uid: string }) {
  const pollen = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ dx: Math.sin(i * 2.4) * 26, dy: -26 - ((i * 37) % 30), d: 0.9 + (i % 4) * 0.25, s: 2 + (i % 3) })), []);
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="flower"
            className="absolute left-0 top-0"
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.35 } }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <motion.div
              className="absolute left-0 top-0"
              animate={reduced ? undefined : { rotate: [0, 4, 0, -3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* sepals */}
              {[-1, 1].map((s) => (
                <svg key={s} width={14} height={8} viewBox="0 0 14 8" className="absolute overflow-visible" style={{ left: 0, top: -4, transform: `rotate(${s > 0 ? 35 : 145}deg)`, transformOrigin: "0 4px" }}>
                  <path d="M0 4 C 4 0, 10 0, 14 3.5 C 10 7.5, 4 7.5, 0 4 Z" fill="#40c057" />
                </svg>
              ))}
              {Array.from({ length: PETALS }, (_, k) => {
                const a = (k * 360) / PETALS - 90;
                return (
                  <motion.div
                    key={k}
                    className="absolute left-0 top-0"
                    initial={reduced ? { rotate: a, scale: 1 } : { rotate: -90 + (a + 90) * 0.12, scale: 0.35 }}
                    animate={{ rotate: a, scale: 1 }}
                    transition={{ type: "spring", stiffness: 170, damping: 11, delay: reduced ? 0 : 0.25 + k * 0.07 }}
                  >
                    <svg width={20} height={16} viewBox="0 0 20 16" className="absolute left-[1px] top-[-8px] overflow-visible">
                      <defs>
                        <radialGradient id={`${uid}-petal-${k}`} cx="0.15" cy="0.5" r="0.95">
                          <stop offset="0" stopColor="#ffd1e3" />
                          <stop offset="0.55" stopColor="#ff8fbf" />
                          <stop offset="1" stopColor="#f2569b" />
                        </radialGradient>
                      </defs>
                      <path d="M0 8 C 2 1, 13 -1.5, 18.5 3.5 Q 20.5 8, 18.5 12.5 C 13 17.5, 2 15, 0 8 Z" fill={`url(#${uid}-petal-${k})`} />
                      <path d="M2 8 L 14 8" stroke="rgba(255,255,255,.45)" strokeWidth={0.7} strokeLinecap="round" />
                    </svg>
                  </motion.div>
                );
              })}
              <motion.span
                className="absolute left-0 top-0 -ml-[6px] -mt-[6px] block h-3 w-3 rounded-full"
                style={{ background: "radial-gradient(circle at 35% 35%, #fff3a3, #ffd43b 55%, #f59f00)" }}
                initial={{ scale: reduced ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 14, delay: reduced ? 0 : 0.65 }}
              />
            </motion.div>
            {!reduced &&
              pollen.map((p, i) => (
                <motion.span
                  key={i}
                  className="absolute left-0 top-0 block rounded-full bg-[#ffd43b]"
                  style={{ width: p.s, height: p.s, marginLeft: -p.s / 2, marginTop: -p.s / 2 }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: p.dx, y: p.dy, opacity: [0, 1, 0] }}
                  transition={{ duration: p.d + 0.6, delay: 0.7 + i * 0.05, ease: [0.2, 0.6, 0.4, 1] }}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```
