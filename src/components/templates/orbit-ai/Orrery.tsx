"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

/**
 * Orbit's hero: the pull request at the centre of an orrery, and five review agents, each on its own tilted orbit
 * at its own speed. The orbits draw themselves in on load. The selected agent's orbit darkens and a scan beam runs
 * from it to the pull request, where its finding shows. Agents pass in front of the card on the near side of
 * their orbit and behind it on the far side. Laid out on a fixed 1180 x 640 stage the page scales to fit.
 */

export const STAGE = { w: 1180, h: 640, cx: 590, cy: 330 };
/** The pull request card's box on the stage, so the beam can land on its edge. */
const CARD = { x: 380, y: 96, w: 420, h: 448 };

export type OrbitAgent = { id: string; name: string; tone: string; icon: string };

const ORBITS = [
  { rx: 400, ry: 168, rot: -14, speed: 0.16, phase: 0.6 },
  { rx: 472, ry: 206, rot: 10, speed: 0.12, phase: 2.1 },
  { rx: 536, ry: 236, rot: -24, speed: 0.1, phase: 3.7 },
  { rx: 352, ry: 146, rot: 24, speed: 0.19, phase: 5.1 },
  { rx: 566, ry: 252, rot: 4, speed: 0.085, phase: 1.3 },
];

const rad = (d: number) => (d * Math.PI) / 180;

function pointOn(i: number, t: number) {
  const o = ORBITS[i];
  const px = o.rx * Math.cos(t);
  const py = o.ry * Math.sin(t);
  const c = Math.cos(rad(o.rot));
  const s = Math.sin(rad(o.rot));
  return { x: STAGE.cx + px * c - py * s, y: STAGE.cy + px * s + py * c, depth: Math.sin(t) };
}

/** The nearest point on the card's edge, for the beam to land on. */
function edge(x: number, y: number) {
  const ex = Math.max(CARD.x, Math.min(CARD.x + CARD.w, x));
  const ey = Math.max(CARD.y, Math.min(CARD.y + CARD.h, y));
  const inside = ex === x && ey === y;
  if (!inside) return { x: ex, y: ey };
  // the agent is over the card: aim at the nearest side
  const d = [x - CARD.x, CARD.x + CARD.w - x, y - CARD.y, CARD.y + CARD.h - y];
  const m = Math.min(...d);
  return m === d[0] ? { x: CARD.x, y } : m === d[1] ? { x: CARD.x + CARD.w, y } : m === d[2] ? { x, y: CARD.y } : { x, y: CARD.y + CARD.h };
}

function Agent({ i, a, x, y, depth, selected, onPick, ink, paper }: { i: number; a: OrbitAgent; x: MotionValue<number>; y: MotionValue<number>; depth: MotionValue<number>; selected: boolean; onPick: (i: number) => void; ink: string; paper: string }) {
  const scale = useTransform(depth, [-1, 1], [0.78, 1.06]);
  const zIndex = useTransform(depth, (d) => (d > 0 ? 30 : 5));
  const left = useTransform(x, (v) => v - 26);
  const top = useTransform(y, (v) => v - 26);
  return (
    <motion.div className="absolute left-0 top-0" style={{ x: left, y: top, scale, zIndex }}>
      <button
        type="button"
        onClick={() => onPick(i)}
        aria-pressed={selected}
        aria-label={`${a.name} agent`}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: selected ? ink : paper, color: selected ? paper : ink, boxShadow: selected ? `0 0 0 6px ${a.tone}33, 0 16px 30px -14px rgba(0,0,0,.5)` : "0 0 0 1px rgba(14,20,27,.18), 0 10px 22px -14px rgba(0,0,0,.45)", ["--tw-ring-color" as string]: ink }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={a.icon} /></svg>
        <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full" style={{ background: a.tone, boxShadow: `0 0 0 3px ${paper}` }} />
        <span className="absolute top-[58px] whitespace-nowrap text-[12.5px] font-medium" style={{ color: ink }}>{a.name}</span>
      </button>
    </motion.div>
  );
}

export function Orrery({ agents, sel, onPick, card, ink, paper, line, accent }: { agents: OrbitAgent[]; sel: number; onPick: (i: number) => void; card?: ReactNode; ink: string; paper: string; line: string; accent: string }) {
  const still = useReducedMotion();
  const t = useRef(0);
  // five agents, each with x, y and depth
  const xs = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const ys = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const ds = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const bx = useMotionValue(0);
  const by = useMotionValue(0);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const selRef = useRef(sel);
  useEffect(() => { selRef.current = sel; }, [sel]);

  const place = (time: number) => {
    for (let i = 0; i < ORBITS.length; i++) {
      const p = pointOn(i, ORBITS[i].phase + time * ORBITS[i].speed);
      xs[i].set(p.x);
      ys[i].set(p.y);
      ds[i].set(p.depth);
    }
    const s = selRef.current;
    const e = edge(xs[s].get(), ys[s].get());
    bx.set(xs[s].get());
    by.set(ys[s].get());
    tx.set(e.x);
    ty.set(e.y);
  };

  useAnimationFrame((_, delta) => {
    if (still) { place(0); return; }
    t.current += Math.min(delta, 50) / 1000;
    place(t.current);
  });

  return (
    <div className="relative" style={{ width: STAGE.w, height: STAGE.h }}>
      {/* the orbits */}
      <svg className="pointer-events-none absolute inset-0" width={STAGE.w} height={STAGE.h} aria-hidden="true">
        {/* engraved scale on the outermost orbit's plane */}
        <g transform={`rotate(${ORBITS[4].rot} ${STAGE.cx} ${STAGE.cy})`}>
          {Array.from({ length: 72 }, (_, k) => {
            const a = (k / 72) * Math.PI * 2;
            const r1 = 1;
            const r2 = k % 6 === 0 ? 1.035 : 1.018;
            // rounded so the server and the browser print the same numbers
            const r = (v: number) => Math.round(v * 100) / 100;
            return <line key={k} x1={r(STAGE.cx + ORBITS[4].rx * r1 * Math.cos(a))} y1={r(STAGE.cy + ORBITS[4].ry * r1 * Math.sin(a))} x2={r(STAGE.cx + ORBITS[4].rx * r2 * Math.cos(a))} y2={r(STAGE.cy + ORBITS[4].ry * r2 * Math.sin(a))} stroke={line} strokeWidth={1} />;
          })}
        </g>
        {ORBITS.map((o, i) => (
          <motion.ellipse
            key={i}
            cx={STAGE.cx}
            cy={STAGE.cy}
            rx={o.rx}
            ry={o.ry}
            fill="none"
            transform={`rotate(${o.rot} ${STAGE.cx} ${STAGE.cy})`}
            initial={{ pathLength: 0, stroke: line, strokeWidth: 1 }}
            animate={{ pathLength: 1, stroke: i === sel ? ink : line, strokeWidth: i === sel ? 1.6 : 1 }}
            transition={{ pathLength: { duration: 1.4, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }, stroke: { duration: 0.4 }, strokeWidth: { duration: 0.4 } }}
          />
        ))}
        {/* the beam from the selected agent to the pull request */}
        <motion.line x1={bx} y1={by} x2={tx} y2={ty} stroke={accent} strokeWidth={1.6} strokeDasharray="3 5" />
        <motion.circle cx={tx} cy={ty} r={4} fill={accent} />
      </svg>

      {card ? (
        <div className="absolute" style={{ left: CARD.x, top: CARD.y, width: CARD.w, zIndex: 20 }}>{card}</div>
      ) : (
        <div className="absolute flex items-center justify-center rounded-full text-[34px] font-semibold" style={{ left: STAGE.cx - 90, top: STAGE.cy - 90, width: 180, height: 180, background: ink, color: paper, zIndex: 20 }}>
          #4127
        </div>
      )}

      {agents.map((a, i) => (
        <Agent key={a.id} i={i} a={a} x={xs[i]} y={ys[i]} depth={ds[i]} selected={i === sel} onPick={onPick} ink={ink} paper={paper} />
      ))}
    </div>
  );
}
