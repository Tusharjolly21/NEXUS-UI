# Range Calendar

Add the "Range Calendar" component from Nexus UI to my project.

A trip date picker whose selection is one liquid ribbon. Drag and it stretches to your finger, snapping day by day and wrapping across rows; the nights count rolls like an odometer and months turn like the faces of a cube. SVG ribbon with spring physics and full keyboard control.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/ui-sounds-pro` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { RangeCalendar } from "@/components/range-calendar";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/range-calendar/index.ts ---

```ts
export { RangeCalendar } from "./range-calendar";
export type { RangeCalendarProps } from "./range-calendar";
```

--- components/range-calendar/range-calendar.tsx ---

```tsx
"use client";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, type AnimationPlaybackControls } from "framer-motion";
import { useProSound } from "@/lib/ui-sounds-pro";

/* ---------- dates (all UTC day indices, so no timezone drift) ---------- */
const DAY_MS = 864e5;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WD3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WDL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HEAD = [["M", "Monday"], ["T", "Tuesday"], ["W", "Wednesday"], ["T", "Thursday"], ["F", "Friday"], ["S", "Saturday"], ["S", "Sunday"]];
const idxOf = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m, d) / DAY_MS);
const dOf = (i: number) => new Date(i * DAY_MS);
const shortD = (i: number) => `${MON3[dOf(i).getUTCMonth()]} ${dOf(i).getUTCDate()}`;
const fieldD = (i: number) => `${WD3[dOf(i).getUTCDay()]}, ${shortD(i)}`;
const longD = (i: number) => `${WDL[dOf(i).getUTCDay()]}, ${MONTHS[dOf(i).getUTCMonth()]} ${dOf(i).getUTCDate()}`;
const mkOf = (i: number) => dOf(i).getUTCFullYear() * 12 + dOf(i).getUTCMonth();
type Month = { mk: number; y: number; m: number; first: number; off: number; n: number; rows: number };
const monthOf = (mk: number): Month => {
  const y = Math.floor(mk / 12), m = mk % 12, first = idxOf(y, m, 1);
  const off = (dOf(first).getUTCDay() + 6) % 7, n = idxOf(y, m + 1, 1) - first;
  return { mk, y, m, first, off, n, rows: Math.ceil((off + n) / 7) };
};
const BASE_MK = 2026 * 12 + 8;
const SEP = (d: number) => idxOf(2026, 8, d);
const INIT = { s: SEP(4), e: SEP(11) as number | null };
type Sel = { s: number; e: number | null };
const nightsWord = (n: number) => (n === 1 ? "night" : "nights");
const summary = (s: Sel) => (s.e === null ? `Check-in ${shortD(s.s)}. Choose a check-out date.` : `${shortD(s.s)} to ${shortD(s.e)}, ${s.e - s.s} ${nightsWord(s.e - s.s)}`);
const CHIPS: { label: string; f: (s: number) => [number, number] }[] = [
  { label: "Weekend", f: (s) => { const ws = s - ((dOf(s).getUTCDay() + 6) % 7); return [ws + 4, ws + 6]; } },
  { label: "3 nights", f: (s) => [s, s + 3] },
  { label: "1 week", f: (s) => [s, s + 7] },
  { label: "2 weeks", f: (s) => [s, s + 14] },
];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/* ---------- springs (index space: 1 unit = 1 day) ---------- */
type Sp = { x: number; v: number; t: number; d: number; dv: number };
const mkSp = (x: number): Sp => ({ x, v: 0, t: x, d: 0, dv: 0 });
function stepSp(s: Sp, dt: number) {
  const pv = s.v;
  s.v += (620 * (s.t - s.x) - 40 * s.v) * dt;
  s.x += s.v * dt;
  // Cap deformation: stretch with speed, an underdamped jelly spring overshoots into a squash when it stops,
  // and a kick when the cap reverses direction (the turnaround).
  if (pv * s.v < 0 && Math.abs(pv) > 2.5) s.dv -= Math.min(5.5, Math.abs(pv) * 0.28);
  const tgt = Math.min(0.2, Math.abs(s.v) * 0.011);
  s.dv += (430 * (tgt - s.d) - 11 * s.dv) * dt;
  s.d += s.dv * dt;
  if (Math.abs(s.t - s.x) < 5e-4 && Math.abs(s.v) < 5e-3) { s.x = s.t; s.v = 0; }
  if (Math.abs(s.d) < 5e-4 && Math.abs(s.dv) < 5e-3) { s.d = 0; s.dv = 0; }
}
const spRest = (s: Sp) => s.x === s.t && s.v === 0 && s.d === 0 && s.dv === 0;
type Springs = { S: Sp; E: Sp; N: { x: number; v: number; t: number } };

/* ---------- ribbon geometry ---------- */
type Dims = { W: number; cw: number; h: number; pitch: number };
type V = { x: number; y: number; r: number };
type Row = { top: number; bot: number; xa: number; xb: number; rlT: number; rlB: number; rrT: number; rrB: number };
const K = 0.5523;
const f1 = (n: number) => Math.round(n * 10) / 10;
function roundPoly(src: V[]) {
  const P: V[] = [];
  for (const v of src) { const l = P[P.length - 1]; if (!l || Math.abs(l.x - v.x) + Math.abs(l.y - v.y) > 0.05) P.push(v); }
  while (P.length > 2 && Math.abs(P[0].x - P[P.length - 1].x) + Math.abs(P[0].y - P[P.length - 1].y) <= 0.05) P.pop();
  const n = P.length;
  if (n < 3) return "";
  let d = "";
  for (let i = 0; i < n; i++) {
    const v = P[i], p = P[(i + n - 1) % n], q = P[(i + 1) % n];
    const l1 = Math.hypot(p.x - v.x, p.y - v.y), l2 = Math.hypot(q.x - v.x, q.y - v.y);
    const r = Math.max(0, Math.min(v.r, l1 / 2, l2 / 2));
    const ax = v.x + ((p.x - v.x) / l1) * r, ay = v.y + ((p.y - v.y) / l1) * r;
    const bx = v.x + ((q.x - v.x) / l2) * r, by = v.y + ((q.y - v.y) / l2) * r;
    d += `${i ? "L" : "M"}${f1(ax)} ${f1(ay)}C${f1(ax + (v.x - ax) * K)} ${f1(ay + (v.y - ay) * K)} ${f1(bx + (v.x - bx) * K)} ${f1(by + (v.y - by) * K)} ${f1(bx)} ${f1(by)}`;
  }
  return d + "Z";
}
const RC = 9; // concave join radius
/** Union of row segments with the gaps between rows filled where they overlap, so the selection reads as one ribbon. */
function ribbonPath(rows: Row[]) {
  if (!rows.length) return "";
  const comps: Row[][] = [[rows[0]]];
  const necks: number[][] = [[]];
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1], b = rows[i];
    const w = Math.min(a.xb, b.xb) - Math.max(a.xa, b.xa);
    if (w > 0.5) { comps[comps.length - 1].push(b); necks[necks.length - 1].push(Math.min(RC, w * 0.5)); continue; }
    // about to separate: the facing corners sharpen as the neck closes, so the hand-off is continuous
    const g = Math.max(0, -w) * 1.2;
    if (b.xb <= a.xa + 0.5) { a.rlB = Math.min(a.rlB, g); b.rrT = Math.min(b.rrT, g); } else { a.rrB = Math.min(a.rrB, g); b.rlT = Math.min(b.rlT, g); }
    comps.push([b]); necks.push([]);
  }
  let d = "";
  comps.forEach((C, ci) => {
    const nk = necks[ci], k = C.length - 1, Vs: V[] = [];
    Vs.push({ x: C[0].xb, y: C[0].top, r: C[0].rrT });
    for (let i = 0; i < k; i++) {
      const a = C[i], b = C[i + 1];
      if (b.xb < a.xb - 0.01) { Vs.push({ x: a.xb, y: a.bot, r: a.rrB }, { x: b.xb, y: a.bot, r: nk[i] }); }
      else if (b.xb > a.xb + 0.01) { Vs.push({ x: a.xb, y: b.top, r: nk[i] }, { x: b.xb, y: b.top, r: b.rrT }); }
    }
    Vs.push({ x: C[k].xb, y: C[k].bot, r: C[k].rrB }, { x: C[k].xa, y: C[k].bot, r: C[k].rlB });
    for (let i = k; i > 0; i--) {
      const a = C[i], p = C[i - 1];
      if (p.xa > a.xa + 0.01) { Vs.push({ x: a.xa, y: a.top, r: a.rlT }, { x: p.xa, y: a.top, r: nk[i - 1] }); }
      else if (p.xa < a.xa - 0.01) { Vs.push({ x: a.xa, y: p.bot, r: nk[i - 1] }, { x: p.xa, y: p.bot, r: p.rlB }); }
    }
    Vs.push({ x: C[0].xa, y: C[0].top, r: C[0].rlT });
    d += roundPoly(Vs);
  });
  return d;
}
/** Staircase outline of the month's day cells, used to clip the endpoint discs. */
function monthShape(M: Month, D: Dims) {
  const last = M.off + M.n - 1, lr = Math.floor(last / 7), lc = last % 7, cw = D.cw, p = D.pitch, W = 7 * cw, pad = 3;
  const pts = [[M.off * cw, -pad], [W, -pad], [W, lr * p], [(lc + 1) * cw, lr * p], [(lc + 1) * cw, (lr + 1) * p + pad], [0, (lr + 1) * p + pad], [0, p], [M.off * cw, p]];
  return "M" + pts.map((q) => `${f1(q[0])} ${f1(q[1])}`).join("L") + "Z";
}

/* ---------- one month page ---------- */
const flipV = {
  // a shallow cube turn: the two pages stay joined at one edge while they swing through depth
  enter: (d: number) => ({ x: `${d * 100}%`, rotateY: d * 34, originX: d > 0 ? 0 : 1 }),
  center: { x: "0%", rotateY: 0 },
  exit: (d: number) => ({ x: `${d * -100}%`, rotateY: d * -34, originX: d > 0 ? 1 : 0 }),
};
const shadeV = { enter: { opacity: 1 }, center: { opacity: 0 }, exit: { opacity: 1 } };
const flipT = { type: "spring" as const, stiffness: 210, damping: 29, mass: 1 };

type PageProps = {
  month: Month; dims: Dims; reg: Map<string, () => void>; springs: { current: Springs }; sel: Sel; focus: number;
  onKey: (e: RKeyboardEvent<HTMLButtonElement>, idx: number) => void; onFocusDay: (idx: number) => void; dir: number;
};
function Page({ month: M, dims: D, reg, springs, sel, focus, onKey, onFocusDay, dir }: PageProps) {
  const present = useIsPresent();
  const uid = useId().replace(/:/g, "");
  const ribbon = useRef<SVGPathElement>(null);
  const els = useRef<(SVGEllipseElement | null)[]>([]);
  const dRef = useRef(D);
  const mRef = useRef(M);
  const lastKey = useRef("");
  const drawRef = useRef<() => void>(() => {});
  const draw = () => {
    const Dm = dRef.current, Mo = mRef.current, sp = springs.current;
    const lo = sp.S.x <= sp.E.x ? sp.S : sp.E, hi = lo === sp.S ? sp.E : sp.S;
    const R0 = Dm.h / 2, RW = 9, cw = Dm.cw, rowW = 7 * cw;
    const U = (i: number) => (i - Mo.first + Mo.off + 0.5) * cw;
    const rxL = R0 * (1 + lo.d), rxH = R0 * (1 + hi.d);
    const uL = U(lo.x) - rxL, uR = U(hi.x) + rxH;
    const mL = Mo.off * cw, mR = (Mo.off + Mo.n) * cw;
    const blend = (ov: number) => (ov <= 0 ? R0 : Math.max(RW, R0 - ov));
    const rows: Row[] = [];
    for (let r = 0; r < Mo.rows; r++) {
      const rs = r * rowW, cl = Math.max(rs, mL), cr = Math.min(rs + rowW, mR);
      const a = Math.max(uL, cl), b = Math.min(uR, cr);
      if (b - a > 0.3) {
        const top = r * Dm.pitch + (Dm.pitch - Dm.h) / 2, rl = blend(cl - uL), rr = blend(uR - cr);
        rows.push({ top, bot: top + Dm.h, xa: a - rs, xb: b - rs, rlT: rl, rlB: rl, rrT: rr, rrB: rr });
      }
    }
    const path = ribbonPath(rows);
    // endpoint discs, with a second copy while one wraps across a row break
    const disc: number[] = [];
    for (const s of [lo, hi]) {
      const u = U(s.x), rx = R0 * (1 + s.d), ry = R0 * (1 - 0.6 * s.d), r0 = Math.floor(u / rowW), x0 = u - r0 * rowW;
      const alt = x0 > rowW - rx ? [r0 + 1, x0 - rowW] : x0 < rx ? [r0 - 1, x0 + rowW] : null;
      disc.push(x0, r0 * Dm.pitch + Dm.pitch / 2, rx, ry);
      if (alt) disc.push(alt[1], alt[0] * Dm.pitch + Dm.pitch / 2, rx, ry);
      else disc.push(0, -99, 0, 0);
    }
    const key = path + disc.map(f1).join(",");
    if (key === lastKey.current) return;
    lastKey.current = key;
    ribbon.current?.setAttribute("d", path || "M0 0");
    for (let j = 0; j < 4; j++) {
      const [cx, cy, rx, ry] = disc.slice(j * 4, j * 4 + 4);
      for (let t = 0; t < 3; t++) {
        const el = els.current[j * 3 + t];
        if (!el) continue;
        const sh = t === 0;
        el.setAttribute("cx", f1(cx) + "");
        el.setAttribute("cy", f1(cy + (sh ? Dm.h * 0.14 : 0)) + "");
        el.setAttribute("rx", f1(Math.max(0, rx * (sh ? 1.06 : 1))) + "");
        el.setAttribute("ry", f1(Math.max(0, ry * (sh ? 0.92 : 1))) + "");
      }
    }
  };
  useLayoutEffect(() => { dRef.current = D; mRef.current = M; drawRef.current = draw; });
  useLayoutEffect(() => {
    const f = () => drawRef.current();
    reg.set(uid, f);
    f();
    return () => { reg.delete(uid); };
  }, [reg, uid]);
  useLayoutEffect(() => { lastKey.current = ""; drawRef.current(); }, [D, M]);

  const H = M.rows * D.pitch;
  const cells = Array.from({ length: M.n }, (_, i) => { const c = M.off + i; return { idx: M.first + i, day: i + 1, r: Math.floor(c / 7), col: c % 7 }; });
  const tabTarget = focus >= M.first && focus < M.first + M.n ? focus : sel.s >= M.first && sel.s < M.first + M.n ? sel.s : M.first;
  const inSel = (i: number) => (sel.e === null ? i === sel.s : i >= sel.s && i <= sel.e);
  const tx = (c: { col: number }) => (c.col + 0.5) * D.cw, ty = (c: { r: number }) => c.r * D.pitch + D.pitch / 2;
  const fs = D.cw < 46 ? 14 : 15;
  return (
    <motion.div data-mk={M.mk} custom={dir} variants={flipV} initial="enter" animate="center" exit="exit" transition={flipT}
      className="absolute inset-x-0 top-0" style={{ height: H, transformOrigin: "50% 50%", pointerEvents: present ? "auto" : "none" }}
      role="grid" aria-label={`${MONTHS[M.m]} ${M.y}`} aria-hidden={present ? undefined : true}>
      <svg width={D.W} height={H} viewBox={`0 0 ${D.W} ${H}`} className="absolute left-0 top-0 overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id={`m${uid}`}><path d={monthShape(M, D)} /></clipPath>
          <clipPath id={`d${uid}`}>{[0, 1, 2, 3].map((j) => <ellipse key={j} ref={(el) => { els.current[j * 3 + 2] = el; }} rx="0" ry="0" />)}</clipPath>
          <linearGradient id={`g${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a77ea" /><stop offset="1" stopColor="#005fc6" /></linearGradient>
          <linearGradient id={`t${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e6f1fd" /><stop offset="1" stopColor="#dcebfc" /></linearGradient>
          <radialGradient id={`s${uid}`}><stop offset="0.55" stopColor="#0050b4" stopOpacity="0.28" /><stop offset="1" stopColor="#0050b4" stopOpacity="0" /></radialGradient>
        </defs>
        <path ref={ribbon} fill={`url(#t${uid})`} />
        <g clipPath={`url(#m${uid})`}>
          {[0, 1, 2, 3].map((j) => (
            <g key={j}>
              <ellipse ref={(el) => { els.current[j * 3] = el; }} fill={`url(#s${uid})`} rx="0" ry="0" />
              <ellipse ref={(el) => { els.current[j * 3 + 1] = el; }} fill={`url(#g${uid})`} rx="0" ry="0" />
            </g>
          ))}
        </g>
        <g fill="#1d1d1f" fontSize={fs} fontWeight={500} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
          {cells.map((c) => <text key={c.idx} x={tx(c)} y={ty(c)} dy="0.35em">{c.day}</text>)}
        </g>
        <g clipPath={`url(#m${uid})`}>
          <g clipPath={`url(#d${uid})`} fill="#fff" fontSize={fs} fontWeight={500} textAnchor="middle" style={{ fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" }}>
            {cells.map((c) => <text key={c.idx} x={tx(c)} y={ty(c)} dy="0.35em">{c.day}</text>)}
          </g>
        </g>
      </svg>
      {Array.from({ length: M.rows }, (_, r) => (
        <div role="row" key={r} className="contents">
          {cells.filter((c) => c.r === r).map((c) => (
            <button key={c.idx} type="button" role="gridcell" data-idx={c.idx} aria-selected={inSel(c.idx)}
              aria-label={`${longD(c.idx)}${c.idx === sel.s ? ", check-in" : c.idx === sel.e ? ", check-out" : ""}`}
              tabIndex={present && c.idx === tabTarget ? 0 : -1}
              onKeyDown={(e) => onKey(e, c.idx)} onFocus={() => onFocusDay(c.idx)}
              className="absolute rounded-full outline-none transition-colors duration-150 hover:bg-black/[0.035] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]"
              style={{ left: c.col * D.cw + (D.cw - D.h) / 2, top: c.r * D.pitch + (D.pitch - D.h) / 2, width: D.h, height: D.h }} />
          ))}
        </div>
      ))}
      <motion.div variants={shadeV} transition={flipT} className="pointer-events-none absolute inset-0 rounded-[18px]" style={{ background: "#fff" }} />
    </motion.div>
  );
}

/* ---------- small pieces ---------- */
function Field({ label, value, placeholder, active, narrow }: { label: string; value: string | null; placeholder: string; active: boolean; narrow: boolean }) {
  return (
    <div className={`min-w-0 flex-1 rounded-[14px] bg-[#f5f5f7] py-2 ${narrow ? "px-2.5" : "px-3"} transition-shadow duration-200 ${active ? "shadow-[inset_0_0_0_2px_#0071e3]" : "shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]"}`}>
      <div className="whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.05em] text-[#6e6e73]">{label}</div>
      <div className="relative mt-0.5 h-[20px] overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={value ?? "none"} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 38 }}
            className={`truncate whitespace-nowrap text-[15px] leading-[20px] tracking-[-0.015em] ${value ? "font-semibold text-[#1d1d1f]" : "font-medium text-[#6e6e73]"}`}>
            {value ?? placeholder}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
const DIG = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const LH = 30;
function Strip({ stripRef }: { stripRef: (el: HTMLSpanElement | null) => void }) {
  return (
    <span ref={stripRef} className="absolute left-0 top-0 flex w-full flex-col items-center will-change-transform">
      {DIG.map((d, i) => <span key={i} style={{ height: LH, lineHeight: `${LH}px` }}>{d}</span>)}
    </span>
  );
}

/**
 * A trip date-range picker whose selection is one liquid ribbon. Press a day and drag: the ribbon
 * stretches to the pointer, snapping day by day on springs and wrapping across week rows with rounded
 * joins, while the nights count rolls like an odometer. Quick chips flow it to a preset range, and the
 * month pages turn in 3D. Arrow keys move, Enter sets check-in then check-out, Shift+arrows extends.
 */
export interface RangeCalendarProps {
  /** Plays itself with a ghost pointer until the visitor touches it. Off by default, so a copied component reacts only to the visitor. */
  autoplay?: boolean;
  /** Plays interface sounds that follow what happens on screen. They follow the visitor's sound switch (off until switched on on this site). */
  enableSound?: boolean;
  /** Extra classes for the outer card. */
  className?: string;
}

export function RangeCalendar({ autoplay = false, enableSound = true, className = "" }: RangeCalendarProps) {
  const [sel, setSel] = useState<Sel>(INIT);
  const selRef = useRef<Sel>(INIT);
  const [view, setView] = useState({ mk: BASE_MK, dir: 1 });
  const viewRef = useRef(view);
  const [focus, setFocus] = useState(INIT.s);
  const [dims, setDims] = useState<Dims>({ W: 392, cw: 56, h: 40, pitch: 46 });
  const dimsRef = useRef(dims);
  const [live, setLive] = useState("");
  const [dragging, setDragging] = useState(false);
  const [apChip, setApChip] = useState(-1);
  const [reg] = useState(() => new Map<string, () => void>());
  const springs = useRef<Springs>({ S: mkSp(INIT.s), E: mkSp(INIT.e!), N: { x: 7, v: 0, t: 7 } });
  const stage = useRef<HTMLDivElement>(null);
  const sizer = useRef<HTMLDivElement>(null);
  const strips = useRef<(HTMLSpanElement | null)[]>([]);
  const tensSlot = useRef<HTMLSpanElement>(null);
  const engine = useRef<{ kick: () => void } | null>(null);
  const touched = useRef(false);
  const drag = useRef({ on: false, anchor: 0, head: 0, auto: false });
  const kbNav = useRef(false);
  const ghostX = useMotionValue(0), ghostY = useMotionValue(0), ghostO = useMotionValue(0), ghostS = useMotionValue(1);
  const ctl = useRef<AnimationPlaybackControls[]>([]);

  // sounds: a real visitor plays them directly; while the ghost pointer is driving they go through play.auto
  const play = useProSound(enableSound);
  const playRef = useRef(play);
  const autoplayRef = useRef(autoplay);
  const lastTick = useRef(0);
  useLayoutEffect(() => { viewRef.current = view; dimsRef.current = dims; playRef.current = play; autoplayRef.current = autoplay; });
  const sfx = (name: Parameters<typeof play>[0], vol?: number) => {
    if (typeof document !== "undefined" && document.hidden) return;
    const p = playRef.current;
    if (autoplayRef.current && !touched.current) p.auto(name, vol); else p(name, vol);
  };
  /** The ribbon snapped onto another day: a soft tap, at most about 12 a second. */
  const snapTick = () => {
    const now = performance.now();
    if (now - lastTick.current < 80) return;
    lastTick.current = now;
    sfx("glass-tap", 0.22);
  };

  // one rAF loop: integrates the springs and asks every mounted page to redraw its ribbon
  useEffect(() => {
    let id = 0, last = 0;
    const step = (now: number) => {
      const dt = Math.min(0.033, Math.max(0.001, (now - last) / 1000));
      last = now;
      const sp = springs.current;
      const sub = Math.ceil(dt / 0.006);
      for (let i = 0; i < sub; i++) { stepSp(sp.S, dt / sub); stepSp(sp.E, dt / sub); }
      const N = sp.N;
      for (let i = 0; i < sub; i++) { N.v += (190 * (N.t - N.x) - 25 * N.v) * (dt / sub); N.x += N.v * (dt / sub); }
      if (Math.abs(N.t - N.x) < 1e-3 && Math.abs(N.v) < 1e-2) { N.x = N.t; N.v = 0; }
      reg.forEach((f) => f());
      // mechanical odometer: ones roll continuously, tens carry during the last tenth of a turn
      const v = clamp(N.x, 0, 99), ones = ((v % 10) + 10) % 10, tens = Math.floor(v / 10) + clamp(ones - 9, 0, 1);
      const sO = strips.current[1], sT = strips.current[0];
      if (sO) sO.style.transform = `translate3d(0,${(-ones * LH).toFixed(2)}px,0)`;
      if (sT) sT.style.transform = `translate3d(0,${(-(tens % 10) * LH).toFixed(2)}px,0)`;
      const tw = clamp(v - 9, 0, 1);
      if (tensSlot.current) { tensSlot.current.style.width = `${(tw * 0.62).toFixed(3)}em`; tensSlot.current.style.opacity = tw.toFixed(3); }
      const busy = !spRest(sp.S) || !spRest(sp.E) || N.x !== N.t || N.v !== 0;
      id = busy ? requestAnimationFrame(step) : 0;
    };
    engine.current = { kick: () => { if (!id) { last = performance.now(); id = requestAnimationFrame(step); } } };
    engine.current.kick();
    return () => { cancelAnimationFrame(id); id = 0; engine.current = null; };
  }, [reg]);
  const kick = () => engine.current?.kick();

  // measure the grid width (offsetWidth ignores CSS zoom / transforms of the gallery)
  useLayoutEffect(() => {
    const el = sizer.current;
    if (!el) return;
    const measure = () => {
      const W = el.offsetWidth;
      if (!W) return;
      const cw = W / 7, h = Math.round(clamp(cw - 7, 30, 40)), pitch = h + 6;
      setDims((p) => (Math.abs(p.W - W) < 0.5 ? p : { W, cw, h, pitch }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const commit = (next: Sel, announce: boolean) => {
    const cur = selRef.current;
    if (cur.s !== next.s || cur.e !== next.e) {
      selRef.current = next;
      setSel(next);
      const sp = springs.current;
      sp.S.t = next.s;
      sp.E.t = next.e ?? next.s;
      sp.N.t = next.e === null ? 0 : next.e - next.s;
      kick();
    }
    if (announce) setLive(summary(next));
  };
  const hit = (x: number, y: number) => {
    const D = dimsRef.current, M = monthOf(viewRef.current.mk);
    const col = clamp(Math.floor(x / D.cw), 0, 6), row = clamp(Math.floor(y / D.pitch), 0, M.rows - 1);
    return M.first + clamp(row * 7 + col, M.off, M.off + M.n - 1) - M.off;
  };
  const center = (i: number) => {
    const D = dimsRef.current, M = monthOf(viewRef.current.mk), c = i - M.first + M.off;
    return { x: ((c % 7) + 0.5) * D.cw, y: Math.floor(c / 7) * D.pitch + D.pitch / 2 };
  };
  const moveHead = (head: number) => {
    const a = drag.current.anchor;
    drag.current.head = head;
    commit(head === a ? { s: a, e: null } : { s: Math.min(a, head), e: Math.max(a, head) }, false);
  };
  const begin = (i: number, auto: boolean) => {
    const s = selRef.current;
    drag.current = { on: true, anchor: s.e === null && i !== s.s ? s.s : i, head: i, auto };
    sfx("glass-clink", 0.5);
    setDragging(true);
    setFocus(i);
    moveHead(i);
  };
  const end = (quiet = false) => {
    if (!drag.current.on) return;
    drag.current.on = false;
    setDragging(false);
    commit(selRef.current, true);
    // letting go: a chime when a range is set, a lone ping when only the check-in is
    if (!quiet) { if (selRef.current.e === null) sfx("glass-ping", 0.4); else sfx("glass-chime", 0.5); }
  };
  const pick = (i: number) => {
    const s = selRef.current;
    if (s.e === null && i !== s.s) { commit({ s: Math.min(i, s.s), e: Math.max(i, s.s) }, true); sfx("glass-chime", 0.5); }
    else { commit({ s: i, e: null }, true); sfx("glass-ping", 0.4); }
  };
  const extend = (from: number, to: number) => {
    const s = selRef.current;
    const anchor = s.e === null ? s.s : from === s.e ? s.s : from === s.s ? s.e : from;
    commit(anchor === to ? { s: anchor, e: null } : { s: Math.min(anchor, to), e: Math.max(anchor, to) }, true);
    snapTick();
  };
  const go = (delta: number) => {
    setView((v) => ({ mk: v.mk + delta, dir: delta > 0 ? 1 : -1 }));
    sfx("paper-flip", delta > 0 ? 0.5 : 0.32);
  };
  const applyChip = (k: number) => {
    const [a, b] = CHIPS[k].f(selRef.current.s);
    commit({ s: a, e: b }, true);
    sfx("glass-open", 0.45);
  };

  const local = (e: RPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget, r = el.getBoundingClientRect(), sc = r.width / el.offsetWidth || 1;
    return { x: (e.clientX - r.left) / sc, y: (e.clientY - r.top) / sc };
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    begin(hit(p.x, p.y), false);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!drag.current.on || drag.current.auto) return;
    const p = local(e), h = hit(p.x, p.y);
    if (h !== drag.current.head) { moveHead(h); snapTick(); }
  };
  const onKey = (e: RKeyboardEvent<HTMLButtonElement>, i: number) => {
    const dl = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" ? -7 : e.key === "ArrowDown" ? 7 : 0;
    if (dl) {
      e.preventDefault();
      const nf = i + dl;
      if (e.shiftKey) extend(i, nf);
      kbNav.current = true;
      setFocus(nf);
      const mk = mkOf(nf);
      if (mk !== viewRef.current.mk) go(mk - viewRef.current.mk);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(i);
    }
  };
  useEffect(() => {
    if (!kbNav.current) return;
    kbNav.current = false;
    stage.current?.querySelector<HTMLButtonElement>(`[data-mk="${view.mk}"] [data-idx="${focus}"]`)?.focus({ preventScroll: true });
  }, [focus, view.mk]);

  const stopAuto = () => {
    if (touched.current) return;
    touched.current = true;
    ctl.current.forEach((c) => c.stop());
    ghostO.set(0);
    setApChip(-1);
    if (drag.current.auto) end(true);
  };

  // autoplay: drag a range (with a turnaround), use a chip, turn the page and back; repeat
  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    const timers: number[] = [];
    const ok = () => alive && !touched.current;
    const sleep = (ms: number) => new Promise<void>((res) => { timers.push(window.setTimeout(res, ms)); });
    const mv = (to: { x: number; y: number }, ms: number) => new Promise<void>((res) => {
      const t = { duration: ms / 1000, ease: [0.45, 0, 0.25, 1] as [number, number, number, number] };
      const track = () => { if (drag.current.on && drag.current.auto && ok()) { const h = hit(ghostX.get(), ghostY.get()); if (h !== drag.current.head) { moveHead(h); snapTick(); } } };
      ctl.current = [animate(ghostX, to.x, { ...t, onUpdate: track }), animate(ghostY, to.y, { ...t, onUpdate: track, onComplete: res })];
    });
    (async () => {
      await sleep(900);
      while (ok()) {
        if (viewRef.current.mk !== BASE_MK) { go(BASE_MK - viewRef.current.mk); await sleep(900); if (!ok()) break; }
        const a = center(SEP(18));
        ghostX.set(a.x + 26); ghostY.set(a.y + 34); ghostS.set(1.15);
        ctl.current = [animate(ghostO, 1, { duration: 0.25 }), animate(ghostS, 1, { duration: 0.3 })];
        await mv(a, 380);
        if (!ok()) break;
        ctl.current = [animate(ghostS, 0.82, { type: "spring", stiffness: 600, damping: 30 })];
        begin(SEP(18), true);
        await sleep(260);
        const D = dimsRef.current;
        await mv(center(SEP(20)), 520);
        await mv(center(SEP(27)), 420);
        await mv({ x: 6.5 * D.cw, y: 4.5 * D.pitch }, 420);
        await sleep(160);
        await mv(center(SEP(25)), 560);
        if (!ok()) break;
        await sleep(240);
        end();
        ctl.current = [animate(ghostS, 1.1, { duration: 0.3 }), animate(ghostO, 0, { duration: 0.35 })];
        await sleep(1000);
        if (!ok()) break;
        setApChip(3);
        await sleep(160);
        if (!ok()) break;
        applyChip(3);
        await sleep(180);
        setApChip(-1);
        await sleep(1500);
        if (!ok()) break;
        go(1);
        await sleep(1700);
        if (!ok()) break;
        go(-1);
        await sleep(1500);
      }
    })();
    return () => { alive = false; timers.forEach(clearTimeout); ctl.current.forEach((c) => c.stop()); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const M = monthOf(view.mk);
  const nights = sel.e === null ? 0 : sel.e - sel.s;
  const chipOn = (k: number) => { if (sel.e === null) return false; const [a, b] = CHIPS[k].f(sel.s); return a === sel.s && b === sel.e; };
  const pending = sel.e === null;
  const narrow = dims.W < 330;
  const fmt = narrow ? shortD : fieldD;

  return (
    <div className={`relative w-full max-w-[440px] select-none rounded-[24px] bg-white p-[18px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      role="group" aria-label="Trip dates" onPointerDownCapture={stopAuto} onKeyDownCapture={stopAuto}>
      <div className="flex items-stretch gap-2">
        <Field label="Check-in" value={fmt(sel.s)} placeholder="Add date" active={false} narrow={narrow} />
        <Field label="Check-out" value={sel.e === null ? null : fmt(sel.e)} placeholder="Add date" active={pending || dragging} narrow={narrow} />
        <div className={`flex ${narrow ? "w-[58px]" : "w-[64px]"} flex-none flex-col items-center justify-center rounded-[14px] bg-[#f5f5f7] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.04)]`} aria-hidden="true">
          <span className="flex text-[26px] font-semibold tabular-nums leading-none tracking-[-0.03em] text-[#1d1d1f]"
            style={{ height: LH, WebkitMaskImage: "linear-gradient(transparent, #000 22%, #000 78%, transparent)", maskImage: "linear-gradient(transparent, #000 22%, #000 78%, transparent)" }}>
            <span ref={tensSlot} className="relative inline-block overflow-hidden" style={{ height: LH, width: 0 }}><Strip stripRef={(el) => { strips.current[0] = el; }} /></span>
            <span className="relative inline-block overflow-hidden" style={{ height: LH, width: "0.62em" }}><Strip stripRef={(el) => { strips.current[1] = el; }} /></span>
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-[#6e6e73]">{nightsWord(nights)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between pl-1">
        <div className="relative h-[24px] min-w-0 flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout" custom={view.dir}>
            <motion.h3 key={view.mk} custom={view.dir} initial={{ x: view.dir * 28, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { type: "spring", stiffness: 380, damping: 34, opacity: { duration: 0.2, delay: 0.08 } } }}
              exit={{ x: view.dir * -28, opacity: 0, transition: { type: "spring", stiffness: 380, damping: 34, opacity: { duration: 0.1 } } }} className="m-0 whitespace-nowrap text-[17px] font-semibold leading-[24px] tracking-[-0.022em] text-[#1d1d1f]">
              {MONTHS[M.m]} <span className="font-normal text-[#6e6e73]">{M.y}</span>
            </motion.h3>
          </AnimatePresence>
        </div>
        <div className="flex gap-1">
          {[-1, 1].map((d) => (
            <button key={d} type="button" aria-label={d < 0 ? "Previous month" : "Next month"} onClick={() => go(d)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#0071e3] outline-none transition-colors hover:bg-[#0071e3]/[0.08] active:bg-[#0071e3]/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]">
              <svg width="9" height="15" viewBox="0 0 9 15" fill="none" aria-hidden="true"><path d={d < 0 ? "M7.5 1.5L1.5 7.5l6 6" : "M1.5 1.5l6 6-6 6"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          ))}
        </div>
      </div>

      <div ref={sizer} className="mt-2 grid grid-cols-7" aria-hidden="true">
        {HEAD.map(([s, l]) => <span key={l} className="text-center text-[12px] font-medium text-[#6e6e73]">{s}</span>)}
      </div>
      <div className="mt-1">
        <motion.div ref={stage} className="relative touch-none overflow-hidden" style={{ perspective: 1000 }} initial={false} animate={{ height: M.rows * dims.pitch }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => end()} onPointerCancel={() => end()} onLostPointerCapture={() => { if (!drag.current.auto) end(); }}>
          <AnimatePresence initial={false} custom={view.dir}>
            <Page key={view.mk} month={M} dims={dims} reg={reg} springs={springs} sel={sel} focus={focus} onKey={onKey} onFocusDay={setFocus} dir={view.dir} />
          </AnimatePresence>
          <motion.div aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-[30px] w-[30px] rounded-full"
            style={{ x: ghostX, y: ghostY, opacity: ghostO, scale: ghostS, marginLeft: -15, marginTop: -15, background: "rgba(60,60,67,0.16)", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.85), 0 0 0 1px rgba(0,0,0,0.06), 0 4px 12px -4px rgba(0,0,0,0.25)" }} />
        </motion.div>
      </div>

      <div className="mt-3 flex gap-1.5" role="group" aria-label="Quick ranges">
        {CHIPS.map((c, k) => {
          const on = chipOn(k);
          return (
            <motion.button key={c.label} type="button" aria-pressed={on} onClick={() => applyChip(k)} animate={{ scale: apChip === k ? 0.93 : 1 }} whileTap={{ scale: 0.93 }}
              transition={{ type: "spring", stiffness: 600, damping: 28 }}
              className={`h-8 min-w-0 flex-1 whitespace-nowrap rounded-full px-1 text-[13px] font-medium tracking-[-0.01em] outline-none transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] ${on ? "bg-[#0071e3] text-white" : "bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ebebef]"}`}>
              {c.label}
            </motion.button>
          );
        })}
      </div>
      <p className="mb-0 mt-3 text-center text-[12px] text-[#86868b]">Drag across days, or use arrow keys and Enter. Shift+arrows extends.</p>
      <p className="sr-only" aria-live="polite">{live}</p>
    </div>
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
 * The Nexus UI Pro sound pack: 39 more interface sounds in six sets (Glass, Paper and wood,
 * Arcade, Studio, Devices, Gallery), made the same way as the free ones, from oscillators and filtered noise with the
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

export type ProSoundCategory = "Glass" | "Paper and wood" | "Arcade" | "Studio" | "Devices" | "Gallery";
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

  // Gallery: a ring of photo cards. Light, papery and airy, with a soft glass edge. They are written to follow the
  // motion of the Ring Gallery: a tick for each card that passes, a thud when the ring settles, a whoosh that swells
  // and fades with the speed of the spin-in. None plays on hover.
  "ring-tick": { category: "Gallery", label: "Ring tick", play: (c, o) => { const j = 0.94 + Math.random() * 0.12; hiss(c, o, { freq: 3800 * j, decay: 0.013, gain: 0.36, q: 3.2 }); tone(c, o, { freq: 1300 * j, to: 920 * j, decay: 0.03, gain: 0.17, type: "triangle" }); } },
  "ring-settle": { category: "Gallery", label: "Ring settle", play: (c, o) => { tone(c, o, { freq: 150, to: 92, glide: 0.1, decay: 0.16, gain: 0.28 }); hiss(c, o, { freq: 700, decay: 0.06, gain: 0.1, filter: "lowpass" }); tone(c, o, { at: 0.01, freq: 2093, decay: 0.5, gain: 0.035 }); } },
  "ring-spool": {
    category: "Gallery",
    label: "Ring spool",
    length: 2.2,
    play: (c, o) => {
      // Two seconds shaped like the spin it goes with: slow, fastest in the middle, slow again. A band of air opens as
      // the ring picks up speed and closes as it slows, with a low whine that rises and falls the same way.
      const t0 = c.currentTime, T = 2, K = 64;
      const bell = (k: number) => Math.pow(Math.sin((Math.PI * k) / (K - 1)), 1.6);
      const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const air = c.createBufferSource();
      air.buffer = buf;
      air.loop = true;
      const band = c.createBiquadFilter();
      band.type = "bandpass";
      band.Q.value = 0.9;
      band.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 260 * Math.pow(10, bell(k))), t0, T);
      const ag = c.createGain();
      ag.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.15 * bell(k)), t0, T);
      air.connect(band).connect(ag).connect(o);
      air.start(t0);
      air.stop(t0 + T + 0.05);
      const whine = c.createOscillator();
      whine.type = "triangle";
      whine.frequency.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 90 * Math.pow(3.8, bell(k))), t0, T);
      const wg = c.createGain();
      wg.gain.setValueCurveAtTime(Float32Array.from({ length: K }, (_, k) => 0.0001 + 0.06 * bell(k) * bell(k)), t0, T);
      whine.connect(wg).connect(o);
      whine.start(t0);
      whine.stop(t0 + T + 0.05);
    },
  },
  "ring-open": { category: "Gallery", label: "Entry open", play: (c, o) => { hiss(c, o, { attack: 0.12, decay: 0.22, freq: 500, to: 3200, gain: 0.1, q: 0.9 }); tone(c, o, { freq: 196, to: 130, glide: 0.14, attack: 0.01, decay: 0.28, gain: 0.2 }); tone(c, o, { at: 0.2, freq: 1568, decay: 0.5, gain: 0.07 }); tone(c, o, { at: 0.24, freq: 2349, decay: 0.55, gain: 0.05 }); } },
  "ring-close": { category: "Gallery", label: "Entry close", play: (c, o) => { tone(c, o, { freq: 2349, decay: 0.25, gain: 0.05 }); tone(c, o, { at: 0.06, freq: 1568, decay: 0.3, gain: 0.07 }); hiss(c, o, { at: 0.02, attack: 0.06, decay: 0.22, freq: 3200, to: 500, gain: 0.09, q: 0.9 }); tone(c, o, { at: 0.22, freq: 170, to: 110, glide: 0.1, decay: 0.22, gain: 0.18 }); } },
  "ring-next": { category: "Gallery", label: "Next entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 2200, to: 4200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 740, to: 988, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
  "ring-prev": { category: "Gallery", label: "Previous entry", play: (c, o) => { hiss(c, o, { attack: 0.01, decay: 0.08, freq: 4200, to: 2200, gain: 0.18, q: 0.9 }); tone(c, o, { freq: 988, to: 740, glide: 0.07, decay: 0.09, gain: 0.13, type: "triangle" }); } },
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
