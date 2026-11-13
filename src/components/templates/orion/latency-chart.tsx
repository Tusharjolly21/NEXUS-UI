"use client";

import { useEffect, useMemo } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

/**
 * Orion's signature: checkout-api's p95 latency from 02:00 to 02:42, drawn as the incident replays. The spike starts
 * at 02:14 after a bad deploy; when it ends depends on the autonomy policy, so changing the dial changes the shape
 * of the outage. Markers land on the timeline as the agent and people act. Laid out at 1180 x 240 and scaled to fit.
 */

export type ChartEvent = { t: string; who: "agent" | "human" | "gate"; text: string };

const W = 1180;
const H = 240;
const PAD = { l: 52, r: 16, t: 18, b: 30 };
const T0 = 2 * 3600; // 02:00:00
const T1 = 2 * 3600 + 42 * 60; // 02:42:00
const MAX = 2800;
const SLO = 400;

const secs = (t: string) => { const [h, m, s] = t.split(":").map(Number); return h * 3600 + m * 60 + s; };
const X = (t: number) => PAD.l + ((t - T0) / (T1 - T0)) * (W - PAD.l - PAD.r);
// a square-root scale, so the healthy 300 ms band still has some shape under a 2.4 s spike
const Y = (ms: number) => PAD.t + (1 - Math.sqrt(ms / MAX)) * (H - PAD.t - PAD.b);
const r1 = (v: number) => Math.round(v * 10) / 10;

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

/** The latency series for an incident that recovers at `back` (seconds). */
function series(back: number) {
  const rnd = seeded(7);
  const pts: [number, number][] = [];
  for (let t = T0; t <= T1; t += 15) {
    const n = rnd();
    let ms = 285 + n * 45;
    const start = secs("02:13:10");
    if (t >= start && t < back) {
      const ramp = Math.min(1, (t - start) / 60);
      ms = 300 + ramp * (2150 + n * 380);
    } else if (t >= back && t < back + 120) {
      const k = (t - back) / 120;
      ms = 2300 * (1 - k) * (1 - k) + 300 + n * 30;
    }
    pts.push([r1(X(t)), r1(Y(ms))]);
  }
  return pts;
}

export function LatencyChart({ events, step, ink, muted, line, hot, warn }: { events: ChartEvent[]; step: number; ink: string; muted: string; line: string; hot: string; warn: string }) {
  const back = useMemo(() => {
    const e = events.find((v) => v.text.startsWith("p95 back"));
    return e ? secs(e.t) : T1;
  }, [events]);
  const pts = useMemo(() => series(back), [back]);
  const d = useMemo(() => `M ${pts.map((p) => p.join(" ")).join(" L ")}`, [pts]);
  const area = `${d} L ${pts[pts.length - 1][0]} ${H - PAD.b} L ${pts[0][0]} ${H - PAD.b} Z`;

  // reveal up to the event being replayed; once the incident closes, run on to the end of the window
  const cur = events[Math.min(step, events.length - 1)];
  const done = step >= events.length - 1;
  const reveal = useSpring(X(secs("02:13:00")), { stiffness: 60, damping: 20 });
  useEffect(() => { reveal.set(done ? W : X(secs(cur.t)) + 6); }, [cur.t, done, reveal]);
  const clipW = useTransform(reveal, (v) => Math.max(0, v - PAD.l));

  const marks = events
    .map((e, i) => ({ e, i }))
    .filter(({ e, i }) => i === 0 || e.who === "gate" || e.text.startsWith("Rolling back") || e.text.startsWith("p95 back") || (e.who === "human" && e.text.includes("by hand")));
  const slo = Y(SLO);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="block" role="img" aria-label="p95 latency for checkout-api from 02:00 to 02:42, with the incident and its recovery">
      <defs>
        <linearGradient id="or-line" x1="0" y1={PAD.t} x2="0" y2={H - PAD.b} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={hot} />
          <stop offset={(slo - PAD.t) / (H - PAD.t - PAD.b) - 0.02} stopColor={hot} />
          <stop offset={(slo - PAD.t) / (H - PAD.t - PAD.b) + 0.02} stopColor={ink} />
          <stop offset="1" stopColor={ink} />
        </linearGradient>
        <linearGradient id="or-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={hot} stopOpacity="0.22" />
          <stop offset="1" stopColor={hot} stopOpacity="0" />
        </linearGradient>
        <clipPath id="or-clip"><motion.rect x={PAD.l} y={0} height={H} style={{ width: clipW }} /></clipPath>
      </defs>

      {/* axes */}
      {[300, 1000, 2000].map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={r1(Y(v))} y2={r1(Y(v))} stroke={line} />
          <text x={PAD.l - 8} y={r1(Y(v)) + 4} textAnchor="end" fontSize={11} fill={muted}>{v >= 1000 ? `${v / 1000} s` : `${v} ms`}</text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, k) => T0 + k * 6 * 60).map((t) => (
        <text key={t} x={r1(X(t))} y={H - 8} textAnchor="middle" fontSize={11} fill={muted}>{`02:${String((t - T0) / 60).padStart(2, "0")}`}</text>
      ))}
      <line x1={PAD.l} x2={W - PAD.r} y1={r1(slo)} y2={r1(slo)} stroke={warn} strokeDasharray="4 6" strokeOpacity={0.7} />
      <text x={W - PAD.r} y={r1(slo) - 6} textAnchor="end" fontSize={11} fill={warn}>SLO 400 ms</text>
      {/* the bad deploy */}
      <line x1={r1(X(secs("02:02:10")))} x2={r1(X(secs("02:02:10")))} y1={PAD.t} y2={H - PAD.b} stroke={muted} strokeDasharray="2 4" />
      <text x={r1(X(secs("02:02:10"))) + 6} y={PAD.t + 10} fontSize={11} fill={muted}>deploy 4f2a1c</text>

      {/* the series, revealed as the replay advances */}
      <g clipPath="url(#or-clip)">
        <path d={area} fill="url(#or-fill)" />
        <path d={d} fill="none" stroke="url(#or-line)" strokeWidth={2} strokeLinejoin="round" />
      </g>

      {/* what happened, and when */}
      {marks.map(({ e, i }, k) => {
        if (i > step) return null;
        const x = r1(X(secs(e.t)));
        const tone = e.who === "gate" ? warn : e.who === "human" ? muted : ink;
        const label = i === 0 ? "Alert" : e.who === "gate" ? "Asked a person" : e.text.startsWith("Rolling back") ? "Rolling back" : e.text.startsWith("p95 back") ? "Recovered" : "Fixed by hand";
        return (
          <motion.g key={`${e.t}-${label}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
            {/* labels step down a row each, so markers seconds apart don't collide */}
            <line x1={x} x2={x} y1={PAD.t} y2={H - PAD.b - 10 - (k % 3) * 16} stroke={tone} strokeOpacity={0.45} />
            <circle cx={x} cy={H - PAD.b - 10 - (k % 3) * 16} r={3.5} fill={tone} />
            <text x={x + 6} y={H - PAD.b - 6 - (k % 3) * 16} fontSize={11.5} fontWeight={600} fill={tone}>{label}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}
