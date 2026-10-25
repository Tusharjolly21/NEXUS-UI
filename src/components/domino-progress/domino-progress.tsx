"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useMotionValue, type MotionValue } from "framer-motion";

const STEPS = [
  { name: "Build", doing: "Building" },
  { name: "Test", doing: "Running tests" },
  { name: "Upload", doing: "Uploading" },
  { name: "Verify", doing: "Verifying" },
  { name: "Live", doing: "Going live" },
];
const N = STEPS.length;
// domino geometry, in floor pixels (x runs along the line, y across it, z up)
const T = 15, W = 46, H = 90, S = 56, X0 = 34, Y0 = 34;
const FW = 470, FH = 150;
const GAP_OPEN = H + T + 46 - S; // far enough that a falling tile cannot reach
const GAP_TOUCH = H + T + 2 - S; // slid in until it touches the flat tile
const TILT = 57, TURN = -34, PERSP = 1300; // camera: floor rotateX / rotateZ in degrees
const SCENE_W = 420, SCENE_H = 232;
const FCX = SCENE_W / 2 + 30, FCY = SCENE_H / 2 + 12; // floor centre = perspective origin
const D2R = Math.PI / 180;

/** floor point -> scene pixels, mirroring the CSS transform chain */
function project(x: number, y: number, z = 0) {
  let px = x - FW / 2, py = y - FH / 2, pz = z;
  const a = TURN * D2R, b = TILT * D2R;
  [px, py] = [px * Math.cos(a) - py * Math.sin(a), px * Math.sin(a) + py * Math.cos(a)];
  [py, pz] = [py * Math.cos(b) - pz * Math.sin(b), py * Math.sin(b) + pz * Math.cos(b)];
  const k = PERSP / (PERSP - pz);
  return [FCX + px * k, FCY + py * k] as const;
}

type Gap = { idx: number; x: number; v: number; target: number; bumped: boolean };

const ICONS: ReactNode[] = [
  <g key="b"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M4 7.5l8 4.5 8-4.5M12 12v9" /></g>,
  <g key="t"><path d="M9 3h6M10 3v6.2L4.8 18.4A1.7 1.7 0 006.3 21h11.4a1.7 1.7 0 001.5-2.6L14 9.2V3" /><path d="M7.2 15h9.6" /></g>,
  <g key="u"><path d="M12 15V4M7 8.5L12 4l5 4.5" /><path d="M4.5 14v4.2c0 1 .8 1.8 1.8 1.8h11.4c1 0 1.8-.8 1.8-1.8V14" /></g>,
  <g key="v"><path d="M12 3l7.5 3v5.6c0 4.6-3.2 8.2-7.5 9.4-4.3-1.2-7.5-4.8-7.5-9.4V6L12 3z" /><path d="M8.6 12.2l2.4 2.4 4.5-4.6" /></g>,
  <g key="l"><circle cx="12" cy="12" r="2.2" /><path d="M7.6 7.6a6.2 6.2 0 000 8.8M16.4 7.6a6.2 6.2 0 010 8.8M4.8 4.8a10.2 10.2 0 000 14.4M19.2 4.8a10.2 10.2 0 010 14.4" /></g>,
];
// pip positions on a 3x3 grid, classic domino layouts
const PIPS: [number, number][][] = [
  [[1, 1]],
  [[0, 0], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 0], [2, 0], [0, 2], [2, 2]],
  [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
];

function hull(pts: [number, number][]) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [], up: [number, number][] = [];
  for (const q of p) { while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  const h = lo.slice(0, -1).concat(up.slice(0, -1));
  return "M" + h.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join("L") + "Z";
}

const face = "absolute [backface-visibility:hidden]";

function Domino({ i, rot, off, state }: { i: number; rot: MotionValue<number>; off: MotionValue<number>; state: "todo" | "active" | "done" }) {
  const live = i === N - 1;
  const lit = live && state === "done";
  const ink = state === "active" ? "#0071e3" : lit ? "#ffffff" : state === "done" ? (live ? "#fff" : "#1d1d1f") : "#86868b";
  const faceBg = lit ? "linear-gradient(160deg,#5fe08a,#24b14e)" : live ? "linear-gradient(160deg,#f6fff8,#e3f6e8)" : "linear-gradient(160deg,#ffffff,#eef0f3)";
  return (
    <motion.div className="absolute" style={{ left: X0 + i * S - T / 2, top: Y0, width: T, height: W, transformStyle: "preserve-3d", x: off }}>
      {/* active glow on the floor */}
      <motion.div
        className="absolute rounded-full"
        style={{ left: -26, top: -14, width: T + 52, height: W + 28, background: "radial-gradient(closest-side, rgba(0,113,227,.35), rgba(0,113,227,0))" }}
        initial={false}
        animate={state === "active" ? { opacity: [0.55, 1, 0.55], scale: [0.95, 1.05, 0.95] } : { opacity: 0, scale: 0.8 }}
        transition={state === "active" ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      />
      {/* the tile, tipping about its front bottom edge */}
      <motion.div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transformOrigin: "100% 50% 0px", rotateY: rot }}>
        {/* top */}
        <div className={face} style={{ left: 0, top: 0, width: T, height: W, transform: `translateZ(${H}px)`, background: lit ? "#46cf73" : "#ffffff", borderRadius: 3 }} />
        {/* bottom (shows when the tile lies on its back) */}
        <div className={face} style={{ left: 0, top: 0, width: T, height: W, transform: "rotateY(180deg)", background: "#d9dce1" }} />
        {/* far side */}
        <div className={face} style={{ left: 0, top: 0, width: T, height: H, transformOrigin: "0 0", transform: "rotateX(90deg)", background: "#e4e6ea" }} />
        {/* near side */}
        <div className={face} style={{ left: 0, top: W - H, width: T, height: H, transformOrigin: "0 100%", transform: "rotateX(-90deg)", background: lit ? "linear-gradient(#36b860,#2a9d50)" : "linear-gradient(#e9ebef,#d3d6dc)", borderRadius: 2 }} />
        {/* front (+x), faces the next tile */}
        <div className={face} style={{ left: T, top: 0, width: W, height: H, transformOrigin: "0 0", transform: "rotateZ(90deg) rotateX(90deg)", background: "#cfd3d9" }} />
        {/* back (-x): the printed face the viewer sees */}
        <div
          className={`${face} flex flex-col items-center overflow-hidden`}
          style={{
            left: 0, top: -H, width: W, height: H, transformOrigin: "0 100%", transform: "rotateZ(90deg) rotateX(-90deg)",
            background: faceBg, borderRadius: 5,
            boxShadow: state === "active" ? "inset 0 0 0 2px #0071e3, inset 0 1px 0 #fff" : "inset 0 0 0 1px rgba(0,0,0,.07), inset 0 1px 0 #fff",
          }}
        >
          <div className="flex h-1/2 w-full items-center justify-center">
            {lit && <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transition: "stroke .3s", display: lit ? "none" : undefined }}>
              {lit ? null : ICONS[i]}
            </svg>
          </div>
          <div className="h-[2px] w-[70%] rounded-full" style={{ background: lit ? "rgba(255,255,255,.6)" : "rgba(0,0,0,.12)" }} />
          <div className="relative h-1/2 w-full">
            {PIPS[i].map(([cx, cy]) => (
              <span key={`${cx}${cy}`} className="absolute h-[7px] w-[7px] rounded-full" style={{ left: 9 + cx * 10.5, top: 8 + cy * 10.5, background: lit ? "#fff" : state === "active" ? "#0071e3" : "#1d1d1f", boxShadow: lit ? "none" : "inset 0 1px 1px rgba(0,0,0,.35)" }} />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * A deploy pipeline as a line of standing dominoes. Each completed step tips the
 * current tile over onto the next, which wobbles from the hit and lights up as
 * the active step. Pause opens a gap so the falling tile lands flat on the
 * table; Resume slides the next tile in and the chain carries on to Live.
 */
export interface DominoProgressProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function DominoProgress({ autoplay = false, className = "" }: DominoProgressProps) {
  const uid = useId().replace(/:/g, "");
  const rots = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const offs = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const shadowCast = useRef<(SVGPathElement | null)[]>([]);
  const shadowFoot = useRef<(SVGPathElement | null)[]>([]);
  const labels = useRef<(HTMLSpanElement | null)[]>([]);
  const marker = useRef<HTMLDivElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const resumeBtn = useRef<HTMLButtonElement>(null);

  const [done, setDone] = useState(0); // completed steps
  const [paused, setPaused] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [falling, setFalling] = useState(false);
  const st = useRef({ done: 0, paused: false, blocked: false, busy: false, falling: false });
  useLayoutEffect(() => { st.current = { done, paused, blocked, busy, falling }; });
  const touched = useRef(false);

  // physics state
  const sim = useRef({
    th: Array(N).fill(0) as number[],
    om: Array(N).fill(0) as number[],
    mode: Array(N).fill("stand") as ("stand" | "fall" | "rise")[],
    hit: Array(N).fill(false) as boolean[],
    gaps: [] as Gap[],
    onHit: (() => {}) as (i: number) => void,
    onFloor: (() => {}) as (i: number) => void,
    onSlotIn: (() => {}) as (i: number) => void,
  });
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  // responsive scale
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const geo = useRef({ w: SCENE_W, sc: 1 });
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      const sc = Math.min(1, el.offsetWidth / SCENE_W);
      geo.current = { w: el.offsetWidth, sc };
      setScale(sc);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // rAF physics: gravity, contacts between tiles, floor, gaps sliding on springs
  useEffect(() => {
    const s = sim.current;
    const offOf = (j: number) => s.gaps.reduce((a, g) => (g.idx < j ? a + g.x : a), 0);
    const pivot = (j: number) => X0 + j * S + T / 2 + offOf(j);
    const limit = (i: number) => {
      let lim = 90 * D2R;
      const j = i + 1;
      if (j >= N) return lim;
      const pi = pivot(i), pj = pivot(j), f = s.th[j];
      const nx = -Math.cos(f), nz = Math.sin(f), dx = Math.sin(f), dz = Math.cos(f);
      const bx = pj - T * Math.cos(f), bz = T * Math.sin(f);
      const g = (a: number) => (pi + H * Math.sin(a) - bx) * nx + (H * Math.cos(a) - bz) * nz;
      if (g(lim) < 0 && g(0) > 0) {
        let lo = 0, hi = lim;
        for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (g(m) > 0) lo = m; else hi = m; }
        const qs = (pi + H * Math.sin(hi) - bx) * dx + (H * Math.cos(hi) - bz) * dz;
        if (qs >= -1 && qs <= H + 1) lim = hi;
      }
      for (const [px, pz] of [[bx, bz], [bx + H * dx, bz + H * dz]]) {
        const ex = px - pi;
        if (ex > 0 && Math.hypot(ex, pz) <= H) lim = Math.min(lim, Math.atan2(ex, pz));
      }
      return lim;
    };
    const toStage = (x: number, y: number) => [geo.current.w / 2 + (x - SCENE_W / 2) * geo.current.sc, y * geo.current.sc] as const;
    const prevLim = Array(N).fill(90 * D2R) as number[];
    let raf = 0, last = performance.now();
    const step = (dt: number) => {
      for (const g of s.gaps) {
        g.v += (-130 * (g.x - g.target) - 17 * g.v) * dt;
        g.x += g.v * dt;
        if (g.target === GAP_TOUCH && g.x < GAP_TOUCH) {
          g.x = GAP_TOUCH;
          if (!g.bumped) { g.bumped = true; s.om[g.idx + 1] -= Math.min(2.2, Math.abs(g.v) * 0.02 + 1); s.onSlotIn(g.idx + 1); }
          g.v = 0;
        }
      }
      for (let i = 0; i < N; i++) {
        const m = s.mode[i];
        let a = 0;
        if (m === "fall") a = 46 * Math.sin(s.th[i] + 0.16) - 0.4 * s.om[i];
        else if (m === "stand") a = -300 * s.th[i] - 7 * s.om[i];
        else a = -150 * s.th[i] - 15 * s.om[i];
        s.om[i] += a * dt;
        s.th[i] += s.om[i] * dt;
      }
      for (let i = N - 1; i >= 0; i--) {
        const lim = limit(i);
        const limV = (lim - prevLim[i]) / dt;
        prevLim[i] = lim;
        if (s.th[i] > lim) {
          const rel = s.om[i] - limV;
          s.th[i] = lim;
          if (rel > 1.2) {
            const j = i + 1;
            if (lim < 89 * D2R && j < N && s.mode[j] === "stand") {
              s.om[j] += rel * 0.2;
              if (!s.hit[i]) { s.hit[i] = true; s.onHit(i); }
            } else if (lim >= 89.5 * D2R && !s.hit[i]) { s.hit[i] = true; s.onFloor(i); }
            s.om[i] = limV - rel * 0.22;
          } else s.om[i] = Math.min(s.om[i], limV);
        }
        if (s.th[i] < -0.35) { s.th[i] = -0.35; s.om[i] = 0; }
      }
    };
    const shadow = (i: number) => {
      const th = s.th[i], c = Math.cos(th), sn = Math.sin(th);
      const left = X0 + i * S - T / 2 + offOf(i);
      const cast: [number, number][] = [], foot: [number, number][] = [];
      for (const x of [0, T]) for (const z of [0, H]) {
        const xr = T + (x - T) * c + z * sn, zr = -(x - T) * sn + z * c;
        for (const y of [0, W]) {
          cast.push([left + xr + zr * 0.2, Y0 + y + zr * 0.36]);
          foot.push([left + xr, Y0 + y]);
        }
      }
      shadowCast.current[i]?.setAttribute("d", hull(cast));
      shadowFoot.current[i]?.setAttribute("d", hull(foot));
    };
    const frame = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const sub = 4;
      for (let k = 0; k < sub; k++) step(dt / sub);
      for (let i = 0; i < N; i++) {
        rots[i].set(s.th[i] / D2R);
        offs[i].set(offOf(i));
        shadow(i);
        const [lx, ly] = toStage(...project(X0 + i * S + offOf(i) - 2, Y0 + W + 14));
        const el = labels.current[i];
        if (el) el.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) translateX(-50%)`;
      }
      const g = s.gaps[s.gaps.length - 1];
      if (g && marker.current) {
        const a = pivot(g.idx) + H * Math.sin(Math.max(0, s.th[g.idx])), b = pivot(g.idx + 1) - T;
        const [mx, my] = toStage(...project((a + b) / 2, Y0 + W * 0.2, H * 1.12));
        marker.current.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // sim callbacks need fresh setters; they only call setState
  useLayoutEffect(() => {
    sim.current.onHit = (i) => { if (i === st.current.done - 1) setFalling(false); };
    sim.current.onFloor = (i) => {
      if (i === N - 1) { setFalling(false); return; }
      if (st.current.paused) { setBlocked(true); setFalling(false); }
    };
    sim.current.onSlotIn = () => {
      if (document.activeElement === resumeBtn.current) nextBtn.current?.focus();
      setPaused(false); setBlocked(false); setBusy(false);
    };
  });

  const next = () => {
    const c = st.current;
    if (c.busy || c.blocked || c.falling || c.done >= N) return;
    const s = sim.current;
    const i = c.done;
    s.mode[i] = "fall";
    s.om[i] = Math.max(s.om[i], 2.2);
    s.hit[i] = false;
    setFalling(true);
    setDone(i + 1);
  };
  const pause = () => {
    const c = st.current;
    if (c.busy || c.paused || c.falling || c.done > N - 3) return;
    const s = sim.current;
    s.gaps = s.gaps.filter((g) => g.target !== 0 || Math.abs(g.x) > 0.5);
    s.gaps.push({ idx: c.done, x: 0, v: 0, target: GAP_OPEN, bumped: false });
    setPaused(true);
  };
  const resume = () => {
    const c = st.current;
    if (!c.paused || c.busy) return;
    const s = sim.current;
    const g = s.gaps[s.gaps.length - 1];
    if (!g) { setPaused(false); return; }
    if (c.blocked) { g.target = GAP_TOUCH; setBusy(true); }
    else {
      g.target = 0;
      if (document.activeElement === resumeBtn.current) nextBtn.current?.focus();
      setPaused(false);
    }
  };
  const reset = () => {
    if (st.current.busy || (st.current.done === 0 && !st.current.paused)) return;
    const s = sim.current;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBusy(true);
    let k = 0;
    for (let i = N - 1; i >= 0; i--) {
      if (s.th[i] < 0.05 && s.mode[i] === "stand") continue;
      const idx = i;
      later(() => { s.mode[idx] = "rise"; s.hit[idx] = false; }, k++ * 95);
    }
    const total = k * 95;
    later(() => { for (const g of s.gaps) g.target = 0; }, total + 380);
    later(() => {
      for (let i = 0; i < N; i++) s.mode[i] = "stand";
      s.gaps = [];
      for (let i = 0; i < N; i++) offs[i].set(0);
      setBusy(false);
    }, total + 1250);
    setDone(0); setPaused(false); setBlocked(false); setFalling(false);
  };

  // autoplay loop: two steps, a gap at step 3, resume, finish, ripple back up
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const ids: number[] = [];
    const run = () => {
      const plan: [number, () => void][] = [
        [900, next], [2100, next], [3300, pause], [4100, next], [5900, resume], [7300, next], [8500, next], [10600, reset], [12200, run],
      ];
      for (const [t, fn] of plan) ids.push(window.setTimeout(() => { if (alive && !touched.current) fn(); }, t));
    };
    run();
    return () => { alive = false; ids.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const active = done < N && !blocked && !falling ? done : -1;
  const stateOf = (i: number): "todo" | "active" | "done" =>
    i < done - 1 ? "done" : i === done - 1 ? (falling && i === N - 1 ? "active" : "done") : i === active ? "active" : "todo";
  const pct = Math.round((done / N) * 100);
  const isLive = done === N && !falling;
  const status = isLive
    ? "Live on nexus-ui.com"
    : paused
      ? "Paused: waiting for review"
      : falling
        ? `${STEPS[done - 1].name} complete`
        : `${STEPS[done].doing}...`;

  const btn = "h-9 rounded-full px-4 text-[13px] font-medium outline-none transition-[background-color,opacity,transform] active:scale-[.97] aria-disabled:cursor-default aria-disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

  return (
    <div
      className={`w-full max-w-[560px] rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Deploying nexus-ui</div>
          <div className="truncate text-[12px] text-[#6e6e73]">main · 3f2a9c1 · Production</div>
        </div>
        <div className="flex-none text-right">
          <div className="text-[22px] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[#1d1d1f]">{pct}%</div>
          <div className="mt-1 text-[12px] tabular-nums text-[#6e6e73]">{Math.min(done + (isLive ? 0 : 1), N)} of {N}</div>
        </div>
      </div>

      <div
        ref={stage}
        role="progressbar"
        aria-label="Deploy progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${done} of ${N} steps complete. ${status}`}
        className="relative -mx-2 mt-1 flex justify-center overflow-hidden"
        style={{ height: SCENE_H * scale }}
      >
        <div className="relative flex-none" style={{ width: SCENE_W, height: SCENE_H, transform: `scale(${scale})`, transformOrigin: "50% 0", perspective: PERSP, perspectiveOrigin: `${FCX}px ${FCY}px` }}>
          <div
            className="absolute"
            style={{ left: FCX - FW / 2, top: FCY - FH / 2, width: FW, height: FH, transformStyle: "preserve-3d", transform: `rotateX(${TILT}deg) rotateZ(${TURN}deg)` }}
          >
            <svg className="absolute left-0 top-0 overflow-visible" width={FW} height={FH} aria-hidden="true">
              <defs>
                <radialGradient id={`${uid}m`} cx="50%" cy="45%" r="55%">
                  <stop offset="0" stopColor="#eef0f3" />
                  <stop offset="0.65" stopColor="#f5f6f8" />
                  <stop offset="1" stopColor="#f4f5f7" stopOpacity="0" />
                </radialGradient>
                <filter id={`${uid}b`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
                <filter id={`${uid}f`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6" /></filter>
              </defs>
              <ellipse cx={FW / 2 - 6} cy={Y0 + W / 2 + 6} rx={FW / 2 - 12} ry={FH / 2 + 6} fill={`url(#${uid}m)`} />
              <g filter={`url(#${uid}b)`} fill="rgba(30,35,50,.16)">
                {STEPS.map((s, i) => <path key={s.name} ref={(el) => { shadowCast.current[i] = el; }} />)}
              </g>
              <g filter={`url(#${uid}f)`} fill="rgba(30,35,50,.22)">
                {STEPS.map((s, i) => <path key={s.name} ref={(el) => { shadowFoot.current[i] = el; }} />)}
              </g>
            </svg>
            {isLive && (
              <motion.div
                className="absolute rounded-full border-2 border-[#30d158]"
                style={{ left: X0 + (N - 1) * S + T / 2 + H / 2 - 40, top: Y0 + W / 2 - 40, width: 80, height: 80, x: offs[N - 1] }}
                initial={{ scale: 0.3, opacity: 0.9 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeOut", repeat: 1 }}
              />
            )}
            {STEPS.map((s, i) => (
              <Domino key={s.name} i={i} rot={rots[i]} off={offs[i]} state={stateOf(i)} />
            ))}
          </div>
        </div>
        {/* overlays drawn at screen scale so text stays crisp and legible when the scene shrinks */}
        <div className="pointer-events-none absolute inset-0">
          <div ref={marker} className="absolute left-0 top-0">
            <AnimatePresence>
              {paused && (
                <motion.div
                  className="absolute flex h-7 w-7 items-center justify-center gap-[3px] rounded-full bg-white shadow-[0_0_0_1.5px_#ff9f0a,0_8px_16px_-8px_rgba(255,159,10,.8)]"
                  style={{ left: -14, top: -14 }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ scale: { type: "spring", stiffness: 500, damping: 18 }, y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <span className="h-[10px] w-[3px] rounded-full bg-[#ff9f0a]" />
                  <span className="h-[10px] w-[3px] rounded-full bg-[#ff9f0a]" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* step names, flat to the screen, pinned under each tile's base */}
          {STEPS.map((s, i) => {
            const st = stateOf(i);
            return (
              <span
                key={s.name}
                ref={(el) => { labels.current[i] = el; }}
                className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[12px] tracking-[-0.01em] transition-colors duration-300 ${st === "active" ? "font-semibold text-[#0071e3]" : st === "done" ? (i === N - 1 ? "font-semibold text-[#1a8f3c]" : "font-medium text-[#1d1d1f]") : "text-[#6e6e73]"}`}
                style={{ willChange: "transform" }}
              >
                {s.name}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-1 flex min-h-[36px] items-center justify-between gap-3" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={paused ? "p" : isLive ? "l" : "r"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            className="flex min-w-0 items-center gap-2"
          >
            <span className={`h-2 w-2 flex-none rounded-full ${paused ? "bg-[#ff9f0a]" : isLive ? "bg-[#30d158]" : "bg-[#0071e3]"}`} />
            <span className={`text-[13px] font-medium leading-[1.25] ${paused ? "text-[#a35b00]" : isLive ? "text-[#1a8f3c]" : "text-[#1d1d1f]"}`}>{status}</span>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence>
          {paused && (
            <motion.button
              key="resume"
              type="button"
              ref={resumeBtn}
              onClick={resume}
              aria-disabled={busy}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 600, damping: 26 }}
              className={`${btn} flex-none bg-[#ff9f0a]/15 text-[#8a4d00] hover:bg-[#ff9f0a]/25`}
            >
              Resume
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button ref={nextBtn} type="button" onClick={next} aria-disabled={busy || blocked || falling || done >= N} className={`${btn} bg-[#0071e3] text-white hover:bg-[#0077ed] aria-disabled:hover:bg-[#0071e3]`}>Next step</button>
        <button type="button" onClick={pause} aria-disabled={busy || paused || falling || done > N - 3} className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebef] aria-disabled:hover:bg-[#f5f5f7]`}>Pause</button>
        <button type="button" onClick={reset} aria-disabled={busy || (done === 0 && !paused)} className={`${btn} bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebef] aria-disabled:hover:bg-[#f5f5f7]`}>Reset</button>
      </div>
      <p className="mt-3 text-[12px] text-[#6e6e73]">Next step tips the current tile. Pause opens a gap in the line.</p>
    </div>
  );
}
