# Storage Clean

Add the "Storage Clean" component from Nexus UI to my project.

A storage panel you can clean. Press a recommendation and that slice of the bar crumbles into particles that stream into the trash can; the bar springs shut, the number rolls down, and Undo pours the particles back. Canvas particles synced to a spring-driven bar.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { StorageClean } from "@/components/storage-clean";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/storage-clean/index.ts ---

```ts
export { StorageClean } from "./storage-clean";
export type { StorageCleanProps } from "./storage-clean";
```

--- components/storage-clean/storage-clean.tsx ---

```tsx
"use client";
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useProSound, type ProSoundName } from "@/lib/ui-sounds-pro";

/* ---------- data ---------- */
const TOTAL = 50;
type Cat = { name: string; color: string; rgb: [number, number, number]; dot: string };
const CATS: Cat[] = [
  { name: "Apps", color: "#0a84ff", rgb: [10, 132, 255], dot: "#0a84ff" },
  { name: "Photos", color: "#ffcc00", rgb: [255, 204, 0], dot: "#f5b700" },
  { name: "iOS", color: "#8e8e93", rgb: [142, 142, 147], dot: "#8e8e93" },
  { name: "System Data", color: "#c7c7cc", rgb: [199, 199, 204], dot: "#b4b4ba" },
  { name: "Cache", color: "#ff3b30", rgb: [255, 59, 48], dot: "#ff3b30" },
];
/** Bar items in order. Chunks are the removable parts; the rest stays. Sizes in GB. */
const ITEMS: { cat: number; size: number; chunk?: number }[] = [
  { cat: 0, size: 11.4 }, { cat: 0, size: 3.2, chunk: 1 },
  { cat: 1, size: 8.0 }, { cat: 1, size: 1.8, chunk: 2 },
  { cat: 2, size: 6.4 }, { cat: 3, size: 3.3 }, { cat: 4, size: 4.1, chunk: 0 },
];
const SUGG = [
  { title: "Clear cache", sub: "Temporary files apps rebuild on demand", size: 4.1, cat: 4, verb: "Cleared cache" },
  { title: "Offload unused apps", sub: "Keeps your documents and data", size: 3.2, cat: 0, verb: "Offloaded unused apps" },
  { title: "Review large videos", sub: "3 videos you have already watched", size: 1.8, cat: 1, verb: "Removed large videos" },
];
const BASE_USED = 38.2;
const gb = (n: number) => `${n.toFixed(1)} GB`;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const mix = (c: [number, number, number], t: [number, number, number], k: number) => `rgb(${c.map((v, i) => Math.round(v + (t[i] - v) * k)).join(",")})`;

/* ---------- simulation types ---------- */
type S1 = { x: number; v: number; t: number };
type Cell = { c: number; r: number; td: number; fd: number; ox: number; oy: number; amp: number; mx: number; col: string; on: boolean; x0: number; y0: number; px: number; py: number; fly: boolean; done: boolean };
type Chunk = { k: number; size: number; cat: number; w: S1; state: "in" | "leaving" | "out" | "returning"; want: "in" | "out"; t0: number; tClose: number; closed: boolean; cells: Cell[]; cols: number };
const CS = 2; // particle cell size in CSS px
const stepS = (s: S1, k: number, c: number, dt: number) => { s.v += (k * (s.t - s.x) - c * s.v) * dt; s.x += s.v * dt; if (Math.abs(s.t - s.x) < 1e-4 && Math.abs(s.v) < 1e-3) { s.x = s.t; s.v = 0; } };
const rest = (s: S1) => s.x === s.t && s.v === 0;
const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
function rnd(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ---------- drawing helpers ---------- */
function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rl: number, rgt: number) {
  rl = Math.min(rl, h / 2, w / 2); rgt = Math.min(rgt, h / 2, w / 2);
  ctx.moveTo(x + rl, y); ctx.lineTo(x + w - rgt, y); ctx.arcTo(x + w, y, x + w, y + rgt, rgt); ctx.lineTo(x + w, y + h - rgt); ctx.arcTo(x + w, y + h, x + w - rgt, y + h, rgt);
  ctx.lineTo(x + rl, y + h); ctx.arcTo(x, y + h, x, y + h - rl, rl); ctx.lineTo(x, y + rl); ctx.arcTo(x, y, x + rl, y, rl); ctx.closePath();
}
function segGrad(ctx: CanvasRenderingContext2D, y: number, h: number, c: Cat) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, mix(c.rgb, [255, 255, 255], 0.3)); g.addColorStop(0.45, c.color); g.addColorStop(1, mix(c.rgb, [0, 0, 0], 0.14));
  return g;
}
// light and view for the bin (Lambert + Blinn on brushed aluminium)
const PITCH = 0.36, SP = Math.sin(PITCH), CP = Math.cos(PITCH);
const L = (() => { const v = [-0.55, 0.7, 0.55]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
const VW = [0, SP, CP];
const HV = (() => { const v = L.map((x, i) => x + VW[i]); const n = Math.hypot(...v); return v.map((x) => x / n); })();
const shade = (n: number[], base: [number, number, number], amb = 0.5, dif = 0.5, spc = 0.6, pw = 26) => {
  const d = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]), s = Math.pow(Math.max(0, n[0] * HV[0] + n[1] * HV[1] + n[2] * HV[2]), pw) * spc;
  const k = amb + dif * d;
  return `rgb(${base.map((c) => Math.round(clamp(c * k + 255 * s, 0, 255))).join(",")})`;
};
const AL: [number, number, number] = [214, 218, 224];

type Geo = { W: number; H: number; bx: number; by: number; bw: number; bh: number; tx: number; ty: number };
const BIN = { rt: 15, rb: 12.4, h: 29, lid: 16.2, th: 2.6 };

/**
 * Device storage, like the Storage panel but alive. Hover a segment of the glossy bar to lift it and
 * read its size. Press a suggestion and that part of the bar crumbles into a stream of particles that
 * curve into the trash can, the rest of the bar springs closed and the used number rolls down.
 * Undo pours the particles back out of the can and the segment regrows.
 */
export interface StorageCleanProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function StorageClean({ autoplay = false, enableSound = true, className = "" }: StorageCleanProps) {
  const [out, setOut] = useState<boolean[]>([false, false, false]); // wanted state per suggestion
  const [freed, setFreed] = useState<boolean[]>([false, false, false]); // reached "gap closed"
  const [toast, setToast] = useState<null | { kind: "freed" | "restored"; gb: number; n: number }>(null);
  const [hover, setHover] = useState(-1);
  const [tipCat, setTipCat] = useState(0);
  if (hover >= 0 && hover !== tipCat) setTipCat(hover);
  const [apPress, setApPress] = useState(-1);
  const [live, setLive] = useState("");
  const card = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const barEl = useRef<HTMLDivElement>(null);
  const binEl = useRef<HTMLDivElement>(null);
  const tip = useRef<HTMLDivElement>(null);
  const digits = useRef<(HTMLSpanElement | null)[]>([]);
  const geo = useRef<Geo>({ W: 0, H: 0, bx: 0, by: 0, bw: 0, bh: 22, tx: 0, ty: 0 });
  const touched = useRef(false);
  const hoverRef = useRef(-1);
  useLayoutEffect(() => { hoverRef.current = hover; });
  const engine = useRef<{ kick: () => void } | null>(null);
  const cb = useRef<{ closed: (k: number) => void; settled: () => void }>({ closed: () => {}, settled: () => {} });
  const play = useProSound(enableSound);
  // sounds from the ghost pointer use the autoplay path; once the visitor takes over they use the normal one
  const sfx = (n: ProSoundName, v?: number) => { if (typeof document !== "undefined" && document.hidden) return; if (touched.current) play(n, v); else play.auto(n, v); };
  const sfxRef = useRef(sfx);
  useLayoutEffect(() => { sfxRef.current = sfx; });
  const sim = useRef<{ chunks: Chunk[]; lift: S1[]; lid: S1; wob: S1; sq: S1; dig: S1[]; used: number }>({
    chunks: [0, 1, 2].map((k) => { const s = SUGG[k].size; return { k, size: s, cat: SUGG[k].cat, w: { x: s, v: 0, t: s }, state: "in", want: "in", t0: 0, tClose: 0, closed: false, cells: [], cols: 0 }; }),
    lift: CATS.map(() => ({ x: 0, v: 0, t: 0 })),
    lid: { x: 0, v: 0, t: 0 }, wob: { x: 0, v: 0, t: 0 }, sq: { x: 0, v: 0, t: 0 },
    dig: [3, 8, 2].map((d) => ({ x: d, v: 0, t: d })),
    used: BASE_USED,
  });

  // geometry: canvas covers the card; bar and bin positions come from placeholders (CSS px, zoom-safe)
  useLayoutEffect(() => {
    const el = card.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect(), sc = r.width / el.offsetWidth || 1;
      const b = barEl.current!.getBoundingClientRect(), t = binEl.current!.getBoundingClientRect();
      geo.current = { W: el.offsetWidth, H: el.offsetHeight, bx: (b.left - r.left) / sc, by: (b.top - r.top) / sc, bw: b.width / sc, bh: b.height / sc, tx: (t.left - r.left) / sc + t.width / sc / 2, ty: (t.top - r.top) / sc + t.height / sc - 7 };
      const cv = canvas.current!, dpr = Math.min(2, window.devicePixelRatio || 1);
      const cw = Math.round(geo.current.W * dpr), ch = Math.round(geo.current.H * dpr);
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      engine.current?.kick();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ---------- the one rAF loop ---------- */
  useEffect(() => {
    let id = 0, last = 0, force = true;
    const cv = canvas.current!, ctx = cv.getContext("2d")!;
    const S = sim.current;
    const layout = () => {
      const G = geo.current, px = G.bw / TOTAL;
      let x = G.bx;
      const spans: { cat: number; x: number; w: number; chunk?: Chunk }[] = [];
      for (const it of ITEMS) {
        const ch = it.chunk !== undefined ? S.chunks[it.chunk] : undefined;
        const w = (ch ? ch.w.x : it.size) * px;
        spans.push({ cat: it.cat, x, w, chunk: ch });
        x += w;
      }
      return spans;
    };
    const mouth = () => { const G = geo.current; return { x: G.tx, y: G.ty - BIN.h * CP }; };
    const bez = (p0: number[], p1: number[], p2: number[], p3: number[], u: number) => {
      const a = 1 - u;
      return [a * a * a * p0[0] + 3 * a * a * u * p1[0] + 3 * a * u * u * p2[0] + u * u * u * p3[0], a * a * a * p0[1] + 3 * a * a * u * p1[1] + 3 * a * u * u * p2[1] + u * u * u * p3[1]];
    };
    const swallowed = new Set<number>(); // chunks whose first particle has already dropped into the can
    const startLeave = (ch: Chunk, now: number, spans: ReturnType<typeof layout>) => {
      swallowed.delete(ch.k);
      sfxRef.current("crumble", 0.6);
      const G = geo.current, sp = spans.find((s) => s.chunk === ch)!, rows = Math.max(1, Math.round(G.bh / CS)), cols = Math.max(2, Math.ceil(sp.w / CS));
      const R = rnd(ch.k * 977 + 13), sweep = 0.32 + cols * 0.011, c0 = CATS[ch.cat].rgb;
      ch.cols = cols; ch.cells = [];
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
        const k = r / rows, base = k < 0.45 ? mix(c0, [255, 255, 255], 0.3 * (1 - k / 0.45)) : mix(c0, [0, 0, 0], 0.14 * ((k - 0.45) / 0.55));
        ch.cells.push({ c, r, td: now + (1 - c / cols) * sweep + R() * 0.12 + k * 0.05, fd: 0.62 + R() * 0.38, ox: (R() - 0.5) * 30, oy: R() * 36, amp: (R() - 0.5) * 14, mx: (R() - 0.5) * 13, col: base, on: true, x0: 0, y0: 0, px: NaN, py: NaN, fly: false, done: false });
      }
      ch.t0 = now; ch.state = "leaving"; ch.closed = false;
      ch.tClose = Math.max(...ch.cells.map((c) => c.td)) + 0.06;
    };
    const startReturn = (ch: Chunk, now: number) => {
      sfxRef.current("pour", 0.6);
      const R = rnd(ch.k * 331 + 7), sweep = 0.3 + ch.cols * 0.011;
      for (const c of ch.cells) { c.td = now + 0.16 + (c.c / ch.cols) * sweep + R() * 0.14; c.fd = 0.6 + R() * 0.32; c.on = false; c.fly = false; c.done = false; c.px = NaN; c.py = NaN; }
      ch.t0 = now; ch.state = "returning"; ch.closed = false; ch.tClose = now + 0.2;
    };
    const draw = (now: number, spans: ReturnType<typeof layout>) => {
      const G = geo.current, dpr = cv.width / (G.W || 1);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, G.W, G.H);
      const { bx, by, bw, bh } = G, rad = bh / 2;
      // ---- bar: recessed glass track
      ctx.save();
      ctx.beginPath(); rr(ctx, bx, by + 1, bw, bh, rad, rad); ctx.fillStyle = "rgba(255,255,255,0.9)"; ctx.fill(); // lower rim light
      ctx.beginPath(); rr(ctx, bx, by, bw, bh, rad, rad);
      const tg = ctx.createLinearGradient(0, by, 0, by + bh); tg.addColorStop(0, "#dedee3"); tg.addColorStop(1, "#efeff3");
      ctx.fillStyle = tg; ctx.fill();
      ctx.clip();
      // segments
      for (let i = 0; i < spans.length; i++) {
        const s = spans[i];
        if (s.w <= 0.05) continue;
        ctx.fillStyle = segGrad(ctx, by, bh, CATS[s.cat]);
        const ch = s.chunk;
        if (!ch || ch.state === "in") { ctx.fillRect(s.x - 0.3, by, s.w + 0.6, bh); continue; }
        // partially dissolved chunk: draw attached cells, merging runs per column
        const rows = Math.round(bh / CS), ch_ = bh / rows;
        for (let c = 0; c < ch.cols; c++) {
          let r0 = -1;
          for (let r = 0; r <= rows; r++) {
            const on = r < rows && ch.cells[c * rows + r]?.on;
            if (on && r0 < 0) r0 = r;
            if (!on && r0 >= 0) { const cx = s.x + c * CS; if (cx < s.x + s.w + CS) ctx.fillRect(cx - 0.25, by + r0 * ch_ - 0.25, CS + 0.5, (r - r0) * ch_ + 0.5); r0 = -1; }
          }
        }
      }
      // separators between categories
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      for (let i = 1; i < spans.length; i++) if (spans[i].cat !== spans[i - 1].cat && spans[i].w > 0.05) ctx.fillRect(spans[i].x - 0.6, by, 1.2, bh);
      // inner shading + gloss
      const ig = ctx.createLinearGradient(0, by, 0, by + bh);
      ig.addColorStop(0, "rgba(0,0,0,0.13)"); ig.addColorStop(0.18, "rgba(0,0,0,0)"); ig.addColorStop(0.82, "rgba(0,0,0,0)"); ig.addColorStop(1, "rgba(0,0,0,0.08)");
      ctx.fillStyle = ig; ctx.fillRect(bx, by, bw, bh);
      ctx.beginPath(); rr(ctx, bx + 3, by + 2, bw - 6, bh * 0.42, bh * 0.21, bh * 0.21);
      const gg = ctx.createLinearGradient(0, by + 2, 0, by + 2 + bh * 0.42); gg.addColorStop(0, "rgba(255,255,255,0.62)"); gg.addColorStop(1, "rgba(255,255,255,0.06)");
      ctx.fillStyle = gg; ctx.fill();
      ctx.restore();
      ctx.beginPath(); rr(ctx, bx + 0.5, by + 0.5, bw - 1, bh - 1, rad - 0.5, rad - 0.5); ctx.strokeStyle = "rgba(0,0,0,0.09)"; ctx.lineWidth = 1; ctx.stroke();
      // lifted segment (hover)
      S.lift.forEach((lf, cat) => {
        if (lf.x < 0.004) return;
        const parts = spans.filter((s) => s.cat === cat && s.w > 0.05);
        if (!parts.length) return;
        const x0 = parts[0].x, x1 = parts[parts.length - 1].x + parts[parts.length - 1].w, l = lf.x;
        const atStart = x0 - bx < 0.5, atEnd = bx + bw - x1 < 0.5;
        const grow = 1.5 * l, y = by - 3.2 * l - grow, h = bh + grow * 2;
        ctx.save();
        ctx.shadowColor = `rgba(0,0,0,${0.28 * l})`; ctx.shadowBlur = 10 * l; ctx.shadowOffsetY = 4 * l;
        ctx.beginPath(); rr(ctx, x0 - grow * 0.6, y, x1 - x0 + grow * 1.2, h, atStart ? h / 2 : 5, atEnd ? h / 2 : 5);
        ctx.fillStyle = segGrad(ctx, y, h, CATS[cat]); ctx.globalAlpha = Math.min(1, l * 1.6); ctx.fill();
        ctx.restore();
        ctx.save(); ctx.globalAlpha = Math.min(1, l * 1.6);
        ctx.beginPath(); rr(ctx, x0 - grow * 0.6 + 2.5, y + 2, x1 - x0 + grow * 1.2 - 5, h * 0.42, 4, 4);
        const lg = ctx.createLinearGradient(0, y + 2, 0, y + 2 + h * 0.42); lg.addColorStop(0, "rgba(255,255,255,0.6)"); lg.addColorStop(1, "rgba(255,255,255,0.04)");
        ctx.fillStyle = lg; ctx.fill(); ctx.restore();
      });

      // ---- bin (back half), particles, bin (front half)
      const { tx, ty } = G, rt = BIN.rt, rb = BIN.rb, hh = BIN.h;
      const P = (x: number, y: number, z: number): [number, number] => [tx + x, ty - y * CP + z * SP];
      const phi = S.lid.x, R = BIN.lid;
      const lidPts = (ly: number, rr0 = R) => {
        const pts: [number, number][] = [];
        for (let i = 0; i < 36; i++) {
          const a = (i / 36) * Math.PI * 2, lx = Math.cos(a) * rr0, lz = Math.sin(a) * rr0, dz = lz + R;
          const dy2 = ly * Math.cos(phi) + dz * Math.sin(phi), dz2 = -ly * Math.sin(phi) + dz * Math.cos(phi);
          pts.push(P(lx, hh + dy2, -R + dz2));
        }
        return pts;
      };
      const poly = (pts: [number, number][]) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); };
      const drawLid = () => {
        const n = [0, Math.cos(phi), -Math.sin(phi)], topVis = Math.sin(PITCH - phi) > 0;
        const top = lidPts(BIN.th), bot = lidPts(0);
        poly(topVis ? bot : top); ctx.fillStyle = shade([0, -0.2, 1], [150, 155, 164], 0.55, 0.3, 0.1); ctx.fill();
        const face = topVis ? top : bot;
        poly(face);
        if (topVis) ctx.fillStyle = shade(n, AL, 0.6, 0.42, 0.55, 18);
        else {
          let y0 = Infinity, y1 = -Infinity;
          face.forEach((q) => { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); });
          const ug = ctx.createLinearGradient(0, y0, 0, y1);
          ug.addColorStop(0, shade(n.map((v) => -v), [200, 204, 211], 0.62, 0.3, 0.05)); ug.addColorStop(1, shade(n.map((v) => -v), [150, 155, 163], 0.62, 0.3, 0.05));
          ctx.fillStyle = ug;
        }
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 0.8; ctx.stroke();
        if (!topVis) { poly(lidPts(0, R - 2.4)); ctx.strokeStyle = "rgba(0,0,0,0.14)"; ctx.lineWidth = 0.9; ctx.stroke(); poly(lidPts(0, R - 3.2)); ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 0.7; ctx.stroke(); }
        if (topVis) {
          const hp = (x: number, y: number) => { const dz = R, dy2 = y * Math.cos(phi) + dz * Math.sin(phi), dz2 = -y * Math.sin(phi) + dz * Math.cos(phi); return P(x, hh + dy2, -R + dz2); };
          const a = hp(-5.5, BIN.th + 2.6), b = hp(5.5, BIN.th + 2.6), a0 = hp(-5.5, BIN.th), b0 = hp(5.5, BIN.th);
          ctx.lineCap = "round"; ctx.strokeStyle = "#9aa0a9"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(a0[0], a0[1]); ctx.lineTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(b0[0], b0[1]); ctx.stroke();
          ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a[0], a[1] - 0.8); ctx.lineTo(b[0], b[1] - 0.8); ctx.stroke();
        }
      };
      const wob = S.wob.x, sq = S.sq.x;
      const binT = () => { ctx.translate(tx, ty); ctx.rotate(wob); ctx.scale(1 + sq * 0.5, 1 - sq); ctx.translate(-tx, -ty); };
      // ground + contact shadow
      ctx.save();
      const gs = ctx.createRadialGradient(tx + wob * 30, ty + 1, 0, tx + wob * 30, ty + 1, 24);
      gs.addColorStop(0, "rgba(0,0,0,0.20)"); gs.addColorStop(1, "rgba(0,0,0,0)");
      ctx.translate(0, ty + 1); ctx.scale(1, 0.2); ctx.translate(0, -(ty + 1));
      ctx.fillStyle = gs; ctx.beginPath(); ctx.arc(tx + wob * 30, ty + 1, 24, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      ctx.save(); binT();
      if (phi > 0.55) drawLid();
      // interior: the far inner wall, lit near the rim, dark deep down
      const m0 = P(0, hh, 0);
      ctx.beginPath(); ctx.ellipse(m0[0], m0[1], rt - 0.8, (rt - 0.8) * SP, 0, 0, Math.PI * 2);
      const ing = ctx.createLinearGradient(0, m0[1] - rt * SP, 0, m0[1] + rt * SP); ing.addColorStop(0, "#9196a0"); ing.addColorStop(0.55, "#4a4e57"); ing.addColorStop(1, "#2b2d33");
      ctx.fillStyle = ing; ctx.fill();
      ctx.restore();
      // particles
      ctx.lineCap = "round";
      const mo = mouth(), batch = new Map<string, number[]>();
      for (const ch of S.chunks) {
        if (ch.state !== "leaving" && ch.state !== "returning") continue;
        const sp = spans.find((s) => s.chunk === ch)!, rows = Math.round(bh / CS), rh = bh / rows;
        for (const c of ch.cells) {
          if (!c.fly) continue;
          const u = clamp((now - c.td) / c.fd, 0, 1), e = ease(u);
          const home = [sp.x + c.c * CS + CS / 2, by + c.r * rh + rh / 2], bin = [mo.x + c.mx, mo.y + rt * SP + 6];
          let p0: number[], p1: number[], p2: number[], p3: number[];
          if (ch.state === "leaving") { p0 = [c.x0, c.y0]; p1 = [c.x0 + c.ox, c.y0 - 26 - c.oy]; p2 = [bin[0] - 40 + c.ox * 0.4, bin[1] - 58 - c.oy * 0.5]; p3 = bin; }
          else { p0 = bin; p1 = [bin[0] - 40 + c.ox * 0.4, bin[1] - 58 - c.oy * 0.5]; p2 = [home[0] + c.ox, home[1] - 26 - c.oy]; p3 = home; }
          const q = bez(p0, p1, p2, p3, e), q2 = bez(p0, p1, p2, p3, Math.min(1, e + 0.01));
          const tl = Math.hypot(q2[0] - q[0], q2[1] - q[1]) || 1, wv = Math.sin(Math.PI * e) * c.amp;
          const x = q[0] + (-(q2[1] - q[1]) / tl) * wv, y = q[1] + ((q2[0] - q[0]) / tl) * wv;
          const sz = ch.state === "leaving" ? CS * (1.05 - 0.5 * e) : CS * (0.55 + 0.5 * e);
          // batch by colour and quantised width: a handful of stroke calls instead of one per particle
          const key = `${c.col}|${Math.round(sz * 4)}`;
          let arr = batch.get(key);
          if (!arr) { arr = []; batch.set(key, arr); }
          if (Number.isNaN(c.px)) arr.push(x - 0.01, y, x, y); else arr.push(x + (c.px - x) * 0.45, y + (c.py - y) * 0.45, x, y);
          c.px = x; c.py = y;
        }
      }
      batch.forEach((arr, key) => {
        const [col, w] = key.split("|");
        ctx.strokeStyle = col; ctx.lineWidth = Number(w) / 4;
        ctx.beginPath();
        for (let i = 0; i < arr.length; i += 4) { ctx.moveTo(arr[i], arr[i + 1]); ctx.lineTo(arr[i + 2], arr[i + 3]); }
        ctx.stroke();
      });
      // front body
      ctx.save(); binT();
      const [lx0, ly0] = P(-rt, hh, 0), [bl, bly] = P(-rb, 0, 0);
      ctx.beginPath();
      ctx.moveTo(lx0, ly0); ctx.lineTo(bl, bly);
      ctx.ellipse(tx, ty, rb, rb * SP, 0, Math.PI, 0, true);
      ctx.lineTo(tx + rt, ly0);
      ctx.ellipse(m0[0], m0[1], rt, rt * SP, 0, 0, Math.PI, false);
      ctx.closePath();
      const bg = ctx.createLinearGradient(tx - rt, 0, tx + rt, 0), taper = (rt - rb) / hh;
      for (let i = 0; i <= 12; i++) {
        const th = -Math.PI / 2 + (i / 12) * Math.PI, n = [Math.sin(th), -taper, Math.cos(th)], nl = Math.hypot(...n);
        bg.addColorStop((Math.sin(th) + 1) / 2, shade(n.map((v) => v / nl), AL, 0.6, 0.42, 0.7, 30));
      }
      ctx.fillStyle = bg; ctx.fill();
      ctx.save(); ctx.clip();
      // ribs, with a groove shadow and a lit edge
      for (const th of [-1.08, -0.66, -0.22, 0.22, 0.66, 1.08]) {
        const a = P(rt * Math.sin(th) * 0.97, hh - 4, rt * Math.cos(th)), b = P(rb * Math.sin(th) * 0.97, 4, rb * Math.cos(th));
        ctx.lineCap = "round";
        ctx.strokeStyle = "rgba(60,66,78,0.2)"; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(a[0] + 0.9, a[1]); ctx.lineTo(b[0] + 0.8, b[1]); ctx.stroke();
      }
      const ao = ctx.createLinearGradient(0, ty - 7, 0, ty + rb * SP);
      ao.addColorStop(0, "rgba(0,0,0,0)"); ao.addColorStop(1, "rgba(0,0,0,0.16)");
      ctx.fillStyle = ao; ctx.fillRect(tx - rt - 2, ty - 8, rt * 2 + 4, 14);
      ctx.restore();
      // rim lip
      ctx.beginPath(); ctx.ellipse(m0[0], m0[1], rt, rt * SP, 0, 0, Math.PI * 2); ctx.strokeStyle = "#f3f4f6"; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(m0[0], m0[1] + 0.3, rt - 1.3, (rt - 1.3) * SP, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.strokeStyle = "rgba(0,0,0,0.22)"; ctx.lineWidth = 0.7; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(m0[0], m0[1] + 0.6, rt + 0.6, (rt + 0.6) * SP, 0, 0.1, Math.PI - 0.1); ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 0.8; ctx.stroke();
      if (phi <= 0.55) drawLid();
      ctx.restore();
    };

    const step = (nowMs: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (nowMs - last) / 1000));
      last = nowMs;
      const now = nowMs / 1000;
      let busy = false;
      let spans = layout();
      // state machine per chunk
      for (const ch of S.chunks) {
        if (ch.state === "in" && ch.want === "out") { startLeave(ch, now, spans); busy = true; }
        else if (ch.state === "out" && ch.want === "in") { startReturn(ch, now); busy = true; }
      }
      const sub = Math.ceil(dt / 0.008), h = dt / sub;
      let wantOpen = false, absorbed = 0;
      for (const ch of S.chunks) {
        for (let i = 0; i < sub; i++) stepS(ch.w, 170, 23, h);
        if (ch.state === "leaving") {
          busy = true;
          const sp = spans.find((s) => s.chunk === ch)!, rows = Math.round(geo.current.bh / CS), rh = geo.current.bh / rows;
          let alive = 0;
          for (const c of ch.cells) {
            if (c.done) continue;
            alive++;
            if (!c.fly && now >= c.td) { c.fly = true; c.on = false; c.x0 = sp.x + c.c * CS + CS / 2; c.y0 = geo.current.by + c.r * rh + rh / 2; }
            if (c.fly && now >= c.td + c.fd) { c.done = true; c.fly = false; absorbed++; if (!swallowed.has(ch.k)) { swallowed.add(ch.k); sfxRef.current("bloop", 0.45); } }
            if (!c.done && c.td + c.fd - now < 0.42) wantOpen = true;
          }
          if (!ch.closed && now >= ch.tClose) { ch.closed = true; ch.w.t = 0; S.used -= ch.size; cb.current.closed(ch.k); }
          if (!alive && ch.closed && rest(ch.w)) { ch.state = "out"; ch.cells.forEach((c) => { c.px = NaN; }); }
        } else if (ch.state === "returning") {
          busy = true;
          if (!ch.closed && now >= ch.tClose) { ch.closed = true; ch.w.t = ch.size; }
          let alive = 0;
          for (const c of ch.cells) {
            if (c.on) continue;
            alive++;
            if (!c.fly && now >= c.td) c.fly = true;
            if (!c.fly && c.td - now < 0.3) wantOpen = true;
            if (c.fly && (now - c.td) / c.fd < 0.35) wantOpen = true;
            if (c.fly && now >= c.td + c.fd) { c.fly = false; c.on = true; c.done = false; S.used += ch.size / ch.cells.length; }
            if (c.fly && Math.abs(now - c.td) < 0.02) absorbed -= 0.5;
          }
          if (!alive && ch.closed && rest(ch.w)) { ch.state = "in"; sfxRef.current("glass-ping", 0.4); }
        }
        if (!rest(ch.w)) busy = true;
      }
      spans = layout();
      // lid, wobble and squash of the can
      S.lid.t = wantOpen ? 1.42 : 0;
      for (let i = 0; i < sub; i++) {
        stepS(S.lid, wantOpen ? 150 : 210, wantOpen ? 20 : 9, h);
        if (S.lid.x < 0) { S.lid.x = 0; if (S.lid.v < -0.4) { S.lid.v = -S.lid.v * 0.38; S.sq.v += 0.9; S.wob.v += 0.25; sfxRef.current("relay-click", 0.4); } else S.lid.v = 0; }
      }
      if (absorbed) { S.wob.v += (absorbed > 0 ? 1 : -1) * Math.min(0.6, Math.abs(absorbed) * 0.012) * (Math.random() < 0.5 ? -1 : 1); S.sq.v += Math.min(0.5, Math.abs(absorbed) * 0.01); }
      for (let i = 0; i < sub; i++) { stepS(S.wob, 300, 7, h); stepS(S.sq, 520, 15, h); }
      S.wob.x = clamp(S.wob.x, -0.09, 0.09); S.sq.x = clamp(S.sq.x, -0.08, 0.08);
      // hover lift
      S.lift.forEach((lf, i) => { lf.t = hoverRef.current === i ? 1 : 0; for (let j = 0; j < sub; j++) stepS(lf, 520, 30, h); if (!rest(lf)) busy = true; });
      // rolling digits for the used number
      const tenths = Math.round(S.used * 10), tg = [Math.floor(tenths / 100) % 10, Math.floor(tenths / 10) % 10, tenths % 10];
      S.dig.forEach((d, i) => { d.t = tg[i]; for (let j = 0; j < sub; j++) stepS(d, 240 - i * 30, 27 - i * 2, h); if (!rest(d)) busy = true; const el = digits.current[i]; if (el) el.style.transform = `translate3d(0,${(-d.x * 1.15).toFixed(4)}em,0)`; });
      if (!rest(S.lid) || !rest(S.wob) || !rest(S.sq)) busy = true;
      // tooltip follows its segment through reflows
      if (tip.current && hoverRef.current >= 0) {
        const parts = spans.filter((s) => s.cat === hoverRef.current && s.w > 0.05);
        if (parts.length) { const x0 = parts[0].x, x1 = parts[parts.length - 1].x + parts[parts.length - 1].w; tip.current.style.transform = `translate3d(${(clamp((x0 + x1) / 2, 70, geo.current.W - 70)).toFixed(1)}px,${(geo.current.by - 10).toFixed(1)}px,0) translate(-50%,-100%)`; }
      }
      draw(now, spans);
      force = false;
      if (!busy) cb.current.settled();
      id = busy ? requestAnimationFrame(step) : 0;
    };
    engine.current = { kick: () => { if (!id) { last = performance.now(); id = requestAnimationFrame(step); } } };
    if (force) engine.current.kick();
    return () => { cancelAnimationFrame(id); id = 0; engine.current = null; };
  }, []);
  const kick = () => engine.current?.kick();
  useEffect(() => { kick(); }, [hover]);

  /* ---------- actions ---------- */
  const outRef = useRef(out);
  useLayoutEffect(() => { outRef.current = out; });
  const sum = (a: boolean[]) => a.reduce((s, v, i) => s + (v ? SUGG[i].size : 0), 0);
  const freedRef = useRef([false, false, false]);
  const onClosed = (k: number) => {
    if (sim.current.chunks[k].want !== "out") return;
    sfxRef.current("access-granted", 0.6);
    const n = freedRef.current.map((v, i) => (i === k ? true : v));
    freedRef.current = n;
    const tot = sum(n);
    setFreed(n);
    setToast({ kind: "freed", gb: tot, n: n.filter(Boolean).length });
    setLive(`${SUGG[k].verb}, freed ${gb(SUGG[k].size)}. ${(BASE_USED - tot).toFixed(1)} of ${TOTAL} GB used.`);
  };
  useLayoutEffect(() => { cb.current.closed = onClosed; });
  const run = (k: number) => {
    if (outRef.current[k]) return;
    sfxRef.current("relay-click", 0.5);
    sim.current.chunks[k].want = "out";
    setOut((o) => o.map((v, i) => (i === k ? true : v)));
    kick();
  };
  const undoAll = () => {
    const was = outRef.current;
    const tot = sum(was);
    if (!tot) return;
    sfxRef.current("glass-tap", 0.5);
    sim.current.chunks.forEach((c) => { c.want = "in"; });
    setOut([false, false, false]);
    freedRef.current = [false, false, false];
    setFreed([false, false, false]);
    setToast({ kind: "restored", gb: tot, n: 0 });
    setLive(`Restored ${gb(tot)}. ${BASE_USED.toFixed(1)} of ${TOTAL} GB used.`);
    kick();
  };
  useEffect(() => {
    if (toast?.kind !== "restored") return;
    const id = window.setTimeout(() => setToast((t) => (t?.kind === "restored" ? null : t)), 1900);
    return () => clearTimeout(id);
  }, [toast]);

  const stopAuto = () => { if (!touched.current) { touched.current = true; setApPress(-1); setHover(-1); } };

  // autoplay: peek at a segment, clear cache, offload apps, undo all; repeat
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const timers: number[] = [];
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise<void>((res) => { timers.push(window.setTimeout(res, ms)); });
    const press = async (k: number, fn: () => void) => { setApPress(k); await sleep(170); if (!ok()) return; fn(); setApPress(-1); };
    (async () => {
      await sleep(700);
      while (ok()) {
        setHover(0); await sleep(1100); if (!ok()) break;
        setHover(-1); await sleep(450); if (!ok()) break;
        await press(0, () => run(0)); await sleep(2700); if (!ok()) break;
        await press(1, () => run(1)); await sleep(2900); if (!ok()) break;
        await press(9, undoAll); await sleep(3000);
      }
    })();
    return () => { alive = false; timers.forEach(clearTimeout); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  /* ---------- hover on the bar ---------- */
  const catAt = (e: RPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect(), sc = r.width / el.offsetWidth || 1, x = (e.clientX - r.left) / sc;
    const px = el.offsetWidth / TOTAL, S = sim.current;
    let acc = 0;
    for (const it of ITEMS) { const w = (it.chunk !== undefined ? S.chunks[it.chunk].w.x : it.size) * px; if (x < acc + w && w > 0.5) return it.cat; acc += w; }
    return -1;
  };

  const freedTot = sum(freed);
  const usedNow = BASE_USED - freedTot;
  const sizes = CATS.map((_, ci) => ITEMS.filter((it) => it.cat === ci).reduce((s, it) => s + (it.chunk !== undefined && freed[it.chunk] ? 0 : it.size), 0));
  const barLabel = `Storage: ${usedNow.toFixed(1)} of ${TOTAL} GB used. ${CATS.map((c, i) => `${c.name} ${gb(sizes[i])}`).join(", ")}. ${(TOTAL - usedNow).toFixed(1)} GB available.`;
  const usedStr = BASE_USED.toFixed(1);

  return (
    <div ref={card} className={`relative w-full max-w-[440px] select-none rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      onPointerDownCapture={stopAuto} onKeyDownCapture={stopAuto}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#6e6e73]">Storage</h3>
          <div className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap" aria-hidden="true">
            <span className="flex text-[32px] font-semibold leading-none tracking-[-0.035em] text-[#1d1d1f] tabular-nums">
              {[0, 1, -1, 2].map((slot, j) => slot < 0 ? <span key={j}>.</span> : (
                <span key={j} className="relative inline-block overflow-hidden" style={{ height: "1.15em", width: "0.6em", WebkitMaskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)", maskImage: "linear-gradient(transparent, #000 18%, #000 82%, transparent)" }}>
                  <span ref={(el) => { digits.current[slot] = el; }} className="absolute inset-x-0 top-0 flex flex-col items-center will-change-transform" style={{ transform: `translate3d(0,${-Number(usedStr.replace(".", "")[slot]) * 1.15}em,0)` }}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <span key={d} className="flex items-center" style={{ height: "1.15em" }}>{d}</span>)}
                  </span>
                </span>
              ))}
              <span className="ml-1 self-end pb-[0.12em] text-[17px] font-semibold tracking-[-0.02em]">GB</span>
            </span>
            <span className="text-[15px] text-[#6e6e73]">of {TOTAL} GB used</span>
          </div>
          <span className="sr-only">{`${usedNow.toFixed(1)} of ${TOTAL} GB used`}</span>
        </div>
        <div ref={binEl} className="h-[54px] w-[46px] flex-none" aria-hidden="true" />
      </div>

      <div ref={barEl} role="img" aria-label={barLabel} className="relative mt-4 h-[22px] w-full touch-none"
        onPointerMove={(e) => { if (e.pointerType === "mouse") { const c = catAt(e); if (c !== hoverRef.current) setHover(c); } }}
        onPointerDown={(e) => { const c = catAt(e); if (c >= 0 && c !== hoverRef.current) sfx("glass-tap", 0.3); setHover(c); }} onPointerLeave={() => setHover(-1)} />

      <ul className="m-0 mt-3 flex list-none flex-wrap gap-x-3.5 gap-y-1.5 p-0">
        {CATS.map((c, i) => (
          <li key={c.name} className="flex items-center gap-1.5 text-[12px] text-[#1d1d1f]">
            <span className="h-2 w-2 rounded-full" style={{ background: sizes[i] > 0 ? c.dot : "transparent", boxShadow: `inset 0 0 0 1.5px ${c.dot}` }} />
            {c.name}
            <span className="tabular-nums text-[#6e6e73]">{gb(sizes[i])}</span>
          </li>
        ))}
      </ul>

      <h4 className="m-0 mt-5 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#6e6e73]">Recommendations</h4>
      <ul className="m-0 mt-2 list-none overflow-hidden rounded-[16px] bg-[#f5f5f7] p-0">
        {SUGG.map((s, k) => {
          const done = out[k];
          return (
            <li key={s.title} className={k ? "border-t border-black/[0.06]" : ""}>
              <motion.button type="button" onClick={() => run(k)} aria-disabled={done} aria-label={done ? `${s.title}: done, ${gb(s.size)} freed` : `${s.title}, ${gb(s.size)}`}
                animate={{ scale: apPress === k ? 0.97 : 1 }} whileTap={done ? undefined : { scale: 0.97 }} transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3.5 py-2.5 text-left outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3] ${done ? "cursor-default" : "hover:bg-black/[0.03]"} ${apPress === k ? "bg-black/[0.05]" : ""}`}>
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[9px]" style={{ background: `linear-gradient(180deg, ${mix(CATS[s.cat].rgb, [255, 255, 255], 0.18)}, ${CATS[s.cat].color})`, boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.08)" }}>
                  <Glyph k={k} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[14px] font-semibold leading-[18px] tracking-[-0.01em] text-[#1d1d1f]">{s.title}</span>
                  <span className="truncate text-[12px] text-[#6e6e73]">{s.sub}</span>
                </span>
                <span className="relative flex h-5 min-w-[52px] flex-none items-center justify-end">
                  <AnimatePresence initial={false} mode="popLayout">
                    {done ? (
                      <motion.span key="d" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ type: "spring", stiffness: 500, damping: 26 }}
                        className="flex items-center gap-1 text-[13px] font-semibold text-[#248a3d]">
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 7.4l2.6 2.6L11 4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Done
                      </motion.span>
                    ) : (
                      <motion.span key="s" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: "spring", stiffness: 500, damping: 32 }}
                        className="text-[13px] tabular-nums text-[#6e6e73]">{gb(s.size)}</motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            </li>
          );
        })}
      </ul>

      <div className="relative mt-3 flex h-[40px] items-center justify-center">
        <AnimatePresence initial={false} mode="popLayout">
          {toast ? (
            <motion.div key="toast" initial={{ opacity: 0, y: 14, scale: 0.86 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 520, damping: 24 }}
              className="flex h-[40px] items-center gap-3 rounded-full bg-[#1d1d1f] pl-4 pr-1.5 text-[13px] text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)]">
              <span className="flex items-center gap-1.5 whitespace-nowrap font-medium tabular-nums">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><circle cx="7" cy="7" r="6.2" fill={toast.kind === "freed" ? "#30d158" : "#0a84ff"} /><path d="M4.2 7.2l1.9 1.9 3.8-4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {toast.kind === "freed" ? `Freed ${gb(toast.gb)}` : `Restored ${gb(toast.gb)}`}
              </span>
              {toast.kind === "freed" ? (
                <motion.button type="button" onClick={undoAll} animate={{ scale: apPress === 9 ? 0.92 : 1 }} whileTap={{ scale: 0.92 }} transition={{ type: "spring", stiffness: 600, damping: 30 }}
                  className={`h-7 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold text-[#64b5ff] outline-none transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#64b5ff] ${apPress === 9 ? "bg-white/15" : ""}`}>
                  {toast.n > 1 ? "Undo all" : "Undo"}
                </motion.button>
              ) : <span className="w-2" />}
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-0 text-center text-[12px] text-[#86868b]">
              Hover the bar to inspect. Press a recommendation to free space.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      <motion.div ref={tip} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-10" initial={false}
        animate={{ opacity: hover >= 0 ? 1 : 0 }} transition={{ duration: 0.15 }}>
        <motion.div initial={false} animate={{ scale: hover >= 0 ? 1 : 0.85, y: hover >= 0 ? 0 : 4 }} transition={{ type: "spring", stiffness: 520, damping: 26 }}
          className="relative origin-bottom whitespace-nowrap rounded-[10px] bg-[#1d1d1f] px-2.5 py-1.5 text-[12px] text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,0.5)]">
          <span className="font-semibold">{CATS[tipCat].name}</span>
          <span className="ml-1.5 tabular-nums text-white/75">{gb(sizes[tipCat])} · {Math.round((sizes[tipCat] / TOTAL) * 100)}%</span>
          <span className="absolute left-1/2 top-full -ml-[5px] block h-0 w-0 border-x-[5px] border-t-[5px] border-x-transparent border-t-[#1d1d1f]" />
        </motion.div>
      </motion.div>
      <p className="sr-only" aria-live="polite">{live}</p>
    </div>
  );
}

function Glyph({ k }: { k: number }) {
  if (k === 0) return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 4.5h10M6.2 4.5V3.2c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7v1.3M4.4 4.5l.6 8.3c0 .4.4.7.8.7h4.4c.4 0 .8-.3.8-.7l.6-8.3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  if (k === 1) return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.6 11.6h-.4A2.7 2.7 0 0 1 3.9 6.2a3.6 3.6 0 0 1 7-.6 2.9 2.9 0 0 1 .9 5.9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 7.6v5.6M6 11.4l2 2 2-2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3.5" width="12" height="9" rx="2" stroke="#fff" strokeWidth="1.5" />
      <path d="M7 6.3v3.4L9.8 8 7 6.3z" fill="#fff" stroke="#fff" strokeWidth="0.8" strokeLinejoin="round" />
    </svg>
  );
}
```
