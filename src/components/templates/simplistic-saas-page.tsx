"use client";
/**
 * Simplistic: landing page template for AI agents that run routine workflows
 * overnight and leave a short report for the morning. Deliberately calm.
 * The whole hero is the night: the sky runs from dusk to sunrise as the
 * agents work through their jobs, the town's windows go out one by one, and
 * you can scrub the night yourself. Instrument Sans.
 * Built from Motion Kit components: Stagger Menu, Dock, Capsule Toggles,
 * Todo List, Liquid Dial (as agent actions), Elastic Stepper and the rolling
 * number from Price Odometer.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import StaggerMenu from "@/components/templates/kit/components/StaggerMenu";
import Dock, { type DockApp } from "@/components/templates/kit/components/Dock";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import TodoList from "@/components/templates/kit/components/TodoList";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import AgentDial from "@/components/templates/simplistic/AgentDial";
import StickyStory from "@/components/templates/simplistic/StickyStory";
import { fontFaces } from "@/components/templates/kit/fonts";
import { CtaBand, Faq, Fit, Footer, Magnetic, Marquee, Nav, Reveal, SectionHead, Stagger, card, scrollToId } from "@/components/templates/kit/parts";

const C = "#3d5bd9"; // night blue for fills and graphics
const CT = "#1f3a8a"; // night blue for text and buttons (10:1 on white)
const INK = "#141a2b";
const FONT = "'Instrument Sans Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_CSS = fontFaces("simplistic", [{ family: "Instrument Sans Variable", file: "instrument-sans", weight: "400 700" }]);
const spring = { type: "spring", stiffness: 260, damping: 26 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill="none" stroke={C} strokeWidth="3" />
        <motion.circle cx="16" cy="16" r="5" fill={CT} animate={{ scale: [1, 0.82, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "16px", originY: "16px" }} />
      </svg>
      Simplistic
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: scrub through the night and watch the agents' work land.      */
/* ------------------------------------------------------------------ */

const NIGHT_HOURS = 9; // 22:00 to 07:00
const LOG = [
  { at: 0.5, agent: "Inbox triage", body: "Sorted 146 emails. Drafted 38 replies and held them for you.", waits: true },
  { at: 1.7, agent: "Invoice chaser", body: "Sent 9 polite reminders. Two over $5,000 wait for your OK.", waits: true },
  { at: 3.25, agent: "Inventory sync", body: "Merged 3 supplier sheets. 4 items need reordering, waiting for your OK.", waits: true },
  { at: 5.1, agent: "CRM tidy-up", body: "Merged 61 duplicate contacts. Nothing was deleted.", waits: false },
  { at: 7.3, agent: "Weekly numbers", body: "Pulled revenue, refunds and churn into Monday's report.", waits: false },
  { at: 8.75, agent: "Morning brief", body: "6 jobs done, 3 things need you. Coffee first.", waits: false },
];

const clock = (t: number) => {
  const mins = Math.round((t * NIGHT_HOURS * 60) / 5) * 5;
  const h = (22 + Math.floor(mins / 60)) % 24;
  return `${String(h).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};

/** Windows in the town on the horizon: x, y, and when in the night (0 to 1) each light goes out. */
const WINDOWS = [[52, 58, 0.12], [64, 58, 0.3], [64, 50, 0.22], [180, 54, 0.4], [192, 54, 0.18], [204, 46, 0.55], [300, 50, 0.35], [312, 50, 0.62], [324, 50, 0.08], [324, 42, 0.48], [430, 56, 0.26], [442, 48, 0.7], [560, 52, 0.15], [572, 52, 0.5], [690, 58, 0.33], [702, 50, 0.6], [820, 54, 0.2], [832, 46, 0.44], [944, 52, 0.38], [956, 52, 0.66], [1080, 56, 0.28], [1092, 48, 0.52], [1200, 54, 0.1], [1212, 54, 0.58], [1330, 50, 0.42]];

function Hero() {
  const target = useMotionValue(0.02);
  const t = useSpring(target, { stiffness: 90, damping: 22 });
  const [shown, setShown] = useState(0);
  const [now, setNow] = useState(0); // the night's progress, in steps of 2%, for the town's windows
  const clockRef = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const dragging = useRef(false);

  // The sky, the moon and sun, and the headline's colour all run from the same clock.
  const top = useTransform(t, [0, 0.2, 0.7, 0.88, 1], ["#33415c", "#070d22", "#070d22", "#33467a", "#8fcbe2"]);
  const bottom = useTransform(t, [0, 0.2, 0.7, 0.88, 1], ["#b4546b", "#142047", "#142047", "#e59a78", "#fde8c2"]);
  const sky = useMotionTemplate`linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  const stars = useTransform(t, [0, 0.18, 0.78, 0.92], [0.15, 1, 1, 0]);
  const orbX = useTransform(t, (v) => `${6 + v * 88}%`);
  const orbY = useTransform(t, (v) => `${72 - Math.sin(v * Math.PI) * 58}%`);
  const moon = useTransform(t, [0.78, 0.92], [1, 0]);
  const sun = useTransform(t, [0.8, 0.95], [0, 1]);
  // the text stays light until the sky is bright enough, then flips quickly
  const ink = useTransform(t, [0.94, 0.975], ["#f3f5fb", "#141a2b"]);
  const soft = useTransform(t, [0.94, 0.975], ["rgba(233,237,247,.8)", "rgba(20,26,43,.75)"]);
  const fill = useTransform(t, (v) => `${v * 100}%`);

  useMotionValueEvent(t, "change", (v) => {
    if (clockRef.current) clockRef.current.textContent = clock(v);
    const n = LOG.filter((l) => v * NIGHT_HOURS >= l.at).length;
    setShown((s) => (s === n ? s : n));
    const q = Math.round(v * 50) / 50;
    setNow((s) => (s === q ? s : q));
  });

  // Until the visitor grabs the timeline, the night plays by itself.
  useEffect(() => {
    let ctl: { stop: () => void } | null = null;
    const ts: number[] = [];
    const play = () => {
      if (touched.current) return;
      target.jump(0.02);
      t.jump(0.02);
      ctl = animate(target, 1, { duration: 14, ease: "linear" });
    };
    ts.push(window.setTimeout(play, 900));
    const loop = window.setInterval(play, 19000);
    return () => { ctl?.stop(); ts.forEach(clearTimeout); clearInterval(loop); };
  }, [target, t]);

  const fromPointer = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    target.stop();
    target.set(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 1 / 9 : 1 / 36;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); touched.current = true; target.stop(); target.set(Math.min(1, target.get() + step)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); touched.current = true; target.stop(); target.set(Math.max(0, target.get() - step)); }
    if (e.key === "Home") { touched.current = true; target.stop(); target.set(0); }
    if (e.key === "End") { touched.current = true; target.stop(); target.set(1); }
  };

  const visible = LOG.slice(0, shown);
  const waiting = visible.filter((l) => l.waits).length;
  const morning = shown === LOG.length;

  return (
    <motion.section id="top" className="relative -mt-[76px] overflow-hidden pt-[76px]" style={{ background: sky }}>
      {/* the sky */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ opacity: stars }} aria-hidden="true">
        {[[6, 12], [14, 30], [22, 8], [31, 22], [40, 10], [47, 34], [55, 16], [63, 28], [71, 9], [79, 24], [86, 14], [93, 32], [10, 44], [36, 46], [60, 42], [84, 46], [27, 58], [68, 56]].map(([x, y], i) => (
          <motion.span key={i} className="absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%` }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2.6 + (i % 5) * 0.6, repeat: Infinity, ease: "easeInOut" }} />
        ))}
      </motion.div>
      <motion.span className="pointer-events-none absolute -ml-8 -mt-8 hidden h-16 w-16 rounded-full sm:block" style={{ left: orbX, top: orbY, opacity: moon, background: "#eef2f9", boxShadow: "0 0 60px 10px rgba(238,242,249,.3), inset -12px -5px 0 #c3ccdb" }} aria-hidden="true" />
      <motion.span className="pointer-events-none absolute -ml-10 -mt-10 hidden h-20 w-20 rounded-full sm:block" style={{ left: orbX, top: orbY, opacity: sun, background: "#fbbf24", boxShadow: "0 0 90px 24px rgba(251,191,36,.45)" }} aria-hidden="true" />
      {/* the town, its lights going out as the night goes on */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-[110px] w-full" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 50 C 120 30, 230 44, 360 40 S 600 22, 760 36 S 1040 48, 1200 30 S 1380 34, 1440 38 V80 H0 Z" fill="rgba(10,16,34,.45)" />
        <path d="M0 64 H40 V52 H76 V44 H88 V64 H170 V48 H216 V40 H228 V64 H290 V44 H336 V36 H348 V64 H420 V50 H454 V42 H466 V64 H550 V46 H584 V64 H680 V52 H714 V44 H726 V64 H810 V48 H844 V40 H856 V64 H934 V46 H968 V64 H1070 V50 H1104 V42 H1116 V64 H1190 V48 H1224 V64 H1320 V44 H1354 V64 H1440 V80 H0 Z" fill="#0a1022" />
        {WINDOWS.map(([x, y, off], i) => <rect key={i} x={x} y={y} width="6" height="5" rx="1" fill="#ffd98a" opacity={now < off ? 0.95 : 0} style={{ transition: "opacity .4s" }} />)}
      </svg>

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-5 pb-[150px] pt-14 lg:grid-cols-[1fr_480px] lg:gap-16 lg:pt-20">
        <div className="flex flex-col items-start gap-7">
          <motion.span ref={clockRef} className="text-[clamp(44px,5vw,64px)] font-[560] leading-none tabular-nums tracking-[-0.04em]" style={{ color: ink }} aria-hidden="true">22:00</motion.span>
          <motion.h1 className="m-0 text-[clamp(44px,6.6vw,84px)] font-[640] leading-[0.98] tracking-[-0.045em] [text-wrap:balance]" style={{ color: ink }}>
            Go to bed. The work gets done.
          </motion.h1>
          <motion.p className="m-0 max-w-[500px] text-[clamp(17px,1.9vw,19px)] leading-[1.55]" style={{ color: soft }}>
            Simplistic runs your routine workflows overnight: inbox triage, invoice reminders, stock sheets, the weekly numbers. Anything risky waits for you, with a short note in the morning.
          </motion.p>
          <div className="flex flex-wrap gap-3">
            <Magnetic className="bg-white text-[#141a2b]" onClick={() => scrollToId("pricing")}>Start with one agent</Magnetic>
            <Magnetic className="text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.35)]" style={{ background: "rgba(20,26,43,.35)" }} onClick={() => scrollToId("how")}>How it works</Magnetic>
          </div>
        </div>

        <div className="w-full overflow-hidden rounded-[24px] bg-white/80 shadow-[0_0_0_1px_rgba(255,255,255,.4),0_40px_80px_-40px_rgba(0,0,0,.6)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[14px] font-semibold text-[#141a2b]">Tonight&rsquo;s log</span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={morning ? "m" : "n"} initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={spring} className="rounded-full px-3 py-1.5 text-[13px] font-semibold" style={morning ? { background: "#fef3c7", color: "#92400e" } : { background: "#eef1fb", color: CT }} aria-live="polite">
                  {morning ? `Good morning. ${waiting} things need you.` : `${shown} of ${LOG.length} jobs done`}
                </motion.span>
              </AnimatePresence>
            </div>
            <ol className="m-0 flex h-[258px] list-none flex-col justify-end gap-2 overflow-hidden p-0" aria-live="polite" aria-label="Overnight log">
              <AnimatePresence initial={false}>
                {visible.length === 0 && (
                  <motion.li key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center rounded-2xl bg-[#f2f4f9] text-[14px] text-[#5a6276]">
                    Agents start at 22:30.
                  </motion.li>
                )}
                {visible.slice(-3).map((l) => (
                  <motion.li key={l.agent} layout initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } }} transition={spring} className="flex items-start gap-3 rounded-2xl bg-[#f2f4f9] px-4 py-3">
                    <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: l.waits ? "#fef3c7" : "#e0e6fb" }}>
                      {l.waits ? (
                        <span className="h-2 w-2 rounded-full bg-[#d97706]" />
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={CT} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-semibold text-[#141a2b]">{l.agent} <span className="font-normal tabular-nums text-[#5a6276]">at {clock(l.at / NIGHT_HOURS)}</span></span>
                      <span className="text-[13px] leading-[1.4] text-[#3b4256]">{l.body}</span>
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ol>
            <div
              ref={track}
              role="slider"
              tabIndex={0}
              aria-label="Time of night"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round((shown / LOG.length) * 100)}
              aria-valuetext={`${shown} of ${LOG.length} jobs done`}
              onKeyDown={onKey}
              onPointerDown={(e) => { touched.current = true; dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
              onPointerMove={(e) => dragging.current && fromPointer(e)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
              className="group relative h-10 cursor-ew-resize touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a8a] focus-visible:ring-offset-2"
            >
              <span className="absolute inset-x-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full bg-[#e3e6ef]" />
              <motion.span className="absolute left-0 top-1/2 h-[6px] -translate-y-1/2 rounded-full" style={{ width: fill, background: C }} />
              {LOG.map((l) => (
                <span key={l.agent} className="absolute top-1/2 h-2.5 w-[2px] -translate-y-1/2 rounded-full bg-white/90" style={{ left: `${(l.at / NIGHT_HOURS) * 100}%` }} />
              ))}
              <motion.span className="absolute top-1/2 -ml-[13px] -mt-[13px] h-[26px] w-[26px] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,.25),0_0_0_.5px_rgba(0,0,0,.1)] transition-transform group-active:scale-110" style={{ left: fill }} />
            </div>
            <div className="-mt-2 flex justify-between text-[12px] tabular-nums text-[#5a6276]" aria-hidden="true">
              <span>22:00</span><span>01:00</span><span>04:00</span><span>07:00</span>
            </div>
            <span className="text-[12.5px] text-[#5a6276]">Drag the timeline to scrub through a real night. Your first agent is free.</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */

function Principles() {
  const items = [
    { t: "It asks first.", d: "Emails, payments and deletions wait in a morning queue until you say yes. You choose what counts as risky.", icon: "M12 3l8 4v5c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V7z" },
    { t: "It writes everything down.", d: "Every step an agent takes is logged in plain English, with the data it read. Undo any run for 24 hours.", icon: "M6 4h9l4 4v12H6zM14 4v5h5M9 13h7M9 17h5" },
    { t: "It stays small.", d: "No workflow canvas, no node graph. Pick a trigger, connect tools, set rules. Most agents take four minutes.", icon: "M5 12h14M12 5v14" },
  ];
  return (
    <section id="principles" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead title="Fewer features. Fewer surprises." sub="Simplistic does one thing: routine work, done overnight, checked by you in the morning." accent={CT} />
      <Stagger className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {items.map((it) => (
          <div key={it.t} className={`${card} flex h-full flex-col gap-4 p-7`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: "#ecfeff", color: CT }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={it.icon} /></svg>
            </span>
            <h3 className="m-0 text-[21px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">{it.t}</h3>
            <p className="m-0 text-[16px] leading-[1.5] text-[#6e6e73]">{it.d}</p>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* --------------------------- How it works --------------------------- */

const I = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

const TRIGGERS = [
  { id: "night", label: "Every night at 02:00", icon: I("M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"), done: "Runs nightly at 02:00" },
  { id: "file", label: "When a file lands", icon: I("M3 7h6l2 2h10v10H3z"), done: "Watching the folder" },
  { id: "mail", label: "When an email arrives", icon: I("M4 6h16v12H4zM4 7l8 6 8-6"), done: "Watching the inbox" },
  { id: "ship", label: "After the last order ships", icon: I("M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10"), done: "Runs after shipping" },
  { id: "manual", label: "Only when I ask", icon: I("M8 13V5a2 2 0 0 1 4 0v6M12 11V4a2 2 0 0 1 4 0v8M16 9a2 2 0 0 1 4 0v5a7 7 0 0 1-14 0v-2a2 2 0 0 1 4 0"), done: "Manual runs only" },
];

const G = (d: string) => (
  <svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const TOOLS: DockApp[] = [
  { id: "mail", label: "Email", bg: "linear-gradient(180deg,#22d3ee,#0e7490)", glyph: G("M4 6h16v12H4zM4 7l8 6 8-6") },
  { id: "cal", label: "Calendar", bg: "linear-gradient(180deg,#fb7185,#e11d48)", glyph: G("M4 6h16v14H4zM4 10h16M9 3v4M15 3v4") },
  { id: "sheet", label: "Spreadsheets", bg: "linear-gradient(180deg,#4ade80,#15803d)", glyph: G("M4 4h16v16H4zM4 10h16M4 15h16M10 4v16") },
  { id: "drive", label: "Shared drive", bg: "linear-gradient(180deg,#fcd34d,#d97706)", glyph: G("M3 7h6l2 2h10v10H3z") },
  { id: "chat", label: "Team chat", bg: "linear-gradient(180deg,#a78bfa,#6d28d9)", glyph: G("M4 5h16v11H9l-5 4z") },
  { id: "books", label: "Accounting", bg: "linear-gradient(180deg,#60a5fa,#1d4ed8)", glyph: G("M6 3h12v18H6zM9 7h6M9 11h6M9 15h3") },
  { id: "crm", label: "CRM", bg: "linear-gradient(180deg,#94a3b8,#334155)", glyph: G("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0") },
];

function TriggerVisual() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-7`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#6e6e73]">Invoice chaser trigger</span>
        <span className="rounded-full bg-[#ecfeff] px-2.5 py-1 text-[12px] font-semibold" style={{ color: CT }}>Step 1 of 4</span>
      </div>
      <div className="flex justify-center"><StaggerMenu label="Choose a trigger" items={TRIGGERS} autoplay /></div>
    </div>
  );
}

function ToolsVisual() {
  return (
    <div className={`${card} flex w-[520px] flex-col gap-2 p-7`}>
      <span className="text-[13px] font-semibold text-[#6e6e73]">Connected tools</span>
      <p className="m-0 text-[15px] leading-[1.5] text-[#424245]">The agent can only see what is in this dock. Click a tool to connect it.</p>
      <Dock apps={TOOLS} autoplay />
    </div>
  );
}

const RULES = [
  { id: "email", label: "Ask before sending any email", hint: "Drafts wait in your morning queue", on: true },
  { id: "pay", label: "Ask before payments over $1,000", hint: "Smaller reminders go out on their own", on: true },
  { id: "delete", label: "Never delete records", hint: "Merge and archive only", on: true },
  { id: "cost", label: "Stop if a run costs over $5", hint: "Model usage, checked every step", on: false },
];

function RulesVisual() {
  const [state, setState] = useState(() => Object.fromEntries(RULES.map((r) => [r.id, r.on])) as Record<string, boolean>);
  const touched = useRef(false);
  useEffect(() => {
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      const r = RULES[3];
      setState((s) => ({ ...s, [r.id]: !s[r.id] }));
    }, 1600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={`${card} w-[460px] overflow-hidden`} onPointerDown={() => (touched.current = true)}>
      <div className="flex items-center justify-between px-6 pb-2 pt-5">
        <span className="text-[13px] font-semibold text-[#6e6e73]">Rules</span>
        <span className="text-[12px] tabular-nums text-[#6e6e73]">{Object.values(state).filter(Boolean).length} of {RULES.length} on</span>
      </div>
      <ul className="m-0 list-none divide-y divide-[#f0f0f3] p-0">
        {RULES.map((r) => (
          <li key={r.id} className="flex items-center gap-4 px-6 py-4">
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-[#1d1d1f]">{r.label}</span>
              <span className="text-[13px] text-[#6e6e73]">{state[r.id] ? r.hint : "Off"}</span>
            </span>
            <CapsuleToggle label={r.label} checked={state[r.id]} onColor={C} onChange={(v) => { touched.current = true; setState((s) => ({ ...s, [r.id]: v })); }} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReviewVisual() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#6e6e73]">Waiting for you at 07:00</span>
        <span className="text-[12px] text-[#6e6e73]">About 4 minutes</span>
      </div>
      <TodoList accent={CT} initial={["Approve 38 drafted replies", "OK two invoices over $5,000", "Reorder 4 low-stock items", "Skim the Monday numbers"]} autoplay />
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="Four steps. No diagrams." sub="Every agent is the same four questions. When does it run, what can it touch, what must it ask about, and what do you see in the morning." accent={CT} />
        <div className="mt-6">
          <StickyStory
            accent={CT}
            steps={[
              { kicker: "When", title: "Pick a trigger.", body: "A time of night, a new file, an incoming email or the end of the shipping day. One trigger per agent keeps it predictable.", visual: <TriggerVisual /> },
              { kicker: "What", title: "Connect only what it needs.", body: "Agents get read or write access tool by tool. An invoice chaser never sees your calendar.", visual: <ToolsVisual /> },
              { kicker: "Limits", title: "Set the rules once.", body: "Plain switches, not prompt engineering. Rules are checked before every step, and a broken rule stops the run.", visual: <RulesVisual /> },
              { kicker: "Morning", title: "Review over coffee.", body: "Everything that needed a yes is in one short list. Tick it off, or open any item to see exactly what the agent did and why.", visual: <ReviewVisual /> },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ Control ------------------------------ */

const ACTIONS = [
  { id: "run", label: "Run now", d: "M8 5l11 7-11 7z", done: "Running now" },
  { id: "skip", label: "Skip tonight", d: "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5zM4 4l16 16", done: "Skipping tonight" },
  { id: "pause", label: "Pause", d: "M8 5h3v14H8zM13 5h3v14h-3z", done: "Agent paused" },
  { id: "rules", label: "Edit rules", d: "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6", done: "Opening rules" },
];

function Control() {
  const [status, setStatus] = useState("Scheduled for 02:00");
  const pick = (id: string) => setStatus({ run: "Running now, 1 of 6 steps", skip: "Skipping tonight, back tomorrow", pause: "Paused until you resume it", rules: "Editing rules" }[id] ?? "Scheduled for 02:00");
  return (
    <section id="agents" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-10">
          <SectionHead title="Change tonight's plan in one tap." sub="Run an agent now, skip a night or pause it while you are on holiday. No settings pages." accent={CT} />
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {["Every run can be undone for 24 hours.", "Skipping a night loses nothing. The work runs tomorrow.", "Pausing holds the queue until you are back."].map((t) => (
              <li key={t} className="flex items-start gap-3 border-t border-black/[.08] pt-3 text-[16px] leading-[1.45] text-[#141a2b]">
                <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full" style={{ background: C }} aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Reveal y={16}>
          <div className={`${card} flex flex-col items-center gap-2 px-6 pb-8 pt-7`}>
            <div className="flex w-full items-center gap-4 rounded-[20px] bg-[#f5f5f7] p-4">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl text-white" style={{ background: CT }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 3h12v18H6zM9 7h6M9 11h6M9 15h3" /></svg>
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[16px] font-semibold text-[#1d1d1f]">Invoice chaser</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={status} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring} className="text-[13px] text-[#6e6e73]" aria-live="polite">{status}</motion.span>
                </AnimatePresence>
              </span>
              <span className="hidden text-[12px] tabular-nums text-[#6e6e73] sm:inline">Last run 02:00</span>
            </div>
            <Fit><AgentDial actions={ACTIONS} color={INK} accent={C} onSelect={pick} label="Agent actions" autoplay /></Fit>
            <span className="text-[13px] text-[#6e6e73]">Press the button and pick an action.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing ------------------------------ */

function Pricing() {
  const [agents, setAgents] = useState(3);
  const [yearly, setYearly] = useState(false);
  const rate = yearly ? 10 : 12;
  const total = Math.max(0, agents - 1) * rate;
  return (
    <section id="pricing" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="One plan. Pay per agent." sub="Your first agent is free for good. Every agent after that is $12 a month, with model usage included up to a fair limit." accent={CT} center />
        <Reveal y={16} className="mx-auto mt-12 max-w-[880px]">
          <div className={`${card} grid grid-cols-1 overflow-hidden md:grid-cols-[1.1fr_1fr]`}>
            <div className="flex flex-col items-center gap-7 px-6 py-10 sm:px-10">
              <span className="text-[14px] font-semibold text-[#1d1d1f]">How many agents?</span>
              <ElasticStepper label="Agents" min={1} max={12} defaultValue={3} onChange={setAgents} accent={CT} />
              <label className="flex items-center gap-3 text-[15px] font-medium text-[#1d1d1f]">
                <CapsuleToggle label="Billed yearly" checked={yearly} onChange={setYearly} onColor={C} />
                Billed yearly <span className="rounded-full bg-[#ecfeff] px-2 py-0.5 text-[12px] font-semibold" style={{ color: CT }}>2 months free</span>
              </label>
            </div>
            <div className="flex flex-col gap-6 bg-[#1d1d1f] px-6 py-10 text-white sm:px-10">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[#a1a1a6]">Your monthly total</span>
                <span className="flex items-baseline gap-2">
                  <span className="flex text-[56px] font-semibold tabular-nums leading-none tracking-[-0.05em]">$<RollingNumber value={total} /></span>
                  <span className="text-[14px] text-[#a1a1a6]">/ month</span>
                </span>
                <span className="text-[13px] tabular-nums text-[#a1a1a6]">{agents === 1 ? "One agent, on the house." : `1 free + ${agents - 1} × $${rate}`}</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[15px] text-[#d2d2d7]">
                {["Unlimited runs and team members", "Morning queue and 24-hour undo", "Every integration, no add-ons", "Logs kept for 90 days"].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button type="button" whileTap={{ scale: 0.96 }} className="mt-auto h-12 rounded-full bg-white text-[15px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#67e8f9] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d1d1f]">
                Start free
              </motion.button>
            </div>
          </div>
        </Reveal>
        <p className="m-0 mt-6 text-center text-[13px] text-[#6e6e73]">Prices in US dollars, before tax. Cancel from settings in two clicks.</p>
      </div>
    </section>
  );
}

const QUOTES = [
  { q: "I used to spend Sunday night chasing invoices. Now I read a list of four things on Monday and I'm done before the kettle boils.", n: "Dana Whitlock", c: "Owner, Copperleaf Dental" },
  { q: "The rules are switches, which is why I trust it. It cannot email a customer without me.", n: "Marcus Oyelaran", c: "Ops lead, Halden Freight" },
  { q: "We tried a workflow builder with forty node types. Simplistic has four questions, and our team actually uses it.", n: "Sofia Lind", c: "COO, Birch & Vale" },
  { q: "The morning brief replaced our stand-up for the stock numbers. Ten minutes back, every day.", n: "Ravi Menon", c: "Founder, Pinewood Supply" },
];

function Quotes() {
  return (
    <section className="py-20" aria-label="What customers say">
      <Marquee speed={24}>
        {QUOTES.map((q) => (
          <figure key={q.n} className={`${card} m-0 mx-2.5 flex w-[340px] flex-none flex-col gap-5 p-7 sm:w-[380px]`}>
            <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
            <figcaption className="text-[14px] text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span>, {q.c}</figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}

export function SimplisticSaaSPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT }}>
        <style>{FONT_CSS}</style>
        <Nav dark brand={<Logo />} accent={CT} cta="Start free" onCta={() => scrollToId("pricing")} links={[{ label: "How it works", id: "how" }, { label: "Agents", id: "agents" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <main>
          <Hero />
            <Principles />
          <HowItWorks />
          <Control />
          <Pricing />
          <Quotes />
          <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead title="Good questions." accent={CT} />
            <Reveal y={16}>
              <Faq
                accent={CT}
                items={[
                  { q: "What if an agent gets something wrong?", a: "Every run is logged step by step and can be undone for 24 hours. Anything you marked as risky never happens without your yes, so the worst case is usually a draft you delete." },
                  { q: "Which models do the agents use?", a: "A mix of hosted language models, chosen per step for cost and accuracy. Your data is not used to train them, and you can see which model handled each step in the log." },
                  { q: "Do I need to write prompts?", a: "No. You describe the job in a sentence, pick a trigger, connect tools and set rules with switches. You can edit the instructions if you want to, but most people never do." },
                  { q: "Can it run during the day too?", a: "Yes. Night is the default because nobody is waiting on the results, but any agent can run on a file, an email or a button press." },
                  { q: "Where is my data stored?", a: "In the EU or US region you choose at sign-up, encrypted at rest. Connected tools use scoped access you can revoke at any time." },
                ]}
              />
            </Reveal>
          </section>
          <div className="mx-auto max-w-[1180px] px-5 pb-20">
            <CtaBand title="Hand over one boring job tonight." sub="Set up your first agent in about four minutes. It is free, and it asks before it does anything risky." cta="Start with one agent" secondary="Book a 15-minute call" accent={CT} glow="rgba(8,145,178,.22)" dark={false} />
          </div>
        </main>
        <Footer brand={<Logo />} note="Quiet AI agents for small teams. They work at night and ask before anything risky." columns={[{ title: "Product", links: ["How it works", "Agents", "Pricing", "Changelog"] }, { title: "Trust", links: ["Security", "Data regions", "Status", "Logs and undo"] }, { title: "Company", links: ["About", "Careers", "Privacy", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default SimplisticSaaSPage;
