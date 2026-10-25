# Dart Rating

Add the "Dart Rating" component from Nexus UI to my project.

Rate something from 1 to 10 by throwing a dart. Press and hold on the board to aim: the reticle wobbles more the longer you hold while a power meter fills, and letting go throws. The ring the dart lands in is the rating, a score and a word appear under the board, and throwing again pulls the old dart out. Number and arrow keys throw a perfect dart straight to that ring, and the board is a real slider for screen readers.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { DartRating } from "@/components/dart-rating";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/dart-rating/dart-rating.tsx ---

```tsx
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VW = 300, VH = 344;
const CX = 150, CY = 134, R = 110, RIM = 12;
const REST = { x: 150, y: 276 };
const RW = R / 10; // ring width
const FILLS = ["#f5f5f7", "#e8e8ed", "#f5f5f7", "#e8e8ed", "#e6f0fd", "#cfe3fc", "#a9cdfa", "#7fb4f6", "#4b95ef", "#0071e3"];
const WORDS = ["", "Terrible", "Bad", "Poor", "Meh", "Okay", "Decent", "Good", "Great", "Excellent", "Perfect"];
const TONE = (k: number) => (k <= 3 ? "#d70015" : k <= 5 ? "#b25000" : k <= 9 ? "#248a3d" : "#0071e3");
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const outerR = (k: number) => R * (11 - k) / 10;

type Phase = "idle" | "aim" | "fly" | "miss";
type Stuck = { x: number; y: number; ang: number };

function scoreAt(x: number, y: number) {
  const d = Math.hypot(x - CX, y - CY);
  if (d > R + RIM) return 0;
  if (d > R) return 1;
  return clamp(10 - Math.floor(d / RW), 1, 10);
}
/** A point in the middle of ring k, away from the number column. */
function ringPoint(k: number) {
  const rr = k === 10 ? Math.random() * 3 : outerR(k) - RW / 2;
  const a = (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 1.9); // radians from straight up
  return { x: CX + Math.sin(a) * rr, y: CY - Math.cos(a) * rr };
}
const pointAngle = (from: { x: number; y: number }, to: { x: number; y: number }) => (Math.atan2(to.x - from.x, from.y - to.y) * 180) / Math.PI;
const annulus = (k: number) => {
  const a = outerR(k), b = k === 10 ? 0 : outerR(k + 1);
  const c = (r: number) => `M${CX - r} ${CY}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  return c(a) + (b ? c(b) : "");
};

function Dart({ uid, shadow = false }: { uid: string; shadow?: boolean }) {
  return (
    <g>
      {shadow && <path d="M0 0 L3.8 14 V32 L12.5 59 L10.5 67 L0 60.5 L-10.5 67 L-12.5 59 L-3.8 32 V14 Z" transform="translate(3 4)" fill="#0b2a55" opacity={0.16} />}
      <path d="M0 0 L1.4 13 H-1.4 Z" fill="#8e8e93" />
      <rect x={-3.8} y={12} width={7.6} height={20} rx={3.2} fill={`url(#${uid}barrel)`} />
      {[16.5, 20.5, 24.5, 28.5].map((y) => <rect key={y} x={-3.6} y={y} width={7.2} height={1} fill="rgba(0,0,0,.2)" />)}
      <rect x={-1.4} y={31} width={2.8} height={15} rx={1} fill="#3a3a3c" />
      <path d="M0 41 L-12.5 59 L-10.5 67 L0 60.5 L10.5 67 L12.5 59 Z" fill={`url(#${uid}flight)`} />
      <path d="M0 42 V63" stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.75} />
    </g>
  );
}

/**
 * Rate it 1 to 10 by throwing a dart. Press and hold on the board to aim: the
 * reticle wobbles more the longer you hold while the power meter fills, and
 * releasing throws. The ring you hit is your rating; throwing again pulls the
 * old dart out. Number keys and arrow keys throw a perfect dart straight to
 * that ring.
 */
export interface DartRatingProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function DartRating({ autoplay = false, className = "" }: DartRatingProps) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  const boardRef = useRef<SVGGElement>(null);
  const handRef = useRef<SVGGElement>(null);
  const stuckRef = useRef<SVGGElement>(null);
  const reticleRef = useRef<SVGGElement>(null);
  const reticleRing = useRef<SVGCircleElement>(null);
  const powerRef = useRef<SVGRectElement>(null);
  const st = useRef({
    phase: "idle" as Phase, hold: 0, power: 0, amp: 0, wob: { x: 0, y: 0 },
    aim: { x: CX, y: CY }, goal: { x: CX, y: CY }, perfect: false, calm: 1,
    fly: { x0: 0, y0: 0, x1: 0, y1: 0, cx: 0, cy: 0, t: 0, a0: 0, a1: 0, dur: 0.42 },
    stuck: null as Stuck | null, quiver: 99, shake: 99, spawn: 99, miss: { x: 0, y: 0, vx: 0, vy: 0, r: 0, t: 0 },
    drag: null as null | { id: number; onBoard: boolean; sx: number; sy: number; gx: number; gy: number },
  });
  const [rating, setRating] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const [leaving, setLeaving] = useState<(Stuck & { id: number })[]>([]);
  const [status, setStatus] = useState("");
  const touched = useRef(false);
  const ratingRef = useRef<number | null>(null);
  useLayoutEffect(() => { ratingRef.current = rating; });
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);
  const landRef = useRef<(x: number, y: number) => void>(() => {});
  const missRef = useRef<() => void>(() => {});

  const pullOut = () => {
    const s = st.current;
    if (!s.stuck) return;
    const id = nextId.current++;
    const old = s.stuck;
    s.stuck = null;
    setLeaving((l) => [...l, { ...old, id }]);
    timers.current.push(window.setTimeout(() => setLeaving((l) => l.filter((x) => x.id !== id)), 650));
  };

  useLayoutEffect(() => {
    landRef.current = (x: number, y: number) => {
      const s = st.current;
      const k = scoreAt(x, y);
      pullOut();
      s.stuck = { x, y, ang: pointAngle(REST, { x, y }) * 0.45 };
      s.quiver = 0; s.shake = 0; s.spawn = 0;
      s.phase = "idle";
      setRating(k);
      setShot((n) => n + 1);
      setStatus(`${k} out of 10, ${WORDS[k]}`);
    };
    missRef.current = () => { setStatus("Missed the board. Try again."); };
  });

  const release = () => {
    const s = st.current;
    if (s.phase !== "aim") return;
    const drop = s.perfect ? 0 : (1 - s.power) ** 2 * 34;
    const hx = s.perfect ? s.goal.x : s.aim.x + s.wob.x;
    const hy = s.perfect ? s.goal.y : s.aim.y + s.wob.y + drop;
    const a0 = pointAngle(REST, s.aim);
    const top = Math.min(REST.y, hy) - 46 - s.power * 26;
    s.fly = { x0: REST.x, y0: REST.y + s.power * 8, x1: hx, y1: hy, cx: (REST.x + hx) / 2, cy: top, t: 0, a0, a1: pointAngle(REST, { x: hx, y: hy }) * 0.45, dur: 0.36 + (1 - s.power) * 0.12 };
    s.phase = "fly";
    s.drag = null;
  };

  const startAim = (goal: { x: number; y: number }, perfect: boolean, calm = 1) => {
    const s = st.current;
    if (s.phase === "fly" || s.phase === "aim") return false;
    s.phase = "aim"; s.hold = 0; s.power = 0; s.perfect = perfect; s.calm = calm;
    s.goal = goal; s.spawn = Math.max(s.spawn, 1);
    if (!perfect) s.aim = { ...goal };
    return true;
  };

  const throwTo = (k: number) => {
    const s = st.current;
    if (s.phase === "fly" || s.phase === "aim") return;
    const p = ringPoint(k);
    if (!startAim(p, true, 0.2)) return;
    s.aim = { ...p };
    s.hold = 0.55; s.power = 0.85;
    timers.current.push(window.setTimeout(release, 160));
  };

  const reset = () => {
    pullOut();
    setRating(null);
    setStatus("Rating cleared");
  };

  useEffect(() => {
    let raf = 0, last = performance.now(), T = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      T += dt;
      const s = st.current;
      // board shake on impact
      s.shake += dt;
      const sh = 3.2 * Math.exp(-s.shake * 10) * Math.sin(s.shake * 55);
      boardRef.current?.setAttribute("transform", `translate(${(sh * 0.3).toFixed(2)} ${(-sh).toFixed(2)})`);

      // aim smoothing
      s.aim.x += (s.goal.x - s.aim.x) * Math.min(1, dt * 14);
      s.aim.y += (s.goal.y - s.aim.y) * Math.min(1, dt * 14);

      const hand = handRef.current;
      if (s.phase === "aim") {
        s.hold += dt;
        s.power = Math.min(1, s.power + dt / 0.8);
        // steadiness: a Lissajous wobble that grows the longer you hold
        s.amp = (1.8 + 26 * Math.pow(clamp((s.hold - 0.55) / 2.4, 0, 1), 1.35)) * s.calm;
        s.wob.x = s.amp * Math.sin(T * 7.3 + 0.4) + Math.sin(T * 23) * 0.5;
        s.wob.y = s.amp * Math.sin(T * 10.1) * 0.85 + Math.cos(T * 19) * 0.5;
      } else s.amp *= 0.9;
      const rx = s.aim.x + s.wob.x, ry = s.aim.y + s.wob.y;
      const ret = reticleRef.current;
      if (ret) {
        ret.setAttribute("transform", `translate(${rx.toFixed(2)} ${ry.toFixed(2)})`);
        ret.style.opacity = s.phase === "aim" ? "1" : "0";
      }
      const shaky = clamp(s.amp / 20, 0, 1);
      if (reticleRing.current) {
        reticleRing.current.setAttribute("r", (8 + s.amp * 0.35).toFixed(2));
        reticleRing.current.setAttribute("stroke", shaky > 0.55 ? "#ff9f0a" : "#0071e3");
      }
      if (powerRef.current) {
        const p = s.phase === "aim" ? s.power : Math.max(0, Number(powerRef.current.dataset.p || 0) - dt * 3);
        powerRef.current.dataset.p = String(p);
        powerRef.current.setAttribute("height", (52 * p).toFixed(2));
        powerRef.current.setAttribute("y", (334 - 52 * p).toFixed(2));
      }

      if (hand) {
        if (s.phase === "fly") {
          const f = s.fly;
          f.t = Math.min(1, f.t + dt / f.dur);
          const p = 1 - Math.pow(1 - f.t, 1.35); // a dart sheds a little speed in the air
          const x = (1 - p) ** 2 * f.x0 + 2 * (1 - p) * p * f.cx + p * p * f.x1;
          const y = (1 - p) ** 2 * f.y0 + 2 * (1 - p) * p * f.cy + p * p * f.y1;
          const sc = 1 - 0.28 * p, sy = 1 - 0.4 * p;
          const ang = f.a0 + (f.a1 - f.a0) * p;
          hand.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(2)}) scale(${sc.toFixed(3)} ${(sc * sy).toFixed(3)})`);
          hand.style.opacity = "1";
          if (f.t >= 1) {
            if (scoreAt(f.x1, f.y1) > 0) landRef.current(f.x1, f.y1);
            else { s.phase = "miss"; s.miss = { x: f.x1, y: f.y1, vx: (f.x1 - CX) * 0.8, vy: -60, r: f.a1, t: 0 }; missRef.current(); }
          }
        } else if (s.phase === "miss") {
          const m = s.miss;
          m.t += dt; m.vy += 1400 * dt; m.x += m.vx * dt; m.y += m.vy * dt; m.r += (m.vx > 0 ? 1 : -1) * 260 * dt;
          hand.setAttribute("transform", `translate(${m.x.toFixed(2)} ${m.y.toFixed(2)}) rotate(${m.r.toFixed(2)}) scale(0.62 0.4)`);
          hand.style.opacity = String(clamp(1 - m.t * 1.8, 0, 1));
          if (m.t > 0.6) { s.phase = "idle"; s.spawn = 0; }
        } else {
          // the next dart springs up into the hand; while aiming it points at the reticle and draws back
          s.spawn += dt;
          const e = s.spawn > 5 ? 1 : 1 - Math.exp(-s.spawn * 9) * Math.cos(s.spawn * 13);
          const pull = s.phase === "aim" ? s.power * 8 : 0;
          const ang = s.phase === "aim" ? pointAngle(REST, { x: rx, y: ry }) * 0.8 : Math.sin(T * 1.6) * 1.5;
          hand.setAttribute("transform", `translate(${REST.x} ${(REST.y + pull + (1 - e) * 60).toFixed(2)}) rotate(${ang.toFixed(2)})`);
          hand.style.opacity = String(clamp(s.spawn * 5, 0, 1));
        }
      }

      const stk = stuckRef.current;
      if (stk) {
        if (s.stuck) {
          s.quiver += dt;
          const q = Math.exp(-s.quiver * 5.2) * Math.sin(s.quiver * 42);
          const ang = s.stuck.ang + 11 * q;
          stk.setAttribute("transform", `translate(${s.stuck.x.toFixed(2)} ${s.stuck.y.toFixed(2)}) rotate(${ang.toFixed(2)}) scale(0.72 ${(0.72 * 0.6 * (1 + 0.06 * q)).toFixed(3)})`);
          stk.style.opacity = "1";
        } else stk.style.opacity = "0";
      }
    };
    raf = requestAnimationFrame(loop);
    const ts = timers.current;
    return () => { cancelAnimationFrame(raf); ts.forEach(clearTimeout); };
  }, []);

  // autoplay: throw a 6, then a 9, then clear the board
  useEffect(() => {
    if (!autoplay) return;
    let live = true;
    const ts: number[] = [];
    const wait = (ms: number) => new Promise<void>((r) => { ts.push(window.setTimeout(r, ms)); });
    const ok = () => live && !touched.current;
    (async () => {
      await wait(900);
      while (ok()) {
        for (const k of [6, 9]) {
          const p = ringPoint(k);
          startAim({ x: CX + (p.x - CX) * 0.3, y: CY + 46 }, true, 0.28);
          await wait(350); if (!ok()) return;
          st.current.goal = p;
          await wait(900); if (!ok()) return;
          release();
          await wait(2300); if (!ok()) return;
        }
        reset();
        await wait(1500);
      }
    })();
    return () => { live = false; ts.forEach(clearTimeout); };
  }, [autoplay]); // eslint-disable-line react-hooks/exhaustive-deps

  const toSvg = (e: RPointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * VW, y: ((e.clientY - r.top) / r.height) * VH };
  };
  const clampBoard = (p: { x: number; y: number }) => {
    const dx = p.x - CX, dy = p.y - CY, d = Math.hypot(dx, dy), m = R + RIM - 3;
    return d > m ? { x: CX + (dx / d) * m, y: CY + (dy / d) * m } : p;
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const p = toSvg(e);
    const onBoard = Math.hypot(p.x - CX, p.y - CY) <= R + RIM + 10;
    const goal = onBoard ? clampBoard(p) : { x: CX, y: CY };
    if (!startAim(goal, false)) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current.drag = { id: e.pointerId, onBoard, sx: p.x, sy: p.y, gx: goal.x, gy: goal.y };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = st.current.drag;
    if (!d || d.id !== e.pointerId) return;
    const p = toSvg(e);
    st.current.goal = clampBoard(d.onBoard ? p : { x: d.gx + (p.x - d.sx) * 1.2, y: d.gy + (p.y - d.sy) * 1.2 });
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = st.current.drag;
    if (!d || d.id !== e.pointerId) return;
    release();
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const cur = ratingRef.current;
    let k: number | null = null;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") k = cur === null ? 5 : Math.min(10, cur + 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") k = cur === null ? 5 : Math.max(1, cur - 1);
    else if (e.key === "Home") k = 1;
    else if (e.key === "End") k = 10;
    else if (/^[0-9]$/.test(e.key)) k = e.key === "0" ? 10 : Number(e.key);
    if (k === null) return;
    e.preventDefault();
    throwTo(k);
  };

  return (
    <div
      className={`w-full max-w-[440px] rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#1d1d1f]">How was your delivery?</h3>
          <p className="mt-0.5 text-[13px] text-[#6e6e73]">Order #4821 · arrived 12:40</p>
        </div>
        <div className="flex w-[96px] flex-none flex-col items-end" aria-hidden="true">
          <div className="flex items-baseline gap-1 leading-none">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={rating === null ? "none" : `${shot}`}
                initial={{ scale: 0.3, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.6, opacity: 0, transition: { duration: 0.12 } }}
                transition={{ type: "spring", stiffness: 520, damping: 13 }}
                className="inline-block origin-bottom text-[36px] font-semibold tabular-nums tracking-[-0.04em]"
                style={{ color: rating === null ? "#c7c7cc" : "#1d1d1f" }}
              >
                {rating ?? "–"}
              </motion.span>
            </AnimatePresence>
            <span className="text-[15px] font-medium tabular-nums text-[#6e6e73]">/ 10</span>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={rating === null ? "none" : `w${shot}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 0.1 } }}
              transition={{ type: "spring", stiffness: 420, damping: 22, delay: 0.06 }}
              className="mt-1 text-[13px] font-semibold"
              style={{ color: rating === null ? "#6e6e73" : TONE(rating) }}
            >
              {rating === null ? "Not rated" : WORDS[rating]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Delivery rating. Press and hold on the board to aim, release to throw. Number keys or arrow keys throw straight to a ring."
        aria-valuemin={1}
        aria-valuemax={10}
        aria-valuenow={rating ?? undefined}
        aria-valuetext={rating === null ? "Not rated" : `${rating} out of 10, ${WORDS[rating]}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onKeyDown={onKey}
        className="mx-auto mt-2 max-w-[340px] cursor-crosshair touch-none select-none rounded-[20px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <svg ref={svgRef} viewBox={`0 0 ${VW} ${VH}`} className="block w-full overflow-visible" aria-hidden="true">
          <defs>
            <radialGradient id={`${uid}rim`} cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dcdce1" /></radialGradient>
            <linearGradient id={`${uid}barrel`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8e8e93" /><stop offset="0.35" stopColor="#f2f2f7" /><stop offset="1" stopColor="#6e6e73" /></linearGradient>
            <linearGradient id={`${uid}flight`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffb340" /><stop offset="1" stopColor="#ff7a00" /></linearGradient>
            <radialGradient id={`${uid}sheen`} cx="0.35" cy="0.25" r="0.75"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.6" stopColor="#fff" stopOpacity="0" /></radialGradient>
            <filter id={`${uid}sh`} x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="9" floodColor="#000" floodOpacity="0.16" /></filter>
          </defs>

          <g ref={boardRef}>
            <circle cx={CX} cy={CY} r={R + RIM} fill={`url(#${uid}rim)`} filter={`url(#${uid}sh)`} />
            <circle cx={CX} cy={CY} r={R + RIM - 0.5} fill="none" stroke="rgba(0,0,0,.08)" />
            {FILLS.map((f, i) => (
              <circle key={i} cx={CX} cy={CY} r={outerR(i + 1)} fill={f} stroke="#fff" strokeWidth={1.3} />
            ))}
            <AnimatePresence>
              {rating !== null && (
                <motion.path key={shot} d={annulus(rating)} fillRule="evenodd" fill="#fff" initial={{ opacity: 0.85 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} />
              )}
            </AnimatePresence>
            {FILLS.map((_, i) => {
              const k = i + 1;
              const y = k === 10 ? CY : CY - (outerR(k) - RW / 2);
              return (
                <text key={k} x={CX} y={y + 3.2} textAnchor="middle" fontSize={9} fontWeight={700} fill={k === 10 ? "#fff" : "#1d1d1f"} className="tabular-nums" opacity={k === 10 ? 1 : 0.82}>{k}</text>
              );
            })}
            <circle cx={CX} cy={CY} r={R} fill={`url(#${uid}sheen)`} pointerEvents="none" />
            {/* darts being pulled out */}
            {leaving.map((d) => (
              <g key={d.id} transform={`translate(${d.x} ${d.y})`}>
                <motion.g initial={{ y: 0, opacity: 1 }} animate={{ y: [0, -4, 26], opacity: [1, 1, 0] }} transition={{ duration: 0.55, times: [0, 0.25, 1], ease: "easeIn" }}>
                  <g transform={`rotate(${d.ang}) scale(0.72 ${0.72 * 0.6})`}><Dart uid={uid} shadow /></g>
                </motion.g>
              </g>
            ))}
            <g ref={stuckRef} style={{ opacity: 0 }}><Dart uid={uid} shadow /></g>
          </g>

          <g ref={reticleRef} style={{ opacity: 0 }} pointerEvents="none">
            <circle ref={reticleRing} r={8} fill="rgba(0,113,227,.08)" stroke="#0071e3" strokeWidth={1.6} />
            <path d="M-14 0H-5M5 0H14M0 -14V-5M0 5V14" stroke="#1d1d1f" strokeWidth={1.3} strokeLinecap="round" />
            <circle r={1.4} fill="#1d1d1f" />
          </g>

          {/* power meter */}
          <rect x={190} y={282} width={7} height={52} rx={3.5} fill="#e8e8ed" />
          <rect ref={powerRef} x={190} y={334} width={7} height={0} rx={3.5} fill="#30d158" />
          <ellipse cx={REST.x} cy={338} rx={16} ry={3} fill="#000" opacity={0.08} />
          <g ref={handRef} transform={`translate(${REST.x} ${REST.y})`}><Dart uid={uid} /></g>
        </svg>
      </div>
      <p className="mt-2 text-center text-[12px] text-[#6e6e73]">Press and hold on the board to aim, then let go. Or press 1 to 0.</p>
      <div className="sr-only" aria-live="polite">{status}</div>
    </div>
  );
}
```

--- components/dart-rating/index.ts ---

```ts
export { DartRating } from "./dart-rating";
export type { DartRatingProps } from "./dart-rating";
```
