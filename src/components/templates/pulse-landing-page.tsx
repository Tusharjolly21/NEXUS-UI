"use client";
/**
 * Pulse: landing page template for an engineering operations platform:
 * issues, roadmaps, incident triage and initiative tracking. Motion Kit
 * style: light page, one red accent.
 * Kit components: Swipe Stack (adapted as a triage deck), Hold to Confirm,
 * Matrix Loader, Todo List, Copy Chip, Stretch Nav and Radio Cards.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import HoldToConfirm from "@/components/templates/kit/components/HoldToConfirm";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import TodoList from "@/components/templates/kit/components/TodoList";
import { CopyChip } from "@/components/templates/kit/components/CopyButton";
import StretchNav from "@/components/templates/kit/components/StretchNav";
import RadioCards from "@/components/templates/kit/components/RadioCards";
import TriageStack from "@/components/templates/pulse-landing/triage-stack";
import { StickyStory } from "@/components/templates/pulse-landing/sticky-story";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const A = "#dc2626"; // red: fills, graphics, buttons (white text 4.8:1)
const AD = "#b91c1c"; // red text on white and grey (6:1)
const INK = "#1d1d1f";
const MONO = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";
const OK = "#1a7f37";
const WARN = "#b25000";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[8px]" style={{ background: A }} aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M2 12h5l2-5 4 10 2-5h7" initial={{ pathLength: 0.2 }} animate={{ pathLength: [0.2, 1, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        </svg>
      </span>
      Pulse
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: scrub the week                                                 */
/* ------------------------------------------------------------------ */

const COLS = ["Triage", "In progress", "In review", "Done"];
const STEPS = 28; // 7 days x 4 slots
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["morning", "midday", "afternoon", "evening"];

type Hist = [number, number][]; // [step, column]
const ISSUES: { key: string; title: string; who: string; hue: number; hist: Hist; incident?: boolean }[] = [
  { key: "PUL-190", title: "Remove legacy auth tokens", who: "JK", hue: 210, hist: [[0, 2], [5, 3]] },
  { key: "PUL-198", title: "Rate-limit the export API", who: "AM", hue: 30, hist: [[0, 0], [3, 1], [11, 2], [16, 3]] },
  { key: "PUL-201", title: "Status page dark mode", who: "RS", hue: 280, hist: [[0, 1], [8, 2], [12, 3]] },
  { key: "PUL-204", title: "Flaky test: billing.sync", who: "DW", hue: 150, hist: [[2, 0], [6, 1], [7, 3]] },
  { key: "PUL-207", title: "Upgrade Postgres to 16", who: "JK", hue: 210, hist: [[0, 1], [19, 2], [25, 3]] },
  { key: "PUL-209", title: "SSO for the admin console", who: "LP", hue: 330, hist: [[4, 0], [14, 1], [22, 2]] },
  { key: "SEV-212", title: "Checkout 502s after deploy", who: "DW", hue: 0, hist: [[9, 0], [10, 1], [13, 3]], incident: true },
  { key: "PUL-215", title: "Webhook retries with backoff", who: "AM", hue: 30, hist: [[13, 0], [17, 1], [23, 2], [27, 3]] },
  { key: "PUL-217", title: "Onboarding checklist copy", who: "RS", hue: 280, hist: [[18, 0], [21, 1], [26, 3]] },
];

const EVENTS: [number, string][] = [
  [0, "Cycle 34 starts with 7 issues"],
  [5, "PUL-190 shipped: legacy tokens gone"],
  [7, "Flaky billing test fixed in a day"],
  [9, "SEV-2 declared: checkout 502s"],
  [10, "Dana is on it. Rolling back deploy 4127"],
  [13, "Incident resolved in 29 minutes"],
  [16, "Export API now rate-limited"],
  [19, "Postgres 16 upgrade in review"],
  [22, "SSO up for review, 2 days early"],
  [26, "Onboarding copy shipped"],
  [27, "Cycle 34 closes: 7 of 9 done"],
];

function colAt(hist: Hist, step: number) {
  let c = -1;
  for (const [s, col] of hist) if (s <= step) c = col;
  return c;
}

// Heartbeat line: a blip wherever something moved, a big spike for the incident.
const ECG = (() => {
  const W = 1000, base = 40;
  const act = Array.from({ length: STEPS }, (_, s) => ISSUES.reduce((n, it) => n + (it.hist.some(([hs]) => hs === s) ? (it.incident ? 4 : 1) : 0), 0));
  let d = `M 0 ${base}`;
  act.forEach((a, s) => {
    const x0 = (s / STEPS) * W, mid = x0 + W / STEPS / 2;
    const h = Math.min(34, a * 8);
    if (!a) { d += ` L ${x0 + W / STEPS} ${base}`; return; }
    d += ` L ${mid - 10} ${base} L ${mid - 5} ${base + h * 0.25} L ${mid} ${base - h} L ${mid + 5} ${base + h * 0.4} L ${mid + 10} ${base} L ${x0 + W / STEPS} ${base}`;
  });
  return d;
})();

function Avatar({ who, hue, size = 22 }: { who: string; hue: number; size?: number }) {
  return (
    <span className="flex flex-none items-center justify-center rounded-full text-[9px] font-semibold text-white" style={{ width: size, height: size, background: `hsl(${hue} 55% 42%)` }} aria-hidden="true">{who}</span>
  );
}

function RollDigit({ n }: { n: number }) {
  return (
    <span className="relative inline-flex h-[18px] min-w-[10px] justify-center overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={n} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{n}</motion.span>
      </AnimatePresence>
    </span>
  );
}

function WeekBoard({ step }: { step: number }) {
  const cols = COLS.map((_, c) => ISSUES.filter((it) => colAt(it.hist, step) === c));
  const event = [...EVENTS].reverse().find(([s]) => s <= step)?.[1] ?? "";
  const live = ISSUES.some((it) => it.incident && colAt(it.hist, step) >= 0 && colAt(it.hist, step) < 3);
  return (
    <div className={`${card} flex w-full flex-col overflow-hidden`}>
      <div className="flex items-center gap-3 border-b border-black/[.06] px-4 py-3 sm:px-5">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">Cycle 34 · Platform</span>
        <span className="relative ml-auto flex h-[22px] min-w-0 flex-1 justify-end overflow-hidden text-[12px] text-[#515154]" aria-live="polite">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={event} className="truncate leading-[22px]" initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}>
              {event}
            </motion.span>
          </AnimatePresence>
        </span>
        <motion.span className="flex flex-none items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold" animate={{ backgroundColor: live ? "rgba(220,38,38,.12)" : "rgba(52,199,89,.14)", color: live ? AD : OK }} transition={{ duration: 0.3 }}>
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: "currentColor" }} animate={live ? { scale: [1, 1.8, 1], opacity: [1, 0.4, 1] } : { scale: 1, opacity: 1 }} transition={live ? { duration: 0.9, repeat: Infinity } : {}} />
          {live ? "Incident" : "Healthy"}
        </motion.span>
      </div>
      <LayoutGroup id="pulse-week">
        <div className="grid grid-cols-4 gap-1.5 p-2 sm:gap-2.5 sm:p-3">
          {COLS.map((name, c) => (
            <div key={name} className="flex min-h-[300px] min-w-0 flex-col gap-1.5 rounded-[16px] bg-[#f5f5f7] p-1.5 sm:min-h-[372px] sm:gap-2 sm:p-2">
              <div className="flex items-center justify-between px-1 pt-0.5 text-[11px] font-semibold text-[#515154] sm:text-[12px]">
                <span className="truncate">{name}</span>
                <RollDigit n={cols[c].length} />
              </div>
              {cols[c].map((it) => (
                <motion.div
                  key={it.key}
                  layoutId={`pulse-${it.key}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 28 }}
                  className="relative flex flex-col gap-1 rounded-[10px] bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_4px_10px_-6px_rgba(0,0,0,.25)] sm:gap-1.5 sm:rounded-[12px] sm:p-2.5"
                  style={it.incident && c < 3 ? { boxShadow: `0 0 0 1.5px ${A}, 0 8px 18px -10px rgba(220,38,38,.6)` } : undefined}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] font-semibold tabular-nums sm:text-[11px]" style={{ color: it.incident ? AD : "#6e6e73", fontFamily: MONO }}>{it.key}</span>
                    <span className="hidden sm:block"><Avatar who={it.who} hue={it.hue} /></span>
                  </div>
                  <span className="hidden text-[13px] font-medium leading-[1.3] text-[#1d1d1f] sm:block">{it.title}</span>
                  {c === 3 && <span className="hidden text-[11px] font-medium sm:block" style={{ color: OK }}>Shipped</span>}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

function Timeline({ onStep }: { onStep: (s: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const p = useMotionValue(0); // 0..1 through the week
  const sp = useSpring(p, { stiffness: 260, damping: 30 });
  const pct = useTransform(sp, (v) => `${v * 100}%`);
  const clipW = useTransform(sp, (v) => v * 1000);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const dragging = useRef(false);
  const idle = useRef(0);

  useMotionValueEvent(sp, "change", (v) => {
    const s = Math.max(0, Math.min(STEPS - 1, Math.floor(v * STEPS)));
    setStep((o) => (o === s ? o : s));
  });
  useEffect(() => { onStep(step); }, [step, onStep]);

  const toStep = (s: number) => p.set((Math.max(0, Math.min(STEPS - 1, s)) + 0.5) / STEPS);

  // Autoplay: hop forward one slot at a time, hold at the end, then rewind.
  useEffect(() => {
    if (!playing) return;
    let hold = 0;
    const t = setInterval(() => {
      if (dragging.current || Date.now() - idle.current < 6000) return;
      const s = Math.floor(p.get() * STEPS);
      if (s >= STEPS - 1) {
        if (++hold > 3) { hold = 0; animate(p, 0.5 / STEPS, { type: "spring", stiffness: 60, damping: 16 }); }
        return;
      }
      toStep(s + 1);
    }, 650);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const fromX = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    p.set(Math.max(0, Math.min(0.9999, (clientX - r.left) / r.width)));
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    idle.current = Date.now();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    fromX(e.clientX);
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => { if (dragging.current) { idle.current = Date.now(); fromX(e.clientX); } };
  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    idle.current = Date.now();
    toStep(Math.floor(p.get() * STEPS)); // settle onto the slot
  };
  const key = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = Math.floor(p.get() * STEPS);
    const map: Record<string, number> = { ArrowRight: s + 1, ArrowUp: s + 1, ArrowLeft: s - 1, ArrowDown: s - 1, Home: 0, End: STEPS - 1, PageUp: s + 4, PageDown: s - 4 };
    if (e.key in map) { e.preventDefault(); idle.current = Date.now(); toStep(map[e.key]); }
  };

  return (
    <div className={`${card} flex items-center gap-3 p-3 sm:gap-4 sm:p-4`}>
      <button
        type="button"
        onClick={() => { setPlaying((v) => !v); idle.current = 0; }}
        aria-label={playing ? "Pause the week replay" : "Play the week replay"}
        className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ background: INK, ["--tw-ring-color" as string]: A }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <motion.path fill="currentColor" initial={false} animate={{ d: playing ? "M6 4h4v16H6zM14 4h4v16h-4z" : "M7 4l13 8-13 8z" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
        </svg>
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          ref={track}
          className="relative h-[64px] cursor-ew-resize touch-none select-none rounded-[14px] bg-[#f5f5f7] outline-none focus-visible:ring-2"
          style={{ ["--tw-ring-color" as string]: A }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key}
          tabIndex={0}
          role="slider"
          aria-label="Scrub through the week"
          aria-valuemin={0}
          aria-valuemax={STEPS - 1}
          aria-valuenow={step}
          aria-valuetext={`${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][Math.floor(step / 4)]} ${SLOTS[step % 4]}`}
        >
          {DAYS.map((d, i) => i > 0 && <span key={d} className="absolute bottom-2 top-2 w-px bg-black/[.07]" style={{ left: `${(i / 7) * 100}%` }} aria-hidden="true" />)}
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <clipPath id="pulse-past"><motion.rect x="0" y="0" height="64" width={clipW} /></clipPath>
            </defs>
            <path d={ECG} fill="none" stroke="#c7c7cc" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            <path d={ECG} fill="none" stroke={A} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" clipPath="url(#pulse-past)" />
          </svg>
          <motion.div className="pointer-events-none absolute bottom-0 top-0" style={{ left: pct }} aria-hidden="true">
            <span className="absolute bottom-0 top-0 -ml-px w-[2px]" style={{ background: A }} />
            <span className="absolute -top-1.5 -ml-[7px] h-[14px] w-[14px] rounded-full border-[3px] bg-white" style={{ borderColor: A }} />
          </motion.div>
        </div>
        <div className="grid grid-cols-7 text-[11px] font-medium text-[#6e6e73] sm:text-[12px]">
          {DAYS.map((d, i) => <span key={d} className="pl-1.5" style={{ color: Math.floor(step / 4) === i ? AD : undefined }}>{d}</span>)}
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const [step, setStep] = useState(0);
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(40% 50% at 78% 35%, rgba(220,38,38,.10), transparent 70%), radial-gradient(30% 30% at 10% 90%, rgba(255,159,10,.10), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-12 lg:pb-20 lg:pt-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[400px_1fr] lg:gap-12">
          <div className="flex flex-col items-start gap-6">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">
              <span className="h-2 w-2 rounded-full" style={{ background: A }} aria-hidden="true" />
              Issues, incidents and roadmaps in one place
            </motion.span>
            <h1 className="m-0 text-[clamp(44px,5.8vw,76px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
              <Words text="Know what engineering did this week." accentWords={["this", "week."]} accent={AD} />
            </h1>
            <Reveal delay={0.35} y={14}>
              <p className="m-0 text-[clamp(17px,2vw,19px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
                Pulse keeps the issue tracker, the on-call incident and the quarter&apos;s roadmap on one timeline. Drag through the week and watch the work move.
              </p>
            </Reveal>
            <Reveal delay={0.45} y={14} className="flex flex-wrap gap-3">
              <Magnetic className="text-white shadow-[0_12px_30px_-12px_rgba(220,38,38,.7)]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Start with your team</Magnetic>
              <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("incidents")}>See incident mode</Magnetic>
            </Reveal>
          </div>
          <motion.div className="min-w-0" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.15 }}>
            <WeekBoard step={step} />
          </motion.div>
        </div>
        <motion.div className="mt-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.35 }}>
          <Timeline onStep={setStep} />
          <p className="m-0 mt-2.5 text-center text-[13px] text-[#6e6e73]">Drag the line, or use the arrow keys. Each blip is work moving; the spike on Wednesday is the incident.</p>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Signals                                                              */
/* ------------------------------------------------------------------ */

function Signals() {
  const items = [
    { to: 29, f: (n: number) => `${Math.round(n)} min`, l: "median time to resolve, last quarter" },
    { to: 82, f: (n: number) => `${Math.round(n)}%`, l: "of cycle scope shipped on time" },
    { to: 3.4, f: (n: number) => `${n.toFixed(1)} h`, l: "from report to triaged, on average" },
    { to: 140, f: (n: number) => `${Math.round(n)}`, l: "engineers on one workspace, no lag" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 pb-6" aria-label="Pulse in numbers">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(36px,4.6vw,52px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
      <p className="m-0 mt-6 text-[12px] text-[#6e6e73]">From the Pulse platform team&apos;s own workspace. Placeholder figures for this template.</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Triage                                                               */
/* ------------------------------------------------------------------ */

function Triage() {
  return (
    <section id="triage" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[1fr_1fr]">
        <Reveal y={18} className="order-2 lg:order-1">
          <div className={`${card} flex flex-col items-center gap-2 px-4 py-10`}>
            <Fit><TriageStack accent={A} autoplay /></Fit>
            <span className="text-[13px] text-[#6e6e73]">Drag a card right to take it into the cycle, left to close it.</span>
          </div>
        </Reveal>
        <div className="order-1 flex flex-col gap-8 lg:order-2">
          <SectionHead eyebrow="Triage" title="Inbox to cycle in a flick." sub="Support tickets, error reports and chat requests land in one triage queue. Whoever is on triage this week clears it like a deck of cards." accent={AD} />
          <Stagger className="flex flex-col gap-4">
            {[
              { t: "Duplicates are flagged before you read them", b: "Pulse matches new reports against open issues and suggests the merge." },
              { t: "Crashes arrive with the stack trace attached", b: "Error tracker issues carry the release, the user count and the first-seen time." },
              { t: "Closing always asks why", b: "Won't fix, duplicate or can't reproduce, so the reporter hears back automatically." },
            ].map((f) => (
              <div key={f.t} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: "rgba(220,38,38,.12)", color: AD }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-semibold tracking-[-0.015em] text-[#1d1d1f]">{f.t}</span>
                  <span className="text-[15px] leading-[1.5] text-[#6e6e73]">{f.b}</span>
                </span>
              </div>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Incidents: the story                                                 */
/* ------------------------------------------------------------------ */

function DeclareCard() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-6`}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#fff1f1] px-4 py-3">
        <motion.span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: A }} animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} aria-hidden="true" />
        <span className="flex flex-col">
          <span className="text-[14px] font-semibold text-[#1d1d1f]">Error rate 6.2% on /checkout</span>
          <span className="text-[12px] text-[#515154]">Alert fired 09:02 · threshold 1%</span>
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[{ k: "Customers", v: "1,940" }, { k: "Since deploy", v: "4127" }, { k: "Regions", v: "3 of 4" }].map((x) => (
          <div key={x.k} className="rounded-2xl bg-[#f5f5f7] px-2 py-3">
            <span className="block text-[18px] font-semibold tabular-nums tracking-[-0.02em] text-[#1d1d1f]">{x.v}</span>
            <span className="text-[12px] text-[#6e6e73]">{x.k}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center"><HoldToConfirm label="Hold to declare SEV-1" holdingLabel="Keep holding…" doneLabel="SEV-1 declared" color={A} holdMs={1400} autoplay /></div>
      <span className="text-center text-[12px] text-[#6e6e73]">A hold, not a click, so nobody pages the whole company by accident.</span>
    </div>
  );
}

function PageCard() {
  const rows = [
    { n: "Dana Whitfield", r: "Primary on-call, payments", s: "ack" as const, t: "Acknowledged in 48 s" },
    { n: "Luis Paredes", r: "Secondary on-call", s: "call" as const, t: "Calling…" },
    { n: "#inc-212", r: "Incident channel", s: "ack" as const, t: "Created, 6 people joined" },
    { n: "Status page", r: "Public update", s: "draft" as const, t: "Draft ready for review" },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col gap-2 p-5`}>
      <span className="px-2 pb-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">Paging · SEV-1</span>
      {rows.map((r, i) => (
        <motion.div key={r.n} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: i * 0.12 }} className="flex items-center gap-3 rounded-2xl px-2 py-2.5 hover:bg-[#f5f5f7]">
          {r.s === "call" ? <MatrixLoader pattern={1} size={28} color={A} /> : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: r.s === "ack" ? "rgba(52,199,89,.16)" : "#f0f0f2", color: r.s === "ack" ? OK : "#515154" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={r.s === "ack" ? "M5 12.5l4.5 4.5L19 7.5" : "M4 20l4-1 11-11-3-3L5 16z"} /></svg>
            </span>
          )}
          <span className="flex flex-1 flex-col">
            <span className="text-[15px] font-medium text-[#1d1d1f]">{r.n}</span>
            <span className="text-[12px] text-[#6e6e73]">{r.r}</span>
          </span>
          <span className="text-right text-[12px] tabular-nums" style={{ color: r.s === "call" ? AD : "#515154" }}>{r.t}</span>
        </motion.div>
      ))}
    </div>
  );
}

function RunbookCard() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Runbook: checkout errors</span>
        <span className="rounded-full bg-[#fff1f1] px-2.5 py-1 text-[11px] font-semibold" style={{ color: AD }}>SEV-1</span>
      </div>
      <TodoList accent={A} autoplay initial={["Roll back deploy 4127 to 4126", "Post first status page update", "Check payment provider status", "Confirm error rate under 1%"]} />
    </div>
  );
}

function ReviewCard() {
  const log = [
    { t: "09:02", e: "Alert: error rate over 1% on /checkout" },
    { t: "09:04", e: "SEV-1 declared by Dana" },
    { t: "09:05", e: "Deploy 4127 linked as likely cause" },
    { t: "09:19", e: "Rolled back to 4126" },
    { t: "09:31", e: "Error rate normal. Resolved." },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Postmortem draft</span>
        <span className="text-[13px] tabular-nums text-[#515154]">Resolved in <b className="font-semibold text-[#1d1d1f]">29 min</b></span>
      </div>
      <ol className="relative m-0 flex list-none flex-col gap-3 p-0 pl-5">
        <span className="absolute bottom-2 left-[5px] top-2 w-[2px] rounded-full bg-[#f0f0f2]" aria-hidden="true" />
        {log.map((l, i) => (
          <motion.li key={l.t} className="relative flex gap-3 text-[14px]" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 + i * 0.12 }}>
            <span className="absolute -left-5 top-[5px] h-3 w-3 rounded-full border-2 border-white" style={{ background: i === log.length - 1 ? OK : A }} aria-hidden="true" />
            <span className="w-11 flex-none font-semibold tabular-nums text-[#1d1d1f]">{l.t}</span>
            <span className="text-[#515154]">{l.e}</span>
          </motion.li>
        ))}
      </ol>
      <div className="flex items-center justify-between gap-3 border-t border-black/[.06] pt-4">
        <span className="text-[13px] text-[#6e6e73]">3 follow-up issues filed to Platform</span>
        <CopyChip value="https://pulse.example/inc/212" display="inc/212" label="Copy link" accent={A} />
      </div>
    </div>
  );
}

function Incidents() {
  return (
    <section id="incidents" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Incident mode" title="When it breaks, everyone knows what to do." sub="An incident in Pulse is just an issue with a clock on it. It pages the right people, runs the runbook, and writes most of the postmortem for you." accent={AD} />
      <div className="mt-10">
        <StickyStory
          accent={AD}
          steps={[
            { kicker: "09:02 · Detect", title: "Alerts become incidents in one hold.", body: "Pulse attaches the alert, the last deploy and the affected customers, so whoever declares it starts with context instead of a blank page.", visual: <DeclareCard /> },
            { kicker: "09:04 · Page", title: "The right people, not everyone.", body: "On-call schedules live next to the services they cover. Pulse pages the owner, opens a channel and drafts the status page update while you're still reading the alert.", visual: <PageCard /> },
            { kicker: "09:05 · Respond", title: "The runbook runs with you.", body: "Each service carries its runbook as a checklist. Tick steps as you go and the timeline records who did what, and when.", visual: <RunbookCard /> },
            { kicker: "09:31 · Learn", title: "The postmortem is mostly written.", body: "The timeline, the linked deploy and the follow-up issues are already there. You add what the timeline can't know: why.", visual: <ReviewCard /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Roadmap                                                              */
/* ------------------------------------------------------------------ */

type Status = "on" | "risk" | "off" | "plan";
const ST: Record<Status, { l: string; c: string; bg: string }> = {
  on: { l: "On track", c: OK, bg: "rgba(52,199,89,.14)" },
  risk: { l: "At risk", c: WARN, bg: "rgba(255,159,10,.16)" },
  off: { l: "Off track", c: AD, bg: "rgba(220,38,38,.1)" },
  plan: { l: "Planned", c: "#515154", bg: "#f0f0f2" },
};

const ROADMAP: { name: string; team: string; p: number; s: Status; due: string; issues: number }[][] = [
  [
    { name: "Self-serve SSO", team: "Identity", p: 72, s: "on", due: "Nov 14", issues: 18 },
    { name: "Checkout reliability", team: "Payments", p: 54, s: "risk", due: "Nov 28", issues: 23 },
    { name: "Postgres 16 upgrade", team: "Platform", p: 90, s: "on", due: "Nov 7", issues: 9 },
    { name: "Usage-based billing", team: "Billing", p: 31, s: "off", due: "Dec 12", issues: 27 },
  ],
  [
    { name: "Audit log export", team: "Identity", p: 8, s: "plan", due: "Jan", issues: 11 },
    { name: "Mobile triage", team: "Apps", p: 12, s: "plan", due: "Feb", issues: 16 },
    { name: "Faster search index", team: "Platform", p: 4, s: "plan", due: "Feb", issues: 7 },
  ],
  [
    { name: "Public API v2", team: "Platform", p: 0, s: "plan", due: "Q2", issues: 4 },
    { name: "EU data residency", team: "Infra", p: 0, s: "plan", due: "Q2", issues: 6 },
    { name: "Offline desktop app", team: "Apps", p: 0, s: "plan", due: "Q3", issues: 2 },
  ],
];

function Roadmap() {
  const [tab, setTab] = useState(0);
  const rows = ROADMAP[tab];
  return (
    <section id="roadmap" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <SectionHead eyebrow="Roadmap and initiatives" title="Progress you don't have to ask for." accent={AD} />
          <Reveal y={14}><p className="m-0 max-w-[460px] text-[17px] leading-[1.5] text-[#6e6e73]">Initiatives roll up from the issues underneath them. When work closes, the bar moves. When an incident hits a team, its initiatives show the risk.</p></Reveal>
        </div>
        <Reveal y={18} className="mt-12">
          <div className={`${card} flex flex-col gap-6 p-5 sm:p-7`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <StretchNav items={["Now", "Next", "Later"]} defaultIndex={0} onChange={setTab} />
              <span className="text-[13px] text-[#6e6e73]">Q4 · 4 teams · <span className="tabular-nums">{ROADMAP.flat().reduce((n, r) => n + r.issues, 0)}</span> linked issues</span>
            </div>
            <div className="relative flex min-h-[300px] flex-col">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div key={tab} className="flex flex-col divide-y divide-black/[.06]" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 260, damping: 28 }}>
                  {rows.map((r, i) => (
                    <div key={r.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 py-4 sm:grid-cols-[1.3fr_2fr_auto_auto]">
                      <span className="flex flex-col">
                        <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{r.name}</span>
                        <span className="text-[13px] text-[#6e6e73]">{r.team} · <span className="tabular-nums">{r.issues}</span> issues</span>
                      </span>
                      <span className="col-span-2 flex items-center gap-3 sm:col-span-1">
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#f0f0f2]">
                          <motion.span className="block h-full origin-left rounded-full" style={{ width: `${Math.max(2, r.p)}%`, background: r.s === "off" ? A : r.s === "risk" ? "#ff9f0a" : r.s === "on" ? "#34c759" : "#c7c7cc" }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.1 + i * 0.08 }} />
                        </span>
                        <span className="w-10 text-right text-[13px] font-semibold tabular-nums text-[#1d1d1f]">{r.p}%</span>
                      </span>
                      <span className="row-start-1 justify-self-end rounded-full px-2.5 py-1 text-[12px] font-semibold sm:row-auto" style={{ color: ST[r.s].c, background: ST[r.s].bg }}>{ST[r.s].l}</span>
                      <span className="hidden w-14 text-right text-[13px] tabular-nums text-[#515154] sm:block">{r.due}</span>
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                              */
/* ------------------------------------------------------------------ */

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Pricing" title="One tool instead of four." sub="Issues, incidents, on-call and roadmaps are in every plan. You pay per engineer; viewers, reporters and stakeholders are free." accent={AD} />
          <Stagger className="grid grid-cols-2 gap-3">
            {["Unlimited issues and projects", "Free viewers and reporters", "Import from your old tracker", "Cancel or downgrade any time"].map((t) => (
              <span key={t} className="flex items-start gap-2.5 text-[15px] leading-[1.4] text-[#1d1d1f]">
                <svg className="mt-0.5 flex-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={AD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={18} className="flex justify-center">
          <div className={`${card} flex w-full max-w-[500px] flex-col items-center gap-5 p-6 sm:p-7`}>
            <span className="self-start text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Pick a plan</span>
            <Fit>
              <div className="w-[440px]">
                <RadioCards
                  accent={A}
                  defaultValue="team"
                  options={[
                    { id: "free", title: "Free", description: "Up to 10 engineers", meta: "$0", features: ["Issues and cycles", "1 on-call schedule", "30 days of history"] },
                    { id: "team", title: "Team", description: "For growing engineering orgs", meta: "$10 / engineer", features: ["Incident mode and runbooks", "Roadmaps and initiatives", "Unlimited history"] },
                    { id: "business", title: "Business", description: "For regulated teams", meta: "$18 / engineer", features: ["SSO, SCIM, audit log", "Data residency", "99.95% uptime SLA"] },
                  ]}
                />
              </div>
            </Fit>
            <Magnetic className="w-full text-white" style={{ background: A }}>Start a 14-day trial</Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function PulseLandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}>
        <Nav brand={<Logo />} accent={A} cta="Start free" onCta={() => scrollToId("pricing")} links={[{ label: "Triage", id: "triage" }, { label: "Incidents", id: "incidents" }, { label: "Roadmap", id: "roadmap" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Signals />
        <Triage />
        <Incidents />
        <Roadmap />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="What teams ask first." accent={AD} />
          <Reveal y={14}>
            <Faq
              accent={AD}
              items={[
                { q: "Do we have to move everything at once?", a: "No. Most teams start with triage and incidents, keep their old tracker read-only for a cycle, then import. The importer brings issues, comments, labels and history." },
                { q: "Does Pulse replace our paging tool?", a: "It can. Pulse has on-call schedules, escalation and phone, SMS and push paging. If you'd rather keep your current pager, Pulse takes its alerts in and sends acknowledgements back." },
                { q: "How do initiatives get their progress?", a: "From the issues linked to them. Close an issue and the initiative's bar moves; reopen it and it moves back. You never update a percentage by hand." },
                { q: "Who counts as a paid seat?", a: "Anyone assigned issues or on an on-call schedule. People who only read, comment or file reports are free." },
                { q: "Where is our data stored?", a: "In the US by default, or the EU on Business. Data is encrypted at rest and in transit, and you can export everything at any time as JSON or CSV." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Run this week's cycle in Pulse." sub="Import your issues in about ten minutes. Free for teams of up to ten engineers." cta="Start free" secondary="Book a walkthrough" accent={A} glow="rgba(220,38,38,.30)" />
        </div>
        <Footer brand={<Logo />} note="Issues, incidents, on-call and roadmaps for engineering teams, on one timeline." columns={[{ title: "Product", links: ["Issues", "Incidents", "Roadmaps", "Pricing"] }, { title: "Resources", links: ["Docs", "Importer", "Changelog", "Status"] }, { title: "Company", links: ["About", "Security", "Careers", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}
