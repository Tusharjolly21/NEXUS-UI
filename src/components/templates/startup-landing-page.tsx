"use client";
/**
 * Aureon: landing page template for an AI portfolio co-pilot for
 * self-directed investors. Built in the Motion Kit style from Bubble Cluster
 * (as Holdings Cluster), Swipe Stack (as Draft Stack), Hold to Confirm (as
 * Hold to Send),
 * Folder Peek, Matrix Loaders, Scrub Inputs, Radio Cards and the Price
 * Odometer's rolling number. The hero opens with an X-ray: the portfolio
 * starts as one opaque block, a scan line sweeps across and reveals what's
 * inside (including the hidden concentration), then the risk dial takes over.
 * Instrument Serif and Albert Sans.
 */
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from "framer-motion";
import FolderPeek from "@/components/templates/kit/components/FolderPeek";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import { ScrubField } from "@/components/templates/kit/components/ScrubInput";
import RadioCards from "@/components/templates/kit/components/RadioCards";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import HoldingsCluster from "@/components/templates/aureon/HoldingsCluster";
import DraftStack from "@/components/templates/aureon/DraftStack";
import HoldToSend from "@/components/templates/aureon/HoldToSend";
import StickyStory from "@/components/templates/aureon/StickyStory";
import { fontFaces } from "@/components/templates/kit/fonts";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, Words, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = "'Albert Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const A = "#1e4d3a"; // forest: 9.5:1 on white
const WARN = "#c4501a";
const INK = "#101418";
const FONT_CSS =
  fontFaces("aureon", [
    { family: "Albert Sans Variable", file: "albert-sans" },
    { family: "Instrument Serif", file: "instrument-serif", weight: "400", variable: false },
  ]) + `.ar h1,.ar h2{font-family:${"'Instrument Serif', Georgia, serif"};font-weight:400;letter-spacing:-0.02em}`;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="30" height="22" viewBox="0 0 40 28" aria-hidden="true">
        {[8, 20, 32].map((cx, i) => (
          <motion.circle key={cx} cx={cx} cy="14" r="7.5" fill="none" stroke={i === 1 ? A : "#1d1d1f"} strokeWidth="2.6" animate={{ y: [0, i === 1 ? -3 : 1, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }} />
        ))}
      </svg>
      Aureon
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: drag the risk dial and the whole portfolio re-splits          */
/* ------------------------------------------------------------------ */

const TOTAL = 412_880;
type Key = "us" | "intl" | "emp" | "bond" | "cash";
const TODAY: Record<Key, number> = { us: 0.44, intl: 0.09, emp: 0.31, bond: 0.06, cash: 0.1 };

/** Target mix for a risk level from 1 (steady) to 10 (growth). */
function plan(r: number): Record<Key, number> {
  const stocks = 0.38 + 0.058 * (r - 1);
  const emp = 0.1;
  const cash = 0.03;
  const rest = stocks - emp;
  return { us: rest * 0.64, intl: rest * 0.36, emp, bond: 1 - stocks - cash, cash };
}

const SEGS: { k: Key; label: string; c: string; ink: string }[] = [
  { k: "us", label: "US stocks", c: A, ink: "#fff" },
  { k: "intl", label: "International", c: "#8fb39a", ink: "#101418" },
  { k: "emp", label: "Employer stock", c: WARN, ink: "#fff" },
  { k: "bond", label: "Bonds", c: "#e2d8c3", ink: "#101418" },
  { k: "cash", label: "Cash", c: "#ececea", ink: "#101418" },
];

const KNOB = 40;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const fmtPct = (v: number) => `${Math.round(v)}%`;

function Segment({ s, pos, mode }: { s: (typeof SEGS)[number]; pos: MotionValue<number>; mode: MotionValue<number> }) {
  const raw = useTransform([pos, mode], ([p, m]: number[]) => {
    const target = plan(1 + p * 9)[s.k];
    return (TODAY[s.k] + (target - TODAY[s.k]) * m) * 100;
  });
  const w = useSpring(raw, { stiffness: 170, damping: 24 });
  const pct = useTransform(w, fmtPct);
  const show = useTransform(w, [7, 11], [0, 1]);
  return (
    <motion.div className="relative flex min-w-0 flex-col justify-end overflow-hidden px-3 pb-3" style={{ flexGrow: w, flexBasis: 0, background: s.c, color: s.ink }}>
      <motion.span className="hidden truncate text-[12px] font-medium opacity-90 sm:block" style={{ opacity: show }}>{s.label}</motion.span>
      <motion.span className="text-[clamp(15px,2vw,22px)] font-semibold tabular-nums tracking-[-0.03em]" style={{ opacity: show }}>{pct}</motion.span>
    </motion.div>
  );
}

function LegendPct({ s, pos, mode }: { s: (typeof SEGS)[number]; pos: MotionValue<number>; mode: MotionValue<number> }) {
  const raw = useTransform([pos, mode], ([p, m]: number[]) => (TODAY[s.k] + (plan(1 + p * 9)[s.k] - TODAY[s.k]) * m) * 100);
  const pct = useTransform(raw, fmtPct);
  return <motion.span className="tabular-nums text-[#1d1d1f]">{pct}</motion.span>;
}

function RiskBand() {
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const tw = useMotionValue(0);
  const mode = useMotionValue(0);
  const pos = useTransform([x, tw], ([v, w]: number[]) => (w > KNOB ? clamp01(v / (w - KNOB)) : 5 / 9));
  const [level, setLevel] = useState(6);
  const [planOn, setPlanOn] = useState(false);
  const [touched, setTouched] = useState(false);
  const scan = useMotionValue(0); // the X-ray sweep across the band, 0 to 1
  const [scanned, setScanned] = useState(false);
  const cover = useTransform(scan, (v) => `inset(0 0 0 ${v * 100}%)`);
  const lineX = useTransform(scan, (v) => `${v * 100}%`);
  const lineO = useTransform(scan, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const levelRef = useRef(level);
  useEffect(() => { levelRef.current = level; }, [level]);
  useMotionValueEvent(pos, "change", (p) => setLevel(Math.round(1 + p * 9)));

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      tw.set(w);
      x.set(((levelRef.current - 1) / 9) * (w - KNOB));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tw, x]);

  const showPlan = (on: boolean) => {
    setPlanOn(on);
    animate(mode, on ? 1 : 0, { type: "spring", stiffness: 120, damping: 20 });
  };

  // First the X-ray: the band starts as one block and a scan reveals what's inside. Then, once, a plan drafts itself.
  useEffect(() => {
    const c = animate(scan, 1, { duration: 1.8, delay: 0.7, ease: [0.45, 0, 0.2, 1], onComplete: () => setScanned(true) });
    const t = setTimeout(() => { if (mode.get() === 0) { setPlanOn(true); animate(mode, 1, { type: "spring", stiffness: 120, damping: 20 }); } }, 5200);
    return () => { c.stop(); clearTimeout(t); };
  }, [mode, scan]);

  const goLevel = (l: number) => {
    const n = Math.max(1, Math.min(10, l));
    const w = tw.get();
    animate(x, ((n - 1) / 9) * (w - KNOB), { type: "spring", stiffness: 420, damping: 32 });
    if (!planOn) showPlan(true);
  };
  const snap = () => goLevel(Math.round(1 + pos.get() * 9));
  const onKey = (e: RKeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); setTouched(true); goLevel(level - 1); }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); setTouched(true); goLevel(level + 1); }
    if (e.key === "Home") { e.preventDefault(); goLevel(1); }
    if (e.key === "End") { e.preventDefault(); goLevel(10); }
  };

  const target = planOn ? plan(level) : TODAY;
  const stocks = target.us + target.intl;
  const badYear = Math.round(((stocks * 0.34 + target.emp * 0.6 + target.bond * 0.04) * TOTAL) / 100) * 100;
  const moves = useMemo(() => {
    if (!planOn) return [];
    const p = plan(level);
    return SEGS.map((s) => ({ ...s, d: Math.round(((p[s.k] - TODAY[s.k]) * TOTAL) / 100) * 100 }))
      .filter((m) => Math.abs(m.d) >= 1000)
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d))
      .slice(0, 3);
  }, [planOn, level]);

  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-black/[.06] px-5 py-3.5 sm:px-6">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">Sample household</span>
        <span className="text-[13px] tabular-nums text-[#6e6e73]">4 accounts, ${TOTAL.toLocaleString("en-US")}</span>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] font-medium" style={{ color: A }}>
          <motion.span className="h-2 w-2 rounded-full" style={{ background: A }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
          Read-only, synced 2 min ago
        </span>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="group" aria-label="Show" className="relative grid grid-cols-2 rounded-xl bg-[#ececef] p-[3px]">
            {["Today", "Aureon plan"].map((l, i) => {
              const on = planOn === (i === 1);
              return (
                <button key={l} type="button" aria-pressed={on} onClick={() => { setTouched(true); showPlan(i === 1); }} className="relative z-10 h-9 rounded-[9px] px-4 text-[13px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#1e4d3a]">
                  {on && <motion.span layoutId="aureon-mode" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
                  {l}
                </button>
              );
            })}
          </div>
          <span className="text-[13px] text-[#6e6e73]">{planOn ? `Risk level ${level} of 10` : "What you hold right now"}</span>
        </div>

        <div>
          <div className="relative">
            <div className="flex h-[96px] w-full gap-[3px] overflow-hidden rounded-[18px] sm:h-[148px]" role="img" aria-label={`Allocation: ${SEGS.map((s) => `${s.label} ${Math.round(target[s.k] * 100)}%`).join(", ")}`}>
              {SEGS.map((s) => <Segment key={s.k} s={s} pos={pos} mode={mode} />)}
            </div>
            {/* how it looks from your brokerage app: one number. The scan peels it back. */}
            <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-end justify-between overflow-hidden rounded-[18px] px-4 pb-3 text-white" style={{ background: INK, clipPath: cover }}>
              <span className="flex flex-col">
                <span className="text-[12px] text-white/60">4 accounts, as your apps show them</span>
                <span className="text-[clamp(20px,3vw,34px)] font-semibold tabular-nums tracking-[-0.03em]">${TOTAL.toLocaleString("en-US")}</span>
              </span>
              <span className="text-[12px] text-white/60">Scanning inside every fund</span>
            </motion.div>
            <motion.span aria-hidden="true" className="pointer-events-none absolute -bottom-2 -top-2 w-[3px] rounded-full" style={{ left: lineX, opacity: lineO, background: "#7fe0c0", boxShadow: "0 0 18px 4px rgba(127,224,192,.65)" }} />
            <AnimatePresence>
              {scanned && !planOn ? (
                <motion.span key="hidden" className="absolute -top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white shadow-[0_8px_18px_-8px_rgba(0,0,0,.5)]" style={{ left: "57%", background: WARN }} initial={{ opacity: 0, y: 8, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 24 }}>
                  31% in one company
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px] sm:grid-cols-5">
            {SEGS.map((s) => (
              <span key={s.k} className="flex items-center gap-2 text-[#6e6e73]">
                <span className="h-2.5 w-2.5 flex-none rounded-[3px]" style={{ background: s.c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.08)" }} />
                <span className="min-w-0">{s.label}</span>
                <LegendPct s={s} pos={pos} mode={mode} />
              </span>
            ))}
          </div>
        </div>

        {/* the dial */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[12px] font-medium text-[#6e6e73]">
            <span>Steadier</span>
            <span className="hidden text-[#424245] sm:inline">Drag the dial to set how much swing you can live with</span>
            <span>More growth</span>
          </div>
          <div
            ref={track}
            className="relative h-[44px] w-full cursor-pointer touch-none rounded-full bg-[#f2f2ee]"
            onPointerDown={(e) => {
              if (e.target !== e.currentTarget) return;
              const r = e.currentTarget.getBoundingClientRect();
              setTouched(true);
              goLevel(Math.round(1 + clamp01((e.clientX - r.left - KNOB / 2) / (r.width - KNOB)) * 9));
            }}
          >
            <div className="pointer-events-none absolute inset-x-[20px] top-1/2 flex -translate-y-1/2 justify-between" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => <span key={i} className="h-2 w-[2px] rounded-full" style={{ background: i + 1 <= level && planOn ? A : "#c7c7c2" }} />)}
            </div>
            <motion.div
              role="slider"
              tabIndex={0}
              aria-label="Risk level"
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={level}
              aria-valuetext={`Level ${level} of 10`}
              onKeyDown={onKey}
              drag="x"
              dragConstraints={track}
              dragElastic={0.06}
              dragMomentum={false}
              onDragStart={() => { setTouched(true); if (!planOn) showPlan(true); }}
              onDragEnd={snap}
              whileDrag={{ scale: 1.12 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="absolute left-0 top-[2px] flex h-[40px] w-[40px] cursor-grab items-center justify-center rounded-full bg-white text-[14px] font-semibold tabular-nums text-[#1d1d1f] shadow-[0_6px_16px_-6px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#1e4d3a] active:cursor-grabbing"
              style={{ x }}
            >
              {!touched && (
                <motion.span aria-hidden="true" className="absolute inset-0 rounded-full" style={{ boxShadow: `0 0 0 2px ${A}` }} animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
              )}
              {level}
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1.6fr]">
          <div className="flex flex-col gap-1 rounded-[18px] bg-[#f7f7f4] p-4">
            <span className="text-[12px] font-medium text-[#6e6e73]">Largest single company</span>
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.03em] leading-none" style={{ color: planOn ? A : WARN }}><RollingNumber value={Math.round(target.emp * 100)} />%</span>
          </div>
          <div className="flex flex-col gap-1 rounded-[18px] bg-[#f7f7f4] p-4">
            <span className="text-[12px] font-medium text-[#6e6e73]">A bad year could cost</span>
            <span className="text-[26px] font-semibold tabular-nums tracking-[-0.03em] text-[#1d1d1f] leading-none">−$<RollingNumber value={badYear} /></span>
          </div>
          <div className="flex min-h-[112px] flex-col gap-1.5 rounded-[18px] bg-[#f7f7f4] p-4">
            <span className="text-[12px] font-medium text-[#6e6e73]">{planOn ? "Drafted moves, waiting for you" : "No moves drafted yet"}</span>
            <ul className="m-0 flex list-none flex-col gap-1 p-0">
              <AnimatePresence initial={false} mode="popLayout">
                {moves.map((m) => (
                  <motion.li key={m.k} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ type: "spring", stiffness: 380, damping: 30 }} className="flex items-center justify-between gap-3 text-[14px]">
                    <span className="flex items-center gap-2 text-[#1d1d1f]">
                      <span className="h-2 w-2 rounded-full" style={{ background: m.c, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.1)" }} />
                      {m.d < 0 ? "Sell" : "Buy"} {m.label.toLowerCase()}
                    </span>
                    <span className="font-semibold tabular-nums leading-none" style={{ color: m.d < 0 ? "#9a3412" : A }}>{m.d < 0 ? "−" : "+"}$<RollingNumber value={Math.abs(m.d)} /></span>
                  </motion.li>
                ))}
              </AnimatePresence>
              {!planOn && <li className="text-[14px] text-[#6e6e73]">Switch to the plan, or drag the dial.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-14 sm:pt-20">
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-end gap-8 px-5 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
        <div className="flex flex-col items-start gap-6">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }} className="text-[14px] font-medium text-[#4b5560]">
            For people who manage their own money. Read-only links, and you approve every trade.
          </motion.span>
          <h1 className="m-0 text-[clamp(52px,8.4vw,112px)] leading-[0.92] text-[#101418] [text-wrap:balance]">
            <Words text="Know exactly what you own." />
          </h1>
        </div>
        <motion.div className="flex flex-col items-start gap-6 lg:pb-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 24, delay: 0.3 }}>
          <p className="m-0 text-[clamp(17px,1.9vw,19px)] leading-[1.55] text-[#3f4851]">
            Aureon links your brokerage, 401(k) and stock-plan accounts, looks inside every fund, and shows the risk hiding in plain sight. Then it drafts the trades to fix it, and waits for your yes.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic className="text-white focus-visible:ring-[#1e4d3a]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Get your free X-ray</Magnetic>
            <Magnetic className="bg-white text-[#101418] shadow-[inset_0_0_0_1px_rgba(16,20,24,.16)] focus-visible:ring-[#1e4d3a]" onClick={() => scrollToId("how")}>How it works</Magnetic>
          </div>
        </motion.div>
      </div>
      <motion.div className="relative mx-auto mt-12 max-w-[1180px] px-5" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.25 }}>
        <RiskBand />
        <p className="m-0 mt-3 text-center text-[12px] text-[#5b646d]">Sample data. Drafts are suggestions for a made-up household, not advice for yours.</p>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Xray() {
  const facts = [
    { k: "Look-through", v: "We open every fund and ETF and count what's inside, so overlap stops hiding." },
    { k: "Stock plans", v: "RSUs, options and ESPP shares count, vested or not, with their tax lots." },
    { k: "Fees", v: "Every expense ratio and account fee, added up in dollars per year." },
  ];
  return (
    <section id="xray" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead title="Your accounts, finally in one picture." sub="Most people hold the same few companies three times over and never see it. Aureon packs everything you own into one view, sized by how much of your money it is." accent={A} />
          <Stagger className="flex flex-col gap-4">
            {facts.map((f) => (
              <div key={f.k} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: "rgba(30,77,58,.12)", color: A }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                <span className="text-[16px] leading-[1.5] text-[#424245]"><b className="font-semibold text-[#1d1d1f]">{f.k}.</b> {f.v}</span>
              </div>
            ))}
          </Stagger>
        </div>
        <Reveal y={20} amount={0.15}>
          <div className={`${card} flex flex-col items-center gap-2 px-4 py-8 sm:px-8`}>
            <div className="flex w-full items-center justify-between px-2 pb-2">
              <span className="text-[13px] font-semibold text-[#1d1d1f]">Exposure by holding</span>
              <span className="text-[12px] text-[#6e6e73]">Tap an account</span>
            </div>
            <Fit><HoldingsCluster accent={A} autoplay /></Fit>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SyncBoard() {
  const rows = [
    { p: 0, t: "Linking brokerage", s: "Read-only, 3 accounts" },
    { p: 2, t: "Reading 401(k)", s: "212 lots, 6 funds" },
    { p: 3, t: "Pricing stock grants", s: "4 RSU vests, 1 ESPP" },
    { p: 1, t: "Looking inside funds", s: "9 funds, 3,412 holdings" },
  ];
  return (
    <div className={`${card} flex w-[420px] flex-col gap-1 p-4`}>
      <span className="px-3 pb-2 pt-1 text-[12px] font-semibold text-[#6e6e73]">Connecting, about 2 minutes</span>
      {rows.map((r, i) => (
        <motion.div key={r.t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 300, damping: 26, delay: i * 0.08 }} className="flex items-center gap-4 rounded-2xl px-3 py-3 hover:bg-[#f5f5f7]">
          <MatrixLoader pattern={r.p} size={32} color={A} />
          <span className="flex flex-col">
            <span className="text-[15px] font-medium text-[#1d1d1f]">{r.t}</span>
            <span className="text-[13px] tabular-nums text-[#6e6e73]">{r.s}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function SendBoard() {
  return (
    <div className={`${card} flex w-[420px] flex-col gap-5 p-7`}>
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold text-[#6e6e73]">Ready to send</span>
        <span className="text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">3 orders to your brokerage</span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[14px]">
        {[["Sell employer stock", "−$86,700"], ["Buy international fund", "+$47,600"], ["Buy Treasury fund", "+$18,400"]].map(([l, v]) => (
          <li key={l} className="flex justify-between border-b border-black/[.06] pb-2 text-[#1d1d1f]"><span>{l}</span><span className="font-semibold tabular-nums">{v}</span></li>
        ))}
      </ul>
      <div className="flex justify-center pt-1"><HoldToSend label="Hold to send orders" holdingLabel="Keep holding…" doneLabel="Sent. Fills in 1–2 min" color={A} autoplay /></div>
      <span className="text-center text-[12px] text-[#6e6e73]">You can still cancel at your brokerage until they fill.</span>
    </div>
  );
}

function How() {
  return (
    <section id="how" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead title="From login to a plan in one sitting." sub="No spreadsheets, no account numbers typed by hand. Aureon never holds your money and can't withdraw it." accent={A} />
      <div className="mt-6">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Step 1", title: "Link accounts, read-only.", body: "Sign in to your brokerage, 401(k) and stock plan through their own login pages. Aureon gets read access only, and every lot and grant comes across.", visual: <SyncBoard /> },
            { kicker: "Step 2", title: "Swipe through what Aureon drafts.", body: "Each draft says what to trade, why, and what it costs in tax. Keep the ones you agree with, skip the rest. Nothing moves yet.", visual: <div className={`${card} flex justify-center px-6 py-8`}><DraftStack accent={A} autoplay /></div> },
            { kicker: "Step 3", title: "Hold to send. Then it's done.", body: "Approved drafts go to your brokerage as ordinary orders in your name. A long press stops a stray tap from trading.", visual: <SendBoard /> },
            { kicker: "At tax time", title: "Your tax pack, already sorted.", body: "Every harvested loss, every lot sold and the cost basis behind it, filed in one folder for you or your accountant.", visual: <div className={`${card} flex h-[380px] w-[420px] items-center justify-center`}><FolderPeek title="Tax pack 2026" meta="Lot report · harvest log · 8 files" color={A} autoplay /></div> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Planner: scrub the assumptions, the projection redraws              */
/* ------------------------------------------------------------------ */

const AGE = 38;
const END = 80;
const CW = 560, CH = 220;

function project(monthly: number, retire: number, ret: number) {
  const r = ret / 100;
  let b = TOTAL;
  let atRetire = TOTAL;
  const pts: number[] = [b];
  for (let age = AGE + 1; age <= END; age++) {
    if (age <= retire) b = b * (1 + r) + monthly * 12;
    else b = Math.max(0, b * (1 + r) - atRetire * 0.04);
    if (age === retire) atRetire = b;
    pts.push(b);
  }
  return { pts, atRetire };
}

function Planner() {
  const [monthly, setMonthly] = useState(1500);
  const [retire, setRetire] = useState(62);
  const [ret, setRet] = useState(5);
  const { pts, atRetire } = useMemo(() => project(monthly, retire, ret), [monthly, retire, ret]);
  const max = Math.max(...pts);
  const top = Math.ceil(max / 1_000_000) * 1_000_000 || 1_000_000;
  const X = (i: number) => 8 + (i / (END - AGE)) * (CW - 16);
  const Y = (v: number) => CH - 12 - (v / top) * (CH - 28);
  const line = pts.map((v, i) => `${i ? "L" : "M"} ${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${X(END - AGE).toFixed(1)} ${CH} L ${X(0).toFixed(1)} ${CH} Z`;
  const rx = X(retire - AGE);
  const spring = { type: "spring", stiffness: 120, damping: 20 } as const;
  const income = Math.round((atRetire * 0.04) / 12 / 10) * 10;
  return (
    <section id="planner" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="Ask “what if” with your real numbers." sub="Drag a label sideways to change it. The projection starts from what you actually hold, in today's dollars, after inflation." accent={A} center />
        <Reveal y={20} amount={0.15} className="mt-12">
          <div className={`${card} grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[280px_1fr]`}>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-semibold text-[#1d1d1f]">Assumptions</span>
              <ScrubField label="Monthly" value={monthly} onChange={setMonthly} min={0} max={6000} step={50} unit="$/mo" accent={A} />
              <ScrubField label="Retire" value={retire} onChange={setRetire} min={50} max={72} unit="age" accent={A} />
              <ScrubField label="Return" value={ret} onChange={setRet} min={1} max={8} step={0.5} unit="% real" accent={A} />
              <span className="pt-1 text-[12px] leading-[1.45] text-[#6e6e73]">Drag a label sideways; hold Shift for big steps. Or type a number.</span>
              <div className="mt-2 flex flex-col gap-1 rounded-[18px] bg-[#f7f7f4] p-4">
                <span className="text-[12px] font-medium text-[#6e6e73]">At {retire} you&apos;d have about</span>
                <span className="text-[30px] font-semibold tabular-nums tracking-[-0.035em] text-[#1d1d1f] leading-none">$<RollingNumber value={Math.round(atRetire / 10000) * 10000} /></span>
                <span className="text-[13px] text-[#424245]">Roughly <b className="font-semibold tabular-nums">${income.toLocaleString("en-US")}/month</b> at a 4% draw.</span>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2">
              <div className="flex items-center justify-between text-[12px] text-[#6e6e73]">
                <span>Projected balance</span>
                <span className="tabular-nums">Top of chart: ${(top / 1_000_000).toFixed(0)}M</span>
              </div>
              <svg viewBox={`0 0 ${CW} ${CH}`} className="h-auto w-full" role="img" aria-label={`Projected balance from age ${AGE} to ${END}, peaking near $${Math.round(max / 1000).toLocaleString("en-US")}k`}>
                <defs>
                  <linearGradient id="aureon-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={A} stopOpacity=".28" /><stop offset="1" stopColor={A} stopOpacity="0" /></linearGradient>
                </defs>
                {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1="8" x2={CW - 8} y1={Y(top * g)} y2={Y(top * g)} stroke="rgba(0,0,0,.06)" />)}
                <motion.path initial={false} animate={{ d: area }} transition={spring} fill="url(#aureon-area)" />
                <motion.path initial={false} animate={{ d: line }} transition={spring} fill="none" stroke={A} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
                <motion.line initial={false} animate={{ x1: rx, x2: rx }} transition={spring} y1="10" y2={CH} stroke="#1d1d1f" strokeDasharray="3 4" strokeOpacity=".4" />
                <motion.circle initial={false} animate={{ cx: rx, cy: Y(atRetire) }} transition={spring} r="6" fill="#fff" stroke={A} strokeWidth="3" />
              </svg>
              <div className="flex justify-between text-[12px] tabular-nums text-[#6e6e73]">
                {[38, 45, 52, 59, 66, 73, 80].map((a) => <span key={a}>{a}</span>)}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const PRINCIPLES = [
  { t: "Read-only links", b: "Aureon can see balances and lots. It has no way to withdraw or transfer money.", d: "M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z" },
  { t: "Nothing trades without you", b: "Every order needs a long press from you. Turn drafts off entirely if you just want the X-ray.", d: "M12 3v10M7 8l5 5 5-5M5 21h14" },
  { t: "One flat price", b: "No commissions, no percentage of your assets, no paid fund placement.", d: "M3 12V4h8l10 10-8 8zM7.5 7.5h.01" },
  { t: "Your data isn't for sale", b: "We don't sell or rent it. Delete your account and it's gone within 30 days.", d: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" },
];

function Principles() {
  return (
    <section id="principles" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead title="Built so it can't do the scary part." accent={A} />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRINCIPLES.map((p) => (
          <motion.div key={p.t} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className={`${card} flex h-full flex-col gap-4 p-6`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px]" style={{ background: "rgba(30,77,58,.1)", color: A }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={p.d} /></svg>
            </span>
            <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.t}</h3>
            <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]">{p.b}</p>
          </motion.div>
        ))}
      </Stagger>
    </section>
  );
}

function Pricing() {
  const rows = [
    { l: "A typical 1% adviser fee", v: 4129, c: "#c7c7c2" },
    { l: "Aureon Household", v: 288, c: "#8fae4f" },
    { l: "Aureon Plus", v: 144, c: A },
  ];
  return (
    <section id="pricing" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="A flat price. Not a slice of your savings." sub="Start with a free X-ray. Upgrade when you want Aureon to draft trades and run your tax tools." accent={A} center />
        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Reveal y={20} amount={0.15}>
            <div className={`${card} flex h-full flex-col gap-6 p-6 sm:p-7`}>
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Choose a plan</h3>
                <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Billed monthly. Cancel from settings in two taps.</p>
              </div>
              <div className="flex justify-center">
                <RadioCards
                  accent={A}
                  defaultValue="plus"
                  options={[
                    { id: "free", title: "Free", description: "The X-ray, for one person", meta: "$0", features: ["Link up to 6 accounts", "Look-through exposure and fees", "A monthly check-in email"] },
                    { id: "plus", title: "Plus", description: "Drafts, tax tools and the planner", meta: "$12/mo", features: ["Drafted trades you approve", "Tax-loss harvesting alerts", "What-if planner"] },
                    { id: "household", title: "Household", description: "For couples and families", meta: "$24/mo", features: ["Up to 5 people", "Shared and private accounts", "Year-end tax pack"] },
                  ]}
                />
              </div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.08} amount={0.15}>
            <div className={`${card} flex h-full flex-col gap-6 p-6 sm:p-7`}>
              <div>
                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">The fee math, per year</h3>
                <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">For the sample household&apos;s ${TOTAL.toLocaleString("en-US")}.</p>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-5">
                {rows.map((r, i) => (
                  <div key={r.l} className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between gap-4 text-[15px]">
                      <span className="text-[#424245]">{r.l}</span>
                      <Counter to={r.v} format={(n) => `$${Math.round(n).toLocaleString("en-US")}`} className="font-semibold text-[#1d1d1f]" />
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-[#f2f2ee]">
                      <motion.div className="h-full origin-left rounded-full" style={{ background: r.c, width: `${Math.max(3, (r.v / 4129) * 100)}%` }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.5 }} transition={{ type: "spring", stiffness: 90, damping: 18, delay: i * 0.12 }} />
                    </div>
                  </div>
                ))}
              </div>
              <p className="m-0 text-[12px] leading-[1.5] text-[#6e6e73]">Advisers do more than rebalance, and some people want that. Fund expense ratios are separate and apply either way.</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function StartupLandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="ar min-h-screen overflow-x-clip bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <style>{FONT_CSS}</style>
        <Nav brand={<Logo />} accent={A} cta="Get started" onCta={() => scrollToId("pricing")} links={[{ label: "X-ray", id: "xray" }, { label: "How it works", id: "how" }, { label: "Planner", id: "planner" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Xray />
        <How />
        <Planner />
        <Principles />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead title="Fair questions." accent={A} />
          <Reveal y={16} amount={0.1}>
            <Faq
              accent={A}
              items={[
                { q: "Is Aureon a broker? Where is my money?", a: "No. Your money stays at your brokerage and your 401(k) provider, in your name. Aureon reads those accounts and, if you approve, sends orders to them through their trading connection." },
                { q: "Can Aureon move money out of my accounts?", a: "No. The links are read-only for balances and transfers. Placing an order needs your long press each time, and orders can only buy or sell inside the same account." },
                { q: "Which accounts can I connect?", a: "Most US brokerages, workplace 401(k) and 403(b) plans, IRAs, HSAs and the big stock-plan administrators. If one isn't supported you can upload a statement and Aureon reads that instead." },
                { q: "Is this financial advice?", a: "Drafts are personalised suggestions from a registered investment adviser, based on the goals you set. They are not guarantees. Markets go down as well as up, and you decide what to do." },
                { q: "How does Aureon make money?", a: "Subscriptions, and nothing else. No commissions, no payment for order flow, no fees from fund companies." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Get your X-ray in about nine minutes." sub="Free for one person. Read-only links. Delete your account any time and your data goes with it." cta="Get your free X-ray" secondary="See a sample" accent={A} glow="rgba(143,174,79,.32)" />
        </div>
        <Footer brand={<Logo />} note="Aureon is a template. The company, people and numbers on this page are invented, and nothing here is investment advice." columns={[{ title: "Product", links: ["X-ray", "Drafts", "Planner", "Pricing"] }, { title: "Trust", links: ["Security", "How we're paid", "Disclosures", "Status"] }, { title: "Company", links: ["About", "Careers", "Press", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default StartupLandingPage;
