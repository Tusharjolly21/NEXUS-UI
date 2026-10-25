# Range Calendar

Add the "Range Calendar" component from Nexus UI to my project.

A trip date picker whose selection is one liquid ribbon. Drag and it stretches to your finger, snapping day by day and wrapping across rows; the nights count rolls like an odometer and months turn like the faces of a cube. SVG ribbon with spring physics and full keyboard control.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { RangeCalendar } from "@/components/range-calendar";`. The props are typed and documented in the code.

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
