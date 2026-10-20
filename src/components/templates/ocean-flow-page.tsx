"use client";
/**
 * Ocean Flow: landing page template for a diving equipment store.
 * Built from Motion Kit components: Radio Cards, Ruler Picker (local copy),
 * Elastic Stepper, Capsule Toggles, Price Odometer's rolling number,
 * Todo List, Flight Tracker and Receipt Unfold.
 * The hero is a depth gauge: drag it down the reef and the water, the colours,
 * the readouts and the recommended kit all change with depth.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import RadioCards from "@/components/templates/ocean-flow/RadioCards";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import TodoList from "@/components/templates/kit/components/TodoList";
import FlightTracker from "@/components/templates/kit/components/FlightTracker";
import ReceiptUnfold from "@/components/templates/ocean-flow/ReceiptUnfold";
import RulerPicker from "@/components/templates/ocean-flow/RulerPicker";
import { Story } from "@/components/templates/ocean-flow/Story";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#0284c7"; // graphics
const AD = "#0369a1"; // blue text and buttons (5.9:1 on white)
const INK = "#1d1d1f";
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

/* ------------------------------------------------------------------ cart */

interface CartLine { key: string; name: string; variant: string; price: number; qty: number; tint: string }
type AddInput = Omit<CartLine, "qty"> & { qty?: number };
const CartCtx = createContext<{ add: (items: AddInput[]) => void; open: () => void }>({ add: () => {}, open: () => {} });
const useCart = () => useContext(CartCtx);

/* ------------------------------------------------------------------ logo */

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="15" fill={A} />
        <motion.path
          d="M3 17c3-3 6-3 9 0s6 3 9 0 6-3 9 0"
          fill="none"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          animate={{ x: [0, -3, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
        <path d="M6 23c3-2 6-2 9 0s6 2 9 0" fill="none" stroke="#bae6fd" strokeWidth="2" strokeLinecap="round" />
        <circle cx="21" cy="9" r="2" fill="#e0f2fe" />
      </svg>
      Ocean Flow
    </span>
  );
}

/* ------------------------------------------------------------------ product art */

function MaskArt({ skirt = "#1d1d1f", strap = "#0284c7", w = 220 }: { skirt?: string; strap?: string; w?: number }) {
  return (
    <svg width={w} viewBox="0 0 220 130" aria-hidden="true">
      <defs>
        <linearGradient id={`glass-${skirt.slice(1)}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e0f2fe" />
          <stop offset=".55" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <rect x="4" y="56" width="212" height="17" rx="8.5" fill={strap} />
      <path d="M40 34 Q110 16 180 34 Q202 40 198 70 Q192 104 150 106 Q127 108 117 91 Q110 80 103 91 Q93 108 70 106 Q28 104 22 70 Q18 40 40 34Z" fill={skirt} />
      <path d="M46 48 Q76 38 101 47 L101 82 Q87 96 66 94 Q44 92 41 74Z" fill={`url(#glass-${skirt.slice(1)})`} />
      <path d="M119 47 Q144 38 174 48 L179 74 Q176 92 154 94 Q133 96 119 82Z" fill={`url(#glass-${skirt.slice(1)})`} />
      <path d="M54 52 Q66 47 78 48" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <path d="M128 52 Q140 47 152 48" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

function FinsArt({ color = "#0ea5e9", w = 200 }: { color?: string; w?: number }) {
  const fin = (dx: number, rot: number) => (
    <g transform={`translate(${dx} 0) rotate(${rot} 60 100)`}>
      <path d="M38 16 Q60 6 82 16 L90 64 Q118 150 104 196 Q60 210 16 196 Q2 150 30 64Z" fill={color} />
      <path d="M38 16 Q60 6 82 16 L88 58 Q60 66 32 58Z" fill="#1d1d1f" />
      <path d="M60 70 L60 190" stroke="rgba(255,255,255,.45)" strokeWidth="3" />
      <path d="M40 76 Q30 140 26 188M80 76 Q90 140 94 188" stroke="rgba(0,0,0,.18)" strokeWidth="3" fill="none" />
    </g>
  );
  return (
    <svg width={w} viewBox="0 0 220 220" aria-hidden="true">
      {fin(8, -8)}
      {fin(92, 8)}
    </svg>
  );
}

function ComputerArt({ strap = "#1d1d1f", w = 170, depth = 18, ndl = "56" }: { strap?: string; w?: number; depth?: number; ndl?: string }) {
  return (
    <svg width={w} viewBox="0 0 170 220" aria-hidden="true">
      <rect x="55" y="0" width="60" height="220" rx="16" fill={strap} />
      <circle cx="85" cy="110" r="66" fill="#2c2c2e" />
      <circle cx="85" cy="110" r="58" fill="#0b1720" stroke="#3a3a3c" strokeWidth="3" />
      {Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2;
        // Rounded so the server and client print the same attribute strings.
        const p = (r: number, c: number, f: (x: number) => number) => (c + f(a) * r).toFixed(2);
        return <line key={i} x1={p(62, 85, Math.cos)} y1={p(62, 110, Math.sin)} x2={p(65, 85, Math.cos)} y2={p(65, 110, Math.sin)} stroke="#8e8e93" strokeWidth="2" />;
      })}
      <text x="85" y="104" textAnchor="middle" fontSize="30" fontWeight="700" fill="#e0f2fe" style={{ fontFamily: SYSTEM_FONT }}>{depth.toFixed(0)}<tspan fontSize="14" fill="#7dd3fc"> m</tspan></text>
      <text x="85" y="128" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7dd3fc" letterSpacing="1" style={{ fontFamily: SYSTEM_FONT }}>NO-STOP {ndl}</text>
      <rect x="60" y="140" width="50" height="5" rx="2.5" fill="#1e3a4c" />
      <rect x="60" y="140" width="32" height="5" rx="2.5" fill="#22c55e" />
    </svg>
  );
}

function TorchArt({ w = 220 }: { w?: number }) {
  return (
    <svg width={w} viewBox="0 0 240 110" aria-hidden="true">
      <defs>
        <linearGradient id="beam" x1="0" x2="1">
          <stop offset="0" stopColor="#fef9c3" stopOpacity=".95" />
          <stop offset="1" stopColor="#fef9c3" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M150 38 L240 6 L240 104 L150 72Z" fill="url(#beam)" />
      <rect x="18" y="40" width="96" height="30" rx="10" fill="#1d1d1f" />
      <rect x="30" y="44" width="10" height="22" rx="3" fill="#3a3a3c" />
      <rect x="48" y="44" width="10" height="22" rx="3" fill="#3a3a3c" />
      <path d="M110 34 L150 28 L150 82 L110 76Z" fill="#2c2c2e" />
      <rect x="146" y="28" width="8" height="54" rx="3" fill="#fde68a" />
      <circle cx="84" cy="55" r="6" fill={A} />
    </svg>
  );
}

function SnorkelArt({ w = 90 }: { w?: number }) {
  return (
    <svg width={w} viewBox="0 0 90 200" aria-hidden="true">
      <path d="M58 10 L58 150 Q58 186 30 186 L22 186" fill="none" stroke="#facc15" strokeWidth="16" strokeLinecap="round" />
      <rect x="44" y="4" width="28" height="22" rx="8" fill="#1d1d1f" />
      <rect x="10" y="176" width="22" height="20" rx="6" fill="#1d1d1f" />
    </svg>
  );
}

function BootsArt({ w = 120 }: { w?: number }) {
  return (
    <svg width={w} viewBox="0 0 140 120" aria-hidden="true">
      {[0, 64].map((dx) => (
        <g key={dx} transform={`translate(${dx} 0)`}>
          <path d="M14 8 H50 V78 Q50 84 58 86 L70 90 Q76 92 76 100 V108 H10 Q6 108 6 100 V20 Q6 8 14 8Z" fill="#1d1d1f" />
          <path d="M8 98 H76 V108 H10 Q6 108 6 104Z" fill="#334155" />
          <path d="M28 12 V70" stroke={A} strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ hero: the depth gauge */

const DMAX = 40;
const NDL: [number, number][] = [[10, 219], [12, 147], [14, 98], [16, 72], [18, 56], [20, 45], [22, 37], [25, 29], [30, 20], [35, 14], [40, 9]];
function ndlAt(d: number) {
  if (d < 10) return null;
  for (let i = 0; i < NDL.length - 1; i++) {
    const [a, am] = NDL[i], [b, bm] = NDL[i + 1];
    if (d <= b) return Math.round(am + ((bm - am) * (d - a)) / (b - a));
  }
  return 9;
}
const tempAt = (d: number) => 27 - d * 0.22;

const SUITS = [
  { id: "s3", title: "3 mm Current suit", description: "Water 24 °C and warmer", meta: "$219", price: 219, features: ["Back zip, glued and blind-stitched seams", "Tropical reefs and summer lakes", "Packs into a carry-on"] },
  { id: "s5", title: "5 mm Current suit", description: "Water 20 to 24 °C", meta: "$269", price: 269, features: ["Chest zip with a sealed flap", "Knee pads for shore entries", "The one most people own"] },
  { id: "s7", title: "7 mm Current suit", description: "Water below 20 °C", meta: "$329", price: 329, features: ["Attached hood option", "Double-lined cuffs and ankles", "Quarry, kelp forest and wreck season"] },
];
const suitFor = (t: number) => (t >= 24 ? SUITS[0] : t >= 20 ? SUITS[1] : SUITS[2]);

function rangeFor(d: number) {
  if (d <= 18) return "Open Water range";
  if (d <= 30) return "Advanced range";
  return "Deep specialty range";
}

/** Rising bubbles with fixed positions so the server and client agree. */
function Bubbles() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: 16 }, (_, i) => {
        const left = (i * 37 + 11) % 100;
        const size = 4 + (i % 4) * 3;
        return (
          <motion.span
            key={i}
            className="absolute bottom-[-20px] rounded-full border border-white/70 bg-white/20"
            style={{ left: `${left}%`, width: size, height: size }}
            animate={{ y: [0, -680], x: [0, i % 2 ? 10 : -10, 0], opacity: [0, 0.9, 0] }}
            transition={{ duration: 7 + (i % 5), repeat: Infinity, delay: i * 0.55, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

function Fish({ ds, color, fade, y, scale = 1, dur, delay = 0, flip = false }: { ds: MotionValue<number>; color: string; fade: [number, number]; y: string; scale?: number; dur: number; delay?: number; flip?: boolean }) {
  const fill = useTransform(ds, fade, [color, "#5b6f82"]);
  return (
    <motion.svg
      width={46 * scale}
      viewBox="0 0 46 24"
      className="absolute"
      style={{ top: y, left: flip ? "70%" : "18%", scaleX: flip ? -1 : 1 }}
      animate={{ x: flip ? [0, -120, 0] : [0, 140, 0], y: [0, -8, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden="true"
    >
      <motion.path d="M2 12 Q16 0 32 12 Q16 24 2 12Z M31 12 L44 3 L41 12 L44 21Z" style={{ fill }} />
      <circle cx="10" cy="10" r="1.6" fill="#0b1720" />
    </motion.svg>
  );
}

function Reef({ ds }: { ds: MotionValue<number> }) {
  const grey = "#53667a";
  const red = useTransform(ds, [2, 8], ["#ef4444", grey]);
  const red2 = useTransform(ds, [2, 8], ["#f87171", "#60738a"]);
  const orange = useTransform(ds, [7, 18], ["#f97316", grey]);
  const yellow = useTransform(ds, [14, 30], ["#facc15", "#6b7f73"]);
  const green = useTransform(ds, [20, 40], ["#22c55e", "#2f6b5a"]);
  const purple = useTransform(ds, [25, 40], ["#a855f7", "#4c4f8f"]);
  const sand = useTransform(ds, [0, 20, 40], ["#e7d6ae", "#9fa79f", "#3b4a57"]);
  const rock = useTransform(ds, [0, 40], ["#475569", "#1e2b38"]);
  const y = useTransform(ds, [0, DMAX], [90, -10]);
  const scale = useTransform(ds, [0, DMAX], [0.92, 1.12]);
  return (
    <motion.svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[52%] w-full origin-bottom" style={{ y, scale }} aria-hidden="true">
      <motion.path d="M0 262 Q300 228 600 250 T1200 244 V320 H0Z" style={{ fill: sand }} />
      <motion.path d="M110 272 Q150 186 262 196 Q336 202 356 272Z" style={{ fill: rock }} />
      <motion.path d="M742 264 Q790 168 900 178 Q992 188 1014 264Z" style={{ fill: rock }} />
      {/* red branching coral */}
      <motion.path d="M232 236 L232 170 M232 202 L204 164 M232 188 L262 150 M204 164 L192 138 M262 150 L274 124 M232 170 L240 136" style={{ stroke: red }} strokeWidth="11" strokeLinecap="round" fill="none" />
      <motion.ellipse cx="420" cy="252" rx="46" ry="26" style={{ fill: red2 }} />
      <motion.path d="M388 248 Q420 232 452 248 M392 258 Q420 244 448 258" stroke="rgba(0,0,0,.18)" strokeWidth="3" fill="none" />
      {/* orange sea fan */}
      <motion.path d="M540 256 C482 196 488 128 540 116 C592 128 598 196 540 256Z" style={{ fill: orange }} />
      <path d="M540 250 L540 128 M540 200 L510 158 M540 186 L570 150 M540 226 L516 196 M540 220 L566 190" stroke="rgba(0,0,0,.16)" strokeWidth="3" fill="none" />
      {/* yellow tube coral */}
      {[0, 22, 44, 66].map((dx, i) => (
        <motion.rect key={dx} x={846 + dx} y={170 + (i % 2) * 22} width="17" height={90 - (i % 2) * 22} rx="8.5" style={{ fill: yellow }} />
      ))}
      {/* sea grass */}
      {[640, 660, 680, 1080, 1100, 1120].map((x, i) => (
        <motion.path key={x} d={`M${x} 262 Q${x - 18} ${206 - i * 4} ${x + 6} ${150 - (i % 3) * 14}`} style={{ stroke: green }} strokeWidth="7" strokeLinecap="round" fill="none" />
      ))}
      {/* purple anemone */}
      {[-24, -8, 8, 24].map((dx) => (
        <motion.circle key={dx} cx={1000 + dx} cy={224 - Math.abs(dx) * 0.4} r="12" style={{ fill: purple }} />
      ))}
      <motion.path d="M60 290 Q90 250 130 286" style={{ stroke: red }} strokeWidth="8" strokeLinecap="round" fill="none" />
    </motion.svg>
  );
}

function Gauge({ depth, onTouch }: { depth: MotionValue<number>; onTouch: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState(false);
  const [now, setNow] = useState(0);
  useMotionValueEvent(depth, "change", (v) => setNow(Math.round(v)));
  const top = useTransform(depth, (v) => `${(v / DMAX) * 100}%`);
  const fill = useTransform(depth, (v) => v / DMAX);
  const at = (clientY: number) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(DMAX, ((clientY - r.top) / r.height) * DMAX));
  };
  const nudge = (to: number) => {
    onTouch();
    animate(depth, Math.max(0, Math.min(DMAX, to)), { type: "spring", stiffness: 220, damping: 26 });
  };
  return (
    <div className="absolute bottom-5 right-4 top-5 flex w-[70px] flex-col items-center rounded-full bg-white/85 py-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.45)] backdrop-blur-md sm:right-5">
      <span className="text-[11px] font-semibold text-[#424245]">Depth</span>
      <div
        ref={track}
        className="relative mt-3 w-full flex-1 cursor-ns-resize touch-none select-none"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          setDrag(true);
          nudge(at(e.clientY));
        }}
        onPointerMove={(e) => {
          if (!drag) return;
          depth.stop();
          depth.set(at(e.clientY));
        }}
        onPointerUp={() => setDrag(false)}
        onPointerCancel={() => setDrag(false)}
      >
        <span className="absolute bottom-0 left-1/2 top-0 w-[4px] -translate-x-1/2 rounded-full bg-[#e5e7eb]" />
        <motion.span className="absolute left-1/2 top-0 h-full w-[4px] -translate-x-1/2 origin-top rounded-full" style={{ scaleY: fill, background: A }} />
        {[0, 10, 20, 30, 40].map((t) => (
          <span key={t} className="absolute right-[6px] -translate-y-1/2 text-[10px] font-medium tabular-nums text-[#6e6e73]" style={{ top: `${(t / DMAX) * 100}%` }}>{t}</span>
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className="absolute left-[8px] h-px w-[8px] bg-[#c7c7cc]" style={{ top: `${(i / 8) * 100}%` }} />
        ))}
        <motion.span
          role="slider"
          tabIndex={0}
          aria-label="Dive depth in metres"
          aria-valuemin={0}
          aria-valuemax={DMAX}
          aria-valuenow={now}
          aria-valuetext={`${now} metres`}
          onKeyDown={(e) => {
            const v = depth.get();
            if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); nudge(Math.round(v) + 1); }
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); nudge(Math.round(v) - 1); }
            if (e.key === "PageDown") { e.preventDefault(); nudge(Math.round(v) + 5); }
            if (e.key === "PageUp") { e.preventDefault(); nudge(Math.round(v) - 5); }
            if (e.key === "Home") { e.preventDefault(); nudge(0); }
            if (e.key === "End") { e.preventDefault(); nudge(DMAX); }
          }}
          animate={{ scale: drag ? 1.12 : 1 }}
          transition={{ type: "spring", stiffness: 500, damping: drag ? 22 : 14 }}
          className="absolute left-1/2 -ml-[25px] -mt-[17px] flex h-[34px] w-[50px] items-center justify-center rounded-full text-[13px] font-semibold tabular-nums text-white shadow-[0_8px_18px_-6px_rgba(3,105,161,.7)] outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1f] focus-visible:ring-offset-2"
          style={{ top, background: AD }}
        >
          {now}m
        </motion.span>
      </div>
    </div>
  );
}

function Readout({ d, ds }: { d: number; ds: MotionValue<number> }) {
  const r = useTransform(ds, [3, 8], [1, 0.12]);
  const o = useTransform(ds, [8, 18], [1, 0.12]);
  const yl = useTransform(ds, [15, 30], [1, 0.12]);
  const ndl = ndlAt(d);
  const rows = [
    { l: "Pressure", v: `${(1 + d / 10).toFixed(1)} bar` },
    { l: "Water", v: `${tempAt(d).toFixed(0)} °C` },
    { l: "No-stop time", v: ndl === null ? "Over 3 h" : `${ndl} min` },
  ];
  return (
    <div className="flex w-[230px] flex-col gap-3 rounded-[22px] bg-white/90 p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.45)] backdrop-blur-md sm:w-[250px] sm:p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-semibold text-[#6e6e73]">Punta Vela reef</span>
        <span className="text-[11px] font-medium text-[#6e6e73]">{rangeFor(d)}</span>
      </div>
      <div className="flex items-baseline gap-1 text-[44px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={d} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 36 }}>{d}</motion.span>
        </AnimatePresence>
        <span className="text-[17px] font-medium tracking-normal text-[#6e6e73]">m</span>
      </div>
      <div className="flex flex-col divide-y divide-black/[.06]">
        {rows.map((row) => (
          <div key={row.l} className="flex items-center justify-between py-1.5 text-[13px]">
            <span className="text-[#6e6e73]">{row.l}</span>
            <span className="font-semibold tabular-nums text-[#1d1d1f]">{row.v}</span>
          </div>
        ))}
        <div className="flex items-center justify-between py-1.5 text-[13px]">
          <span className="text-[#6e6e73]">Colour left</span>
          <span className="flex items-center gap-1.5" role="img" aria-label={`Reds ${d < 6 ? "visible" : "gone"}, oranges ${d < 14 ? "visible" : "gone"}, yellows ${d < 24 ? "visible" : "gone"}`}>
            <motion.span className="h-3 w-3 rounded-full bg-[#ef4444]" style={{ opacity: r }} />
            <motion.span className="h-3 w-3 rounded-full bg-[#f97316]" style={{ opacity: o }} />
            <motion.span className="h-3 w-3 rounded-full bg-[#facc15]" style={{ opacity: yl }} />
            <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
            <span className="h-3 w-3 rounded-full bg-[#3b82f6]" />
          </span>
        </div>
      </div>
      <span className="text-[11px] leading-[1.35] text-[#6e6e73]">Planning figures for air, first dive of the day. Not a dive table.</span>
    </div>
  );
}

function Packed({ d }: { d: number }) {
  const { add } = useCart();
  const suit = suitFor(tempAt(d));
  const items = [
    { why: "Low volume, clears in one breath", item: { key: "tern-black", name: "Tern mask", variant: "Black", price: 89, tint: "#1d1d1f" } },
    { why: `For ${tempAt(d).toFixed(0)} °C water`, item: { key: `${suit.id}-m`, name: suit.title, variant: "Size M", price: suit.price, tint: A } },
    ...(d >= 10 ? [{ why: "Tracks your no-stop time", item: { key: "fathom-graphite", name: "Fathom computer", variant: "Graphite", price: 429, tint: "#3a3a3c" } }] : []),
    ...(d >= 15 ? [{ why: "Brings the reds back", item: { key: "lumen", name: "Lumen 1200 torch", variant: "One size", price: 119, tint: "#facc15" } }] : []),
  ];
  const total = items.reduce((s, i) => s + i.item.price, 0);
  return (
    <div className="flex w-full flex-col gap-3 rounded-[22px] bg-white/90 p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.45)] backdrop-blur-md sm:w-[320px] sm:p-5">
      <span className="text-[13px] font-semibold text-[#1d1d1f]">Packed for {d} m</span>
      <motion.ul layout className="m-0 flex list-none flex-col gap-1.5 p-0">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map(({ why, item: it }) => (
            <motion.li key={it.key.split("-")[0]} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="flex items-center gap-2.5 text-[13px]">
              <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: it.tint }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-[#1d1d1f]">{it.name}</span>
                <span className="truncate text-[11px] text-[#6e6e73]">{why}</span>
              </span>
              <span className="tabular-nums text-[#424245]">{money(it.price)}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={() => add(items.map((i) => i.item))}
        className="mt-1 flex h-11 items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: AD }}
      >
        Add this kit · <span className="tabular-nums">{money(total)}</span>
      </motion.button>
    </div>
  );
}

/** The hero's depth, shared as a motion value so the page never re-renders while you drag. */
const DepthCtx = createContext<MotionValue<number> | null>(null);

function Hero({ shared }: { shared: MotionValue<number> }) {
  const depth = useMotionValue(4);
  const ds = useSpring(depth, { stiffness: 110, damping: 22, mass: 0.8 });
  const [d, setD] = useState(4);
  const touched = useRef(false);
  useMotionValueEvent(depth, "change", (v) => {
    const r = Math.round(v);
    setD(r);
    shared.set(r);
  });
  useEffect(() => {
    const t = setTimeout(() => {
      if (!touched.current) animate(depth, 18, { type: "spring", stiffness: 26, damping: 14 });
    }, 900);
    return () => clearTimeout(t);
  }, [depth]);
  const top = useTransform(ds, [0, 10, 25, 40], ["#bdeafe", "#38bdf8", "#0369a1", "#062437"]);
  const bottom = useTransform(ds, [0, 10, 25, 40], ["#38bdf8", "#0284c7", "#074b70", "#03131f"]);
  const bg = useMotionTemplate`linear-gradient(180deg, ${top}, ${bottom})`;
  const rays = useTransform(ds, [0, 22], [0.55, 0]);
  const surfaceY = useTransform(ds, [0, 8], [0, -170]);
  const dark = useTransform(ds, [20, 40], [0, 0.35]);
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-10 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden="true" style={{ background: "radial-gradient(55% 60% at 50% 0%, rgba(56,189,248,.20), transparent 70%)" }} />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-5 px-5 text-center">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">
          <span className="h-2 w-2 rounded-full" style={{ background: A }} />
          Fitted and pressure-tested before it ships
        </motion.span>
        <h1 className="m-0 max-w-[900px] text-[clamp(42px,6.4vw,84px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
          <Words text="Gear for the depth you actually dive." className="justify-center" accentWords={["depth"]} accent={AD} />
        </h1>
        <Reveal delay={0.3} y={14}>
          <p className="m-0 max-w-[620px] text-[clamp(17px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
            Drag the gauge down the reef. Watch the reds go, the water cool and the no-stop time shrink, and we&apos;ll pack the kit that suits that dive.
          </p>
        </Reveal>
        <Reveal delay={0.4} y={12} className="flex flex-wrap justify-center gap-3">
          <Magnetic className="text-white" style={{ background: AD }} onClick={() => scrollToId("gear")}>Shop the gear</Magnetic>
          <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("fit")}>Find my size</Magnetic>
        </Reveal>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.25 }}
        className="relative mx-auto mt-8 max-w-[1240px] px-3 sm:px-5"
      >
        <div className="relative h-[700px] overflow-hidden rounded-[32px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_40px_80px_-40px_rgba(3,105,161,.55)] sm:h-[620px]" onPointerDown={() => (touched.current = true)}>
          <motion.div className="absolute inset-0" style={{ background: bg }} aria-hidden="true" />
          <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: rays }} aria-hidden="true">
            {[12, 30, 52, 70, 86].map((l, i) => (
              <motion.span
                key={l}
                className="absolute -top-10 h-[120%] w-[70px] origin-top bg-gradient-to-b from-white/70 to-transparent blur-[6px]"
                style={{ left: `${l}%`, rotate: 14 - i * 3 }}
                animate={{ opacity: [0.5, 1, 0.5], x: [0, 14, 0] }}
                transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
          <motion.div className="pointer-events-none absolute inset-x-0 top-0" style={{ y: surfaceY }} aria-hidden="true">
            <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="block h-[44px] w-full">
              <path d="M0 30 Q50 14 100 30 T200 30 T300 30 T400 30 T500 30 T600 30 T700 30 T800 30 T900 30 T1000 30 T1100 30 T1200 30 V0 H0Z" fill="rgba(255,255,255,.85)" />
            </svg>
          </motion.div>
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <Fish ds={ds} color="#ef4444" fade={[2, 8]} y="30%" dur={14} />
            <Fish ds={ds} color="#facc15" fade={[14, 30]} y="44%" scale={0.8} dur={11} delay={1.5} flip />
            <Fish ds={ds} color="#38bdf8" fade={[38, 40]} y="22%" scale={0.7} dur={16} delay={3} flip />
          </div>
          <Reef ds={ds} />
          <motion.div className="pointer-events-none absolute inset-0 bg-[#020c14]" style={{ opacity: dark }} aria-hidden="true" />
          <Bubbles />
          <div className="absolute left-3 top-3 sm:left-5 sm:top-5">
            <Readout d={d} ds={ds} />
          </div>
          <div className="absolute bottom-3 left-3 right-[92px] sm:bottom-5 sm:left-auto sm:right-[100px]">
            <Packed d={d} />
          </div>
          <Gauge depth={depth} onTouch={() => (touched.current = true)} />
        </div>
        <p className="m-0 mt-4 text-center text-[13px] text-[#6e6e73]">Drag the depth gauge, or focus it and use the arrow keys. Red light is gone by about 6 m, orange by 15 m.</p>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ promise strip */

function Promises() {
  const items = [
    { to: 150, f: (n: number) => `$${Math.round(n)}`, l: "free shipping from" },
    { to: 60, f: (n: number) => `${Math.round(n)} days`, l: "to return it, even wet" },
    { to: 3, f: (n: number) => `${Math.round(n)} pm`, l: "order by, ships today" },
    { to: 4.8, f: (n: number) => n.toFixed(1), l: "from 3,214 diver reviews" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 pb-8 pt-4">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-1 border-t border-black/[.08] pt-5">
            <Counter to={it.to} format={it.f} className="text-[clamp(32px,4.2vw,46px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ featured gear */

function AddButton({ onAdd, label = "Add to bag" }: { onAdd: () => void; label?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <motion.button
      type="button"
      onClick={() => { onAdd(); setDone(true); }}
      whileTap={{ scale: 0.94 }}
      initial={false}
      animate={{ backgroundColor: done ? "#15803d" : AD }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="relative flex h-11 min-w-[132px] items-center justify-center overflow-hidden rounded-full px-5 text-[14px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={done ? "d" : "i"} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="flex items-center gap-2">
          {done ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} /></svg>
              Added
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2" /></svg>
              {label}
            </>
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

function Swatches({ options, value, onChange, group }: { options: { id: string; name: string; hex: string }[]; value: string; onChange: (id: string) => void; group: string }) {
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Colour">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={o.id} type="button" role="radio" aria-checked={on} aria-label={o.name} onClick={() => onChange(o.id)} className="relative flex h-8 w-8 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-1" style={{ ["--tw-ring-color" as string]: AD }}>
            {on && <motion.span layoutId={`sw-${group}`} className="absolute inset-0 rounded-full" style={{ boxShadow: `inset 0 0 0 2px ${AD}` }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
            <span className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: o.hex }} />
          </button>
        );
      })}
    </div>
  );
}

const MASK_COLOURS = [
  { id: "black", name: "Black", hex: "#1d1d1f", strap: "#0284c7" },
  { id: "clear", name: "Clear", hex: "#dbe4ea", strap: "#94a3b8" },
  { id: "reef", name: "Reef blue", hex: "#0369a1", strap: "#1d1d1f" },
];
const FIN_COLOURS = [
  { id: "sky", name: "Sky", hex: "#0ea5e9" },
  { id: "coral", name: "Coral", hex: "#fb7185" },
  { id: "graphite", name: "Graphite", hex: "#475569" },
];
const STRAPS = [
  { id: "graphite", name: "Graphite", hex: "#1d1d1f" },
  { id: "sea", name: "Sea glass", hex: "#5eead4" },
];

function Gear() {
  const { add } = useCart();
  const heroDepth = useContext(DepthCtx);
  const [depth, setDepth] = useState(18);
  useEffect(() => {
    if (!heroDepth) return;
    return heroDepth.on("change", (v) => setDepth(v));
  }, [heroDepth]);
  const [mask, setMask] = useState("black");
  const [fin, setFin] = useState("sky");
  const [strap, setStrap] = useState("graphite");
  const [qty, setQty] = useState(1);
  const m = MASK_COLOURS.find((c) => c.id === mask)!;
  const f = FIN_COLOURS.find((c) => c.id === fin)!;
  const s = STRAPS.find((c) => c.id === strap)!;
  const ndl = ndlAt(depth);
  return (
    <section id="gear" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Featured gear" title="Five things every diver ends up buying." sub="We stock fewer models and test every one in the pool before it ships. Pick a colour, add it, keep scrolling." accent={AD} />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Reveal y={20} className="lg:col-span-2">
          <div className={`${card} grid h-full grid-cols-1 items-center gap-8 overflow-hidden p-7 sm:grid-cols-[1fr_1.1fr] sm:p-9`}>
            <div className="relative flex items-center justify-center rounded-[24px] py-8" style={{ background: "radial-gradient(70% 70% at 50% 40%, #e0f2fe, #f5f5f7 75%)" }}>
              <motion.div key={strap} initial={{ rotate: -6, scale: 0.94 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                <ComputerArt strap={s.hex} depth={depth} ndl={ndl === null ? "3H+" : `${ndl}`} />
              </motion.div>
              <span className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#424245] shadow-[0_0_0_1px_rgba(0,0,0,.06)]">Screen shows your hero depth</span>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-semibold" style={{ color: AD }}>Best seller</span>
                <h3 className="m-0 text-[28px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">Fathom dive computer</h3>
                <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]">Air and nitrox up to 40%, a screen you can read at 30 m in green water, and a battery that lasts a week on a liveaboard.</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-[28px] font-semibold tracking-[-0.03em] tabular-nums text-[#1d1d1f]">{money(429 * qty)}</span>
                <Swatches options={STRAPS} value={strap} onChange={setStrap} group="strap" />
              </div>
              <div className="flex flex-wrap items-end justify-between gap-5">
                <ElasticStepper label="Quantity" min={1} max={4} defaultValue={1} onChange={setQty} accent={AD} />
                <AddButton onAdd={() => add([{ key: `fathom-${strap}`, name: "Fathom computer", variant: s.name, price: 429, tint: s.hex, qty }])} />
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <ProductCard
            name="Tern low-volume mask"
            spec="Tempered glass, anti-fog treated at the factory. Fits most faces with a soft, wide skirt."
            price={89}
            art={<motion.div key={mask} initial={{ y: 8, opacity: 0.6 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}><MaskArt skirt={m.hex} strap={m.strap} w={200} /></motion.div>}
            swatches={<Swatches options={MASK_COLOURS} value={mask} onChange={setMask} group="mask" />}
            onAdd={() => add([{ key: `tern-${mask}`, name: "Tern mask", variant: m.name, price: 89, tint: m.hex }])}
          />
        </Reveal>
        <Reveal y={20}>
          <ProductCard
            name="Glide open-heel fins"
            spec="Soft, long blade that's kind to your calves on a long reef drift. Sized by foot length below."
            price={149}
            art={<motion.div key={fin} initial={{ rotate: -4 }} animate={{ rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12 }}><FinsArt color={f.hex} w={150} /></motion.div>}
            swatches={<Swatches options={FIN_COLOURS} value={fin} onChange={setFin} group="fin" />}
            onAdd={() => add([{ key: `glide-${fin}`, name: "Glide fins", variant: `${f.name} · M`, price: 149, tint: f.hex }])}
          />
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <ProductCard
            name="Lumen 1200 torch"
            spec="1,200 lumens with a wide, even beam. Brings back the reds that the water takes away past 6 m."
            price={119}
            art={<TorchArt w={220} />}
            onAdd={() => add([{ key: "lumen", name: "Lumen 1200 torch", variant: "One size", price: 119, tint: "#facc15" }])}
          />
        </Reveal>
        <Reveal y={20} delay={0.16}>
          <ProductCard
            name="Drift snorkel"
            spec="Dry top that closes when a wave breaks over it, and a purge valve you'll use more than you think."
            price={29}
            art={<div className="rotate-[24deg]"><SnorkelArt w={70} /></div>}
            onAdd={() => add([{ key: "drift", name: "Drift snorkel", variant: "Yellow", price: 29, tint: "#facc15" }])}
          />
        </Reveal>
      </div>
    </section>
  );
}

function ProductCard({ name, spec, price, art, swatches, onAdd }: { name: string; spec: string; price: number; art: ReactNode; swatches?: ReactNode; onAdd: () => void }) {
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className={`${card} flex h-full flex-col gap-4 p-6`}>
      <div className="flex h-[190px] items-center justify-center rounded-[20px] bg-[#f5f5f7]">{art}</div>
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{name}</h3>
        <p className="m-0 text-[14px] leading-[1.5] text-[#6e6e73]">{spec}</p>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f]">{money(price)}</span>
        {swatches}
      </div>
      <AddButton onAdd={onAdd} />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ sizing */

const FIN_SIZES = [
  { s: "XS", eu: "34–36", min: 220, max: 234 },
  { s: "S", eu: "37–39", min: 235, max: 249 },
  { s: "M", eu: "40–42", min: 250, max: 269 },
  { s: "L", eu: "43–45", min: 270, max: 289 },
  { s: "XL", eu: "46–48", min: 290, max: 320 },
];

function Sizing() {
  const { add } = useCart();
  const [foot, setFoot] = useState(262);
  const [suit, setSuit] = useState("s5");
  const [size, setSize] = useState("M");
  const fin = FIN_SIZES.find((x) => foot >= x.min && foot <= x.max) ?? FIN_SIZES[2];
  const chosen = SUITS.find((x) => x.id === suit)!;
  return (
    <section id="fit" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Sizing" title="Measured once, fitted for good." sub="Most returns are fins that pinch and suits that flush. Two quick choices here prevent both." accent={AD} center />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal y={20}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Fins, by foot length.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Stand on a sheet of paper, mark heel and big toe, measure. Then drag the ruler to match.</p>
              <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-7">
                <RulerPicker min={220} max={320} defaultValue={262} unit="mm" presets={[240, 255, 270, 285]} accent={A} onChange={setFoot} label="Foot length in millimetres" labelEvery={10} />
                <div className="flex w-full items-center justify-between rounded-[20px] bg-[#f5f5f7] px-5 py-4">
                  <span className="flex flex-col">
                    <span className="text-[12px] font-semibold text-[#6e6e73]">Your Glide fin size</span>
                    <span className="text-[13px] text-[#6e6e73]">EU {fin.eu}, with 5 mm boots</span>
                  </span>
                  <span className="relative flex h-12 w-16 items-center justify-center overflow-hidden text-[32px] font-semibold tracking-[-0.04em] text-[#1d1d1f]" aria-live="polite">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={fin.s} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{fin.s}</motion.span>
                    </AnimatePresence>
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.08}>
            <div className={`${card} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Wetsuits, by the water.</h3>
              <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Pick the thickness from where you dive, not the time of year. Then a size.</p>
              <div className="mt-6 flex flex-1 flex-col items-center gap-5">
                <RadioCards
                  options={SUITS}
                  defaultValue="s5"
                  onChange={setSuit}
                  accent={AD}
                  ctaPrefix={`Add size ${size}`}
                  onConfirm={(id) => {
                    const sx = SUITS.find((x) => x.id === id)!;
                    add([{ key: `${id}-${size}`, name: sx.title, variant: `Size ${size}`, price: sx.price, tint: A }]);
                  }}
                  footer={
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-[#424245]">Size, from the chart on the tag</span>
                  <div className="relative flex rounded-full bg-[#f0f0f3] p-1" role="radiogroup" aria-label="Wetsuit size">
                    {["XS", "S", "M", "L", "XL"].map((z) => (
                      <button key={z} type="button" role="radio" aria-checked={size === z} onClick={() => setSize(z)} className="relative h-9 w-10 rounded-full text-[13px] font-semibold outline-none focus-visible:ring-2" style={{ color: size === z ? INK : "#6e6e73" }}>
                        {size === z && <motion.span layoutId="suit-size" className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.12)]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
                        <span className="relative">{z}</span>
                      </button>
                    ))}
                  </div>
                </div>
                  }
                />
                <span className="text-[13px] text-[#6e6e73]">Chosen: {chosen.title}, size {size}. Swap free if it flushes.</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ kit builder */

const KIT = [
  { id: "mask", name: "Tern mask", price: 89, hue: "#0284c7", art: <MaskArt w={150} />, pos: { left: "6%", top: "8%" } },
  { id: "snorkel", name: "Drift snorkel", price: 29, hue: "#ca8a04", art: <div className="rotate-[64deg]"><SnorkelArt w={52} /></div>, pos: { left: "60%", top: "2%" } },
  { id: "fins", name: "Glide fins", price: 149, hue: "#0ea5e9", art: <FinsArt w={150} />, pos: { left: "4%", top: "44%" } },
  { id: "boots", name: "5 mm boots", price: 59, hue: "#475569", art: <BootsArt w={100} />, pos: { left: "44%", top: "60%" } },
  { id: "computer", name: "Fathom computer", price: 429, hue: "#3a3a3c", art: <ComputerArt w={92} />, pos: { left: "72%", top: "34%" } },
  { id: "torch", name: "Lumen torch", price: 119, hue: "#facc15", art: <TorchArt w={150} />, pos: { left: "36%", top: "30%" } },
];

function KitBuilder() {
  const { add } = useCart();
  const [on, setOn] = useState<Record<string, boolean>>({ mask: true, snorkel: true, fins: true, boots: true, computer: false, torch: true });
  const picked = KIT.filter((k) => on[k.id]);
  const sum = picked.reduce((s, k) => s + k.price, 0);
  const discount = picked.length >= 4 ? Math.round(sum * 0.1) : 0;
  const total = sum - discount;
  return (
    <section id="kit" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Reveal y={20} className="h-full">
          <div className="relative h-[360px] overflow-hidden rounded-[28px] sm:h-[460px] lg:h-full lg:min-h-[560px]" style={{ background: "radial-gradient(70% 60% at 30% 20%, #fff7e6, rgba(255,247,230,0) 60%), linear-gradient(160deg, #f3e7cf, #e6d3ad)" }} aria-label={`Kit flat lay: ${picked.map((p) => p.name).join(", ") || "empty"}`} role="img">
            {KIT.map((k, i) => (
              <motion.div
                key={k.id}
                className="absolute origin-center drop-shadow-[0_16px_14px_rgba(70,50,20,.25)]"
                style={{ left: k.pos.left, top: k.pos.top }}
                initial={false}
                animate={on[k.id] ? { opacity: 1, scale: 1, rotate: (i % 2 ? 1 : -1) * 6, y: 0 } : { opacity: 0, scale: 0.6, rotate: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 320, damping: 18 }}
              >
                <div className="scale-[.72] sm:scale-100">{k.art}</div>
              </motion.div>
            ))}
            <AnimatePresence>
              {picked.length === 0 && (
                <motion.span key="e" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center text-[15px] font-medium text-[#5c4a2a]">Switch something on to start a kit.</motion.span>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Build a kit" title="Your first kit, priced honestly." sub="Four pieces or more and we take 10% off the lot. No bundles padded with things you won't use." accent={AD} />
          <Reveal y={16}>
            <div className={`${card} flex flex-col p-2`}>
              {KIT.map((k) => (
                <div key={k.id} className="flex items-center gap-4 rounded-[18px] px-4 py-2.5">
                  <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: k.hue }} />
                  <span className="flex-1 text-[15px] font-medium text-[#1d1d1f]">{k.name}</span>
                  <span className="text-[14px] tabular-nums text-[#6e6e73]">{money(k.price)}</span>
                  <CapsuleToggle checked={!!on[k.id]} onChange={(v) => setOn((o) => ({ ...o, [k.id]: v }))} label={`Include ${k.name}`} onColor={A} />
                </div>
              ))}
              <div className="mx-2 mt-2 flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-[#f5f5f7] px-5 py-4">
                <span className="flex flex-col">
                  <span className="flex items-baseline gap-0.5 text-[34px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] tabular-nums">$<RollingNumber value={total} /></span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={discount ? "d" : "n"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-[13px]" style={{ color: discount ? "#15803d" : "#6e6e73" }}>
                      {discount ? `You save ${money(discount)} on ${picked.length} pieces` : `${Math.max(0, 4 - picked.length)} more for 10% off`}
                    </motion.span>
                  </AnimatePresence>
                </span>
                <AddButton label="Add kit" onAdd={() => picked.length && add(picked.map((k) => ({ key: `kit-${k.id}`, name: k.name, variant: discount ? "Kit, 10% off" : "Kit", price: discount ? Math.round(k.price * 0.9) : k.price, tint: k.hue })))} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ delivery */

function ReturnLabel() {
  return (
    <div className={`${card} w-[340px] overflow-hidden`}>
      <div className="flex items-center justify-between px-6 py-4" style={{ background: AD }}>
        <span className="text-[14px] font-semibold text-white">Prepaid return</span>
        <span className="text-[12px] font-medium tabular-nums text-white/90">OF-20419</span>
      </div>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-[#6e6e73]">Reason</span>
          <span className="text-[17px] font-semibold text-[#1d1d1f]">Suit flushes at the neck</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-[#6e6e73]">What happens next</span>
          <span className="text-[14px] leading-[1.45] text-[#424245]">Rinse it, drop it at any parcel locker. The next size ships the day we scan your return.</span>
        </div>
        <div className="flex h-12 items-end gap-[3px]" aria-hidden="true">
          {Array.from({ length: 44 }, (_, i) => (
            <span key={i} className="bg-[#1d1d1f]" style={{ width: i % 3 === 0 ? 3 : 1.5, height: i % 7 === 0 ? "100%" : "82%" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Delivery() {
  return (
    <section id="delivery" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Delivery and returns" title="From our pool to your dive bag." accent={AD} />
        <div className="mt-6">
          <Story
            accent={AD}
            steps={[
              { kicker: "Packed today", title: "Checked by a diver, not a scanner.", body: "Orders placed by 3 pm ship the same day. Before anything leaves, someone who dives every week runs through the checklist and signs the tag.", visual: <div className={`${card} p-7`}><TodoList accent={AD} autoplay initial={["Regulator flow-tested at 200 bar", "Mask lens checked for scratches", "Computer charged and set to your units", "Fins matched to your foot length"]} /></div> },
              { kicker: "Island express", title: "Shipping to an island? We fly it.", body: "Dive centres and liveaboards on islands get kits by air in two to four days, with a tracking page that shows the plane, not just a postcode.", visual: <FlightTracker from="SAN" to="HNL" /> },
              { kicker: "60-day fit returns", title: "Get it wet, then decide.", body: "Try your suit and fins in a pool or on a dive. If the fit is wrong, send it back within 60 days and we cover the label.", visual: <ReturnLabel /> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ reviews */

const REVIEWS = [
  { n: "Marisol Tavares", m: "312 logged dives", p: "Tern mask", t: "First mask that hasn't fogged on the second dive of the day. My buddy is relieved I've stopped spitting in it." },
  { n: "Dev Ramaswamy", m: "Certified this spring", p: "Glide fins", t: "Measured my foot with the ruler on this page, ordered an M, and it fit over 5 mm boots exactly as the chart said." },
  { n: "Hanna Lindqvist", m: "Divemaster", p: "Fathom computer", t: "Readable at 30 m in murky green water, and the battery lasted a full week on a liveaboard with four dives a day." },
  { n: "Tomás Ibarra", m: "Cold-water diver", p: "7 mm Current suit", t: "Sent my first suit back after one pool session. No questions, and the next size down arrived two days later." },
  { n: "Aiko Brennan", m: "Shoots macro", p: "Lumen 1200 torch", t: "The reds came back in my photos at 20 m. That's the whole review, really." },
  { n: "Priya Natarajan", m: "Runs a dive centre", p: "Six starter kits", t: "Flown to our island in four days. Every regulator still had its pressure-test tag on, signed and dated." },
];

function Stars({ n = 5 }: { n?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path fill={i < n ? "#f59e0b" : "#d2d2d7"} d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18.3 5.5 22l1.7-7.4L1.5 9.6 9 8.9z" /></svg>
      ))}
    </span>
  );
}

function Reviews() {
  const dist = [82, 12, 4, 1, 1];
  return (
    <section id="reviews" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[0.8fr_1.6fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Reviews" title="Divers who came back up happy." accent={AD} />
          <Reveal y={16}>
            <div className={`${card} flex flex-col gap-4 p-6`}>
              <div className="flex items-baseline gap-3">
                <Counter to={4.8} format={(n) => n.toFixed(1)} className="text-[52px] font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f]" />
                <span className="flex flex-col gap-1"><Stars /><span className="text-[13px] text-[#6e6e73]">3,214 verified orders</span></span>
              </div>
              <div className="flex flex-col gap-2">
                {dist.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-[12px] tabular-nums text-[#6e6e73]">
                    <span className="w-3">{5 - i}</span>
                    <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-[#f0f0f3]">
                      <motion.span className="absolute inset-y-0 left-0 origin-left rounded-full" style={{ width: `${p}%`, background: A }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 90, damping: 20, delay: i * 0.06 }} />
                    </span>
                    <span className="w-8 text-right">{p}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REVIEWS.map((r) => (
            <figure key={r.n} className={`${card} m-0 flex h-full flex-col gap-4 p-6`}>
              <div className="flex items-center justify-between gap-3">
                <Stars n={r.n === "Tomás Ibarra" ? 4 : 5} />
                <span className="rounded-full bg-[#f0f9ff] px-2.5 py-1 text-[12px] font-medium" style={{ color: AD }}>{r.p}</span>
              </div>
              <blockquote className="m-0 text-[16px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f]">&ldquo;{r.t}&rdquo;</blockquote>
              <figcaption className="mt-auto flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: AD }}>{r.n.split(" ").map((w) => w[0]).join("")}</span>
                <span className="flex flex-col">
                  <span className="text-[14px] font-semibold text-[#1d1d1f]">{r.n}</span>
                  <span className="text-[12px] text-[#6e6e73]">{r.m}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ cart drawer */

function CartDrawer({ open, onClose, lines, setLines }: { open: boolean; onClose: () => void; lines: CartLine[]; setLines: (fn: (l: CartLine[]) => CartLine[]) => void }) {
  const [placed, setPlaced] = useState<CartLine[] | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const FREE = 150;
  const ship = subtotal >= FREE || subtotal === 0 ? 0 : 9;
  const left = Math.max(0, FREE - subtotal);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  const step = (key: string, d: number) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, qty: Math.max(0, Math.min(9, l.qty + d)) } : l)).filter((l) => l.qty > 0));
  const receipt = useMemo(() => {
    if (!placed) return null;
    const sub = placed.reduce((s, l) => s + l.price * l.qty, 0);
    const shipping = sub >= FREE ? 0 : 9;
    // The slip has room for four rows: up to three items (or two plus a "more" row) and shipping.
    const keep = placed.length > 3 ? 2 : 3;
    const top = placed.slice(0, keep).map((l) => ({ label: `${l.name} × ${l.qty}`, amount: money(l.price * l.qty) }));
    const rest = placed.slice(keep).reduce((s, l) => s + l.price * l.qty, 0);
    return { lines: [...top, ...(rest ? [{ label: `${placed.length - keep} more items`, amount: money(rest) }] : []), { label: "Shipping", amount: shipping ? money(shipping) : "Free" }], total: money(sub + shipping) };
  }, [placed]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div key="cart" className="fixed inset-0 z-[60]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.button type="button" aria-label="Close bag" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Your bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="absolute bottom-0 right-0 top-0 flex w-full max-w-[420px] flex-col bg-[#fbfbfd] text-[#1d1d1f] shadow-[-30px_0_60px_-30px_rgba(0,0,0,.35)]"
          >
            <div className="flex items-center justify-between border-b border-black/[.06] px-6 py-5">
              <span className="text-[20px] font-semibold tracking-[-0.02em]">{placed ? "Order placed" : "Your bag"}</span>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Close bag" className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: AD }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {placed && receipt ? (
              <div className="flex flex-1 flex-col items-center gap-6 overflow-y-auto px-6 py-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#15803d]">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.1 }} /></svg>
                </span>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-[17px] font-semibold">Order OF-20419 is in.</span>
                  <span className="text-[14px] text-[#6e6e73]">This is a demo store, so nothing was charged.</span>
                </div>
                <Fit><ReceiptUnfold lines={receipt.lines} total={receipt.total} number="Order OF-20419" from="Ocean Flow" billedTo="Shipped to your saved address" paidWith="Demo order · no card charged" /></Fit>
                <button type="button" onClick={() => { setPlaced(null); onClose(); }} className="mt-auto h-11 rounded-full bg-black/5 px-6 text-[14px] font-semibold outline-none focus-visible:ring-2">Keep shopping</button>
              </div>
            ) : (
              <>
                <div className="px-6 pt-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#424245]">{left > 0 ? `${money(left)} away from free shipping` : "Shipping is free"}</span>
                    <span className="tabular-nums text-[#6e6e73]">{money(Math.min(subtotal, FREE))} / {money(FREE)}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e8e8ed]">
                    <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${Math.min(100, (subtotal / FREE) * 100)}%`, backgroundColor: left > 0 ? A : "#15803d" }} transition={{ type: "spring", stiffness: 160, damping: 22 }} />
                  </div>
                </div>
                <ul className="m-0 flex flex-1 list-none flex-col gap-2 overflow-y-auto p-4">
                  <AnimatePresence initial={false}>
                    {lines.length === 0 && (
                      <motion.li key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-2 py-10 text-center text-[15px] text-[#6e6e73]">Your bag is empty. The depth gauge up top packs a kit in one tap.</motion.li>
                    )}
                    {lines.map((l) => (
                      <motion.li key={l.key} layout initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }} transition={{ type: "spring", stiffness: 360, damping: 32 }} className="flex items-center gap-3 overflow-hidden rounded-[18px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
                        <span className="h-10 w-10 flex-none rounded-[12px]" style={{ background: `linear-gradient(140deg, ${l.tint}, #e0f2fe)` }} aria-hidden="true" />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[14px] font-semibold">{l.name}</span>
                          <span className="truncate text-[12px] text-[#6e6e73]">{l.variant}</span>
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-[#f0f0f3] p-1">
                          <button type="button" aria-label={`One fewer ${l.name}`} onClick={() => step(l.key, -1)} className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] outline-none hover:bg-white focus-visible:ring-2">−</button>
                          <span className="w-4 text-center text-[13px] font-semibold tabular-nums" aria-live="polite">{l.qty}</span>
                          <button type="button" aria-label={`One more ${l.name}`} onClick={() => step(l.key, 1)} className="flex h-7 w-7 items-center justify-center rounded-full text-[16px] outline-none hover:bg-white focus-visible:ring-2">+</button>
                        </span>
                        <span className="w-14 text-right text-[14px] font-semibold tabular-nums">{money(l.price * l.qty)}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="flex flex-col gap-3 border-t border-black/[.06] px-6 py-5">
                  <div className="flex justify-between text-[14px] text-[#6e6e73]"><span>Subtotal</span><span className="tabular-nums">{money(subtotal)}</span></div>
                  <div className="flex justify-between text-[14px] text-[#6e6e73]"><span>Shipping</span><span className="tabular-nums">{ship ? money(ship) : "Free"}</span></div>
                  <div className="flex justify-between text-[18px] font-semibold"><span>Total</span><span className="tabular-nums">{money(subtotal + ship)}</span></div>
                  <motion.button type="button" disabled={!lines.length} whileTap={{ scale: 0.97 }} onClick={() => { setPlaced(lines); setLines(() => []); }} className="mt-1 h-12 rounded-full text-[15px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40" style={{ background: AD }}>
                    Check out
                  </motion.button>
                  <span className="text-center text-[12px] text-[#6e6e73]">Demo checkout. No card needed, nothing is charged.</span>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ page */

export function OceanFlowPage() {
  const [lines, setLinesState] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const depth = useMotionValue(18);
  const toastId = useRef(0);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const setLines = (fn: (l: CartLine[]) => CartLine[]) => setLinesState(fn);
  const add = (items: AddInput[]) => {
    if (!items.length) return;
    setLinesState((ls) => {
      const next = [...ls];
      items.forEach((it) => {
        const i = next.findIndex((l) => l.key === it.key);
        if (i >= 0) next[i] = { ...next[i], qty: Math.min(9, next[i].qty + (it.qty ?? 1)) };
        else next.push({ ...it, qty: it.qty ?? 1 });
      });
      return next;
    });
    toastId.current += 1;
    setToast({ id: toastId.current, text: items.length > 1 ? `${items.length} items added to your bag` : `${items[0].name} added to your bag` });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  const ctx = { add, open: () => setOpen(true) };

  return (
    <MotionConfig reducedMotion="user">
      <CartCtx.Provider value={ctx}>
        <DepthCtx.Provider value={depth}>
          <div className="min-h-screen bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
            <Nav brand={<Logo />} accent={AD} cta={count ? `Bag · ${count}` : "Bag"} onCta={() => setOpen(true)} links={[{ label: "Gear", id: "gear" }, { label: "Sizing", id: "fit" }, { label: "Kits", id: "kit" }, { label: "Delivery", id: "delivery" }, { label: "Reviews", id: "reviews" }]} />
            <Hero shared={depth} />
            <Promises />
            <Gear />
            <Sizing />
            <KitBuilder />
            <Delivery />
            <Reviews />
            <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
              <SectionHead eyebrow="FAQ" title="Before you get wet." accent={AD} />
              <Reveal y={16}>
                <Faq
                  accent={AD}
                  items={[
                    { q: "What if my fins or suit don't fit?", a: "Send them back within 60 days, even after a pool session or a dive. Rinse them, use the prepaid label, and we ship the next size the day your return is scanned." },
                    { q: "Do you service regulators?", a: "Yes. Every regulator we sell gets its first yearly service free, and we service other brands for a flat $85 with a 48-hour turnaround." },
                    { q: "How does island shipping work?", a: "Orders to island addresses and dive centres go by air in two to four days. The tracking page shows the flight your parcel is on." },
                    { q: "Are the depth figures on this page safe to dive with?", a: "No. They're planning figures to explain how depth changes a dive. Always dive within your training and follow your computer or your agency's tables." },
                    { q: "Can I try gear before buying?", a: "Our San Diego store has a pool open on weekends. Book a free 30-minute slot to try masks, fins and suits in the water." },
                  ]}
                />
              </Reveal>
            </section>
            <div className="mx-auto max-w-[1180px] px-5 pb-20">
              <CtaBand title="Your next dive starts at the door." sub="Order by 3 pm and it ships today, checked by someone who dives." cta="Shop the gear" secondary="Book a pool try-on" accent={A} glow="rgba(56,189,248,.32)" />
            </div>
            <Footer brand={<Logo />} note="Dive gear, fitted and pressure-tested before it ships." columns={[{ title: "Shop", links: ["Masks", "Fins", "Suits", "Computers", "Kits"] }, { title: "Help", links: ["Sizing", "Returns", "Servicing", "Shipping"] }, { title: "Visit", links: ["San Diego store", "Pool try-ons", "Dive trips", "Contact"] }]} />

            <AnimatePresence>
              {toast && (
                <motion.div key={toast.id} role="status" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }} className="fixed bottom-5 left-1/2 z-50 flex w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-full bg-[#1d1d1f] py-2 pl-5 pr-2 text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,.5)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{toast.text}</span>
                  <button type="button" onClick={() => { setToast(null); setOpen(true); }} className="h-9 flex-none rounded-full bg-white px-4 text-[13px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#7dd3fc]">View bag</button>
                </motion.div>
              )}
            </AnimatePresence>
            <CartDrawer open={open} onClose={() => setOpen(false)} lines={lines} setLines={setLines} />
          </div>
        </DepthCtx.Provider>
      </CartCtx.Provider>
    </MotionConfig>
  );
}

export default OceanFlowPage;
