"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability, react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, animate, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FunnelStage = { label: string; color: string };
export type FunnelPeriod = { label: string; values: number[]; delta?: number };
export type LiquidFunnelProps = {
  title?: string;
  stages?: FunnelStage[];
  periods?: FunnelPeriod[];
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const STAGES: FunnelStage[] = [
  { label: "Link opened", color: "#0a84ff" },
  { label: "Started", color: "#5e5ce6" },
  { label: "Completed", color: "#bf5af2" },
  { label: "Converted", color: "#ff375f" },
];
const PERIODS: FunnelPeriod[] = [
  { label: "7 days", values: [197, 118, 77, 38], delta: 5.2 },
  { label: "30 days", values: [842, 431, 312, 121], delta: 12.8 },
  { label: "90 days", values: [2310, 1402, 806, 402], delta: -2.4 },
];

const hexRgb = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgba = (hex: string, a: number) => {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};
const ss = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const pct = (v: number) => `${Math.round(v * 100)}%`;

/**
 * A conversion funnel as liquid poured through it.
 *
 * Each stage is a length of tube as thick as the people who reached it, the liquid narrowing smoothly into the next.
 * It flows: streamlines slide along it, bubbles drift through, light catches its upper surface. Where it narrows,
 * the people who left fall away as drops from the underside and splash below, more drops where more were lost.
 * Point at a stage (or tab to its tile) to lift it: the rest dims, the headline reads that stage, and the drops it
 * shed are counted where they land. Change the period and the tube reshapes on springs while every number rolls.
 *   <LiquidFunnel periods={periods} />
 */
export default function LiquidFunnel({
  title = "Sign-up funnel",
  stages = STAGES,
  periods = PERIODS,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: LiquidFunnelProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const seen = useInView(rootRef, { once: true, amount: 0.3 });
  const touched = useRef(false);
  const [period, setPeriod] = useState(0);
  const [focus, setFocus] = useState<number | null>(null);
  const [w, setW] = useState(700);
  const values = periods[period].values;
  const n = stages.length;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.getBoundingClientRect().width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = w < 560;
  const H = narrow ? 180 : 230;

  // the drawn thickness of each stage eases toward its share of the first
  const shares = useMemo(() => values.map((v) => Math.max(0.1, v / values[0])), [values]);
  const live = useRef({
    shares: shares.map(() => 0),
    focus: null as number | null,
    fill: 0,
  });
  useEffect(() => {
    const from = live.current.shares.slice();
    if (reduce) {
      live.current.shares = shares.slice();
      return;
    }
    const a = animate(0, 1, {
      type: "spring",
      stiffness: 110,
      damping: 16,
      onUpdate: (t) => {
        live.current.shares = from.map((f, i) => f + (shares[i] - f) * t);
      },
    });
    return () => a.stop();
  }, [shares, reduce]);
  // pouring in, the first time it's seen
  useEffect(() => {
    if (!seen) return;
    if (reduce) {
      live.current.fill = 1;
      return;
    }
    const a = animate(0, 1, {
      duration: 1.4,
      ease: [0.45, 0, 0.2, 1],
      onUpdate: (v) => (live.current.fill = v),
    });
    return () => a.stop();
  }, [seen, reduce]);
  live.current.focus = focus;

  const stagesRef = useRef(stages);
  stagesRef.current = stages;
  const lostRef = useRef<number[]>([]);
  lostRef.current = values.map((v, i) => (i < n - 1 ? v - values[i + 1] : 0));

  // ------------------------------------------------------------ the liquid, in its glass
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv || !inView) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type Drip = {
      x: number;
      y: number;
      vy: number;
      vx: number;
      r: number;
      stage: number;
      phase: 0 | 1 | 2;
      grow: number;
      t: number;
    };
    type Bead = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      stage: number;
      life: number;
    };
    const drips: Drip[] = [];
    const beads: Bead[] = [];
    const rings: { x: number; t: number; stage: number; s: number }[] = [];
    const bubbles = Array.from({ length: 40 }, () => ({
      u: Math.random(),
      lane: Math.random() * 1.5 - 0.75,
      r: 0.7 + Math.random() * 1.9,
      sp: 0.025 + Math.random() * 0.05,
      wob: Math.random() * 6,
    }));
    const spawnAcc = new Array(8).fill(0);
    let raf = 0;
    let last = performance.now();
    const shadeCol = document.createElement("canvas");
    shadeCol.width = 1;
    shadeCol.height = 256;
    {
      const g = shadeCol.getContext("2d")!;
      const lg = g.createLinearGradient(0, 0, 0, 256);
      lg.addColorStop(0, "rgba(255,255,255,0.45)");
      lg.addColorStop(0.07, "rgba(255,255,255,0.3)");
      lg.addColorStop(0.2, "rgba(255,255,255,0.05)");
      lg.addColorStop(0.5, "rgba(0,0,20,0.13)");
      lg.addColorStop(0.76, "rgba(255,255,255,0)");
      lg.addColorStop(0.9, "rgba(255,255,255,0.24)");
      lg.addColorStop(1, "rgba(0,0,30,0.32)");
      g.fillStyle = lg;
      g.fillRect(0, 0, 1, 256);
    }
    const poly = (pts: [number, number][]) => {
      ctx.beginPath();
      pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    };
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const W = cv.clientWidth;
      const Hc = cv.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(Hc * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(Hc * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, Hc);
      const st = stagesRef.current;
      const { shares: sh, focus: fo, fill } = live.current;
      const N = st.length;
      const X0 = 10;
      const X1 = W - 10;
      const stageW = (X1 - X0) / N;
      const cy = Hc * 0.4;
      const maxH = Hc * 0.33;
      const wall = Math.max(4, Hc * 0.024);
      const neck = stageW * 0.34;
      const floor = Hc - 8;
      const half = (x: number) => {
        const u = Math.max(0, Math.min(X1 - X0 - 0.001, x - X0));
        const i = Math.min(N - 1, Math.floor(u / stageW));
        const local = u - i * stageW;
        if (i > 0 && local < neck) return (sh[i - 1] + (sh[i] - sh[i - 1]) * ss(local / neck)) * maxH;
        return sh[i] * maxH;
      };
      const stageAt = (x: number) => Math.max(0, Math.min(N - 1, Math.floor((x - X0) / stageW)));
      const t = now / 1000;
      const pourX = X0 + (X1 - X0) * fill;
      const step = 3;

      // ---- the shadow the tube casts on the floor, a soft pool under each stage
      for (let i = 0; i < N; i++) {
        const cx = X0 + (i + 0.5) * stageW;
        const rw = stageW * 0.62;
        const g = ctx.createRadialGradient(cx, floor, 0, cx, floor, rw);
        g.addColorStop(0, `rgba(16,24,60,${0.1 * (0.5 + sh[i])})`);
        g.addColorStop(1, "rgba(16,24,60,0)");
        ctx.save();
        ctx.scale(1, 0.12);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, floor / 0.12, rw, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ---- the glass tube: its outline, with rounded ends
      const gTop: [number, number][] = [];
      const gBot: [number, number][] = [];
      for (let x = X0; x <= X1 + 0.1; x += step) {
        const g = half(x) + wall;
        gTop.push([x, cy - g]);
        gBot.push([x, cy + g]);
      }
      const glass = new Path2D();
      glass.moveTo(gTop[0][0], gTop[0][1]);
      for (const [x, y] of gTop) glass.lineTo(x, y);
      const gr1 = (gBot[gBot.length - 1][1] - gTop[gTop.length - 1][1]) / 2;
      glass.ellipse(X1, cy, Math.min(8, gr1 * 0.4), gr1, 0, -Math.PI / 2, Math.PI / 2);
      for (let k = gBot.length - 1; k >= 0; k--) glass.lineTo(gBot[k][0], gBot[k][1]);
      const gr0 = (gBot[0][1] - gTop[0][1]) / 2;
      glass.ellipse(X0, cy, Math.min(8, gr0 * 0.4), gr0, 0, Math.PI / 2, Math.PI * 1.5);
      glass.closePath();
      ctx.fillStyle = "rgba(235,240,250,0.55)";
      ctx.fill(glass);

      // ---- the liquid
      const top: [number, number][] = [];
      const bot: [number, number][] = [];
      for (let x = X0; x <= pourX + 0.1; x += step) {
        const hx = Math.max(1, half(x));
        const wv = reduce ? 0 : Math.sin(x * 0.045 - t * 3.2) * 0.8 + Math.sin(x * 0.11 + t * 2.1) * 0.45;
        top.push([x, cy - hx + wv]);
        bot.push([x, cy + hx]);
      }
      if (top.length >= 2) {
        const liq = new Path2D();
        liq.moveTo(top[0][0], top[0][1]);
        for (const [x, y] of top) liq.lineTo(x, y);
        const lx = top[top.length - 1][0];
        const lh = (bot[bot.length - 1][1] - top[top.length - 1][1]) / 2;
        if (fill < 1) liq.ellipse(lx, cy, Math.min(lh, 16), lh, 0, -Math.PI / 2, Math.PI / 2);
        else liq.ellipse(X1, cy, Math.min(7, lh * 0.38), lh, 0, -Math.PI / 2, Math.PI / 2);
        for (let k = bot.length - 1; k >= 0; k--) liq.lineTo(bot[k][0], bot[k][1]);
        liq.ellipse(
          X0,
          cy,
          Math.min(7, ((bot[0][1] - top[0][1]) / 2) * 0.38),
          (bot[0][1] - top[0][1]) / 2,
          0,
          Math.PI / 2,
          Math.PI * 1.5,
        );
        liq.closePath();
        const grad = ctx.createLinearGradient(X0, 0, X1, 0);
        st.forEach((s, i) => {
          const dim = fo != null && fo !== i ? 0.28 : 1;
          grad.addColorStop(Math.min(1, (i * stageW + (i === 0 ? 0 : neck * 0.5)) / (X1 - X0)), rgba(s.color, dim));
          grad.addColorStop(Math.min(1, ((i + 1) * stageW - 1) / (X1 - X0)), rgba(s.color, dim));
        });
        ctx.fillStyle = grad;
        ctx.fill(liq);
        ctx.save();
        ctx.clip(liq);
        // shade it as a round body of liquid, strip by strip, each against its own height:
        // a reflection under the top surface, a deeper middle, and light gathered near the bottom
        // (one column of the profile, stretched to each pixel column's height, so there are no seams)
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const p0 = Math.floor(X0 * dpr);
        const p1 = Math.ceil(pourX * dpr);
        // one column per CSS pixel: whole device pixels wide, so neighbours meet exactly
        const cw = Math.max(1, Math.round(dpr));
        for (let px = p0; px <= p1; px += cw) {
          const hx = half(px / dpr);
          ctx.drawImage(shadeCol, px, (cy - hx - 1) * dpr, cw, (hx * 2 + 2) * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // caustics: rippling threads of light near the bottom, drifting with the flow
        ctx.globalCompositeOperation = "lighter";
        for (let l = 0; l < 3; l++) {
          ctx.beginPath();
          for (let x = X0; x <= pourX; x += 4) {
            const hx = half(x);
            const lane = 0.55 + l * 0.11 + Math.sin(x * (0.05 + l * 0.02) - t * (1.6 + l * 0.4) + l * 2) * 0.06;
            const y = cy + hx * lane;
            if (x === X0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255,255,255,${0.1 - l * 0.02})`;
          ctx.lineWidth = 1.6 - l * 0.3;
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
        // the flow, faint
        ctx.lineCap = "round";
        for (let l = -1; l <= 1; l++) {
          ctx.beginPath();
          for (let x = X0; x <= pourX; x += step) {
            const y = cy + half(x) * l * 0.35;
            if (x === X0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.setLineDash([22, 34]);
          ctx.lineDashOffset = reduce ? 0 : -t * (48 - Math.abs(l) * 8);
          ctx.strokeStyle = "rgba(255,255,255,0.13)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
        ctx.setLineDash([]);
        // bubbles rising a little as they drift
        for (const b of bubbles) {
          if (!reduce) b.u = (b.u + b.sp * dt * (0.6 + 0.4 * Math.sin(t + b.wob))) % 1;
          const x = X0 + b.u * (X1 - X0);
          if (x > pourX) continue;
          const y = cy + half(x) * (b.lane - b.u * 0.12 + Math.sin(t * 2 + b.wob) * 0.05);
          const bg = ctx.createRadialGradient(x - b.r * 0.3, y - b.r * 0.35, 0, x, y, b.r);
          bg.addColorStop(0, "rgba(255,255,255,0.9)");
          bg.addColorStop(0.5, "rgba(255,255,255,0.15)");
          bg.addColorStop(0.85, "rgba(255,255,255,0.05)");
          bg.addColorStop(1, "rgba(255,255,255,0.55)");
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(x, y, b.r, 0, Math.PI * 2);
          ctx.fill();
        }
        // a moving sheen
        if (!reduce) {
          const sx = X0 + ((t * 0.16) % 1.5) * (X1 - X0) - (X1 - X0) * 0.25;
          const sg = ctx.createLinearGradient(sx - 70, 0, sx + 70, 0);
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(0.5, "rgba(255,255,255,.16)");
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(sx - 70, 0, 140, Hc);
        }
        ctx.restore();
        // the meniscus: a bright line where the surface meets the glass
        poly(top.map(([x, y]) => [x, y + 0.8] as [number, number]));
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ---- the front of the glass: a hairline edge, a sharp highlight along the top, a window reflection, a lit lower rim
      ctx.strokeStyle = "rgba(20,30,70,0.18)";
      ctx.lineWidth = 0.8;
      ctx.stroke(glass);
      poly(gTop.map(([x, y]) => [x, y + wall * 0.45] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      poly(gTop.map(([x, y]) => [x, y + (half(x) + wall) * 0.38] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = Math.max(3, maxH * 0.12);
      ctx.lineCap = "round";
      ctx.stroke();
      poly(gBot.map(([x, y]) => [x, y - wall * 0.5] as [number, number]));
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // ---- the people who left: drops that gather on the underside at each neck, hang, let go, fall and splash
      const lost = lostRef.current;
      const lostSum = Math.max(
        1,
        lost.reduce((a, b) => a + b, 0),
      );
      if (!reduce && fill > 0.98) {
        for (let i = 0; i < N - 1; i++) {
          const rate = Math.min(4, 0.6 + (lost[i] / lostSum) * 5);
          spawnAcc[i] += dt * rate;
          if (spawnAcc[i] > 1 && drips.filter((d) => d.stage === i && d.phase === 0).length < 2) {
            spawnAcc[i] = 0;
            const x0 = X0 + (i + 1) * stageW + neck * (0.15 + Math.random() * 0.7);
            drips.push({
              x: x0,
              y: 0,
              vy: 0,
              vx: 0,
              r: 2.6 + Math.random() * 1.8,
              stage: i,
              phase: 0,
              grow: 0,
              t: 0,
            });
          }
        }
      }
      for (let k = drips.length - 1; k >= 0; k--) {
        const d = drips[k];
        const col = st[d.stage]?.color ?? "#999";
        const dim = fo != null && fo !== d.stage ? 0.25 : 1;
        const surf = cy + half(d.x) + wall;
        if (d.phase === 0) {
          d.grow = Math.min(1, d.grow + dt * (0.9 + d.r * 0.08));
          d.y = surf + d.r * 1.3 * d.grow;
          if (d.grow >= 1) {
            d.phase = 1;
            d.vx = 4 + Math.random() * 6;
          }
        } else if (d.phase === 1) {
          d.vy += 560 * dt;
          d.y += d.vy * dt;
          d.x += d.vx * dt;
          if (d.y + d.r >= floor) {
            d.phase = 2;
            d.t = 0;
            rings.push({ x: d.x, t: 0, stage: d.stage, s: d.r });
            const n = 4 + Math.floor(Math.random() * 3);
            for (let j = 0; j < n; j++) {
              const a = Math.PI * (0.15 + 0.7 * (j / (n - 1)));
              const sp = 40 + Math.random() * 50;
              beads.push({
                x: d.x,
                y: floor - 1,
                vx: -Math.cos(a) * sp,
                vy: -Math.sin(a) * sp * 1.3,
                r: 0.7 + Math.random() * 0.9,
                stage: d.stage,
                life: 0,
              });
            }
            drips.splice(k, 1);
            continue;
          }
        }
        ctx.globalAlpha = dim;
        const r = d.r * (d.phase === 0 ? 0.35 + 0.65 * d.grow : 1);
        if (d.phase === 0) {
          // a pendant drop, still joined to the glass by a neck that thins as it fills
          const nw = r * (1 - d.grow * 0.75) + 0.6;
          ctx.beginPath();
          ctx.moveTo(d.x - r * 0.9, surf - 0.5);
          ctx.quadraticCurveTo(d.x - nw, surf + (d.y - surf) * 0.5, d.x - r, d.y);
          ctx.arc(d.x, d.y, r, Math.PI, 0, true);
          ctx.quadraticCurveTo(d.x + nw, surf + (d.y - surf) * 0.5, d.x + r * 0.9, surf - 0.5);
          ctx.closePath();
        } else {
          // falling: a sphere stretched a touch by its speed, pointed at the top
          const stretch = 1 + Math.min(0.9, d.vy / 420);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - r * stretch * 1.25);
          ctx.quadraticCurveTo(d.x + r * 1.05, d.y - r * 0.2, d.x + r, d.y + r * 0.1);
          ctx.arc(d.x, d.y + r * 0.1, r, 0, Math.PI);
          ctx.quadraticCurveTo(d.x - r * 1.05, d.y - r * 0.2, d.x, d.y - r * stretch * 1.25);
          ctx.closePath();
        }
        const g = ctx.createRadialGradient(d.x - r * 0.35, d.y - r * 0.2, 0, d.x, d.y, r * 1.5);
        g.addColorStop(0, "rgba(255,255,255,0.95)");
        g.addColorStop(0.25, col);
        g.addColorStop(0.8, col);
        g.addColorStop(1, rgba(col, 0.7));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(10,20,60,0.22)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
        // light focused through the drop, on its lower side
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.ellipse(d.x + r * 0.25, d.y + r * 0.5, r * 0.35, r * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      // the crown of a splash: beads thrown up that fall back
      for (let k = beads.length - 1; k >= 0; k--) {
        const b = beads[k];
        b.vy += 480 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life += dt;
        if (b.y > floor || b.life > 0.8) {
          beads.splice(k, 1);
          continue;
        }
        const dim = fo != null && fo !== b.stage ? 0.25 : 1;
        ctx.globalAlpha = dim * (1 - b.life / 0.8);
        ctx.fillStyle = st[b.stage]?.color ?? "#999";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // ripples spreading where they land
      for (let k = rings.length - 1; k >= 0; k--) {
        const g = rings[k];
        g.t += dt * 1.8;
        if (g.t >= 1) {
          rings.splice(k, 1);
          continue;
        }
        const dim = fo != null && fo !== g.stage ? 0.25 : 1;
        const col = st[g.stage]?.color ?? "#999";
        for (const [lag, a] of [
          [0, 0.6],
          [0.25, 0.35],
        ] as const) {
          const u = Math.max(0, g.t - lag);
          if (u <= 0) continue;
          ctx.globalAlpha = (1 - u) * a * dim;
          ctx.strokeStyle = col;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(g.x, floor, g.s + u * 14, (g.s + u * 14) * 0.2, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // the floor: a hairline, brighter where the light falls
      const fl = ctx.createLinearGradient(0, 0, W, 0);
      fl.addColorStop(0, "rgba(0,0,0,0)");
      fl.addColorStop(0.2, "rgba(20,30,70,.1)");
      fl.addColorStop(0.8, "rgba(20,30,70,.1)");
      fl.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = fl;
      ctx.fillRect(0, floor + 1, W, 1);
      void stageAt;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);

  // ------------------------------------------------------------ pointing
  const pick = (clientX: number) => {
    const r = boxRef.current?.getBoundingClientRect();
    if (!r) return;
    const i = Math.max(0, Math.min(n - 1, Math.floor(((clientX - r.left) / r.width) * n)));
    setFocus((f) => {
      if (f !== i) sfx.tick({ freq: 1800 + i * 300, gain: 0.03 });
      return i;
    });
  };
  const choosePeriod = (i: number) => {
    if (i === period) return;
    setPeriod(i);
    sfx.whoosh(400, 1200, { dur: 0.4, gain: 0.04 });
    sfx.note(523 + i * 110, { dur: 0.35, gain: 0.04, at: 0.1, bell: 0.5 });
  };

  // ------------------------------------------------------------ autoplay
  const ap = useRef({ setFocus, choosePeriod });
  ap.current = { setFocus, choosePeriod };
  useEffect(() => {
    if (!autoplay || !inView || reduce) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      while (ok()) {
        await sleep(2400);
        for (let i = 0; i < n && ok(); i++) {
          ap.current.setFocus(i);
          await sleep(1100);
        }
        if (!ok()) break;
        ap.current.setFocus(null);
        await sleep(800);
        if (!ok()) break;
        ap.current.choosePeriod(1);
        await sleep(2400);
        if (!ok()) break;
        ap.current.choosePeriod(2);
        await sleep(2400);
        if (!ok()) break;
        ap.current.choosePeriod(0);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const top = values[0];
  const head =
    focus == null
      ? {
          label: periods[period].label,
          value: top,
          note: periods[period].delta,
        }
      : { label: stages[focus].label, value: values[focus], note: null };
  const lostAt = focus != null && focus < n - 1 ? values[focus] - values[focus + 1] : null;

  return (
    <div
      ref={rootRef}
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
      onPointerEnter={(e) => e.pointerType === "mouse" && (touched.current = true)}
      className={`relative w-full max-w-[720px] overflow-hidden rounded-[28px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.35)] ${narrow ? "p-4" : "p-6"} ${className}`}
      style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Inter, system-ui, sans-serif",
      }}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-[#6e6e73]">{title}</p>
          <div className="mt-1 flex items-baseline gap-2.5">
            <span className="text-[34px] font-semibold leading-none tracking-[-0.035em] tabular-nums">
              <Count n={head.value} reduce={reduce} />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={focus == null ? `p${period}` : `s${focus}`}
                className="flex items-center gap-1.5 whitespace-nowrap"
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.12 }}
              >
                {head.note != null ? (
                  <span
                    className={`rounded-full px-2 py-[2px] text-[12px] font-semibold tabular-nums ${head.note >= 0 ? "bg-[#30d158]/15 text-[#1f7a35]" : "bg-[#ff3b30]/10 text-[#c4161c]"}`}
                  >
                    {head.note >= 0 ? "+" : ""}
                    {head.note.toFixed(1)}%
                  </span>
                ) : (
                  <span className="text-[13px] text-[#6e6e73]">
                    <span className="font-medium" style={{ color: stages[focus!].color }}>
                      {stages[focus!].label}
                    </span>
                    , {pct(values[focus!] / top)} of everyone
                  </span>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div role="radiogroup" aria-label="Period" className="relative flex shrink-0 rounded-full bg-[#f2f2f4] p-[3px]">
          {periods.map((p, i) => (
            <button
              key={p.label}
              role="radio"
              aria-checked={i === period}
              onClick={() => choosePeriod(i)}
              className={`relative z-0 rounded-full px-2.5 py-[5px] text-[12.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3]/60 ${i === period ? "text-[#1d1d1f]" : "text-[#6e6e73] hover:text-[#1d1d1f]"}`}
            >
              {i === period && (
                <motion.span
                  layoutId={`${uid}-p`}
                  className="absolute inset-0 -z-10 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.12),0_3px_8px_-2px_rgba(0,0,0,.12)]"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                />
              )}
              {narrow ? p.label.replace(" days", "d") : p.label}
            </button>
          ))}
        </div>
      </header>

      <div
        ref={boxRef}
        className="relative mt-4"
        style={{ height: H }}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
        role="img"
        aria-label={stages.map((s, i) => `${s.label} ${values[i]}`).join(", ")}
      >
        <canvas ref={cvRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        {/* the share of everyone still here, in the middle of each stage */}
        {stages.map((s, i) => (
          <motion.span
            key={s.label}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/90 px-2 py-[2px] text-[11.5px] font-semibold tabular-nums text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,.15)] backdrop-blur"
            style={{
              left: `${((i + (i === 0 ? 0.5 : 0.58)) / n) * 100}%`,
              top: H * 0.4,
            }}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{
              opacity: seen ? (focus == null || focus === i ? 1 : 0.35) : 0,
              scale: 1,
            }}
            transition={{
              delay: reduce ? 0 : seen && focus == null ? 0.4 + i * 0.25 : 0,
              duration: 0.3,
            }}
          >
            <Count n={Math.round((values[i] / top) * 100)} reduce={reduce} suffix="%" />
          </motion.span>
        ))}
        {/* what was lost at the focused stage, where its drops land */}
        <AnimatePresence>
          {lostAt != null && (
            <motion.span
              key={`l${focus}`}
              className="pointer-events-none absolute bottom-[14px] -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-[2px] text-[11.5px] font-medium tabular-nums"
              style={{
                left: `${((focus! + 1.15) / n) * 100}%`,
                color: stages[focus!].color,
                background: rgba(stages[focus!].color, 0.1),
              }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              {lostAt.toLocaleString("en-US")} left here
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-3 grid gap-2 ${narrow ? "grid-cols-2" : "grid-cols-4"}`}>
        {stages.map((s, i) => {
          const on = focus === i;
          return (
            <button
              key={s.label}
              type="button"
              onFocus={() => setFocus(i)}
              onBlur={() => setFocus(null)}
              onPointerEnter={(e) => e.pointerType === "mouse" && setFocus(i)}
              onPointerLeave={(e) => e.pointerType === "mouse" && setFocus(null)}
              onClick={() => setFocus((f) => (f === i ? null : i))}
              aria-pressed={on}
              aria-label={`${s.label}: ${values[i]}, ${pct(values[i] / top)}`}
              className="relative rounded-[14px] px-3 py-2.5 text-left outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-[#0071e3]/60"
              style={{ opacity: focus == null || on ? 1 : 0.5 }}
            >
              <span className="absolute inset-0 rounded-[14px] bg-[#f5f5f7]" />
              {on && (
                <motion.span
                  layoutId={`${uid}-tile`}
                  className="absolute inset-0 rounded-[14px] bg-white"
                  style={{
                    boxShadow: `0 0 0 1.5px ${rgba(s.color, 0.5)}, 0 8px 18px -10px ${rgba(s.color, 0.7)}`,
                  }}
                  transition={{ type: "spring", stiffness: 480, damping: 36 }}
                />
              )}
              <span className="relative flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                <span className="h-2 w-2 rounded-[3px]" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="relative mt-0.5 block text-[17px] font-semibold tabular-nums tracking-[-0.02em]">
                <Count n={values[i]} reduce={reduce} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Count({ n, reduce, suffix = "" }: { n: number; reduce: boolean; suffix?: string }) {
  const [shown, setShown] = useState(n);
  const from = useRef(n);
  useEffect(() => {
    if (reduce) {
      setShown(n);
      from.current = n;
      return;
    }
    const a = animate(from.current, n, {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    });
    from.current = n;
    return () => a.stop();
  }, [n, reduce]);
  return (
    <>
      {shown.toLocaleString("en-US")}
      {suffix}
    </>
  );
}
