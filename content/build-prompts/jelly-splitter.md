# Jelly Splitter

Add the "Jelly Splitter" component from Nexus UI to my project.

A bill splitter where the bill is a slab of glossy watermelon jelly on a plate. Move over the jelly and a cleaver follows you; click or tap and it chops down, the slab splits there and the two pieces wobble apart, each one labelled with the next person and what they owe. Drag the handle in a gap to move the cut and the neighbouring pieces squash and stretch while the amounts follow, snapping to whole percents with a pull at every 5%. The small cross on a piece squishes it back into its neighbour, “Split evenly” glides every cut into place with a jiggle that runs left to right, and “Send requests” hands you the shares. Keyboard: Tab to a cut handle and use the arrow keys (1%, or 5% with Shift); “Add a cut” halves the biggest piece, and each piece's cross button merges it.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { JellySplitter } from "@/components/jelly-splitter";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/jelly-splitter/index.ts ---

```ts
export { JellySplitter } from "./jelly-splitter";
export type { JellyPerson, JellyShare, JellySplitterProps } from "./jelly-splitter";
```

--- components/jelly-splitter/jelly-splitter.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/immutability, react-hooks/purity, react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { Fragment, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type JellyPerson = { id: string; name: string; color: string };
export type JellyShare = { personId: string; amount: number; percent: number };
export type JellySplitterProps = {
  /** the bill */
  total?: number;
  currency?: string;
  title?: string;
  /** a second line under the title, e.g. the date */
  subtitle?: string;
  /** who can be in, in the order the pieces are handed out (up to 6; more slices add guests) */
  people?: JellyPerson[];
  /** where to start: the pieces from left to right, each a person and their percent */
  defaultShares?: { personId: string; percent: number }[];
  onChange?: (shares: JellyShare[]) => void;
  onRequest?: (shares: JellyShare[]) => void;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (MIT) via Iconify, inlined
const ICON = {
  fork: { vb: 256, body: "<path fill=\"currentColor\" d=\"M216 40v184a8 8 0 0 1-16 0v-48h-48a8 8 0 0 1-8-8a268.8 268.8 0 0 1 7.22-56.88c9.78-40.49 28.32-67.63 53.63-78.47A8 8 0 0 1 216 40m-96.11-1.31a8 8 0 1 0-15.78 2.63L111.89 88H88V40a8 8 0 0 0-16 0v48H48.11l7.78-46.68a8 8 0 1 0-15.78-2.63l-8 48A8 8 0 0 0 32 88a48.07 48.07 0 0 0 40 47.32V224a8 8 0 0 0 16 0v-88.68A48.07 48.07 0 0 0 128 88a8 8 0 0 0-.11-1.31Z\"/>" },
  knife: { vb: 256, body: "<path fill=\"currentColor\" d=\"M236 49a25 25 0 0 0-42.63-17.66l-50.21 50.2L18.34 206.4a8 8 0 0 0 3.86 13.45A160.7 160.7 0 0 0 58.4 224c32.95 0 65.91-10.2 96.94-30.23c31.76-20.5 50.19-43.82 51-44.8a8 8 0 0 0-.64-10.59L181.31 114l47.38-47.39A24.84 24.84 0 0 0 236 49m-89.77 131.6c-34.43 22.1-69.94 30.92-105.76 26.3L146 101.34l43.09 43.1a220 220 0 0 1-42.86 36.16\"/>" },
  equals: { vb: 256, body: "<path fill=\"currentColor\" d=\"M228 160a12 12 0 0 1-12 12H40a12 12 0 0 1 0-24h176a12 12 0 0 1 12 12M40 108h176a12 12 0 0 0 0-24H40a12 12 0 0 0 0 24\"/>" },
  send: { vb: 256, body: "<path fill=\"currentColor\" d=\"M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7\"/>" },
  x: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208.49 191.51a12 12 0 0 1-17 17L128 145l-63.51 63.49a12 12 0 0 1-17-17L111 128L47.51 64.49a12 12 0 0 1 17-17L128 111l63.51-63.52a12 12 0 0 1 17 17L145 128Z\"/>" },
  check: { vb: 256, body: "<path fill=\"currentColor\" d=\"m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z\"/>" },
} as const;

const PEOPLE: JellyPerson[] = [
  { id: "maya", name: "Maya", color: "#ff8a3d" },
  { id: "leo", name: "Leo", color: "#2fb4ff" },
  { id: "priya", name: "Priya", color: "#a47dff" },
  { id: "sam", name: "Sam", color: "#22c98c" },
];
const GUEST_COLORS = ["#ffc93d", "#ff7eb6", "#4fdde3", "#b3e33d"];
const MAX = 6;
const JH = 110; // the slab
const SK = 19; // green skin at the bottom
const RD = 6; // pale rind line
const FH = JH - SK - RD; // ruby flesh
const TF = 13; // the top face you see from slightly above
const GAP = 12;
const RAD = 18;
const STOP = Symbol("stop");

type Piece = { key: number; pid: string };
type Cut = { id: number; t: number };
type Data = { pieces: Piece[]; cuts: Cut[] };
type Phys = { x: number; v: number; o: number; ov: number; ot: number; drag: boolean };
type Wob = { s: number; sv: number; q: number; qv: number; pc: number; pw: number };
type Drop = { x: number; y: number; vx: number; vy: number; floor: number; land: number; s: number };

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
/** white initials when they pass 4.5:1, otherwise near-black */
const ink = (hex: string) => (1.05 / (lum(hex) + 0.05) >= 4.5 ? "#ffffff" : "#1d1d1f");
/** whole percents, with a sticky detent at every 5% */
const snapPct = (u: number) => {
  const p = u * 100;
  const f = Math.round(p / 5) * 5;
  return (Math.abs(p - f) < 0.8 ? f : Math.round(p)) / 100;
};
/** split whole units by largest remainder so the parts always add up */
const apportion = (fr: number[], units: number) => {
  const raw = fr.map((f) => f * units);
  const out = raw.map(Math.floor);
  let left = units - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - out[i], i] as const).sort((a, b) => b[0] - a[0]);
  for (let k = 0; left > 0 && order.length; k = (k + 1) % order.length, left--) out[order[k][1]]++;
  return out;
};
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const listing = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);

/**
 * A bill splitter where the bill is a slab of glossy watermelon jelly on a plate. Move over the jelly and a
 * cleaver follows you; click or tap and it chops down, the slab splits there and the two pieces wobble apart,
 * each one labelled with the next person and what they owe. Drag the handle in a gap to move the cut and the
 * neighbouring pieces squash and stretch while the amounts follow, snapping to whole percents with a pull
 * at every 5%. The small cross on a piece squishes it back into its neighbour, "Split evenly" glides every
 * cut into place with a jiggle that runs left to right, and "Send requests" hands you the shares.
 * Keyboard: Tab to a cut handle and use the arrow keys (1%, or 5% with Shift); "Add a cut" halves the biggest
 * piece, and each piece's cross button merges it.
 */
export function JellySplitter({
  total = 186.4,
  currency = "$",
  title = "Dinner at Nori",
  subtitle = "Friday, 8 November",
  people: peopleProp = PEOPLE,
  defaultShares,
  onChange,
  onRequest,
  autoplay = false,
  className = "",
}: JellySplitterProps) {
  const people = peopleProp.length ? peopleProp : PEOPLE;
  const reduced = !!useReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const uid = useId().replace(/:/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const slabRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  // ─── size: everything comes from the measured stage width ───
  const [SW, setSW] = useState(500);
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const pad = SW < 380 ? 16 : 24;
  const W = Math.max(150, Math.round(SW - pad * 2));
  const sc = clamp(W / 460, 0.76, 1); // the knife
  const [canHover, setCanHover] = useState(true);
  const roomy = canHover || autoplay; // on touch the knife waits out of sight until you press
  const KZ = roomy ? Math.round(58 * sc + 22) : 30; // room for the knife to hover
  const LH = 30; // name tags
  const JT = KZ + LH + 6; // top of the jelly
  const SH = JT + JH + 34;
  const minF = Math.max(0.045, 30 / W);
  // six people, unless the plate is too narrow to show six readable pieces
  const maxN = clamp(Math.floor((W + GAP) / (30 + GAP)), 2, MAX);
  const park = Math.min(W * 0.84, W + pad - 8 - 88 * sc); // where the knife rests, fully in view
  const geo = useRef({ W, sc, JT, KZ, minF, pad, park, maxN });
  geo.current = { W, sc, JT, KZ, minF, pad, park, maxN };

  // ─── the pieces and the cuts between them ───
  const keyRef = useRef(100);
  const [data, setData] = useState<Data>(() => {
    const ok = (defaultShares ?? []).filter((s) => s.percent > 0).slice(0, MAX);
    if (ok.length > 1) {
      const sum = ok.reduce((a, s) => a + s.percent, 0);
      let acc = 0;
      return {
        pieces: ok.map((s, i) => ({ key: i + 1, pid: s.personId })),
        cuts: ok.slice(0, -1).map((s, i) => ((acc += s.percent / sum), { id: i + 1, t: acc })),
      };
    }
    return { pieces: [{ key: 1, pid: ok[0]?.personId ?? people[0].id }], cuts: [] };
  });
  const dataRef = useRef(data);
  const rebase = useRef(true);
  const commit = useCallback((d: Data, structural = false) => {
    dataRef.current = d;
    if (structural) rebase.current = true;
    setData(d);
  }, []);

  const phys = useRef(new Map<number, Phys>()).current;
  const wobs = useRef(new Map<number, Wob>()).current;
  const ph = (c: Cut) => {
    let p = phys.get(c.id);
    if (!p) {
      p = { x: c.t, v: 0, o: 1, ov: 0, ot: 1, drag: false };
      phys.set(c.id, p);
    }
    return p;
  };
  const kick = (key: number, sv: number, qv: number) => {
    if (reducedRef.current) return;
    const w = wobs.get(key);
    if (w) {
      w.sv += sv;
      w.qv += qv;
    } else wobs.set(key, { s: 0, sv, q: 0, qv, pc: NaN, pw: NaN });
  };

  const guest = (pid: string): JellyPerson => {
    const n = parseInt(pid.replace("guest-", ""), 10) || 1;
    return { id: pid, name: `Guest ${n}`, color: GUEST_COLORS[(n - 1) % GUEST_COLORS.length] };
  };
  const personOf = (pid: string) => people.find((p) => p.id === pid) ?? guest(pid);
  const peopleRef = useRef(people);
  peopleRef.current = people;
  const nextPid = (pieces: Piece[]) => {
    const used = new Set(pieces.map((p) => p.pid));
    const free = peopleRef.current.slice(0, MAX).find((p) => !used.has(p.id));
    if (free) return free.id;
    for (let n = 1; ; n++) if (!used.has(`guest-${n}`)) return `guest-${n}`;
  };

  // shares from the cut targets: cents and percents that always add up
  const shares = useMemo<JellyShare[]>(() => {
    const b = [0, ...data.cuts.map((c) => c.t), 1];
    const fr = data.pieces.map((_, i) => b[i + 1] - b[i]);
    const cents = apportion(fr, Math.round(total * 100));
    const pct = apportion(fr, 100);
    return data.pieces.map((p, i) => ({ personId: p.pid, amount: cents[i] / 100, percent: pct[i] }));
  }, [data, total]);
  const sharesRef = useRef(shares);
  sharesRef.current = shares;
  const money = (v: number) => `${currency}${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ─── status ───
  const [note, setNote] = useState<string | null>(null);
  const noteT = useRef(0);
  const say = useCallback((m: string) => {
    setNote(m);
    window.clearTimeout(noteT.current);
    noteT.current = window.setTimeout(() => setNote(null), 2600);
  }, []);
  const [live, setLive] = useState("");
  const lastShares = useRef(JSON.stringify(shares));
  useEffect(() => {
    const j = JSON.stringify(shares);
    if (j === lastShares.current) return;
    lastShares.current = j;
    onChange?.(shares);
    const t = window.setTimeout(() => setLive(listing(shares.map((s) => `${personOf(s.personId).name} pays ${money(s.amount)}`)) + "."), 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shares]);

  // ─── layout of the moving parts, written straight to the DOM every frame ───
  const pieceEls = useRef(new Map<number, HTMLDivElement>()).current;
  const patEls = useRef(new Map<number, SVGSVGElement>()).current;
  const tagEls = useRef(new Map<number, HTMLDivElement>()).current;
  const shadeEls = useRef(new Map<number, HTMLDivElement>()).current;
  const handleEls = useRef(new Map<number, HTMLDivElement>()).current;
  const knifeRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const dropEls = useRef<(HTMLSpanElement | null)[]>([]);
  const drops = useRef<Drop[]>([]);
  const lay = useRef({ Weff: 0, gaps: [] as number[], a: [] as number[], b: [] as number[], left: [] as number[], w: [] as number[] });
  const knife = useRef({ x: NaN, v: 0, o: 0, t: 0 });
  const aim = useRef<{ px: number | null; src: null | "mouse" | "demo" | "chop" }>({ px: null, src: null });
  const hoverU = useRef<number | null>(null);
  const chopping = useRef(false);
  const lifting = useRef(false); // on touch the knife fades as soon as it lifts
  const merging = useRef(false);
  const kOff = useMotionValue(0); // knife drop below its hover line
  const kRot = useMotionValue(0);
  const smear = useMotionValue(0);
  const thud = useMotionValue(0);
  const canHoverRef = useRef(true);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const upd = () => {
      canHoverRef.current = mq.matches;
      setCanHover(mq.matches);
    };
    upd();
    mq.addEventListener("change", upd);
    return () => mq.removeEventListener("change", upd);
  }, []);

  const geom = () => {
    const { W: w0 } = geo.current;
    const { pieces, cuts } = dataRef.current;
    const n = pieces.length;
    const gaps = cuts.map((c) => GAP * clamp(ph(c).o, 0, 1.7));
    const Weff = w0 - gaps.reduce((s, g) => s + g, 0);
    const a: number[] = [];
    const b: number[] = [];
    const left: number[] = [];
    const w: number[] = [];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const ai = i === 0 ? 0 : ph(cuts[i - 1]).x;
      const bi = i === n - 1 ? 1 : ph(cuts[i]).x;
      a.push(ai);
      b.push(bi);
      left.push(ai * Weff + acc);
      w.push(Math.max(0, (bi - ai) * Weff));
      if (i < n - 1) acc += gaps[i];
    }
    lay.current = { Weff, gaps, a, b, left, w };
    return lay.current;
  };
  const pxToFrac = (px: number) => {
    const L = lay.current;
    for (let i = 0; i < L.w.length; i++) if (px >= L.left[i] - 0.5 && px <= L.left[i] + L.w[i] + 0.5) return clamp(L.a[i] + (px - L.left[i]) / L.Weff, L.a[i], L.b[i]);
    return null;
  };
  const fracToPx = (u: number) => {
    const L = lay.current;
    for (let i = 0; i < L.w.length; i++) if (u <= L.b[i] + 1e-9 || i === L.w.length - 1) return L.left[i] + (u - L.a[i]) * L.Weff;
    return u * geo.current.W;
  };
  /** which piece a cut at u would split, or why it can't */
  const room = (u: number, force = false): number | "full" | "tight" => {
    const { pieces, cuts } = dataRef.current;
    if (pieces.length >= geo.current.maxN) return "full";
    const b = [0, ...cuts.map((c) => c.t), 1];
    const m = force ? 0.01 : geo.current.minF - 1e-6;
    for (let i = 0; i < b.length - 1; i++) if (u > b[i] && u < b[i + 1]) return u - b[i] >= m && b[i + 1] - u >= m ? i : "tight";
    return "tight";
  };

  const lastCss = useRef(new WeakMap<HTMLElement | SVGElement, string>()).current;
  const css = (el: HTMLElement | SVGElement, key: string, v: string) => {
    const k = `${key}:${v}`;
    if (lastCss.get(el) === k) return;
    lastCss.set(el, k);
    el.style.setProperty(key, v);
  };
  const paintRef = useRef<() => void>(() => {});
  paintRef.current = () => {
    const g = geo.current;
    const L = geom();
    const { pieces, cuts } = dataRef.current;
    const n = pieces.length;
    for (let i = 0; i < n; i++) {
      const p = pieces[i];
      const el = pieceEls.get(p.key);
      if (!el) continue;
      const wb = wobs.get(p.key);
      const s = wb ? wb.s : 0;
      const q = wb ? wb.q : 0;
      const rl = i === 0 ? RAD : RAD * clamp(L.gaps[i - 1] / GAP, 0, 1);
      const rr = i === n - 1 ? RAD : RAD * clamp(L.gaps[i] / GAP, 0, 1);
      const sig = `${L.w[i]}|${L.left[i]}|${s}|${q}|${rl}|${rr}`;
      if (lastCss.get(el) !== sig) {
        lastCss.set(el, sig);
        el.style.width = `${L.w[i]}px`;
        el.style.transform = `translate3d(${L.left[i]}px,0,0) skewX(${s}deg) scale(${1 + q * 0.4},${1 - q})`;
        el.style.borderRadius = `${rl}px ${rr}px ${rr}px ${rl}px`;
      }
      const pat = patEls.get(p.key);
      if (pat) css(pat, "transform", `translate3d(${-L.a[i] * L.Weff}px,0,0)`);
      const cx = L.left[i] + L.w[i] / 2;
      const tag = tagEls.get(p.key);
      if (tag) {
        const hw = (tagW.get(p.key) ?? 24) / 2;
        const tx = clamp(cx - Math.tan((s * Math.PI) / 180) * JH, hw - g.pad + 6, g.W + g.pad - 6 - hw);
        css(tag, "transform", `translate3d(${tx}px,${q * JH * 0.9}px,0)`);
      }
      const sh = shadeEls.get(p.key);
      if (sh) css(sh, "transform", `translate3d(${L.left[i]}px,0,0) scaleX(${(L.w[i] / 100) * (1 + q * 0.5)})`);
    }
    cuts.forEach((c, j) => {
      const el = handleEls.get(c.id);
      if (!el || j >= n - 1) return;
      css(el, "transform", `translate3d(${L.left[j] + L.w[j] + L.gaps[j] / 2}px,0,0)`);
      el.style.opacity = `${clamp((L.gaps[j] / GAP) * 1.6 - 0.4, 0, 1)}`;
    });
    // the knife
    const k = knife.current;
    const kn = knifeRef.current;
    if (kn) {
      if (Number.isNaN(k.x)) k.x = g.park;
      const rot = kRot.get();
      const y = g.KZ - 8 + kOff.get() + (chopping.current ? 0 : Math.sin(k.t * 1.8) * 1.6);
      const r = -10 + rot + clamp(k.v * 0.012, -9, 9) * (1 - rot / 10);
      kn.style.transform = `translate3d(${k.x - 42 * g.sc}px,${y - 50 * g.sc}px,0) rotate(${r}deg)`;
      kn.style.opacity = `${k.o}`;
    }
    const gd = guideRef.current;
    if (gd) {
      const show = aim.current.src === "mouse" && hoverU.current != null && !chopping.current;
      if (show) gd.style.transform = `translate3d(${fracToPx(hoverU.current!) - 1}px,0,0)`;
      gd.style.opacity = show ? "1" : "0";
    }
    drops.current.forEach((d, i) => {
      const el = dropEls.current[i];
      if (!el) return;
      const since = d.land ? k.t - d.land : 0;
      el.style.opacity = `${d.land ? clamp(1 - since / 0.9, 0, 1) : 1}`;
      if (d.land) {
        // a splat on the plate that spreads a little as it fades
        const sp = 1 + Math.min(1, since * 6) * 0.9;
        el.style.transform = `translate3d(${d.x - 5}px,${d.y - 5}px,0) scale(${d.s * sp},${d.s * 0.36})`;
      } else {
        // a teardrop stretched along its flight
        const sp = Math.hypot(d.vx, d.vy);
        const ang = (Math.atan2(d.vy, d.vx) * 180) / Math.PI - 90;
        el.style.transform = `translate3d(${d.x - 5}px,${d.y - 5}px,0) rotate(${ang}deg) scale(${d.s * 0.86},${d.s * (1 + Math.min(0.9, sp / 600))})`;
      }
    });
  };

  // ─── one physics loop: cuts, jelly wobble, the knife and juice ───
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (dt: number) => {
      const red = reducedRef.current;
      const { pieces, cuts } = dataRef.current;
      for (const c of cuts) {
        const p = ph(c);
        if (red) {
          p.x = c.t;
          p.v = 0;
          p.o = p.ot;
          p.ov = 0;
          continue;
        }
        const k = p.drag ? 1500 : 200;
        const z = p.drag ? 1 : 0.62;
        p.v += (k * (c.t - p.x) - 2 * z * Math.sqrt(k) * p.v) * dt;
        p.x += p.v * dt;
        p.ov += (420 * (p.ot - p.o) - 2 * 0.36 * Math.sqrt(420) * p.ov) * dt;
        p.o += p.ov * dt;
        // come fully to rest so nothing creeps forever
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (Math.abs(c.t - p.x) < 2e-5 && Math.abs(p.v) < 2e-4) (p.x = c.t), (p.v = 0);
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        if (Math.abs(p.ot - p.o) < 1e-3 && Math.abs(p.ov) < 1e-2) (p.o = p.ot), (p.ov = 0);
      }
      const L = geom();
      const reb = rebase.current;
      rebase.current = false;
      for (let i = 0; i < pieces.length; i++) {
        const key = pieces[i].key;
        const cx = L.left[i] + L.w[i] / 2;
        let wb = wobs.get(key);
        if (!wb) {
          wb = { s: 0, sv: 0, q: 0, qv: 0, pc: cx, pw: L.w[i] };
          wobs.set(key, wb);
        }
        if (reb || Number.isNaN(wb.pc)) {
          wb.pc = cx;
          wb.pw = L.w[i];
        }
        const vx = (cx - wb.pc) / dt;
        const vw = (L.w[i] - wb.pw) / dt;
        wb.pc = cx;
        wb.pw = L.w[i];
        if (red) {
          wb.s = wb.sv = wb.q = wb.qv = 0;
          continue;
        }
        // the top lags behind when it moves; squeezed pieces bulge up, stretched ones sag
        const sT = Math.abs(vx) < 0.5 ? 0 : clamp(vx * 0.009, -8, 8);
        const qT = Math.abs(vw) < 0.5 ? 0 : clamp((vw / Math.max(24, L.w[i])) * 0.06, -0.1, 0.1);
        wb.sv += (760 * (sT - wb.s) - 8.4 * wb.sv) * dt;
        wb.s = clamp(wb.s + wb.sv * dt, -14, 14);
        wb.qv += (900 * (qT - wb.q) - 10 * wb.qv) * dt;
        wb.q = clamp(wb.q + wb.qv * dt, -0.18, 0.18);
        if (Math.abs(wb.s) < 0.02 && Math.abs(wb.sv) < 0.3 && sT === 0) wb.s = wb.sv = 0;
        if (Math.abs(wb.q) < 4e-4 && Math.abs(wb.qv) < 6e-3 && qT === 0) wb.q = wb.qv = 0;
      }
      // the knife glides after its target and sways as it goes
      const k = knife.current;
      const g = geo.current;
      const target = aim.current.px ?? g.park;
      const kk = aim.current.src === "chop" ? 900 : 240;
      if (Number.isNaN(k.x)) k.x = target;
      if (red) {
        k.x = target;
        k.v = 0;
      } else {
        k.v += (kk * (target - k.x) - 2 * 0.8 * Math.sqrt(kk) * k.v) * dt;
        k.x += k.v * dt;
      }
      const vis = !lifting.current && (canHoverRef.current || aim.current.px != null || chopping.current) ? 1 : 0;
      k.o += (vis - k.o) * Math.min(1, dt * 12);
      k.t += dt;
      for (const d of drops.current) {
        if (d.land) continue;
        d.vy += 1400 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.vy > 0 && d.y >= d.floor) {
          d.y = d.floor;
          d.land = k.t;
        }
      }
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(1 / 30, (now - last) / 1000);
      last = now;
      if (!inViewRef.current || dt <= 0) return;
      const n = dt > 1 / 50 ? 2 : 1;
      for (let i = 0; i < n; i++) step(dt / n);
      paintRef.current();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // place everything right away after React changes the pieces (and note how wide each name tag is)
  const tagW = useRef(new Map<number, number>()).current;
  useLayoutEffect(() => {
    tagEls.forEach((el, key) => tagW.set(key, (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 24));
    paintRef.current();
  });

  // ─── actions ───
  const pause = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
  const to = (mv: MotionValue<number>, v: number, o: Record<string, unknown>) => new Promise<void>((res) => void animate(mv, v, { ...o, onComplete: res } as never));

  /** cut at u right now (the knife has already landed) */
  const sliceAt = (u: number, force = false) => {
    const where = room(u, force);
    if (typeof where !== "number") return null;
    const { pieces, cuts } = dataRef.current;
    const pid = nextPid(pieces);
    const key = keyRef.current++;
    const id = keyRef.current++;
    const np = [...pieces];
    np.splice(where + 1, 0, { key, pid });
    const nc = [...cuts];
    nc.splice(where, 0, { id, t: u });
    const red = reducedRef.current;
    phys.set(id, { x: u, v: 0, o: red ? 1 : 0, ov: red ? 0 : 7, ot: 1, drag: false });
    commit({ pieces: np, cuts: nc }, true);
    // the halves splay apart and squash under the blade
    kick(pieces[where].key, 320, 4.4);
    kick(key, -320, 4.4);
    return { where, key, name: personOf(pid).name };
  };

  const refuse = (why: "full" | "tight") => {
    say(why === "full" ? (geo.current.maxN === MAX ? "Six people is the most for one bill." : "There's no room for another piece here.") : "That piece is too small to cut again.");
    dataRef.current.pieces.forEach((p, i) => kick(p.key, i % 2 ? -40 : 40, 0.6));
  };

  const queued = useRef<(() => void) | null>(null);
  const runQueued = () => {
    const q = queued.current;
    queued.current = null;
    q?.();
  };
  const chop = useCallback(async (u: number, from: "pointer" | "touch" | "key" | "demo", force = false) => {
    if (chopping.current || merging.current) {
      if (from !== "demo") queued.current = () => void chop(u, from, force);
      return;
    }
    const where = room(u, force);
    if (typeof where !== "number") return refuse(where);
    chopping.current = true;
    lifting.current = false;
    const px = fracToPx(u);
    aim.current = { px, src: "chop" };
    if (from === "touch") {
      knife.current.x = px;
      knife.current.v = 0;
    }
    if (reducedRef.current) {
      const r = sliceAt(u, force);
      if (r) say(`${r.name} is in.`);
      if (r && force) splitEvenly();
      chopping.current = false;
      aim.current = { px: null, src: null };
      runQueued();
      return;
    }
    // let it arrive over the spot, then drop like a cleaver
    const t0 = performance.now();
    while (Math.abs(knife.current.x - px) > 2.5 && performance.now() - t0 < 500) await pause(16);
    const g = geo.current;
    const D = g.JT + JH + 4 - (g.KZ - 8);
    void to(kRot, 10, { duration: 0.1, ease: "easeIn" });
    await to(kOff, D, { duration: 0.12, ease: [0.7, 0, 1, 0.5] });
    const r = sliceAt(u, force);
    if (r && force) window.setTimeout(() => splitEvenly(), 140);
    if (r) {
      void to(thud, 0, { type: "spring", from: 0, velocity: 160, stiffness: 700, damping: 16 });
      smear.set(0.9);
      void to(smear, 0, { duration: 1.6, delay: 0.3, ease: "easeIn" });
      const top = g.JT + 16;
      drops.current = Array.from({ length: 4 }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        return {
          x: px + side * 3,
          y: top + Math.random() * 8,
          vx: side * (50 + Math.random() * 120) * (i < 2 ? 1 : 0.45),
          vy: -(260 + Math.random() * 200) * (i < 2 ? 1 : 0.7),
          floor: g.JT + JH + 3 + Math.random() * 7,
          land: 0,
          s: i < 2 ? 1 + Math.random() * 0.3 : 0.6 + Math.random() * 0.25,
        };
      });
    }
    await pause(70);
    if (from === "touch" && !canHoverRef.current) lifting.current = true;
    void to(kRot, 0, { type: "spring", stiffness: 260, damping: 18 });
    await to(kOff, 0, { type: "spring", stiffness: 300, damping: 19, restDelta: 0.5 });
    chopping.current = false;
    window.setTimeout(runQueued, 0);
    aim.current = from === "pointer" && hoverU.current != null ? { px: fracToPx(hoverU.current), src: "mouse" } : { px: from === "demo" ? px : null, src: from === "demo" ? "demo" : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mergeAt = useCallback((i: number) => {
    if (merging.current || chopping.current) return;
    const { pieces, cuts } = dataRef.current;
    if (pieces.length < 2 || i < 0 || i >= pieces.length) return;
    const j = i < pieces.length - 1 ? i : i - 1;
    const nb = i < pieces.length - 1 ? i + 1 : i - 1;
    const gone = pieces[i];
    const keep = pieces[nb];
    const cut = cuts[j];
    const finish = () => {
      const cur = dataRef.current;
      const np = cur.pieces.filter((p) => p.key !== gone.key);
      const nc = cur.cuts.filter((c) => c.id !== cut.id);
      phys.delete(cut.id);
      wobs.delete(gone.key);
      commit({ pieces: np, cuts: nc }, true);
      kick(keep.key, 0, -5);
      merging.current = false;
      say(`${personOf(gone.pid).name}'s share went to ${personOf(keep.pid).name}.`);
      window.setTimeout(runQueued, 0);
    };
    const p = phys.get(cut.id);
    if (reducedRef.current || !p) return finish();
    merging.current = true;
    p.ot = 0;
    p.ov = -3;
    kick(gone.key, nb > i ? -140 : 140, -2);
    kick(keep.key, nb > i ? 140 : -140, -2);
    window.setTimeout(finish, 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const splitEvenly = useCallback(() => {
    const { pieces, cuts } = dataRef.current;
    const n = pieces.length;
    if (n < 2) return say("Cut the jelly first.");
    commit({ pieces, cuts: cuts.map((c, j) => ({ ...c, t: (j + 1) / n })) });
    if (!reducedRef.current) pieces.forEach((p, i) => window.setTimeout(() => kick(p.key, i % 2 ? -230 : 230, 3.4), 60 + i * 95));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCut = () => {
    if (chopping.current || merging.current) {
      queued.current = addCut;
      return;
    }
    const { pieces, cuts } = dataRef.current;
    if (pieces.length >= geo.current.maxN) return refuse("full");
    const b = [0, ...cuts.map((c) => c.t), 1];
    let best = 0;
    for (let i = 1; i < pieces.length; i++) if (b[i + 1] - b[i] > b[best + 1] - b[best]) best = i;
    // halve the biggest piece; if even that is too small, cut it anyway and even everything out to make room
    const u = (b[best] + b[best + 1]) / 2;
    void chop(u, "key", typeof room(u) !== "number");
  };

  const setCut = useCallback((id: number, t: number) => {
    const { pieces, cuts } = dataRef.current;
    const j = cuts.findIndex((c) => c.id === id);
    if (j < 0) return;
    const m = geo.current.minF;
    const lo = (j === 0 ? 0 : cuts[j - 1].t) + m;
    const hi = (j === cuts.length - 1 ? 1 : cuts[j + 1].t) - m;
    const v = clamp(t, lo, hi);
    if (Math.abs(v - cuts[j].t) < 1e-6) return;
    const nc = cuts.slice();
    nc[j] = { id, t: v };
    commit({ pieces, cuts: nc });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dragging a gap: the gap centre follows the pointer
  const [dragging, setDragging] = useState<number | null>(null);
  const grab = useRef({ id: -1, off: 0 });
  const gapToFrac = (id: number, px: number) => {
    const L = lay.current;
    const j = dataRef.current.cuts.findIndex((c) => c.id === id);
    if (j < 0) return null;
    let before = 0;
    for (let k = 0; k < j; k++) before += L.gaps[k];
    return (px - before - L.gaps[j] / 2) / L.Weff;
  };
  const startDrag = (id: number) => {
    const c = dataRef.current.cuts.find((x) => x.id === id);
    if (!c) return;
    ph(c).drag = true;
    setDragging(id);
  };
  const endDrag = () => {
    phys.forEach((p) => (p.drag = false));
    grab.current.id = -1;
    setDragging(null);
  };
  const slabX = (clientX: number) => clientX - (slabRef.current?.getBoundingClientRect().left ?? 0);
  const onHandleDown = (id: number) => (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const L = lay.current;
    const j = dataRef.current.cuts.findIndex((c) => c.id === id);
    const centre = L.left[j] + L.w[j] + L.gaps[j] / 2;
    grab.current = { id, off: slabX(e.clientX) - centre };
    startDrag(id);
  };
  const onHandleMove = (e: RPointerEvent<HTMLDivElement>) => {
    const { id, off } = grab.current;
    if (id < 0) return;
    const f = gapToFrac(id, slabX(e.clientX) - off);
    if (f != null) setCut(id, snapPct(f));
  };
  const onHandleKey = (id: number) => (e: RKeyboardEvent<HTMLDivElement>) => {
    const c = dataRef.current.cuts.find((x) => x.id === id);
    if (!c) return;
    const p = c.t * 100;
    const big = e.shiftKey || e.key === "PageUp" || e.key === "PageDown";
    let dir = 0;
    if (e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "PageUp") dir = 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown" || e.key === "PageDown") dir = -1;
    else if (e.key === "Home") return e.preventDefault(), setCut(id, 0);
    else if (e.key === "End") return e.preventDefault(), setCut(id, 1);
    else return;
    e.preventDefault();
    const step = big ? 5 : 1;
    const np = dir > 0 ? Math.floor(p / step + 1e-6) * step + step : Math.ceil(p / step - 1e-6) * step - step;
    setCut(id, np / 100);
  };

  // pointer over the plate: the knife follows, a guide shows where it will cut
  const onStageMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || grab.current.id >= 0) return;
    const px = slabX(e.clientX);
    const u = (e.target as HTMLElement).closest("[data-handle],[data-merge]") ? null : pxToFrac(px);
    const s = u == null ? null : snapPct(u);
    hoverU.current = s != null && typeof room(s) === "number" ? s : null;
    if (!chopping.current && aim.current.src !== "demo") aim.current = { px: hoverU.current != null ? fracToPx(hoverU.current) : clamp(px, 0, geo.current.W), src: "mouse" };
  };
  const onStageLeave = () => {
    hoverU.current = null;
    if (aim.current.src === "mouse") aim.current = { px: null, src: null };
  };
  const onSlabDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("[data-handle],[data-merge]")) return;
    const u = pxToFrac(slabX(e.clientX));
    if (u == null) return;
    void chop(snapPct(u), e.pointerType === "touch" ? "touch" : "pointer");
  };

  const [sent, setSent] = useState(false);
  const send = () => {
    onRequest?.(sharesRef.current);
    setSent(true);
    say(`Requests sent to ${listing(dataRef.current.pieces.map((p) => personOf(p.pid).name))}.`);
    window.setTimeout(() => setSent(false), 2400);
  };

  // ─── autoplay: two cuts, a drag, split evenly, then merge back ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    let following = false;
    let sx = 0;
    const own = new Set<AnimationPlaybackControls>();
    const unsub = gx.on("change", (v) => {
      if (following && !chopping.current) aim.current = { px: v - sx, src: "demo" };
    });
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      following = false;
      if (aim.current.src === "demo") aim.current = { px: null, src: null };
      if (grab.current.id >= 0 || [...phys.values()].some((p) => p.drag)) endDrag();
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
    const run = (mv: MotionValue<number>, v: number, duration: number, onUpdate?: (x: number) => void) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onUpdate, onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const box = () => {
      const s = slabRef.current!.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: s.left - b.left, y: s.top - b.top };
    };
    const moveTo = async (x: number, y: number, d: number) => {
      if (go.get() < 0.5) {
        gx.set(x + 34);
        gy.set(y + 44);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, d), run(gy, y, d)]);
    };
    const press = async (act: () => void) => {
      await run(gs, 0.8, 0.08);
      act();
      await run(gs, 1, 0.12);
    };
    const tap = async (sel: string, act: () => void, d = 0.5) => {
      const el = root.querySelector<HTMLElement>(sel);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      await moveTo(r.left - b.left + r.width / 2, r.top - b.top + r.height / 2, d);
      await press(act);
    };
    const slice = async (u: number) => {
      const b = box();
      sx = b.x;
      following = true;
      await moveTo(b.x + fracToPx(u), b.y + JH * 0.42, 0.5);
      await wait(200);
      await press(() => void chop(u, "demo"));
      await wait(520);
    };
    const drag = async (j: number, targets: number[]) => {
      const c = dataRef.current.cuts[j];
      if (!c) return;
      following = false;
      const b = box();
      const L = lay.current;
      const hx = b.x + L.left[j] + L.w[j] + L.gaps[j] / 2;
      await moveTo(hx, b.y + JH / 2, 0.55);
      await run(gs, 0.82, 0.08);
      startDrag(c.id);
      for (const t of targets) {
        const Lc = lay.current;
        const jj = dataRef.current.cuts.findIndex((x) => x.id === c.id);
        let before = 0;
        for (let k = 0; k < jj; k++) before += Lc.gaps[k];
        const ex = b.x + t * Lc.Weff + before + Lc.gaps[jj] / 2;
        await run(gx, ex, 0.75, (v) => {
          const f = gapToFrac(c.id, v - b.x);
          if (f != null) setCut(c.id, snapPct(f));
        });
        await wait(140);
      }
      endDrag();
      await run(gs, 1, 0.12);
    };
    (async () => {
      await wait(450);
      while (alive) {
        while (dataRef.current.pieces.length > 1) {
          await tap(`[data-merge="${dataRef.current.pieces.length - 1}"]`, () => mergeAt(dataRef.current.pieces.length - 1));
          await wait(500);
        }
        await slice(0.5);
        await slice(0.75);
        await drag(0, [0.3, 0.58]);
        await wait(300);
        following = false;
        aim.current = { px: null, src: null };
        await tap("[data-even]", () => splitEvenly(), 0.6);
        await run(go, 0, 0.3);
        await wait(1900);
        await tap('[data-merge="1"]', () => mergeAt(1), 0.6);
        await run(go, 0, 0.3);
        await wait(2400);
        await tap('[data-merge="1"]', () => mergeAt(1), 0.5);
        await run(go, 0, 0.3);
        await wait(1800);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      unsub();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  // ─── the jelly, drawn once and shown through every piece ───
  const pattern = useMemo(() => {
    const r = rng(11);
    // seeds hang at two depths: the far ones are smaller, softer and fainter
    const seeds: { x: number; y: number; a: number; s: number; far: boolean }[] = [];
    const ns = Math.max(6, Math.round(W / 26));
    for (let i = 0; i < ns; i++) {
      const far = i % 3 === 1;
      seeds.push({ x: ((i + 0.5) / ns) * W + (r() - 0.5) * 12, y: FH * (far ? 0.7 : [0.8, 0.88][i % 2]) + (r() - 0.5) * 5, a: (r() - 0.5) * 56, s: far ? 0.62 + r() * 0.15 : 0.82 + r() * 0.3, far });
    }
    // watermelon skin: broad dark bands with ragged, feathered edges, and thin pale streaks between them
    const stripes: { d: string; dark: boolean }[] = [];
    const nst = Math.max(8, Math.round(W / 19));
    const y0 = FH + RD - 0.5;
    const band = (x: number, h: number, lean: number) => {
      const steps = 6;
      const L: string[] = [];
      const R: string[] = [];
      let jl = 0;
      let jr = 0;
      for (let k = 0; k <= steps; k++) {
        const y = y0 + ((JH - y0) * k) / steps;
        const c = x + lean * (k / steps);
        jl = clamp(jl + (r() - 0.5) * 1.6, -1.4, 1.4);
        jr = clamp(jr + (r() - 0.5) * 1.6, -1.4, 1.4);
        L.push(`${(c - h + jl).toFixed(1)} ${y.toFixed(1)}`);
        R.unshift(`${(c + h + jr).toFixed(1)} ${y.toFixed(1)}`);
      }
      return `M${L.join("L")}L${R.join("L")}Z`;
    };
    for (let i = 0; i < nst; i++) {
      const x = ((i + 0.5) / nst) * W + (r() - 0.5) * 6;
      const lean = (r() - 0.5) * 6;
      stripes.push({ d: band(x, 2.6 + r() * 2.2, lean), dark: true });
      if (r() > 0.45) stripes.push({ d: band(x + W / nst / 2 + (r() - 0.5) * 3, 0.5 + r() * 0.5, lean * 0.6), dark: false });
    }
    const bubbles = Array.from({ length: Math.max(5, Math.round(W / 40)) }, () => ({ x: r() * W, y: TF + 6 + r() * (FH - TF - 24), r: 1 + r() * 2.2 }));
    const specks = Array.from({ length: Math.round(W / 5) }, () => ({ x: r() * W, y: TF + 3 + r() * (FH - TF - 6), r: 0.45 + r() * 0.8, o: 0.07 + r() * 0.13 }));
    return (
      <g id={`${uid}pat`}>
        {/* the lit top face, then the deeper front face */}
        <rect x="0" y="0" width={W} height={TF + 2} fill={`url(#${uid}tp)`} />
        <rect x="0" y={TF} width={W} height={FH - TF + 2} fill={`url(#${uid}fl)`} />
        <rect x="0" y={TF} width={W} height="1.3" fill="#fff" opacity=".75" />
        <rect x="0" y={TF + 1.3} width={W} height="5" fill={`url(#${uid}lip)`} />
        {specks.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffd6e0" opacity={s.o} />
        ))}
        {seeds
          .filter((s) => s.far)
          .map((s, i) => (
            <path key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.s})`} d="M0 -5.4C2.6 -2.1 3.6 1.4 2.6 3.6C1.6 5.6 -1.6 5.6 -2.6 3.6C-3.6 1.4 -2.6 -2.1 0 -5.4Z" fill="#6d0f2a" opacity=".5" filter={`url(#${uid}soft)`} />
          ))}
        {/* light that made it through pools above the rind */}
        <rect x="0" y={FH - 26} width={W} height={28} fill={`url(#${uid}ss)`} />
        {bubbles.map((b, i) => (
          <g key={i} transform={`translate(${b.x} ${b.y})`}>
            <circle r={b.r} fill="rgba(255,225,233,.22)" stroke="rgba(255,240,244,.7)" strokeWidth=".55" />
            <circle cx={-b.r * 0.35} cy={-b.r * 0.38} r={b.r * 0.32} fill="#fff" opacity=".9" />
          </g>
        ))}
        {seeds
          .filter((s) => !s.far)
          .map((s, i) => (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.s})`}>
              <path d="M0 -5.4C2.6 -2.1 3.6 1.4 2.6 3.6C1.6 5.6 -1.6 5.6 -2.6 3.6C-3.6 1.4 -2.6 -2.1 0 -5.4Z" fill={`url(#${uid}sd)`} />
              <path d="M-1 -2.4C-1.7 -1.1 -1.9 .4 -1.5 1.5" stroke="rgba(255,255,255,.7)" strokeWidth=".75" fill="none" strokeLinecap="round" />
            </g>
          ))}
        <rect x="0" y={FH} width={W} height={RD + 1} fill={`url(#${uid}rd)`} />
        <rect x="0" y={FH + RD} width={W} height={SK} fill={`url(#${uid}sk)`} />
        {stripes.map((st, i) => (
          <path key={i} d={st.d} fill={st.dark ? "#0a5329" : "#b6f0c6"} opacity={st.dark ? 0.66 : 0.4} />
        ))}
        <rect x="0" y={FH + RD} width={W} height="1.5" fill="rgba(255,255,255,.45)" />
        <rect x="0" y={JH - 6} width={W} height="6" fill={`url(#${uid}sb)`} />
      </g>
    );
  }, [W, uid]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;
  const n = data.pieces.length;
  const bounds = [0, ...data.cuts.map((c) => c.t), 1];
  const estW = (i: number) => (bounds[i + 1] - bounds[i]) * (W - (n - 1) * GAP);
  const inNames = data.pieces.map((p) => personOf(p.pid).name);
  const allEqual = n > 1 && shares.every((s) => Math.abs(s.amount - shares[0].amount) < 0.015);

  const handle = (j: number) => {
    const c = data.cuts[j];
    if (!c || j >= n - 1) return null;
    const a = personOf(data.pieces[j].pid).name;
    const b = personOf(data.pieces[j + 1].pid).name;
    const on = dragging === c.id;
    return (
      <div
        key={c.id}
        ref={(el) => { if (el) handleEls.set(c.id, el); else handleEls.delete(c.id); }}
        data-handle
        data-cut={c.id}
        role="slider"
        tabIndex={0}
        aria-label={`Cut between ${a} and ${b}`}
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(c.t * 100)}
        aria-valuetext={`${a} ${shares[j].percent}%, ${b} ${shares[j + 1].percent}%`}
        onPointerDown={onHandleDown(c.id)}
        onPointerMove={onHandleMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={onHandleKey(c.id)}
        className="group absolute left-0 top-1/2 z-10 -ml-[15px] -mt-[34px] grid h-[68px] w-[30px] cursor-ew-resize touch-none place-items-center rounded-full outline-none"
      >
        <span
          className={`flex h-[46px] w-[11px] flex-col items-center justify-center gap-[3px] rounded-full bg-white shadow-[0_2px_6px_rgba(110,0,30,.35),inset_0_-1px_0_rgba(0,0,0,.08)] transition-transform duration-150 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-[#0a84ff] group-focus-visible:ring-offset-2 ${on ? "scale-[1.18]" : ""}`}
        >
          {[0, 1, 2].map((d) => (
            <span key={d} className="h-[3px] w-[3px] rounded-full bg-[#e8184f]" />
          ))}
        </span>
      </div>
    );
  };

  const Avatar = ({ p, size = 22, ring = false }: { p: JellyPerson; size?: number; ring?: boolean }) => (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${ring ? "ring-2 ring-white" : ""}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42), background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.45), rgba(255,255,255,0) 55%), ${p.color}`, color: ink(p.color) }}
      aria-hidden="true"
    >
      {initials(p.name)}
    </span>
  );

  return (
    <div ref={rootRef} className={`relative w-full max-w-[560px] select-none rounded-[32px] bg-white p-4 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(120,20,50,.35)] sm:p-5 ${className}`}>
      {/* shared paint for the jelly */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${uid}tp`} x1="0" y1="0" x2="0" y2={TF} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffc2d1" />
            <stop offset=".55" stopColor="#ff94ae" />
            <stop offset="1" stopColor="#ff7898" />
          </linearGradient>
          <linearGradient id={`${uid}fl`} x1="0" y1={TF} x2="0" y2={FH} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff547f" />
            <stop offset=".16" stopColor="#f22a63" />
            <stop offset=".48" stopColor="#d30c44" />
            <stop offset=".76" stopColor="#da1250" />
            <stop offset="1" stopColor="#ff6890" />
          </linearGradient>
          <linearGradient id={`${uid}lip`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity=".35" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}ss`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff86a5" stopOpacity="0" />
            <stop offset="1" stopColor="#ffa3bb" stopOpacity=".7" />
          </linearGradient>
          <linearGradient id={`${uid}rd`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff5ea" />
            <stop offset=".6" stopColor="#f3fae0" />
            <stop offset="1" stopColor="#c9edb2" />
          </linearGradient>
          <linearGradient id={`${uid}sk`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#46cf80" />
            <stop offset=".35" stopColor="#25a85c" />
            <stop offset="1" stopColor="#137a40" />
          </linearGradient>
          <linearGradient id={`${uid}sb`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#063d1d" stopOpacity="0" />
            <stop offset="1" stopColor="#063d1d" stopOpacity=".45" />
          </linearGradient>
          <radialGradient id={`${uid}sd`} cx=".38" cy=".35" r=".75">
            <stop offset="0" stopColor="#6a1a2c" />
            <stop offset="1" stopColor="#1c040a" />
          </radialGradient>
          <filter id={`${uid}soft`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation=".7" />
          </filter>
          <linearGradient id={`${uid}st`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".16" stopColor="#e2ecf8" />
            <stop offset=".52" stopColor="#b3c3d8" />
            <stop offset=".76" stopColor="#7d90aa" />
            <stop offset=".8" stopColor="#f2f7fc" />
            <stop offset="1" stopColor="#c3d0e0" />
          </linearGradient>
          <linearGradient id={`${uid}wd`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9a46a" />
            <stop offset=".45" stopColor="#bf6a30" />
            <stop offset="1" stopColor="#7a3814" />
          </linearGradient>
          <linearGradient id={`${uid}br`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1b8" />
            <stop offset=".5" stopColor="#f2c14e" />
            <stop offset="1" stopColor="#a8701a" />
          </linearGradient>
          <linearGradient id={`${uid}jm`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ff3d6e" stopOpacity="0" />
            <stop offset="1" stopColor="#ff3d6e" stopOpacity=".85" />
          </linearGradient>
          <mask id={`${uid}hole`}>
            <rect width="128" height="60" fill="#fff" />
            <circle cx="66" cy="14" r="4.4" fill="#000" />
          </mask>
          {pattern}
        </defs>
      </svg>

      {/* header */}
      <div className="flex items-start gap-3 px-1">
        {SW >= 300 && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-white shadow-[0_6px_14px_-6px_rgba(232,24,79,.7)]" style={{ background: "linear-gradient(140deg, #ff6f8f, #e8184f 60%, #c40f45)" }}>
            {ic("fork", 22)}
          </span>
        )}
        <div className="min-w-0 flex-1 pt-0.5">
          <h3 className="m-0 text-[17px] font-semibold leading-tight tracking-[-0.02em] sm:text-[18px]">{title}</h3>
          <p className="m-0 mt-0.5 text-[13px] leading-snug text-[#6e6e73]">{subtitle}</p>
        </div>
        <div className="shrink-0 pt-0.5 text-right">
          <p className="m-0 text-[21px] font-bold leading-none tracking-[-0.03em] tabular-nums sm:text-[24px]">{money(total)}</p>
          <p className="m-0 mt-1 text-[12.5px] text-[#6e6e73]">Total bill</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-1">
        <div className="flex -space-x-1.5">
          <AnimatePresence initial={false}>
            {data.pieces.map((p) => (
              <motion.span key={p.pid} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
                <Avatar p={personOf(p.pid)} size={24} ring />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <p className="m-0 min-w-0 truncate text-[13px] text-[#3a3a3c]">
          {n === 1 ? `Just ${inNames[0]} so far` : `${listing(inNames)} are in`}
        </p>
      </div>

      {/* the plate */}
      <div
        ref={stageRef}
        className="relative mt-3 overflow-hidden rounded-[24px]"
        style={{
          height: SH,
          background:
            "repeating-linear-gradient(0deg, rgba(34,180,120,.07) 0 13px, transparent 13px 26px), repeating-linear-gradient(90deg, rgba(34,180,120,.07) 0 13px, transparent 13px 26px), linear-gradient(180deg, #f3fcf8, #e2f7ee)",
        }}
        onPointerMove={onStageMove}
        onPointerLeave={onStageLeave}
      >
        <motion.div className="absolute top-0" style={{ left: pad, width: W, height: SH, y: thud }}>
          {/* plate */}
          <div aria-hidden="true" className="absolute" style={{ left: -(pad - 5), width: W + (pad - 5) * 2, top: JT + JH - 24, height: 44 }}>
            <div className="absolute inset-x-[3%] bottom-[-7px] h-[20px] rounded-[50%]" style={{ background: "radial-gradient(closest-side, rgba(10,90,55,.26), rgba(10,90,55,0))" }} />
            <div className="absolute inset-x-0 bottom-0 top-[6px] rounded-full" style={{ background: "linear-gradient(180deg, #d5ebe2, #a9d3c2)" }} />
            <div className="absolute inset-x-0 top-0 bottom-[6px] rounded-full" style={{ background: "radial-gradient(120% 160% at 50% 0%, #ffffff 0%, #f5fbf8 50%, #e4f3ec 100%)", boxShadow: "inset 0 1.5px 0 #fff, inset 0 -3px 5px rgba(0,80,50,.1)" }} />
            <div className="absolute inset-x-[7px] top-[4px] bottom-[10px] rounded-full border-[1.5px] border-[#8fdcbd]/70" />
            <div className="absolute" style={{ left: pad - 5, width: W, top: 18, height: 22, background: "radial-gradient(closest-side, rgba(255,61,110,.42), rgba(255,61,110,0))" }} />
          </div>
          {/* contact shadows */}
          {data.pieces.map((p) => (
            <div
              key={p.key}
              ref={(el) => { if (el) shadeEls.set(p.key, el); else shadeEls.delete(p.key); }}
              aria-hidden="true"
              className="absolute left-0 w-[100px] origin-left"
              style={{ top: JT + JH - 6, height: 24, background: "radial-gradient(50% 22% at 50% 25%, rgba(110,8,38,.42), rgba(110,8,38,0)), radial-gradient(closest-side at 50% 52%, rgba(255,64,116,.62), rgba(255,64,116,0))" }}
            />
          ))}

          {/* name tags */}
          {data.pieces.map((p, i) => {
            const who = personOf(p.pid);
            const wide = estW(i) >= who.name.length * 7.4 + 44;
            return (
              <div key={p.key} ref={(el) => { if (el) tagEls.set(p.key, el); else tagEls.delete(p.key); }} className="pointer-events-none absolute left-0" style={{ top: KZ }}>
                <motion.div
                  className={`flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full ${wide ? "bg-white py-[3px] pl-[3px] pr-2.5 shadow-[0_1px_0_rgba(0,0,0,.04),0_4px_10px_-4px_rgba(0,60,30,.25)]" : ""}`}
                  initial={reduced ? false : { scale: 0.4, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 20 }}
                >
                  <Avatar p={who} size={wide ? 20 : 22} ring={!wide} />
                  {wide && <span className="text-[12.5px] font-semibold text-[#1d1d1f]">{who.name}</span>}
                </motion.div>
              </div>
            );
          })}

          {/* the jelly */}
          <div ref={slabRef} data-slab role="group" aria-label={`The bill as jelly, cut into ${n} ${n === 1 ? "piece" : "pieces"}. Click to cut it.`} className="absolute left-0 cursor-pointer" style={{ top: JT, width: W, height: JH }} onPointerDown={onSlabDown}>
            {data.pieces.map((p, i) => {
              const who = personOf(p.pid);
              const sh = shares[i];
              const w = estW(i);
              const tier = w >= 74 ? 2 : w >= 46 ? 1 : 0;
              const nb = i < n - 1 ? i + 1 : i - 1;
              return (
                <Fragment key={p.key}>
                <div ref={(el) => { if (el) pieceEls.set(p.key, el); else pieceEls.delete(p.key); }} className="absolute left-0 top-0 overflow-hidden" style={{ height: JH, transformOrigin: "50% 100%", willChange: "transform" }}>
                  <svg ref={(el) => { if (el) patEls.set(p.key, el); else patEls.delete(p.key); }} width={W} height={JH} className="absolute left-0 top-0" aria-hidden="true">
                    <use href={`#${uid}pat`} />
                  </svg>
                  {/* light through the jelly: glowing rims, light pooling low on the far side, softbox reflections */}
                  <div aria-hidden="true" className="absolute right-[3%] w-[72%]" style={{ top: FH * 0.48, height: FH * 0.6, background: "radial-gradient(closest-side, rgba(255,170,196,.62), rgba(255,170,196,0))" }} />
                  <div aria-hidden="true" className="absolute right-[12%] w-[34%] rounded-full blur-[3px]" style={{ top: FH - 13, height: 8, background: "radial-gradient(closest-side, rgba(255,236,242,.85), rgba(255,236,242,0))" }} />
                  <div aria-hidden="true" className="absolute inset-0" style={{ borderRadius: "inherit", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.9), inset 0 0 0 1px rgba(255,255,255,.14), inset 9px 0 12px -9px rgba(255,226,235,.95), inset -8px 0 12px -8px rgba(255,205,220,.8), inset 0 -6px 8px -5px rgba(0,45,18,.55)" }} />
                  <div aria-hidden="true" className="absolute left-[10px] top-[2.5px] h-[8px] w-[52%] rounded-full [mask-image:linear-gradient(90deg,#000,rgba(0,0,0,.25))]" style={{ background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(255,255,255,.45))" }} />
                  <div aria-hidden="true" className="absolute right-[12px] top-[3px] h-[6px] w-[13%] rounded-full bg-white/55" />
                  <div aria-hidden="true" className="absolute left-[5px] w-[3.5px] rounded-full bg-white/55 blur-[1px]" style={{ top: TF + 6, height: (FH - TF) * 0.5 }} />
                  <div className="pointer-events-none absolute inset-x-0 flex flex-col items-center justify-center text-white [text-shadow:0_1px_2px_rgba(110,0,30,.45)]" style={{ top: TF + 2, height: FH - TF - 14 }}>
                    {tier === 2 ? (
                      <>
                        <span className="font-bold leading-none tracking-[-0.02em] tabular-nums" style={{ fontSize: clamp(w / 5.4, 15, 22) }}>
                          {money(sh.amount)}
                        </span>
                        <span className="mt-1 text-[12px] font-semibold leading-none tabular-nums">{sh.percent}%</span>
                      </>
                    ) : (
                      <span className="font-bold leading-none tabular-nums" style={{ fontSize: tier ? 15 : 12 }}>
                        {sh.percent}%
                      </span>
                    )}
                    <span className="sr-only">
                      {who.name} pays {money(sh.amount)}
                    </span>
                  </div>
                  {n > 1 && (
                    <button
                      type="button"
                      data-merge={i}
                      aria-label={`Merge ${who.name}'s piece into ${personOf(data.pieces[nb].pid).name}'s`}
                      onClick={() => mergeAt(i)}
                      className="group absolute right-[2px] top-[2px] grid h-[26px] w-[26px] place-items-center rounded-full outline-none"
                    >
                      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-white/90 text-[#c4103f] shadow-[0_1px_3px_rgba(110,0,30,.35)] transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-white group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[#de134c]">
                        {ic("x", 10)}
                      </span>
                    </button>
                  )}
                </div>
                {handle(i)}
                </Fragment>
              );
            })}

            {/* where the knife will land */}
            <div ref={guideRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-[4px] z-[5] w-[2px] opacity-0 transition-opacity duration-150" style={{ height: JH - 8, background: "repeating-linear-gradient(180deg, rgba(255,255,255,.9) 0 6px, rgba(255,255,255,0) 6px 11px)" }} />

          </div>

          {/* juice */}
          {[0, 1, 2, 3].map((i) => (
            <span key={i} ref={(el) => { dropEls.current[i] = el; }} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[10px] w-[10px] rounded-[50%_50%_50%_50%/60%_60%_40%_40%] opacity-0" style={{ background: "radial-gradient(circle at 38% 30%, #fff 0 13%, #ff8fab 22%, #f0245c 62%, #c40f45 100%)", boxShadow: "0 1px 2px rgba(150,0,40,.3)" }} />
          ))}

          {/* the cleaver */}
          <div ref={knifeRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 opacity-0 [filter:drop-shadow(0_10px_10px_rgba(20,70,45,.28))]" style={{ width: 128 * sc, height: 60 * sc, transformOrigin: `${42 * sc}px ${50 * sc}px`, willChange: "transform" }}>
            <svg viewBox="0 0 128 60" width={128 * sc} height={60 * sc}>
              <g mask={`url(#${uid}hole)`}>
                <path d="M9 5H75C78 5 79 7 79 10V47C79 50 77 52 73 52C51 53 29 52 8 48C5 47.4 4 45.5 4 42V10C4 7 6 5 9 5Z" fill={`url(#${uid}st)`} />
                <path d="M16 5H32L19 50L7 48Z" fill="#fff" opacity=".28" />
                <path d="M5 41C27 45.5 51 46.5 77 45.5V48C77 50.5 76 52 73 52C51 53 29 52 8 48C5 47.4 4 45.5 4 42Z" fill="#ff7a9a" opacity=".22" />
                <path d="M6 42C27 46 51 47 73 46" stroke="rgba(60,76,100,.6)" strokeWidth=".9" fill="none" />
                <motion.path d="M5 41C27 45.5 51 46.5 77 45.5V48C77 50.5 76 52 73 52C51 53 29 52 8 48C5 47.4 4 45.5 4 42Z" fill={`url(#${uid}jm)`} style={{ opacity: smear }} />
                <path d="M9 5.6H75" stroke="#fff" strokeWidth="1.1" opacity=".9" />
              </g>
              <circle cx="66" cy="14" r="4.4" fill="none" stroke="rgba(60,74,96,.55)" strokeWidth=".9" />
              <rect x="78" y="9" width="9" height="15" rx="2.5" fill="#8796ab" />
              <rect x="78" y="9" width="9" height="5" rx="2" fill="#dbe3ee" />
              <path d="M86 10H118C123 10 125.5 13 125.5 16.5C125.5 20 123 23 118 23H86Z" fill={`url(#${uid}wd)`} />
              <path d="M88 13.5C98 12.5 108 14.5 121 13.2M88 19.5C99 20.5 109 18.6 121 20" stroke="rgba(70,28,8,.35)" strokeWidth=".7" fill="none" />
              <path d="M87 11H118C121 11 123 12 124 13.5" stroke="rgba(255,226,190,.7)" strokeWidth=".9" fill="none" />
              {[96, 106, 116].map((x) => (
                <circle key={x} cx={x} cy="16.5" r="2.1" fill={`url(#${uid}br)`} stroke="rgba(90,50,10,.5)" strokeWidth=".5" />
              ))}
            </svg>
          </div>
        </motion.div>
      </div>

      {/* tools */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-1">
        <p className="m-0 min-w-0 flex-1 basis-[180px] text-[12.5px] text-[#6e6e73]" aria-live="polite">
          {note ?? (n === 1 ? (canHover ? "Click the jelly to cut a share." : "Tap the jelly to cut a share.") : "Drag a gap to change the shares.")}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={addCut}
            disabled={n >= maxN}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#fff0f4] px-3.5 text-[13.5px] font-semibold text-[#b8103f] outline-none transition-colors hover:bg-[#ffe3ea] focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {ic("knife", 15)}
            Add a cut
          </button>
          <button
            type="button"
            data-even
            onClick={splitEvenly}
            disabled={n < 2}
            className="flex h-9 items-center gap-1.5 rounded-full bg-[#eafaf2] px-3.5 text-[13.5px] font-semibold text-[#0f6e3a] outline-none transition-colors hover:bg-[#d9f5e6] focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {ic("equals", 15)}
            Split evenly
          </button>
        </div>
      </div>

      {/* who pays what */}
      <div className="mt-3 rounded-[22px] bg-[#fff5f7] p-3 sm:p-3.5">
        <div className="flex items-baseline justify-between gap-2 px-1">
          <p className="m-0 text-[13px] font-semibold text-[#1d1d1f]">Everyone pays</p>
          {allEqual && <p className="m-0 text-[13px] font-semibold text-[#b8103f]">Split evenly</p>}
        </div>
        <ul className="m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0">
          {data.pieces.map((p, i) => {
            const who = personOf(p.pid);
            return (
              <motion.li key={p.pid} layout="position" initial={reduced ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 500, damping: 26 }} className="flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-[0_1px_0_rgba(0,0,0,.04),0_2px_8px_-4px_rgba(120,20,50,.25)]">
                <Avatar p={who} size={22} />
                <span className="text-[13px] font-medium text-[#3a3a3c]">{who.name}</span>
                <span className="text-[13px] font-semibold text-[#1d1d1f] tabular-nums">{money(shares[i].amount)}</span>
              </motion.li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={send}
          disabled={n < 2}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[15px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(200,15,65,.8),inset_0_1px_0_rgba(255,255,255,.3)] outline-none transition-[filter] hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[#0a84ff] focus-visible:ring-offset-2 disabled:opacity-50"
          style={{ background: "linear-gradient(180deg, #f0245c, #d0104a)" }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={sent ? "s" : "r"} className="flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
              {ic(sent ? "check" : "send", 16)}
              {sent ? "Requests sent" : "Send requests"}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}
```
