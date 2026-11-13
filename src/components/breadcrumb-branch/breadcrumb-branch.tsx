"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type Place = { name: string; children?: Place[] };

export type BreadcrumbBranchProps = {
  /** the places you can go: a tree from the top */
  root?: Place;
  /** where you start, as names below the root */
  defaultPath?: string[];
  /** called with the names from the root down whenever you move */
  onNavigate?: (path: string[]) => void;
  /** Soft synthesised sounds: wood, leaves and the bird. They also follow the site-wide sound switch. */
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
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
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

const DEFAULT_ROOT: Place = {
  name: "Home",
  children: [
    {
      name: "Work",
      children: [
        {
          name: "Projects",
          children: [
            {
              name: "Q3 launch",
              children: [
                { name: "Designs", children: [{ name: "Mobile", children: [{ name: "Onboarding" }, { name: "Checkout" }] }, { name: "Web" }] },
                { name: "Copy" },
                { name: "Assets" },
              ],
            },
            { name: "Website" },
            { name: "Archive" },
          ],
        },
        { name: "Invoices" },
        { name: "Hiring" },
      ],
    },
    { name: "Photos", children: [{ name: "Lisbon" }, { name: "Kyoto" }] },
    { name: "Recipes" },
  ],
};

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ease = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const mix = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

// ── the scene ──
const SH = 290; // its height, css px
const STEP = 140; // between places along the branch
const X0 = 54; // where the trunk tops out
const LEAF_GREEN = [
  [86, 140, 58],
  [110, 165, 72],
  [70, 120, 50],
];
const LEAF_AUTUMN = [
  [222, 160, 46],
  [214, 104, 42],
  [168, 70, 40],
];
const BARK = { dark: "#4f3524", mid: "#6e4c33", light: "#a17b58" };

type Leaf = { t: number; side: number; ang: number; size: number; hue: number; delay: number; phase: number; drop: number };
type Seg = {
  key: number;
  name: string;
  depth: number; // its place along the path, 1 for the first below the root
  grow: number; // 0 to 1
  wither: number; // 0 to 1 once it is being left
  leaves: Leaf[];
  seed: number;
  grownAt: number;
};
type Falling = { x: number; y: number; vx: number; vy: number; rot: number; vr: number; size: number; col: number[]; life: number; phase: number; spin: number; vs: number };
type Bird = {
  x: number;
  y: number;
  face: 1 | -1;
  mode: "perch" | "hop" | "fly";
  t: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  dur: number;
  hops: number;
  look: number;
  nextLook: number;
  flap: number;
  blink: number; // seconds left in a blink
  nextBlink: number;
  peck: number; // 0 to 1 through a peck at the bark
  nextPeck: number;
  tail: number; // a flick of the tail, decaying
  landed: boolean; // set for one frame when it lands, so the branch can take its weight
};
type Gust = { t0: number; amp: number; speed: number; width: number };

/**
 * Breadcrumb navigation grown as a living branch.
 *
 * The path you are on is a branch growing out of a trunk, one length of wood per level, each place's name tagged
 * where it joins. Side twigs carry the places beside each one (tap one to step sideways), and buds at the tip carry
 * the places inside where you are (tap one and the branch grows into it: the wood draws out, the bud swells and its
 * leaves unfurl). A sparrow is you: it hops along the branch, or flies when it is far, to perch on the tip. Go back to
 * an earlier place and the wood you leave behind turns to autumn, its leaves come loose one by one and tumble down,
 * and the bare twig draws back in. The limb is springy: it sags under the bird and bounces when it lands. Gusts of
 * wind run along it, the leaves rustle where your pointer moves, and sunlight dapples it through shafts of light
 * with pollen drifting in them, over out-of-focus foliage behind and in front. It is a real
 * breadcrumb: a nav with an ordered list, the current place marked, every name a button.
 *   <BreadcrumbBranch root={siteMap} onNavigate={(path) => router.push("/" + path.join("/"))} />
 */
export default function BreadcrumbBranch({ root = DEFAULT_ROOT, defaultPath = ["Work", "Projects", "Q3 launch"], onNavigate, enableSound = true, volume = 0.8, autoplay = false, className = "" }: BreadcrumbBranchProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bokehRef = useRef<HTMLCanvasElement>(null);
  const foreRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<Map<string, HTMLElement>>(new Map());
  const inView = useInView(rootRef, { margin: "100px" });
  const cb = useRef({ onNavigate });
  cb.current = { onNavigate };
  const [width, setWidth] = useState(600);

  const validPath = (names: string[]) => {
    const out: string[] = [];
    let at: Place | undefined = root;
    for (const n of names) {
      at = at?.children?.find((c) => c.name === n);
      if (!at) break;
      out.push(n);
    }
    return out;
  };
  const [path, setPath] = useState<string[]>(() => validPath(defaultPath));
  const pathRef = useRef(path);
  pathRef.current = path;
  const placeAt = (names: string[]) => {
    let at: Place = root;
    for (const n of names) at = at.children?.find((c) => c.name === n) ?? at;
    return at;
  };

  // ── the living state, outside React ──
  const keyRef = useRef(0);
  const makeSeg = (name: string, depth: number, grown: boolean): Seg => {
    const seed = hashStr(name) * 13 + depth * 7;
    const n = 11 + Math.floor(hash(seed) * 4);
    const leaves: Leaf[] = [];
    for (let k = 0; k < n; k++) {
      const atTip = k < 5;
      leaves.push({
        t: atTip ? 0.84 + hash(seed + k) * 0.14 : 0.18 + hash(seed + k * 3) * 0.6,
        side: k % 2 ? 1 : -1,
        ang: (k % 2 ? 1 : -1) * (0.45 + hash(seed + k * 5) * 0.85),
        size: 19 + hash(seed + k * 9) * 12 - depth * 0.7,
        hue: Math.floor(hash(seed + k * 11) * 3),
        delay: 0.05 + k * 0.06,
        phase: hash(seed + k) * 6.28,
        drop: -1,
      });
    }
    return { key: keyRef.current++, name, depth, grow: grown ? 1 : 0, wither: 0, leaves, seed, grownAt: grown ? -10 : 0 };
  };
  const sim = useRef<{
    segs: Seg[];
    falling: Falling[];
    bird: Bird;
    cam: number;
    camV: number;
    queue: (() => boolean)[];
    time: number;
    buds: number;
    sag: number[]; // each place along the limb as a damped spring, bent by the bird's weight
    sagV: number[];
    gusts: Gust[];
    nextGust: number;
    hand: { x: number; y: number; vx: number; vy: number; at: number };
    motes: { x: number; y: number; vx: number; vy: number; r: number; tw: number }[];
  } | null>(null);
  if (!sim.current) {
    const segs = path.map((n, i) => makeSeg(n, i + 1, true));
    sim.current = {
      segs,
      falling: [],
      bird: { x: 0, y: 0, face: 1, mode: "perch", t: 0, from: { x: 0, y: 0 }, to: { x: 0, y: 0 }, dur: 0, hops: 0, look: 0, nextLook: 1.5, flap: 0, blink: 0, nextBlink: 2, peck: 0, nextPeck: 4, tail: 0, landed: false },
      cam: 0,
      camV: 0,
      queue: [],
      time: 0,
      buds: 1,
      sag: new Array(16).fill(0),
      sagV: new Array(16).fill(0),
      gusts: [],
      nextGust: 2.5,
      hand: { x: -999, y: -999, vx: 0, vy: 0, at: -10 },
      motes: Array.from({ length: 34 }, (_, k) => ({ x: hash(k * 1.7) * 900, y: hash(k * 2.9) * SH, vx: (hash(k * 4.1) - 0.5) * 6, vy: (hash(k * 5.3) - 0.5) * 4, r: 0.6 + hash(k * 6.7) * 1.4, tw: hash(k) * 6 })),
    };
  }

  /** where a place along the branch sits, before the wind moves it */
  const nodeAt = (i: number, seedName = "") => {
    const y = SH * 0.6 - i * 10 + Math.sin(i * 1.9 + 0.7) * 12 + (hash(hashStr(seedName) + i) - 0.5) * 8;
    return { x: X0 + i * STEP, y };
  };

  const report = (p: string[]) => cb.current.onNavigate?.(p);

  /** go to a path: the wood past where the two paths part withers back, then the new wood grows out */
  const go = (next: string[], user = true) => {
    if (user) touched.current = true;
    next = validPath(next);
    const cur = pathRef.current;
    let k = 0;
    while (k < cur.length && k < next.length && cur[k] === next[k]) k++;
    if (k === cur.length && k === next.length) return;
    setPath(next);
    pathRef.current = next;
    report(next);
    const s = sim.current!;
    if (reduce) {
      s.segs = next.map((n, i) => makeSeg(n, i + 1, true));
      return;
    }
    // what is left behind withers, tip first
    const leaving = s.segs.filter((g) => g.depth > k && g.wither === 0);
    leaving.sort((a, b) => b.depth - a.depth);
    for (const g of leaving)
      s.queue.push(() => {
        g.wither = 0.0001;
        sfx.whoosh(2400, 900, { dur: 0.45, gain: 0.02 });
        return true;
      });
    // then the new wood grows, one length after another
    for (let i = k; i < next.length; i++) {
      const name = next[i],
        depth = i + 1;
      s.queue.push(() => {
        // wait for the withering to clear first
        if (s.segs.some((g) => g.wither > 0 && g.wither < 0.55)) return false;
        const seg = makeSeg(name, depth, false);
        seg.grownAt = s.time;
        s.segs = s.segs.filter((g) => !(g.depth >= depth && g.wither > 0)).concat(seg);
        sfx.note(150 + depth * 12, { glide: 110, dur: 0.35, gain: 0.03, bell: 0 });
        return true;
      });
      s.queue.push(() => {
        const g = s.segs.find((q) => q.depth === depth && q.wither === 0);
        return !g || g.grow >= 0.98;
      });
    }
  };

  // size
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // the out-of-focus foliage behind, painted once
  const bokeh = useMemo(() => Array.from({ length: 26 }, (_, k) => ({ x: hash(k * 3.1) * 1.6, y: hash(k * 5.7), r: 10 + hash(k * 7.3) * 34, c: k % 3, a: 0.1 + hash(k * 2.2) * 0.18 })), []);

  // ── the loop ──
  useEffect(() => {
    const cv = canvasRef.current,
      bk = bokehRef.current,
      fg = foreRef.current;
    if (!cv || !bk || !fg || !inView) return;
    const ctx = cv.getContext("2d"),
      bctx = bk.getContext("2d"),
      fctx = fg.getContext("2d");
    if (!ctx || !bctx || !fctx) return;
    const fore = [
      { x: 0.1, y: -14, size: 30, a: 0.9, c: 0 },
      { x: 0.62, y: SH - 6, size: 34, a: -1.1, c: 1 },
      { x: 0.95, y: 8, size: 26, a: 2.2, c: 2 },
    ];
    const s = sim.current!;
    let raf = 0,
      last = performance.now();
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const frame = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(frame);
      s.time += dt;
      const t = s.time;
      const W = sceneRef.current?.clientWidth ?? width;
      for (const c of [cv, bk, fg])
        if (c.width !== Math.round(W * dpr) || c.height !== Math.round(SH * dpr)) {
          c.width = Math.round(W * dpr);
          c.height = Math.round(SH * dpr);
        }

      // run the queue of growing and withering, in order
      while (s.queue.length && s.queue[0]()) s.queue.shift();
      for (const g of s.segs) {
        if (g.wither > 0) {
          g.wither = Math.min(1, g.wither + dt / 1.5);
          // leaves come loose one by one as they turn
          g.leaves.forEach((lf, k) => {
            if (lf.drop < 0 && g.wither > 0.18 + k * 0.07) {
              lf.drop = t;
              const p = leafWorld(g, lf, t);
              s.falling.push({ x: p.x, y: p.y, vx: (Math.random() - 0.3) * 30, vy: -10, rot: p.ang, vr: (Math.random() - 0.5) * 6, size: lf.size, col: mix(LEAF_GREEN[lf.hue], LEAF_AUTUMN[lf.hue], 0.9), life: 0, phase: Math.random() * 6, spin: 0, vs: 4 + Math.random() * 5 });
            }
          });
        } else if (g.grow < 1) {
          g.grow = Math.min(1, g.grow + dt / 0.75);
          if (g.grow >= 1) {
            sfx.tick({ freq: 1800, gain: 0.04 });
            sfx.whoosh(1800, 4200, { at: 0.05, dur: 0.3, gain: 0.018 });
          }
        }
      }
      s.segs = s.segs.filter((g) => g.wither < 1);
      // falling leaves: they flutter, sliding side to side as they tip, and settle out of sight
      for (const f of s.falling) {
        f.life += dt;
        const sway = Math.sin(f.life * 3.2 + f.phase);
        f.vy += (60 - f.vy) * dt * 1.6;
        f.vx += (sway * 55 - f.vx) * dt * 2.2;
        f.x += f.vx * dt;
        f.y += f.vy * dt;
        f.rot += (f.vr + sway * 2.2) * dt;
        // it tumbles as it falls, showing its paler underside as it turns over
        f.spin += f.vs * dt;
      }
      s.falling = s.falling.filter((f) => f.y < SH + 30);

      // gusts: now and then a breath of wind runs along the branch from the left
      if (!reduce && t > s.nextGust) {
        s.nextGust = t + 4 + Math.random() * 5;
        s.gusts.push({ t0: t, amp: 0.6 + Math.random() * 0.8, speed: 260 + Math.random() * 120, width: 140 });
        sfx.whoosh(500, 1500, { dur: 0.9, gain: 0.012 });
      }
      s.gusts = s.gusts.filter((g) => (t - g.t0) * g.speed < W + s.cam + 600);
      // the limb is springy: each place along it bends under the bird's weight and bounces when it lands
      {
        const liveNow = s.segs.filter((g) => g.wither === 0);
        const tipD = liveNow.length ? Math.max(...liveNow.map((g) => g.depth)) : 0;
        const b = s.bird;
        const perched = b.mode !== "fly";
        for (let i = 1; i < s.sag.length; i++) {
          const reach = tipD > 0 ? Math.pow(Math.min(1, i / Math.max(1, tipD)), 1.6) : 0;
          const load = perched ? 7 * reach * (i <= tipD ? 1 : 0.4) : 0;
          if (b.landed) s.sagV[i] += 95 * reach;
          const k = 55,
            c = 2 * Math.sqrt(k) * 0.16;
          s.sagV[i] += (k * (load - s.sag[i]) - c * s.sagV[i]) * dt;
          s.sag[i] += s.sagV[i] * dt;
          if (reduce) s.sag[i] = 0;
        }
        b.landed = false;
      }
      // the hand: where the pointer is, and how fast it moves, for the leaves near it to rustle
      s.hand.vx *= 1 - Math.min(1, dt * 6);
      s.hand.vy *= 1 - Math.min(1, dt * 6);
      // pollen drifting in the light
      for (const m of s.motes) {
        m.vx += (Math.random() - 0.5) * 8 * dt;
        m.vy += (Math.random() - 0.5) * 8 * dt - 0.6 * dt;
        m.vx *= 0.99;
        m.vy *= 0.99;
        m.x += (m.vx + windAt(m.x + s.cam, t) * 12) * dt;
        m.y += m.vy * dt;
        if (m.y < -10) m.y = SH + 10;
        if (m.y > SH + 10) m.y = -10;
        m.x = ((m.x % (W + 40)) + W + 40) % (W + 40);
      }
      // the tip, the bird's perch, and the camera that keeps it in view
      const live = s.segs.filter((g) => g.wither === 0);
      const tipDepth = live.length ? Math.max(...live.map((g) => g.depth)) : 0;
      const tipSeg = live.find((g) => g.depth === tipDepth);
      const tipGrow = tipSeg ? ease(tipSeg.grow) : 1;
      const tip = pos(tipDepth, t);
      const prev = pos(Math.max(0, tipDepth - 1), t);
      const perch = { x: prev.x + (tip.x - prev.x) * tipGrow, y: prev.y + (tip.y - prev.y) * tipGrow };
      const camWant = Math.max(0, perch.x + 210 - W);
      if (reduce) s.cam = camWant;
      else {
        s.camV += (60 * (camWant - s.cam) - 2 * Math.sqrt(60) * s.camV) * dt;
        s.cam += s.camV * dt;
      }
      stepBird(s.bird, perch, dt, t);

      // ── paint ──
      // the foliage behind, out of focus, moving slower than the branch
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      bctx.clearRect(0, 0, W, SH);
      for (const b of bokeh) {
        const x = (((b.x * W * 1.3 - s.cam * 0.35) % (W * 1.6)) + W * 1.6) % (W * 1.6) - W * 0.2;
        const y = b.y * SH + Math.sin(t * 0.4 + b.x * 9) * 3;
        const col = b.c === 0 ? "120,170,80" : b.c === 1 ? "170,200,90" : "235,215,120";
        const g = bctx.createRadialGradient(x, y, 0, x, y, b.r);
        g.addColorStop(0, `rgba(${col},${b.a})`);
        g.addColorStop(0.7, `rgba(${col},${b.a * 0.8})`);
        g.addColorStop(1, `rgba(${col},0)`);
        bctx.fillStyle = g;
        bctx.beginPath();
        bctx.arc(x, y, b.r, 0, Math.PI * 2);
        bctx.fill();
      }
      // a far-off branch, out of focus, for depth
      {
        const off = -s.cam * 0.35;
        bctx.save();
        bctx.translate(off, 0);
        bctx.strokeStyle = "rgba(96,110,70,0.32)";
        bctx.lineCap = "round";
        const far = (x0: number, y0: number, x1: number, y1: number, w: number) => {
          bctx.lineWidth = w;
          bctx.beginPath();
          bctx.moveTo(x0, y0);
          bctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 - 24, x1, y1);
          bctx.stroke();
        };
        far(W * 0.35, -20, W * 1.2, SH * 0.32, 16);
        far(W * 0.7, SH * 0.12, W * 0.9, -30, 7);
        far(W * 0.95, SH * 0.22, W * 1.25, SH * 0.05, 6);
        for (let k = 0; k < 18; k++) {
          const x = W * 0.45 + k * 46,
            y = SH * 0.08 + Math.sin(k * 1.7) * 26 + k * 4;
          bctx.fillStyle = `rgba(${k % 2 ? "110,150,70" : "140,175,85"},0.28)`;
          bctx.beginPath();
          bctx.ellipse(x, y, 16, 8, k, 0, Math.PI * 2);
          bctx.fill();
        }
        bctx.restore();
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, SH);
      ctx.translate(-s.cam, 0);
      // the trunk, rising out of the bottom left
      const n0 = pos(0, t);
      drawWood(ctx, [
        { x: -50, y: SH + 40, w: 56 },
        { x: -4, y: SH * 0.9, w: 42 },
        { x: 28, y: n0.y + 36, w: 33 },
        { x: n0.x, y: n0.y, w: 28 },
      ], 1);
      // side twigs: the places beside each step of the path
      const p = pathRef.current;
      // the buds at the tip wait for any old wood to clear, then grow in
      const budsWant = s.segs.some((g) => g.wither > 0) || s.queue.length ? 0 : 1;
      s.buds += (budsWant - s.buds) * Math.min(1, dt * (budsWant ? 3.5 : 12));
      for (let i = 0; i <= p.length; i++) {
        const parentPlace = placeAt(p.slice(0, i));
        const kids = (parentPlace.children ?? []).filter((c) => c.name !== p[i]);
        const atTip = i === p.length;
        const seg = live.find((g) => g.depth === i);
        const ready = i === 0 ? 1 : seg ? ease(clamp((seg.grow - 0.6) / 0.4)) : 0;
        kids.forEach((c, k) => {
          const tw = twig(i, k, kids.length, atTip, t);
          const len = ready * (atTip ? ease(s.buds) : 1);
          if (len <= 0.01) return;
          const end = { x: tw.from.x + (tw.to.x - tw.from.x) * len, y: tw.from.y + (tw.to.y - tw.from.y) * len };
          drawWood(ctx, [
            { x: tw.from.x, y: tw.from.y, w: atTip ? 6 : 5 },
            { x: tw.from.x + (end.x - tw.from.x) * 0.5 + tw.bend, y: tw.from.y + (end.y - tw.from.y) * 0.5, w: 3.4 },
            { x: end.x, y: end.y, w: 1.8 },
          ], 0.9);
          if (atTip) drawBud(ctx, end.x, end.y, tw.ang, len, t + k);
          else
            for (let q = 0; q < 4; q++)
              drawLeaf(ctx, end.x, end.y, tw.ang + (q - 1.5) * 0.62 + Math.sin(t * 2.4 + k + q) * 0.12 * (1 + windAt(end.x, t) * 2), (17 - Math.abs(q - 1.5) * 3) * len, LEAF_GREEN[(k + i + q) % 3], 1);
          placeLabel(`${atTip ? "kid" : "sib"}:${i}:${c.name}`, end.x - s.cam + tw.lx, end.y + tw.ly, len);
        });
      }
      // the path's wood, root to tip, as one continuous limb so the joins are seamless
      const ordered = [...s.segs].sort((a, b) => a.depth - b.depth || a.wither - b.wither);
      const limb: { x: number; y: number; w: number }[] = [];
      let lastDepth = 0;
      for (const g of ordered) {
        if (g.depth !== lastDepth + 1) continue;
        const a = pos(g.depth - 1, t),
          b = pos(g.depth, t);
        const len = ease(g.grow) * (g.wither > 0.55 ? 1 - ease((g.wither - 0.55) / 0.45) : 1);
        if (len <= 0.005) break;
        const w0 = 27 * Math.pow(0.87, g.depth - 1),
          w1 = 27 * Math.pow(0.87, g.depth);
        const mid = { x: (a.x + b.x) / 2 + (hash(g.seed) - 0.5) * 14, y: (a.y + b.y) / 2 + 8 + (hash(g.seed + 1) - 0.5) * 12 };
        const pts = bez(a, mid, b, len).map((q, k, arr) => ({ ...q, w: w0 + (w1 - w0) * (k / (arr.length - 1)) * len }));
        limb.push(...(limb.length ? pts.slice(1) : pts));
        lastDepth = g.depth;
        if (len < 0.999) break;
      }
      if (limb.length > 1) {
        limb[limb.length - 1].w *= 0.8;
        drawWood(ctx, limb, 1);
      }
      for (const g of ordered) {
        const a = pos(g.depth - 1, t),
          b = pos(g.depth, t);
        const gr = ease(g.grow);
        const back = g.wither > 0.55 ? 1 - ease((g.wither - 0.55) / 0.45) : 1;
        const len = gr * back;
        if (len <= 0.005) continue;
        const w0 = 27 * Math.pow(0.87, g.depth - 1),
          w1 = 27 * Math.pow(0.87, g.depth);
        const mid = { x: (a.x + b.x) / 2 + (hash(g.seed) - 0.5) * 14, y: (a.y + b.y) / 2 + 8 + (hash(g.seed + 1) - 0.5) * 12 };
        void w0;
        void w1;
        void mid;
        // leaves along it, unfurling after the wood has grown; turning, then falling, when it is left
        for (const lf of g.leaves) {
          if (lf.drop >= 0) continue;
          if (lf.t > len) continue;
          const born = clamp((s.time - g.grownAt - 0.55 - lf.delay) / 0.5);
          const sc = g.grownAt < 0 ? 1 : springy(born);
          if (sc <= 0.01) continue;
          const q = leafWorld(g, lf, t);
          const col = mix(LEAF_GREEN[lf.hue], LEAF_AUTUMN[lf.hue], clamp(g.wither / 0.35));
          drawLeaf(ctx, q.x, q.y, q.ang + (1 - sc) * 0.8, lf.size * Math.min(1, sc * 1.1), col, 1, g.grownAt < 0 ? 1 : Math.max(0.08, springy(clamp(born * 1.2 - 0.15))));
        }
      }
      // leaves in the air
      for (const f of s.falling) drawLeaf(ctx, f.x, f.y, f.rot, f.size, f.col, clamp(1 - (f.y - SH + 40) / 60), Math.cos(f.spin));
      // the sparrow
      drawBird(ctx, s.bird, t);
      // sunlight through the canopy, dappling the branch, the leaves and the bird as it drifts
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      for (let k = 0; k < 5; k++) {
        const x = s.cam + ((k * 173 + t * (9 + k * 3)) % (W + 160)) - 80,
          y = SH * (0.25 + 0.12 * k) + Math.sin(t * 0.5 + k) * 18;
        const r = 50 + k * 9;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,236,170,0.32)");
        g.addColorStop(1, "rgba(255,236,170,0)");
        ctx.fillStyle = g;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();
      // pollen in the air, brighter where the light falls
      for (const m of s.motes) {
        const a = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + m.tw));
        ctx.fillStyle = `rgba(255,250,225,${a})`;
        ctx.beginPath();
        ctx.arc(m.x + s.cam, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // the near foliage, out of focus, passing in front faster than the branch
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.clearRect(0, 0, W, SH);
      for (const f of fore) {
        const x = (((f.x * W * 2 - s.cam * 1.45) % (W * 2.2)) + W * 2.2) % (W * 2.2) - W * 0.4;
        const y = f.y + Math.sin(t * 0.8 + f.x * 7) * 4;
        for (let q = 0; q < 4; q++) drawLeaf(fctx, x + q * 7, y + (q % 2) * 6, f.a + q * 0.55 + Math.sin(t + q) * 0.06, f.size * (1 - q * 0.12), [40 + q * 8, 70 + q * 6, 30], 0.95);
      }
      // shafts of light slanting down from the top left, breathing slowly
      fctx.globalCompositeOperation = "screen";
      for (let k = 0; k < 3; k++) {
        const x0 = W * (0.05 + k * 0.22) - s.cam * 0.1,
          a = 0.16 + 0.08 * Math.sin(t * 0.4 + k * 2);
        const g = fctx.createLinearGradient(x0, 0, x0 + SH * 0.55, SH);
        g.addColorStop(0, `rgba(255,244,205,${a})`);
        g.addColorStop(1, "rgba(255,244,205,0)");
        fctx.fillStyle = g;
        fctx.beginPath();
        fctx.moveTo(x0, -10);
        fctx.lineTo(x0 + 34 + k * 10, -10);
        fctx.lineTo(x0 + SH * 0.62 + 70 + k * 16, SH + 10);
        fctx.lineTo(x0 + SH * 0.62, SH + 10);
        fctx.closePath();
        fctx.fill();
      }
      fctx.globalCompositeOperation = "source-over";
      // tags on the path: where each place joins the branch
      for (let i = 0; i <= p.length; i++) {
        const q = pos(i, t);
        const seg = live.find((g) => g.depth === i);
        const show = i === 0 ? 1 : seg ? clamp((seg.grow - 0.75) / 0.25) : 0;
        placeLabel(`path:${i}`, q.x - s.cam, q.y + 14, show);
      }
    };

    // ── geometry ──
    /** a place along the branch, swaying in the wind more the further out it is */
    const pos = (i: number, t: number) => {
      const n = nodeAt(i, pathRef.current[i - 1] ?? "");
      const wind = Math.sin(t * 1.1 + i * 0.5) * 0.6 + Math.sin(t * 2.3 + i) * 0.3 + windAt(n.x, t) * 1.6;
      return { x: n.x + wind * i * 0.4, y: n.y + wind * i * 0.9 + (s.sag[i] ?? 0) };
    };
    /** the gusts' strength at a place along the branch: each a pulse of wind running to the right */
    function windAt(x: number, t: number) {
      let w = 0;
      for (const g of s.gusts) {
        const front = (t - g.t0) * g.speed - 120;
        w += g.amp * Math.exp(-(((x - front) / g.width) ** 2));
      }
      return w;
    }
    /** how much the hand stirs the leaves at a point: close to the pointer, and moving */
    const stir = (x: number, y: number) => {
      const h = s.hand;
      const d2 = (x - s.cam - h.x) ** 2 + (y - h.y) ** 2;
      return Math.exp(-d2 / 1800) * Math.min(1.5, Math.hypot(h.vx, h.vy) / 400);
    };
    const bez = (a: { x: number; y: number }, c: { x: number; y: number }, b: { x: number; y: number }, upto: number) => {
      const pts: { x: number; y: number }[] = [];
      const n = 14;
      for (let k = 0; k <= n; k++) {
        const u = (k / n) * upto;
        pts.push({ x: (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * c.x + u * u * b.x, y: (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * c.y + u * u * b.y });
      }
      return pts;
    };
    const leafWorld = (g: Seg, lf: Leaf, t: number) => {
      const a = pos(g.depth - 1, t),
        b = pos(g.depth, t);
      const mid = { x: (a.x + b.x) / 2 + (hash(g.seed) - 0.5) * 14, y: (a.y + b.y) / 2 + 8 + (hash(g.seed + 1) - 0.5) * 12 };
      const u = lf.t;
      const x = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * mid.x + u * u * b.x,
        y = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * mid.y + u * u * b.y;
      const gust = windAt(x, t),
        hand = stir(x, y);
      const flutter = (Math.sin(t * 3.1 + lf.phase) * 0.14 + Math.sin(t * 7.3 + lf.phase) * 0.05) * (1 + gust * 2.5 + hand * 3) + gust * 0.25 + Math.sin(t * 19 + lf.phase) * hand * 0.25;
      return { x, y, ang: -Math.PI / 2 + lf.ang + flutter };
    };
    /** the twigs off a place: up and down, alternating, and out ahead at the tip */
    const twig = (i: number, k: number, n: number, atTip: boolean, t: number) => {
      const from = pos(i, t);
      let ang: number, len: number;
      if (atTip) {
        const spread = Math.min(1.5, 0.5 * n);
        ang = n === 1 ? -0.15 : -spread / 2 - 0.1 + (spread * k) / (n - 1);
        len = 54;
      } else {
        const up = k % 2 === 0;
        ang = (up ? -1 : 1) * (0.95 + Math.floor(k / 2) * 0.32);
        len = 48 - Math.floor(k / 2) * 7;
      }
      ang += Math.sin(t * 1.6 + i + k) * 0.03;
      const to = { x: from.x + Math.cos(ang) * len, y: from.y + Math.sin(ang) * len };
      const lx = atTip ? 8 : 6,
        ly = atTip ? 0 : Math.sin(ang) < 0 ? -6 : 6;
      return { from, to, ang, bend: (hash(i * 7 + k) - 0.5) * 8, lx, ly };
    };
    const springy = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 - Math.cos(u * Math.PI * 1.5) * Math.exp(-u * 4.5));

    // ── drawing ──
    function drawWood(c: CanvasRenderingContext2D, pts: { x: number; y: number; w: number }[], alpha: number, wither = 0) {
      if (pts.length < 2) return;
      const side = (k: number, off: number) => {
        const a = pts[Math.max(0, k - 1)],
          b = pts[Math.min(pts.length - 1, k + 1)];
        const dx = b.x - a.x,
          dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: pts[k].x + (-dy / l) * pts[k].w * off, y: pts[k].y + (dx / l) * pts[k].w * off };
      };
      const ribbon = (o0: number, o1: number, fill: string | CanvasGradient) => {
        c.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const q = side(k, o0);
          if (k) c.lineTo(q.x, q.y);
          else c.moveTo(q.x, q.y);
        }
        for (let k = pts.length - 1; k >= 0; k--) {
          const q = side(k, o1);
          c.lineTo(q.x, q.y);
        }
        c.closePath();
        c.fillStyle = fill;
        c.fill();
      };
      c.globalAlpha = alpha;
      const tint = (hex: string) => (wither > 0 ? shade(hex, 1 - wither * 0.15) : hex);
      // round wood, lit from above: shadowed underside, the body, the lit top, a thin highlight and a warm rim of
      // back light along the very top edge
      ribbon(-0.5, 0.5, tint("#5a3d29"));
      ribbon(-0.5, 0.28, tint(BARK.mid));
      ribbon(-0.5, -0.05, tint("#86603f"));
      ribbon(-0.42, -0.24, tint(BARK.light));
      ribbon(-0.36, -0.3, "rgba(255,236,200,0.55)");
      ribbon(0.3, 0.5, "rgba(30,18,10,0.35)");
      const e = pts[pts.length - 1];
      c.fillStyle = tint(BARK.mid);
      c.beginPath();
      c.arc(e.x, e.y, e.w / 2, 0, Math.PI * 2);
      c.fill();
      // bark: long fibres running with the grain, broken here and there
      c.lineWidth = 0.7;
      for (let f = 0; f < 6; f++) {
        const off = -0.38 + f * 0.15;
        c.strokeStyle = f % 2 ? "rgba(36,22,12,0.28)" : "rgba(255,230,190,0.12)";
        c.beginPath();
        let pen = false;
        for (let k = 0; k < pts.length; k++) {
          if (pts[k].w < 5) {
            pen = false;
            continue;
          }
          const gap = hash(f * 31 + k * 7 + Math.round(pts[0].x)) < 0.2;
          const q = side(k, off + (hash(f * 13 + k) - 0.5) * 0.08);
          if (gap || !pen) c.moveTo(q.x, q.y);
          else c.lineTo(q.x, q.y);
          pen = !gap;
        }
        c.stroke();
      }
      // knots and a little moss where the wood is old and thick
      for (let k = 3; k < pts.length - 2; k += 5) {
        const w = pts[k].w;
        if (w < 9) continue;
        const h = hash(k * 3.3 + pts[0].x * 0.01);
        if (h < 0.45) {
          const q = side(k, 0.05);
          c.fillStyle = "rgba(45,28,16,0.55)";
          c.beginPath();
          c.ellipse(q.x, q.y, w * 0.18, w * 0.11, 0, 0, Math.PI * 2);
          c.fill();
          c.strokeStyle = "rgba(255,230,190,0.25)";
          c.lineWidth = 0.6;
          c.stroke();
        } else if (h > 0.7) {
          const q = side(k, -0.42);
          const g = c.createRadialGradient(q.x, q.y, 0, q.x, q.y, w * 0.5);
          g.addColorStop(0, "rgba(120,150,60,0.75)");
          g.addColorStop(1, "rgba(120,150,60,0)");
          c.fillStyle = g;
          c.beginPath();
          c.ellipse(q.x, q.y, w * 0.55, w * 0.22, 0, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.globalAlpha = 1;
    }
    function drawLeaf(c: CanvasRenderingContext2D, x: number, y: number, ang: number, size: number, col: number[], alpha: number, turn = 1) {
      if (size < 0.5 || alpha <= 0) return;
      c.save();
      c.globalAlpha = alpha;
      c.translate(x, y);
      c.rotate(ang);
      // turned edge on, or over: squash across the leaf; the underside is paler and cooler
      const under = turn < 0;
      c.scale(1, Math.max(0.06, Math.abs(turn)));
      // its shadow on whatever is behind
      c.fillStyle = "rgba(40,60,20,0.055)";
      c.beginPath();
      c.ellipse(size * 0.55 + 2.5, 3.5, size * 0.48, size * 0.18, 0, 0, Math.PI * 2);
      c.fill();
      // light comes through a leaf held up toward the sun (up and to the left): it glows yellow-green
      const facing = Math.max(0, -Math.sin(ang + 0.6));
      const lit = mix(col, [236, 240, 120], 0.18 + facing * 0.3);
      const base = under ? mix(col, [200, 215, 190], 0.4) : col;
      const g = c.createLinearGradient(0, -size * 0.32, size * 0.3, size * 0.32);
      g.addColorStop(0, `rgb(${(under ? base : lit).join(",")})`);
      g.addColorStop(1, `rgb(${mix(base, [18, 30, 10], 0.28).join(",")})`);
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(size * 0.22, -size * 0.36, size * 0.7, -size * 0.36, size * 1.04, -size * 0.02);
      c.bezierCurveTo(size * 0.7, size * 0.3, size * 0.25, size * 0.34, 0, 0);
      c.fill();
      // veins: the midrib and a few running out to the edge
      c.strokeStyle = `rgba(${mix(base, [255, 255, 225], 0.5).join(",")},0.65)`;
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(-2.5, 0);
      c.quadraticCurveTo(size * 0.5, -size * 0.03, size * 0.95, -size * 0.02);
      for (let v = 1; v <= 4; v++) {
        const u = v * 0.19;
        c.moveTo(size * u, -size * 0.01);
        c.lineTo(size * (u + 0.13), -size * (0.2 - v * 0.02));
        c.moveTo(size * u, size * 0.01);
        c.lineTo(size * (u + 0.13), size * (0.19 - v * 0.02));
      }
      c.stroke();
      // a glint of sheen across the upper surface
      if (!under) {
        c.fillStyle = "rgba(255,255,240,0.16)";
        c.beginPath();
        c.ellipse(size * 0.45, -size * 0.12, size * 0.28, size * 0.06, -0.15, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    }
    function drawBud(c: CanvasRenderingContext2D, x: number, y: number, ang: number, s: number, t: number) {
      c.save();
      c.translate(x, y);
      c.rotate(ang + Math.sin(t * 2.2) * 0.05);
      const r = 6.2 * s * (1 + Math.sin(t * 2.6) * 0.05);
      // the bud's two sepals cupping it
      c.fillStyle = "#4f7d36";
      c.beginPath();
      c.ellipse(r * 0.35, -r * 0.35, r * 0.75, r * 0.32, -0.6, 0, Math.PI * 2);
      c.ellipse(r * 0.35, r * 0.35, r * 0.75, r * 0.32, 0.6, 0, Math.PI * 2);
      c.fill();
      const g = c.createRadialGradient(r * 0.2, -r * 0.4, 0.5, r * 0.6, 0, r * 1.6);
      g.addColorStop(0, "#c9e39b");
      g.addColorStop(1, "#5d8f3f");
      c.fillStyle = g;
      c.beginPath();
      c.ellipse(r * 0.9, 0, r * 1.3, r * 0.8, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "rgba(60,90,40,.5)";
      c.lineWidth = 0.6;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(r * 1.1, -r * 0.2, r * 2.1, 0);
      c.stroke();
      c.restore();
    }
    function drawBird(c: CanvasRenderingContext2D, b: Bird, t: number) {
      c.save();
      c.translate(b.x, b.y);
      c.scale(b.face * 1.35, 1.35);
      const flying = b.mode === "fly";
      const hop = b.mode === "hop";
      const bob = b.mode === "perch" ? Math.sin(t * 2.4) * 0.4 : 0;
      // its shadow on the bark below
      if (!flying) {
        c.fillStyle = "rgba(30,18,8,0.22)";
        c.beginPath();
        c.ellipse(1, 2.2, 8, 1.8, 0, 0, Math.PI * 2);
        c.fill();
      }
      // body
      c.translate(0, bob);
      c.rotate(flying ? -0.15 : hop ? -0.1 : 0.06);
      // tail
      c.fillStyle = "#5b4130";
      c.beginPath();
      c.moveTo(-6, -6);
      c.lineTo(-17, -3 + (b.mode === "perch" ? Math.sin(t * 5) * 0.6 : 0) - b.tail * 5);
      c.lineTo(-16, 0);
      c.lineTo(-5, -3);
      c.fill();
      const body = c.createRadialGradient(1, -10, 1, 0, -7, 11);
      body.addColorStop(0, "#c49a6c");
      body.addColorStop(1, "#8a6040");
      c.fillStyle = body;
      c.beginPath();
      c.ellipse(0, -7, 10, 6.6, -0.12, 0, Math.PI * 2);
      c.fill();
      // pale breast
      c.fillStyle = "#e9dcc6";
      c.beginPath();
      c.ellipse(3, -4.5, 6, 3.8, -0.2, 0, Math.PI * 2);
      c.fill();
      // wing: folded, or beating
      c.save();
      c.translate(-1, -9);
      const flap = flying ? Math.sin(b.flap) : 0;
      c.rotate(flying ? -0.5 - flap * 1.15 : 0.05);
      const wing = c.createLinearGradient(0, -3, 0, 4);
      wing.addColorStop(0, "#7a5233");
      wing.addColorStop(1, "#4f3524");
      c.fillStyle = wing;
      c.beginPath();
      c.ellipse(-2, 0, flying ? 10 : 7.5, flying ? 3.6 + Math.abs(flap) * 1.6 : 3.6, flying ? -0.2 : -0.08, 0, Math.PI * 2);
      if (flying) {
        // flight feathers fanned at the wing's tip
        for (let f = 0; f < 4; f++) {
          c.moveTo(-10 - f * 1.2, -1 + f * 1.4);
          c.ellipse(-11 - f * 1.4, -1 + f * 1.4, 3.2, 1.1, -0.3, 0, Math.PI * 2);
        }
      }
      c.fill();
      c.strokeStyle = "rgba(240,225,200,.55)";
      c.lineWidth = 0.7;
      c.beginPath();
      c.moveTo(-7, 0.5);
      c.lineTo(2, 1);
      c.stroke();
      c.restore();
      // head, turning now and then
      c.save();
      // a peck takes the head down to the bark and back
      const pk = Math.sin(Math.min(1, b.peck) * Math.PI);
      c.translate(7.5 + pk * 3, -12.5 + pk * 8);
      c.rotate(b.look * 0.35 + pk * 0.9);
      c.fillStyle = "#8a6040";
      c.beginPath();
      c.arc(0, 0, 4.6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#6e7380";
      c.beginPath();
      c.arc(-0.5, -2, 3.2, Math.PI * 1.05, Math.PI * 1.95);
      c.fill();
      c.fillStyle = "#f2ead9";
      c.beginPath();
      c.arc(1.8, 1.2, 2.2, 0, Math.PI * 2);
      c.fill();
      if (b.blink > 0) {
        c.strokeStyle = "#3a2a1c";
        c.lineWidth = 0.8;
        c.beginPath();
        c.moveTo(0.6, -0.5);
        c.lineTo(2.6, -0.5);
        c.stroke();
      } else {
        c.fillStyle = "#111";
        c.beginPath();
        c.arc(1.6, -0.6, 1.05, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        c.beginPath();
        c.arc(1.9, -0.9, 0.35, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = "#d8a23a";
      c.beginPath();
      c.moveTo(4, -0.6);
      c.lineTo(7.4, 0.3);
      c.lineTo(4, 1.2);
      c.fill();
      c.restore();
      // legs, gripping, unless flying
      if (!flying) {
        c.strokeStyle = "#7a6656";
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(-1, -1.5);
        c.lineTo(-2, 1.5);
        c.moveTo(2, -1.5);
        c.lineTo(2.5, 1.5);
        c.stroke();
      }
      c.restore();
    }
    function stepBird(b: Bird, perch: { x: number; y: number }, dt: number, t: number) {
      const target = { x: perch.x - 2, y: perch.y - 4 };
      if (b.mode === "perch") {
        const d = Math.hypot(target.x - b.x, target.y - b.y);
        if (b.x === 0 && b.y === 0) {
          b.x = target.x;
          b.y = target.y;
        } else if (d > 70 && !reduce) {
          b.mode = "fly";
          b.t = 0;
          b.from = { x: b.x, y: b.y };
          b.dur = 0.45 + d / 520;
          b.face = target.x >= b.x ? 1 : -1;
          sfx.whoosh(700, 2000, { dur: 0.4, gain: 0.025 });
        } else if (d > 6 && !reduce) {
          b.mode = "hop";
          b.t = 0;
          b.from = { x: b.x, y: b.y };
          b.hops = Math.max(1, Math.round(d / 16));
          b.dur = b.hops * 0.17;
          b.face = target.x >= b.x ? 1 : -1;
        } else {
          // a perched bird follows its twig as it sways, blinks, pecks at the bark, and looks about now and then
          b.x += (target.x - b.x) * Math.min(1, dt * 12);
          b.y += (target.y - b.y) * Math.min(1, dt * 12);
          b.blink -= dt;
          b.nextBlink -= dt;
          if (b.nextBlink < 0) {
            b.nextBlink = 2 + Math.random() * 3.5;
            b.blink = 0.12;
          }
          if (b.peck > 0) {
            b.peck += dt / 0.32;
            if (b.peck >= 1) {
              b.peck = 0;
              sfx.tick({ freq: 2400, gain: 0.025 });
            }
          }
          b.nextPeck -= dt;
          if (b.nextPeck < 0 && !reduce) {
            b.nextPeck = 4 + Math.random() * 6;
            b.peck = 0.001;
          }
          b.nextLook -= dt;
          if (b.nextLook < 0) {
            b.nextLook = 1.2 + Math.random() * 2.5;
            b.look = Math.random() < 0.35 ? -0.6 : Math.random() < 0.5 ? 0.4 : 0;
            if (Math.random() < 0.25 && !reduce) b.face = (b.face * -1) as 1 | -1;
          }
        }
      }
      if (b.mode === "hop" || b.mode === "fly") {
        b.t += dt;
        const u = clamp(b.t / b.dur);
        b.to = target;
        if (b.mode === "fly") {
          b.flap += dt * 38;
          const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
          b.x = b.from.x + (b.to.x - b.from.x) * e;
          b.y = b.from.y + (b.to.y - b.from.y) * e - Math.sin(u * Math.PI) * 34;
        } else {
          const k = (u * b.hops) % 1;
          b.x = b.from.x + (b.to.x - b.from.x) * u;
          b.y = b.from.y + (b.to.y - b.from.y) * u - Math.sin(k * Math.PI) * 7;
          if (Math.floor((b.t - dt) / (b.dur / b.hops)) !== Math.floor(b.t / (b.dur / b.hops))) sfx.tick({ freq: 900, gain: 0.02 });
        }
        if (u >= 1) {
          b.mode = "perch";
          b.look = 0;
          b.landed = true;
          b.tail = 1;
          sfx.note(3200, { glide: 4300, dur: 0.07, gain: 0.02, bell: 0 });
          sfx.note(3600, { at: 0.1, glide: 4600, dur: 0.07, gain: 0.02, bell: 0 });
        }
      }
      b.tail = Math.max(0, b.tail - dt * 3);
      void t;
    }
    function placeLabel(key: string, x: number, y: number, show: number) {
      const el = labelRefs.current.get(key);
      if (!el) return;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      el.style.opacity = String(show);
      el.style.pointerEvents = show > 0.6 ? "auto" : "none";
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, bokeh]);

  // ── autoplay: climb out to the tip, then back toward the trunk, and out along another way ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    const routes = [
      ["Work", "Projects", "Q3 launch", "Designs"],
      ["Work", "Projects", "Q3 launch", "Designs", "Mobile"],
      ["Work", "Projects"],
      ["Work", "Projects", "Website"],
      ["Work", "Hiring"],
      ["Work", "Projects", "Q3 launch"],
    ];
    let i = 0;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      go(routes[i % routes.length], false);
      i++;
    }, 3400);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, inView]);

  const reg = (key: string) => (el: HTMLElement | null) => {
    if (el) labelRefs.current.set(key, el);
    else labelRefs.current.delete(key);
  };
  const crumbs = ["Home", ...path];
  const here = placeAt(path);
  // the side twigs and buds, for the buttons over the scene
  const sides: { key: string; name: string; to: string[]; kind: "sib" | "kid" }[] = [];
  for (let i = 0; i <= path.length; i++) {
    const parentPlace = placeAt(path.slice(0, i));
    for (const c of parentPlace.children ?? []) {
      if (c.name === path[i]) continue;
      const atTip = i === path.length;
      sides.push({ key: `${atTip ? "kid" : "sib"}:${i}:${c.name}`, name: c.name, to: [...path.slice(0, i), c.name], kind: atTip ? "kid" : "sib" });
    }
  }

  return (
    <div ref={rootRef} onPointerDown={() => (touched.current = true)} className={`w-full max-w-[680px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">{here.name}</div>
        <div className="text-[12px] text-[#86868b]">{here.children?.length ? `${here.children.length} inside` : "Nothing further in"}</div>
      </div>
      <div
        ref={sceneRef}
        onPointerMove={(e) => {
          const h = sim.current!.hand;
          const r = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - r.left,
            y = e.clientY - r.top;
          const now = performance.now() / 1000;
          const dt = Math.max(0.008, now - h.at);
          if (now - h.at < 0.2) {
            h.vx = h.vx * 0.5 + ((x - h.x) / dt) * 0.5;
            h.vy = h.vy * 0.5 + ((y - h.y) / dt) * 0.5;
          }
          h.x = x;
          h.y = y;
          h.at = now;
        }}
        className="relative mt-3 overflow-hidden rounded-[18px]"
        style={{ height: SH, background: "linear-gradient(180deg,#e6eedb 0%,#f1f4e8 50%,#faf8f1 100%)" }}
      >
        {/* soft sun from the top left */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 8% -10%, rgba(255,236,170,.75), rgba(255,240,190,0) 62%)" }} />
        <canvas ref={bokehRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" style={{ filter: "blur(5px)" }} />
        <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={foreRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] h-full w-full" style={{ filter: "blur(4px)", opacity: 0.85 }} />
        <nav aria-label="Breadcrumb" className="relative z-[2]">
          <ol>
            {crumbs.map((n, i) => {
              const current = i === crumbs.length - 1;
              return (
                <li key={`path:${i}:${n}`} ref={reg(`path:${i}`)} className="absolute left-0 top-0 will-change-transform" style={{ opacity: 0 }}>
                  <button
                    type="button"
                    aria-current={current ? "page" : undefined}
                    onClick={() => go(path.slice(0, i))}
                    className={`-translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold tracking-[-0.01em] shadow-[0_1px_2px_rgba(60,40,20,.18),0_0_0_0.5px_rgba(60,40,20,.12)] outline-none focus-visible:shadow-[0_0_0_2px_#0071e3] ${current ? "bg-[#1d1d1f] text-white" : "bg-white/95 text-[#3a3a3c] hover:bg-white"}`}
                  >
                    {n}
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
        <div aria-label={`Places in and beside ${here.name}`} role="group" className="relative z-[2]">
          {sides.map((sd) => (
            <button
              key={sd.key}
              ref={reg(sd.key)}
              type="button"
              onClick={() => go(sd.to)}
              aria-label={sd.kind === "kid" ? `Open ${sd.name}` : `Go to ${sd.name}`}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[11.5px] outline-none will-change-transform focus-visible:shadow-[0_0_0_2px_#0071e3] ${sd.kind === "kid" ? "font-semibold text-[#3d6b2a] hover:bg-white/70" : "-translate-y-1/2 font-medium text-[#6e6e73] hover:bg-white/70 hover:text-[#1d1d1f]"}`}
              style={{ opacity: 0, marginTop: sd.kind === "kid" ? -9 : 0 }}
            >
              {sd.name}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 text-[12px] text-[#86868b]">Tap a bud to grow into it, a twig to step aside, or a name to go back.</div>
    </div>
  );
}

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1000;
  return h / 1000;
}
function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * k),
    g = Math.round(((n >> 8) & 255) * k),
    b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}
