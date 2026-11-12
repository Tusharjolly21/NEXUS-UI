"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { NIGHT } from "./theme";

/** Rounds to 2 decimals so the server and the browser print the same star positions. */
const r2 = (v: number) => Math.round(v * 100) / 100;

/** A small seeded random, so the sky is the same on every load. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Star = { x: number; y: number; r: number; o: number; d: number; l: number };

function makeStars(n: number, seed: number, rMin: number, rMax: number): Star[] {
  const rnd = seeded(seed);
  return Array.from({ length: n }, () => {
    const y = rnd() * 760;
    return {
      x: r2(rnd() * 1440),
      y: r2(y),
      r: r2(rMin + rnd() * (rMax - rMin)),
      // fainter towards the horizon, where the dawn washes them out
      o: r2((0.35 + rnd() * 0.65) * (1 - (y / 760) * 0.55)),
      d: r2(3 + rnd() * 5),
      l: r2(rnd() * -8),
    };
  });
}

/** Four-point glints for the few bright stars. */
const BRIGHT = [
  [182, 128, 1],
  [1262, 96, 0.9],
  [1104, 300, 0.7],
  [318, 392, 0.6],
  [742, 64, 0.55],
] as const;

/**
 * The night sky behind the hero: two layers of stars that drift a little against each other as the pointer moves,
 * a few bright ones that glint, and a curved daylight horizon at the bottom with a lamp-coloured rim, which the page
 * below grows out of. Stars twinkle with CSS, and stop for reduced motion.
 */
export function NightSky({ className = "" }: { className?: string }) {
  const far = useMemo(() => makeStars(150, 7, 0.5, 1.1), []);
  const near = useMemo(() => makeStars(46, 19, 1, 1.9), []);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const farX = useTransform(sx, (v) => v * -6);
  const farY = useTransform(sy, (v) => v * -4);
  const nearX = useTransform(sx, (v) => v * -16);
  const nearY = useTransform(sy, (v) => v * -10);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const move = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [px, py]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true" style={{ background: `linear-gradient(180deg, ${NIGHT.top} 0%, ${NIGHT.mid} 58%, ${NIGHT.low} 100%)` }}>
      <motion.svg className="absolute inset-[-24px] h-[calc(100%+48px)] w-[calc(100%+48px)]" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMin slice" style={{ x: farX, y: farY }}>
        {far.map((s, i) => (
          <circle key={i} className="ast-tw" cx={s.x} cy={s.y} r={s.r} fill={NIGHT.star} style={{ opacity: s.o, ["--o" as string]: s.o, ["--d" as string]: `${s.d}s`, ["--l" as string]: `${s.l}s` }} />
        ))}
      </motion.svg>
      <motion.svg className="absolute inset-[-24px] h-[calc(100%+48px)] w-[calc(100%+48px)]" viewBox="0 0 1440 760" preserveAspectRatio="xMidYMin slice" style={{ x: nearX, y: nearY }}>
        {near.map((s, i) => (
          <circle key={i} className="ast-tw" cx={s.x} cy={s.y} r={s.r} fill={NIGHT.star} style={{ opacity: s.o, ["--o" as string]: s.o, ["--d" as string]: `${s.d}s`, ["--l" as string]: `${s.l}s` }} />
        ))}
        {BRIGHT.map(([x, y, o], i) => (
          <g key={i} className="ast-tw" transform={`translate(${x} ${y})`} style={{ ["--o" as string]: o, ["--d" as string]: `${5 + i}s`, ["--l" as string]: `${-i * 1.3}s`, opacity: o }}>
            <circle r={9} fill={NIGHT.star} opacity={0.12} />
            <path d="M0 -11 L1.3 -1.3 L11 0 L1.3 1.3 L0 11 L-1.3 1.3 L-11 0 L-1.3 -1.3 Z" fill={NIGHT.star} />
          </g>
        ))}
      </motion.svg>
      {/* the curved daylight horizon the page rises out of */}
      <div
        className="absolute left-1/2 top-[calc(100%-190px)] h-[1400px] w-[max(2600px,260%)] -translate-x-1/2 rounded-[50%] sm:top-[calc(100%-230px)]"
        style={{
          background: "#fbfbfd",
          boxShadow: `0 -1px 0 0 rgba(255,214,150,.9), 0 -14px 40px 0 rgba(255,182,72,.38), 0 -90px 160px 10px rgba(122,112,255,.38), 0 -220px 260px 40px rgba(60,60,170,.35)`,
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The constellation that draws the empty page before it fills in.      */
/* ------------------------------------------------------------------ */

type Shape = { key: string; block: string; order: number; pts: [number, number][]; closed: boolean };

/** Nudges a point by a few pixels, the same way every time, so the outline reads as stars rather than a wireframe. */
function jitter(x: number, y: number, k: number): [number, number] {
  const rnd = seeded(Math.round(x * 13 + y * 7 + k * 101));
  return [r2(x + (rnd() - 0.5) * 6), r2(y + (rnd() - 0.5) * 6)];
}

/** Reads every placeholder still on the page and turns it into a short line of stars, or a box of four. */
function measure(root: HTMLElement): Shape[] {
  const box = root.getBoundingClientRect();
  const scale = box.width / root.offsetWidth || 1;
  const blocks = Array.from(root.querySelectorAll<HTMLElement>("[data-block]")).map((b) => b.dataset.block!);
  const out: Shape[] = [];
  const seen: Record<string, number> = {};
  root.querySelectorAll<HTMLElement>("[data-star]").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const x = (r.left - box.left) / scale;
    const y = (r.top - box.top) / scale;
    const w = r.width / scale;
    const h = r.height / scale;
    const block = el.closest<HTMLElement>("[data-block]")?.dataset.block ?? "page";
    const order = Math.max(0, blocks.indexOf(block));
    // numbered within its own part of the page, so a part leaving doesn't re-key (and redraw) the rest
    const i = (seen[block] = (seen[block] ?? -1) + 1) + order * 10;
    if (el.dataset.star === "box") {
      out.push({ key: `${block}-${i}`, block, order, closed: true, pts: [jitter(x, y, i), jitter(x + w, y, i + 1), jitter(x + w, y + h, i + 2), jitter(x, y + h, i + 3)] });
    } else {
      const cy = y + h / 2;
      const pts: [number, number][] = [jitter(x, cy, i)];
      if (w > 140) pts.push(jitter(x + w * 0.46, cy - 5, i + 4));
      pts.push(jitter(x + w, cy, i + 5));
      out.push({ key: `${block}-${i}`, block, order, closed: false, pts });
    }
  });
  return out;
}

/**
 * Drawn over the generated page: each grey placeholder becomes a few stars joined by lines, drawn in on every new
 * build, white against the night while the page is empty and in the page's own colour once its background floods
 * in. When a part of the page arrives, its stars flare and go.
 */
export function Constellation({ root, run, stage, color, w, h }: { root: RefObject<HTMLElement | null>; run: number; stage: number; color: string; w: number; h: number }) {
  const [shapes, setShapes] = useState<Shape[]>([]);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    // after the swap has painted, so the placeholders that left are gone and the ones that stay are in place
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShapes(measure(el))));
    // and once more after the swap animations settle, in case a placeholder was still mid-exit
    const late = window.setTimeout(() => setShapes(measure(el)), 420);
    const ro = new ResizeObserver(() => setShapes(measure(el)));
    ro.observe(el);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(late);
      ro.disconnect();
    };
  }, [root, run, stage]);

  const night = stage === 0;
  const ink = night ? NIGHT.star : color;

  return (
    <svg className="pointer-events-none absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <AnimatePresence>
        {shapes.map((s, si) => {
          const d = `M ${s.pts.map((p) => p.join(" ")).join(" L ")}${s.closed ? " Z" : ""}`;
          const delay = s.order * 0.13 + (si % 4) * 0.04;
          return (
            <motion.g key={`${run}-${s.key}`} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.45 } }}>
              <motion.path
                d={d}
                fill="none"
                strokeWidth={1.2}
                strokeLinejoin="round"
                initial={{ pathLength: 0, stroke: NIGHT.star, opacity: 0.55 }}
                animate={{ pathLength: 1, stroke: ink, opacity: night ? 0.55 : 0.45 }}
                transition={{ pathLength: { delay: delay + 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }, stroke: { duration: 0.5 }, opacity: { duration: 0.5 } }}
              />
              {s.pts.map(([x, y], k) => (
                <motion.circle
                  key={k}
                  cx={x}
                  cy={y}
                  r={k === 0 ? 3 : 2.3}
                  initial={{ scale: 0, fill: NIGHT.star }}
                  animate={{ scale: 1, fill: ink }}
                  exit={{ scale: 2.6, opacity: 0, transition: { duration: 0.4 } }}
                  transition={{ scale: { delay: delay + k * 0.08, type: "spring", stiffness: 520, damping: 16 }, fill: { duration: 0.5 } }}
                  style={{ transformOrigin: `${x}px ${y}px`, filter: night ? "drop-shadow(0 0 4px rgba(238,240,255,.9))" : undefined }}
                />
              ))}
            </motion.g>
          );
        })}
      </AnimatePresence>
    </svg>
  );
}
