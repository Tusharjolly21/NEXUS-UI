# Storage Clean

Add the "Storage Clean" component from Nexus UI to my project.

A storage panel you can clean. Press a recommendation and that slice of the bar crumbles into particles that stream into the trash can; the bar springs shut, the number rolls down, and Undo pours the particles back. Canvas particles synced to a spring-driven bar.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { StorageClean } from "@/components/storage-clean";`. The props are typed and documented in the code.

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

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/ui-sounds-pro.ts ---

```ts
/**
 * The Nexus UI Pro sound pack: 32 more interface sounds in five sets (Glass, Paper and wood,
 * Arcade, Studio, Devices), made the same way as the free ones, from oscillators and filtered noise with the
 * Web Audio API. No audio files. It builds on `@/lib/ui-sounds`, which installs with it, and follows
 * the same on/off switch.
 *
 *   import { playProSound } from "@/lib/ui-sounds-pro";
 *   <button onClick={() => playProSound("glass-chime")}>Done</button>
 *
 * In a component with an `enableSound` option:
 *
 *   const play = useProSound(enableSound);
 *   play("coin");
 */

import * as React from "react";
import { audioAwake, hiss, playDef, tone, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";

export type ProSoundCategory = "Glass" | "Paper and wood" | "Arcade" | "Studio" | "Devices";
type ProDef = SoundDef & { category: ProSoundCategory };

export const PRO_SOUNDS = {
  // Glass: small, bright, with a ring that fades.
  "glass-tap": { category: "Glass", label: "Glass tap", play: (c, o) => { tone(c, o, { freq: 2400, to: 2200, decay: 0.06, gain: 0.2 }); tone(c, o, { freq: 3600, decay: 0.04, gain: 0.08 }); hiss(c, o, { freq: 6500, decay: 0.012, gain: 0.08, filter: "highpass" }); } },
  "glass-chime": { category: "Glass", label: "Glass chime", play: (c, o) => [1, 2.32, 4.25].forEach((m, i) => tone(c, o, { freq: 1320 * m, decay: 1.0 / (i + 1), gain: 0.16 / (i + 1) })) },
  "glass-ping": { category: "Glass", label: "Glass ping", play: (c, o) => { tone(c, o, { freq: 2093, decay: 1.1, gain: 0.14 }); tone(c, o, { freq: 3136, decay: 0.6, gain: 0.06 }); } },
  "glass-open": { category: "Glass", label: "Glass open", play: (c, o) => { tone(c, o, { freq: 1568, decay: 0.16, gain: 0.14 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.2, gain: 0.14 }); tone(c, o, { at: 0.14, freq: 2637, decay: 0.45, gain: 0.12 }); hiss(c, o, { at: 0.05, attack: 0.06, decay: 0.16, freq: 5000, to: 9000, gain: 0.04, filter: "highpass" }); } },
  "glass-close": { category: "Glass", label: "Glass close", play: (c, o) => { tone(c, o, { freq: 2637, decay: 0.14, gain: 0.12 }); tone(c, o, { at: 0.07, freq: 2093, decay: 0.16, gain: 0.12 }); tone(c, o, { at: 0.14, freq: 1568, decay: 0.4, gain: 0.12 }); } },
  "glass-clink": { category: "Glass", label: "Clink", play: (c, o) => { tone(c, o, { freq: 3136, decay: 0.28, gain: 0.12 }); tone(c, o, { at: 0.018, freq: 3520, decay: 0.22, gain: 0.1 }); hiss(c, o, { freq: 7000, decay: 0.01, gain: 0.1, filter: "highpass" }); } },

  // Paper and wood: dry, close and physical.
  "paper-flip": { category: "Paper and wood", label: "Page flip", play: (c, o) => { hiss(c, o, { attack: 0.012, decay: 0.09, freq: 3600, to: 1500, gain: 0.16, q: 0.9 }); hiss(c, o, { at: 0.075, attack: 0.008, decay: 0.05, freq: 2600, to: 1800, gain: 0.08, q: 0.9 }); } },
  "paper-crumple": { category: "Paper and wood", label: "Crumple", play: (c, o) => [[0, 3200], [0.028, 4400], [0.05, 2600], [0.085, 5000], [0.115, 3000], [0.15, 4200], [0.19, 2800]].forEach(([at, f], i) => hiss(c, o, { at, attack: 0.002, decay: 0.03 + (i % 3) * 0.01, freq: f, gain: 0.22, q: 2.4 })) },
  "paper-tear": { category: "Paper and wood", label: "Tear", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.24, freq: 1800, to: 5200, gain: 0.13, filter: "highpass", q: 0.7 }); [0.02, 0.06, 0.1, 0.15, 0.2].forEach((at) => hiss(c, o, { at, attack: 0.002, decay: 0.02, freq: 4200, gain: 0.08, q: 3 })); } },
  "wood-tap": { category: "Paper and wood", label: "Wood tap", play: (c, o) => { tone(c, o, { freq: 520, to: 300, decay: 0.07, gain: 0.32, type: "triangle" }); hiss(c, o, { freq: 1200, decay: 0.02, gain: 0.14, q: 3 }); } },
  "wood-block": { category: "Paper and wood", label: "Wood block", play: (c, o) => { tone(c, o, { freq: 880, decay: 0.12, gain: 0.28, type: "triangle" }); tone(c, o, { freq: 1320, decay: 0.06, gain: 0.1 }); hiss(c, o, { freq: 2400, decay: 0.012, gain: 0.1, q: 2 }); } },
  "wood-drop": { category: "Paper and wood", label: "Wood drop", play: (c, o) => { tone(c, o, { freq: 220, to: 120, decay: 0.14, gain: 0.42 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.16, filter: "lowpass" }); tone(c, o, { at: 0.15, freq: 240, to: 150, decay: 0.08, gain: 0.2 }); } },

  // Arcade: square waves and quick arpeggios.
  coin: { category: "Arcade", label: "Coin", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.07, gain: 0.12, type: "square" }); tone(c, o, { at: 0.07, freq: 1319, decay: 0.3, gain: 0.12, type: "square" }); } },
  "power-up": { category: "Arcade", label: "Power up", play: (c, o) => [392, 523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.05, freq: f, decay: 0.12, gain: 0.1, type: "square" })) },
  blip: { category: "Arcade", label: "Blip", play: (c, o) => tone(c, o, { freq: 660, decay: 0.05, gain: 0.12, type: "square" }) },
  laser: { category: "Arcade", label: "Laser", play: (c, o) => tone(c, o, { freq: 1800, to: 200, glide: 0.18, decay: 0.18, gain: 0.1, type: "square" }) },
  "level-up": { category: "Arcade", label: "Level up", play: (c, o) => { [523, 659, 784, 1047].forEach((f, i) => tone(c, o, { at: i * 0.09, freq: f, decay: 0.12, gain: 0.1, type: "triangle" })); tone(c, o, { at: 0.36, freq: 1319, decay: 0.5, gain: 0.1, type: "triangle" }); } },
  "game-over": { category: "Arcade", label: "Game over", play: (c, o) => { [392, 370, 349, 330].forEach((f, i) => tone(c, o, { at: i * 0.17, freq: f, decay: 0.16, gain: 0.1, type: "square" })); tone(c, o, { at: 0.7, freq: 165, decay: 0.55, gain: 0.12, type: "square" }); } },

  // Studio: bigger moments with a tail.
  riser: { category: "Studio", label: "Riser", play: (c, o) => { hiss(c, o, { attack: 0.5, decay: 0.12, freq: 300, to: 6000, gain: 0.14, q: 0.8 }); tone(c, o, { freq: 110, to: 440, glide: 0.6, attack: 0.5, decay: 0.15, gain: 0.07, type: "sawtooth" }); } },
  impact: { category: "Studio", label: "Impact", play: (c, o) => { tone(c, o, { freq: 70, to: 35, glide: 0.35, decay: 0.45, gain: 0.55 }); hiss(c, o, { freq: 500, decay: 0.25, gain: 0.25, filter: "lowpass" }); } },
  sparkle: { category: "Studio", label: "Sparkle", play: (c, o) => [[0, 4000], [0.04, 5200], [0.075, 6200], [0.12, 4800], [0.16, 6800]].forEach(([at, f]) => tone(c, o, { at, freq: f, decay: 0.16, gain: 0.08 })) },
  "confetti-pop": { category: "Studio", label: "Confetti pop", play: (c, o) => { hiss(c, o, { freq: 1200, decay: 0.09, gain: 0.26, filter: "highpass" }); tone(c, o, { freq: 220, to: 90, decay: 0.08, gain: 0.3 }); [0.06, 0.1, 0.15].forEach((at, i) => tone(c, o, { at, freq: 3600 + i * 700, decay: 0.12, gain: 0.04 })); } },
  fanfare: { category: "Studio", label: "Fanfare", play: (c, o) => [[0, [523, 659, 784]], [0.12, [587, 740, 880]], [0.24, [659, 784, 1047]]].forEach(([at, notes]) => (notes as number[]).forEach((f) => tone(c, o, { at: at as number, freq: f, decay: 0.5, gain: 0.07, type: "triangle" }))) },
  swell: { category: "Studio", label: "Swell", play: (c, o) => [196, 247, 294, 392].forEach((f) => tone(c, o, { freq: f, attack: 0.5, decay: 1.2, gain: 0.05 })) },

  // Devices: scanners, readers, relays and machines. Short, dry and a little electronic.
  "scan-sweep": { category: "Devices", label: "Scan sweep", play: (c, o) => { hiss(c, o, { attack: 0.06, decay: 0.3, freq: 600, to: 3800, gain: 0.1, q: 1.6 }); tone(c, o, { freq: 420, to: 1250, glide: 0.38, attack: 0.05, decay: 0.12, gain: 0.05, type: "triangle" }); } },
  "card-insert": { category: "Devices", label: "Card insert", play: (c, o) => { hiss(c, o, { attack: 0.02, decay: 0.13, freq: 1800, to: 500, gain: 0.14, q: 1.2 }); tone(c, o, { at: 0.12, freq: 150, to: 90, decay: 0.07, gain: 0.3 }); hiss(c, o, { at: 0.12, freq: 3200, decay: 0.012, gain: 0.16, filter: "highpass" }); } },
  "access-granted": { category: "Devices", label: "Access granted", play: (c, o) => { tone(c, o, { freq: 988, decay: 0.09, gain: 0.14, type: "triangle" }); tone(c, o, { at: 0.1, freq: 1480, decay: 0.26, gain: 0.14, type: "triangle" }); } },
  "access-denied": { category: "Devices", label: "Access denied", play: (c, o) => { tone(c, o, { freq: 196, decay: 0.13, gain: 0.15, type: "square" }); tone(c, o, { at: 0.16, freq: 165, decay: 0.24, gain: 0.15, type: "square" }); } },
  "relay-click": { category: "Devices", label: "Relay click", play: (c, o) => { hiss(c, o, { freq: 2800, decay: 0.008, gain: 0.3, filter: "highpass" }); tone(c, o, { freq: 1800, to: 700, decay: 0.02, gain: 0.12 }); tone(c, o, { at: 0.015, freq: 120, decay: 0.05, gain: 0.24 }); } },
  bloop: { category: "Devices", label: "Bloop", play: (c, o) => { tone(c, o, { freq: 300, to: 720, glide: 0.09, decay: 0.12, gain: 0.3 }); tone(c, o, { at: 0.05, freq: 640, to: 1200, glide: 0.05, decay: 0.06, gain: 0.1 }); } },
  crumble: { category: "Devices", label: "Crumble", play: (c, o) => { [[0, 2400], [0.03, 1900], [0.07, 2600], [0.1, 1500], [0.15, 2100], [0.19, 1200], [0.26, 1700], [0.31, 900]].forEach(([at, f]) => hiss(c, o, { at, attack: 0.002, decay: 0.035, freq: f, gain: 0.12, q: 2 })); tone(c, o, { freq: 95, to: 60, decay: 0.22, gain: 0.12 }); } },
  pour: { category: "Devices", label: "Pour", play: (c, o) => { hiss(c, o, { attack: 0.04, decay: 0.5, freq: 3000, to: 1600, gain: 0.09, q: 1.2 }); hiss(c, o, { at: 0.08, attack: 0.05, decay: 0.4, freq: 5200, gain: 0.05, filter: "highpass" }); } },
} satisfies Record<string, ProDef>;

export type ProSoundName = keyof typeof PRO_SOUNDS;

/** Play a Pro sound by name. volume is 0..1 on top of the master level. Silent while sounds are off unless `force`. */
export function playProSound(name: ProSoundName, volume = 1, force = false) {
  if (!(name in PRO_SOUNDS)) return;
  playDef(name, PRO_SOUNDS[name], volume, force);
}

/**
 * Like useSound in `@/lib/ui-sounds`, for the Pro sounds: silent when `enabled` is false.
 * `play.auto(...)` is for a component that plays itself (autoplay).
 */
export type ProSoundPlayer = {
  (name: ProSoundName, volume?: number): void;
  auto: (name: ProSoundName, volume?: number) => void;
};

export function useProSound(enabled = true): ProSoundPlayer {
  const auto = useAutoplaySoundAllowed();
  return React.useMemo(
    () =>
      Object.assign(
        (name: ProSoundName, volume = 1) => {
          if (enabled) playProSound(name, volume);
        },
        {
          auto: (name: ProSoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playProSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}
```
