"use client";
/**
 * Lumis: landing page template for an AI automation agency that builds and
 * runs custom AI agents for businesses. Built on Motion Kit: Upload Chips,
 * Matrix Loaders, Swipe Stack (as a draft review queue), Standing Calendar,
 * Expanding Card, Elastic Stepper, Ruler Picker, Price Odometer digits and
 * Progress Button, plus the shared template parts.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, animate, motion, motionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import ExpandableCard from "@/components/templates/kit/components/ExpandableCard";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import RulerPicker from "@/components/templates/kit/components/RulerPicker";
import ProgressButton from "@/components/templates/kit/components/ProgressButton";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import UploadChips from "@/components/templates/lumis/UploadChips";
import ReviewStack from "@/components/templates/lumis/ReviewStack";
import StandingCalendar from "@/components/templates/lumis/StandingCalendar";
import { StickyStory } from "@/components/templates/lumis/StickyStory";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Spotlight, Stagger, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#a21caf"; // fuchsia, 6.3:1 on white
const SOFT = "#fdf4ff";
const spring = { type: "spring", stiffness: 320, damping: 28 } as const;

function useMq(q: string) {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8 9L16 23L24 9" fill="none" stroke={A} strokeWidth="2.4" strokeLinecap="round" opacity=".35" />
        <circle cx="8" cy="9" r="4" fill={A} />
        <circle cx="24" cy="9" r="4" fill={A} />
        <motion.circle cx="16" cy="23" r="4" fill="#1d1d1f" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} style={{ originX: "16px", originY: "23px" }} />
      </svg>
      Lumis
    </span>
  );
}

/* ------------------------------------------------------------------ hero: live workflow canvas */

type Kind = "trigger" | "agent" | "human" | "done";
interface Step { k: Kind; t: string; s: string }
const TASKS: { label: string; hours: number; who: string; steps: Step[] }[] = [
  {
    label: "Answer support email", hours: 26, who: "Ana",
    steps: [
      { k: "trigger", t: "New email arrives at support@", s: "Trigger" },
      { k: "agent", t: "Reads it and finds the order", s: "Agent · 2 s" },
      { k: "agent", t: "Drafts a reply from your help docs", s: "Agent · 6 s" },
      { k: "human", t: "Your team checks the draft", s: "Human" },
      { k: "done", t: "Sends it and tags the ticket", s: "Done" },
    ],
  },
  {
    label: "Chase unpaid invoices", hours: 9, who: "Rui",
    steps: [
      { k: "trigger", t: "Invoice is 7 days overdue", s: "Trigger" },
      { k: "agent", t: "Checks the bank feed for payment", s: "Agent · 1 s" },
      { k: "agent", t: "Writes a nudge in your tone", s: "Agent · 4 s" },
      { k: "human", t: "Finance approves the batch", s: "Human" },
      { k: "done", t: "Sends and books the next reminder", s: "Done" },
    ],
  },
  {
    label: "Qualify new leads", hours: 14, who: "Sam",
    steps: [
      { k: "trigger", t: "Someone fills in your contact form", s: "Trigger" },
      { k: "agent", t: "Researches the company", s: "Agent · 20 s" },
      { k: "agent", t: "Scores it against your best customers", s: "Agent · 3 s" },
      { k: "human", t: "Sales lead reviews the score", s: "Human" },
      { k: "done", t: "Books a call or sends a guide", s: "Done" },
    ],
  },
  {
    label: "Book jobs from calls", hours: 18, who: "Lena",
    steps: [
      { k: "trigger", t: "Missed call leaves a voicemail", s: "Trigger" },
      { k: "agent", t: "Transcribes it and finds the job", s: "Agent · 5 s" },
      { k: "agent", t: "Finds a free slot on the crew rota", s: "Agent · 2 s" },
      { k: "human", t: "Dispatcher confirms the slot", s: "Human" },
      { k: "done", t: "Texts the customer their booking", s: "Done" },
    ],
  },
];

interface NodeMV { px: MotionValue<number>; py: MotionValue<number>; dx: MotionValue<number>; dy: MotionValue<number> }

const ICONS: Record<Kind, string> = {
  trigger: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  agent: "M12 3v3M5 9h14v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zM9 13h.01M15 13h.01M9 17h6",
  human: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  done: "M5 12.5l4.5 4.5L19 7.5",
};

function Wire({ id, a, b, nw, nh, vertical, drawn, live }: { id: string; a: NodeMV; b: NodeMV; nw: number; nh: number; vertical: boolean; drawn: boolean; live: boolean }) {
  const d = useTransform([a.px, a.py, a.dx, a.dy, b.px, b.py, b.dx, b.dy], (v: number[]) => {
    const [ax, ay, adx, ady, bx, by, bdx, bdy] = v;
    if (vertical) {
      const x1 = ax + adx + nw / 2, y1 = ay + ady + nh, x2 = bx + bdx + nw / 2, y2 = by + bdy;
      const my = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
    }
    const x1 = ax + adx + nw, y1 = ay + ady + nh / 2, x2 = bx + bdx, y2 = by + bdy + nh / 2;
    const mx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  });
  return (
    <g>
      <motion.path d={d} fill="none" stroke="#c7c7cc" strokeWidth={1.5} strokeDasharray="3 6" strokeLinecap="round" />
      <motion.path id={id} d={d} fill="none" stroke={A} strokeWidth={2.2} strokeLinecap="round" initial={false} animate={{ pathLength: drawn ? 1 : 0, opacity: drawn ? 1 : 0 }} transition={{ type: "spring", stiffness: 90, damping: 20 }} />
      {live && (
        <circle r="4.5" fill={A}>
          <animateMotion dur="1.5s" repeatCount="indefinite"><mpath href={`#${id}`} /></animateMotion>
        </circle>
      )}
    </g>
  );
}

function WorkflowCanvas() {
  const fine = useMq("(hover: hover) and (pointer: fine)");
  const reduce = useReducedMotion();
  const area = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState({ w: 0, nw: 196, vertical: false });
  const [nodes] = useState<NodeMV[]>(() => Array.from({ length: 5 }, () => ({ px: motionValue(0), py: motionValue(0), dx: motionValue(0), dy: motionValue(0) })));
  const [task, setTask] = useState(0);
  const [s, setS] = useState(0); // how many nodes are visible
  const [approved, setApproved] = useState(false);
  const [saved, setSaved] = useState(312);
  const touched = useRef(false);
  const NH = 96;

  // Lay the five nodes out in a zigzag row, or a zigzag column when narrow.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const place = () => {
      const w = el.clientWidth;
      const vertical = w < 880;
      const nw = vertical ? Math.min(220, w * 0.62) : Math.min(196, (w - 4 * 30) / 5);
      const h = vertical ? 540 : 300;
      const ys = [0.52, 0.12, 0.7, 0.18, 0.56];
      nodes.forEach((n, i) => {
        if (vertical) { n.px.set(i % 2 ? w - nw : 0); n.py.set(i * ((h - NH) / 4)); }
        else { n.px.set(i * ((w - nw) / 4)); n.py.set(ys[i] * (h - NH)); }
      });
      setGeo({ w, nw, vertical });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [nodes]);

  const resetOffsets = () => nodes.forEach((n) => { animate(n.dx, 0, spring); animate(n.dy, 0, spring); });

  const pick = (i: number) => {
    touched.current = true;
    setTask(i); setS(0); setApproved(false); resetOffsets();
  };

  // The run: nodes appear one by one, the human step waits for approval, then it finishes.
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    if (s < 4) t = setTimeout(() => setS(s + 1), s === 0 ? 450 : 700);
    else if (s === 4 && !approved) { if (!touched.current) t = setTimeout(() => setApproved(true), 2300); }
    else if (s === 4 && approved) t = setTimeout(() => { setS(5); setSaved((v) => v + TASKS[task].hours); }, 450);
    else if (s === 5 && !touched.current) t = setTimeout(() => { setTask((k) => (k + 1) % TASKS.length); setS(0); setApproved(false); nodes.forEach((n) => { animate(n.dx, 0, spring); animate(n.dy, 0, spring); }); }, 3600);
    return () => clearTimeout(t);
  }, [s, approved, task, nodes]);

  const T = TASKS[task];
  const waiting = s === 4 && !approved;

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={area}
        role="group"
        aria-label={`Workflow preview: ${T.label}`}
        className="relative w-full"
        style={{ height: geo.vertical ? 540 : 300 }}
      >
        {geo.w > 0 && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <Wire key={`${task}-${i}`} id={`lumis-wire-${i}`} a={nodes[i]} b={nodes[i + 1]} nw={geo.nw} nh={NH} vertical={geo.vertical} drawn={s > i + 1} live={!reduce && s > i + 1} />
            ))}
          </svg>
        )}
        {T.steps.map((st, i) => {
          const shown = s > i;
          const human = st.k === "human";
          const done = st.k === "done";
          return (
            <motion.div
              key={i}
              drag={fine}
              dragConstraints={area}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => (touched.current = true)}
              whileDrag={{ scale: 1.04, zIndex: 20 }}
              className={`absolute ${fine ? "cursor-grab active:cursor-grabbing" : ""}`}
              style={{ left: nodes[i].px, top: nodes[i].py, x: nodes[i].dx, y: nodes[i].dy, width: geo.nw, height: NH, opacity: geo.w ? 1 : 0 }}
            >
              <div className="absolute inset-0 rounded-[20px] border-[1.5px] border-dashed border-[#d2d2d7]" aria-hidden="true" />
              <motion.div
                className="relative flex h-full flex-col justify-between rounded-[20px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_18px_30px_-20px_rgba(0,0,0,.4)]"
                initial={false}
                animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.85, y: shown ? 0 : 8 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                style={human && waiting ? { boxShadow: `0 0 0 2px ${A}, 0 18px 30px -20px rgba(0,0,0,.4)` } : undefined}
              >
                <span className="flex items-start gap-2">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: done && s > 4 ? "#248a3d" : human ? "#1d1d1f" : st.k === "trigger" ? "#f0f0f3" : SOFT, color: done && s > 4 ? "#fff" : human ? "#fff" : st.k === "trigger" ? "#1d1d1f" : A }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[st.k]} /></svg>
                  </span>
                  <span className="text-[13px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#1d1d1f] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">{st.t}</span>
                </span>
                {human ? (
                  <AnimatePresence mode="popLayout" initial={false}>
                    {approved ? (
                      <motion.span key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-[12px] font-medium text-[#248a3d]">Approved by {T.who}</motion.span>
                    ) : (
                      <motion.button
                        key="ask"
                        type="button"
                        disabled={!waiting}
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => { touched.current = true; setApproved(true); }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0, scale: waiting ? [1, 1.05, 1] : 1 }}
                        transition={{ scale: { duration: 1.2, repeat: waiting ? Infinity : 0 }, default: spring }}
                        className="h-7 w-fit rounded-full px-3 text-[12px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60"
                        style={{ background: A, ["--tw-ring-color" as string]: A }}
                      >
                        {waiting ? "Approve" : "Waiting"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                ) : (
                  <span className="text-[12px] tabular-nums text-[#6e6e73]">{done && s > 4 ? `Done · ${T.hours} h a week back` : st.s}</span>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-4 border-t border-black/[.06] pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Pick a job your team would happily give away</span>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Example workflows">
            {TASKS.map((t, i) => (
              <button key={t.label} type="button" aria-pressed={task === i} onClick={() => pick(i)} className="relative h-9 rounded-full px-4 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ color: task === i ? "#fff" : "#1d1d1f", ["--tw-ring-color" as string]: A }}>
                {task === i ? <motion.span layoutId="lumis-task" className="absolute inset-0 rounded-full" style={{ background: A }} transition={{ type: "spring", stiffness: 480, damping: 34 }} /> : <span className="absolute inset-0 rounded-full bg-[#f0f0f3]" />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-[18px] px-4 py-3" style={{ background: SOFT }}>
          <span className="flex flex-col">
            <span className="text-[12px] font-medium text-[#6e6e73]">Hours handed back this week</span>
            <span className="text-[30px] font-semibold leading-[1.1] tracking-[-0.04em] tabular-nums" style={{ color: A }}><RollingNumber value={saved} /></span>
          </span>
          <span className="max-w-[160px] text-[12px] leading-[1.35] text-[#6e6e73]" aria-live="polite">
            {waiting ? "Waiting on a human. Press Approve." : s === 5 ? `+${T.hours} h from this workflow` : fine ? "Drag the nodes around." : "Watch it run."}
          </span>
        </div>
      </div>
      <ol className="sr-only">{T.steps.map((st) => <li key={st.t}>{st.s}: {st.t}</li>)}</ol>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative px-3 pb-10 pt-4 sm:px-5 sm:pt-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_40px_80px_-50px_rgba(162,28,175,.45)]"
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ backgroundImage: "radial-gradient(rgba(0,0,0,.09) 1px, transparent 1px)", backgroundSize: "22px 22px", maskImage: "linear-gradient(180deg,#000,rgba(0,0,0,.5))" }} />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full" aria-hidden="true" style={{ background: "radial-gradient(closest-side, rgba(217,70,239,.20), transparent)" }} />
        <div className="relative flex flex-col gap-8 p-5 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-end">
            <div className="flex flex-col items-start gap-5">
              <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.1 }} className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]">
                <motion.span className="h-2 w-2 rounded-full" style={{ background: A }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                AI automation agency · 61 agents in production
              </motion.span>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.15 }} className="m-0 text-[clamp(40px,6.4vw,84px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
                AI agents for the <span style={{ color: A }}>boring half</span> of your business.
              </motion.h1>
            </div>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.25 }} className="flex flex-col gap-5">
              <p className="m-0 text-[clamp(17px,1.6vw,19px)] leading-[1.45] tracking-[-0.01em] text-[#6e6e73]">
                We design, build and run custom agents for companies with 10 to 500 people. They work inside the tools you already use, and they ask a person before anything important goes out.
              </p>
              <div className="flex flex-wrap gap-3">
                <Magnetic className="text-white shadow-[0_10px_30px_-12px_rgba(162,28,175,.8)]" style={{ background: A, ["--tw-ring-color" as string]: A }} onClick={() => scrollToId("book")}>Book a 30-min call</Magnetic>
                <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)]" style={{ ["--tw-ring-color" as string]: A }} onClick={() => scrollToId("work")}>See client results</Magnetic>
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.35 }}>
            <WorkflowCanvas />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ proof + services */

function Proof() {
  const items = [
    { to: 61, f: (n: number) => `${Math.round(n)}`, l: "agents running for clients today" },
    { to: 38, f: (n: number) => `${Math.round(n)}k`, l: "hours handed back in 2026 so far" },
    { to: 6, f: (n: number) => `${Math.round(n)} wks`, l: "median from first call to live" },
    { to: 100, f: (n: number) => `${Math.round(n)}%`, l: "of outbound messages checked by a rule you set" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14" aria-label="Lumis in numbers">
      <Stagger className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((it) => (
          <div key={it.l} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(38px,4.6vw,54px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] leading-[1.4] text-[#6e6e73]">{it.l}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

const SERVICES = [
  { p: 0, t: "Support agents", d: "Triage the inbox, answer the routine questions from your docs, and hand the tricky ones to a person with a summary.", n: "Typically 20–30 h a week back" },
  { p: 2, t: "Finance agents", d: "Match payments, chase late invoices, and prepare month-end reconciliations for your accountant to sign off.", n: "Typically 8–12 h a week back" },
  { p: 4, t: "Sales agents", d: "Research every inbound lead, score it against your best customers, and book the good ones straight into a calendar.", n: "Replies in minutes, not days" },
  { p: 1, t: "Phone agents", d: "Pick up missed calls and voicemails, understand the job, and offer a real slot from your rota by text.", n: "No more lost after-hours calls" },
];

function Services() {
  return (
    <section id="services" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="What we build" title="Four kinds of agent cover most of the dull work." sub="Every agent is built for one job in one company. We don't sell a platform, we hand you working software and stay to look after it." accent={A} />
        <Stagger className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {SERVICES.map((s) => (
            <Spotlight key={s.t} className={`${card} h-full p-7`} color="rgba(217,70,239,.10)">
              <div className="flex h-full flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: SOFT }}><MatrixLoader pattern={s.p} size={30} color={A} /></span>
                  <h3 className="m-0 text-[22px] font-semibold tracking-[-0.025em] text-[#1d1d1f]">{s.t}</h3>
                </div>
                <p className="m-0 text-[16px] leading-[1.5] text-[#6e6e73]">{s.d}</p>
                <span className="mt-auto text-[13px] font-semibold" style={{ color: A }}>{s.n}</span>
              </div>
            </Spotlight>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ process story */

function TestBoard() {
  const rows = [
    { p: 0, t: "Replaying 1,240 past tickets", s: "Week 3 · 82% matched your best replies" },
    { p: 3, t: "Checking every refund rule", s: "14 of 14 policies covered" },
    { p: 5, t: "Red-teaming angry customers", s: "60 hostile emails, 0 promises made" },
    { p: 2, t: "Load test, Monday-morning volume", s: "p95 reply drafted in 7.4 s" },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col gap-1 p-4`}>
      <span className="px-3 pb-2 pt-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">Test runs before launch</span>
      {rows.map((r, i) => (
        <motion.div key={r.t} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: i * 0.08 }} className="flex items-center gap-4 rounded-2xl px-3 py-3 hover:bg-[#f5f5f7]">
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

function Process() {
  return (
    <section id="process" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead eyebrow="How a project runs" title="Live in about six weeks, with you in the loop the whole way." accent={A} />
      <div className="mt-6">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Week 1 · Audit", title: "We sit with the people doing the work.", body: "Two days of shadowing and a pile of real examples. Send us macros, exports and screen recordings; we come back with the three jobs worth automating first, and the ones that aren't.", visual: <div className={`${card} w-[440px] p-6`}><UploadChips accent={A} autoplay /></div> },
            { kicker: "Weeks 2–4 · Build", title: "Agents trained on your history, tested on it too.", body: "We build against your real data, then replay months of past work through the agent before a customer ever sees it. You get the scores, not a demo.", visual: <TestBoard /> },
            { kicker: "Week 5 · Approve", title: "Nothing goes out until a person says so.", body: "Every draft lands in a review queue in Slack or the browser. Swipe right to send, left to hold. As trust builds, you choose which kinds of message can skip the queue.", visual: <div className={`${card} p-6`}><ReviewStack accent={A} autoplay /></div> },
            { kicker: "Week 6 on · Run", title: "We run it, watch it, and send you the numbers.", body: "Monitoring, fixes and monthly tuning are part of the deal. Each column is a day of work your agents handled; stand the grid up to see the busy weeks.", visual: <div className={`${card} w-[600px] p-6`}><StandingCalendar weeks={26} noun="tasks handled" autoplay /></div> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ case studies */

function Work() {
  return (
    <section id="work" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Client results" title="Small teams, real hours back." sub="Open a card to read the story. Numbers are measured over the first three months after launch." accent={A} />
          <Reveal y={14}>
            <figure className={`${card} m-0 flex flex-col gap-4 p-7`}>
              <blockquote className="m-0 text-[19px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">&ldquo;I expected a chatbot. We got three agents that do the work my team dreaded, and a monthly report that tells me exactly how much.&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3 text-[14px] text-[#6e6e73]">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: A }} aria-hidden="true">PM</span>
                <span><span className="font-semibold text-[#1d1d1f]">Priya Menon</span> · COO, Kestrel Freight</span>
              </figcaption>
            </figure>
          </Reveal>
        </div>
        <Reveal y={16} className="flex justify-center">
          <ExpandableCard
            autoplay
            cards={[
              { id: "brightline", eyebrow: "Dental · 12 clinics", title: "The front desk got its afternoons back", art: "radial-gradient(120% 90% at 20% 10%,#fae8ff 0%,rgba(250,232,255,0) 60%),radial-gradient(90% 80% at 90% 90%,#f0abfc 0%,rgba(240,171,252,0) 60%),#fdf4ff", body: ["Receptionists at Brightline spent half of every afternoon on reschedules and insurance emails. A phone agent now handles reschedules by text, and an inbox agent answers insurance questions from each clinic's own policy sheet.", "31 hours a week back across 12 clinics, and no-shows down 18% because reminders now go out on time, every time."] },
              { id: "kestrel", eyebrow: "Freight · 40 people", title: "Invoices that chase themselves", art: "radial-gradient(120% 90% at 20% 10%,#ffe4e6 0%,rgba(255,228,230,0) 60%),radial-gradient(90% 80% at 90% 90%,#e9d5ff 0%,rgba(233,213,255,0) 60%),#faf5ff", body: ["Kestrel's two-person finance team was a month behind on chasing. Their finance agent checks the bank feed each morning, drafts reminders in their tone and queues them for one batch approval.", "Average days to get paid fell from 47 to 29, and the team closed the month on the 3rd instead of the 12th."] },
            ]}
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ROI + pricing */

function Roi() {
  const [people, setPeople] = useState(3);
  const [hours, setHours] = useState(12);
  const monthly = Math.round((people * hours * 52 * 0.6) / 12);
  const value = Math.round(monthly * 32);
  const payback = value ? Math.max(1, Math.round(18000 / (value / 4.33))) : 0;
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead eyebrow="Is it worth it?" title="Do the maths before you call us." sub="Tell us how many people do the work and for how long. We assume the agent takes 60% of it, which is our median across 2026 projects." accent={A} center />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal y={16}>
          <div className={`${card} flex h-full flex-col gap-8 p-7`}>
            <div className="flex flex-col items-start gap-3">
              <span className="text-[15px] font-semibold text-[#1d1d1f]">People doing this work</span>
              <ElasticStepper label="People" min={1} max={20} defaultValue={3} accent={A} onChange={setPeople} />
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[15px] font-semibold text-[#1d1d1f]">Hours each, per week</span>
              <Fit><RulerPicker min={0} max={40} defaultValue={12} unit="h" presets={[5, 10, 20, 30]} accent={A} onChange={setHours} /></Fit>
            </div>
          </div>
        </Reveal>
        <Reveal y={16} delay={0.08}>
          <div className="flex h-full flex-col justify-between gap-8 rounded-[28px] bg-[#1d1d1f] p-7 text-white">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] font-medium text-[#a1a1a6]">Hours back each month</span>
              <span className="text-[clamp(56px,8vw,84px)] font-semibold leading-[1] tracking-[-0.05em] tabular-nums"><RollingNumber value={monthly} /></span>
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[#a1a1a6]">Worth, at €32 an hour</span>
                <span className="text-[30px] font-semibold tracking-[-0.03em] tabular-nums">€<RollingNumber value={value} /></span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-[#a1a1a6]">A €18k build pays back in</span>
                <span className="text-[30px] font-semibold tracking-[-0.03em] tabular-nums"><RollingNumber value={payback} /> wks</span>
              </div>
            </div>
            <span className="text-[13px] leading-[1.45] text-[#a1a1a6]">An estimate, not a promise. The audit gives you a real number for your team before you spend more.</span>
          </div>
        </Reveal>
      </div>
      <Stagger className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { n: "Audit", p: "€4,500", d: "One week. A written plan with the three jobs worth automating. Credited in full if you build with us." },
          { n: "Build", p: "from €18k", d: "Three to five weeks per agent, tested on your history, launched behind a review queue." },
          { n: "Run", p: "€1,200 / mo", d: "Per agent. Hosting, monitoring, fixes, monthly tuning and a report you can forward to your CFO." },
        ].map((t) => (
          <div key={t.n} className={`${card} flex h-full flex-col gap-2 p-6`}>
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{t.n}</span>
              <span className="text-[17px] font-semibold tabular-nums" style={{ color: A }}>{t.p}</span>
            </span>
            <span className="text-[14px] leading-[1.5] text-[#6e6e73]">{t.d}</span>
          </div>
        ))}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ booking */

const DAYS = [
  { d: "Mon", n: "2 Nov", taken: [1, 4] },
  { d: "Tue", n: "3 Nov", taken: [0, 2, 3] },
  { d: "Wed", n: "4 Nov", taken: [5] },
  { d: "Thu", n: "5 Nov", taken: [0, 1] },
  { d: "Fri", n: "6 Nov", taken: [2, 3, 4] },
];
const SLOTS = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];

function Book() {
  const [day, setDay] = useState(2);
  const [slot, setSlot] = useState(1);
  const D = DAYS[day];
  const free = !D.taken.includes(slot);
  return (
    <section id="book" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Book a call" title="Thirty minutes, no slides." sub="Bring one job that eats your team's week. You'll talk to an engineer, not a salesperson, and leave knowing whether an agent can do it." accent={A} />
          <Stagger className="flex flex-col gap-4">
            {["We ask how the work is done today", "We tell you honestly if it's a fit", "You get a written follow-up within a day"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: SOFT, color: A }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={16}>
          <div className={`${card} flex flex-col gap-6 p-6 sm:p-7`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Pick a time</span>
              <span className="text-[12px] text-[#6e6e73]">Times shown in Lisbon (WET)</span>
            </div>
            <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Day">
              {DAYS.map((x, i) => (
                <button key={x.n} type="button" role="radio" aria-checked={day === i} onClick={() => setDay(i)} className="relative flex h-16 flex-col items-center justify-center rounded-[16px] text-center outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ ["--tw-ring-color" as string]: A }}>
                  {day === i ? <motion.span layoutId="lumis-day" className="absolute inset-0 rounded-[16px]" style={{ background: A }} transition={{ type: "spring", stiffness: 460, damping: 34 }} /> : <span className="absolute inset-0 rounded-[16px] bg-[#f5f5f7]" />}
                  <span className="relative text-[12px] font-medium" style={{ color: day === i ? "#fae8ff" : "#6e6e73" }}>{x.d}</span>
                  <span className="relative text-[15px] font-semibold tabular-nums" style={{ color: day === i ? "#fff" : "#1d1d1f" }}>{x.n}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Time">
              {SLOTS.map((t, i) => {
                const taken = D.taken.includes(i);
                const on = slot === i && !taken;
                return (
                  <motion.button key={t} type="button" role="radio" aria-checked={on} disabled={taken} onClick={() => setSlot(i)} whileTap={{ scale: 0.95 }} className="relative h-11 rounded-[14px] text-[14px] font-medium tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed" style={{ ["--tw-ring-color" as string]: A, color: taken ? "#6e6e73" : on ? A : "#1d1d1f", textDecoration: taken ? "line-through" : undefined }}>
                    <span className="absolute inset-0 rounded-[14px]" style={{ boxShadow: on ? `inset 0 0 0 2px ${A}` : "inset 0 0 0 1px rgba(0,0,0,.1)", background: taken ? "#f5f5f7" : on ? SOFT : "#fff" }} />
                    <span className="relative">{t}</span>
                  </motion.button>
                );
              })}
            </div>
            <div className="flex flex-col items-start gap-4 border-t border-black/[.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[14px] text-[#1d1d1f]" aria-live="polite">
                {free ? <><span className="font-semibold">{D.d} {D.n}, {SLOTS[slot]}</span> · 30 min video call</> : "That slot just went. Pick another."}
              </span>
              <ProgressButton key={`${day}-${slot}`} label="Book the call" doneLabel="Add to calendar" accent={A} />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export function ClauraAgencyPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Book a call" onCta={() => scrollToId("book")} links={[{ label: "Services", id: "services" }, { label: "Process", id: "process" }, { label: "Results", id: "work" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Proof />
        <Services />
        <Process />
        <Work />
        <Roi />
        <Book />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="The questions everyone asks." accent={A} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "Do we need technical people on our side?", a: "No. We need someone who knows the work and an hour a week of their time during the build. We handle the models, hosting and integrations." },
                { q: "Which tools can the agents work in?", a: "Email, Slack or Teams, the common helpdesks and CRMs, Google Workspace and Microsoft 365, your accounting software, and anything with an API. If it has none, we'll tell you in the audit." },
                { q: "What happens when an agent gets something wrong?", a: "It shouldn't reach a customer, because new agents send nothing without approval. When a draft is wrong, you hold it, and we use it to retrain. You decide when any message type can skip review." },
                { q: "Where does our data go?", a: "Into your own cloud account or a dedicated one we run in the EU. Model providers are contracted not to train on it, and we sign a data processing agreement before the audit starts." },
                { q: "Can we stop paying for Run and keep the agent?", a: "Yes. You own the code and the prompts. We hand over a runbook, and you can host it yourself or with someone else." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Give the boring half to an agent." sub="Book a 30-minute call. If we can't save your team at least ten hours a week, we'll say so." cta="Book a call" secondary="Read client results" accent={A} glow="rgba(217,70,239,.32)" />
        </div>
        <Footer brand={<Logo />} note="Custom AI agents, built and run for small and mid-sized companies. Based in Lisbon, working across Europe." columns={[{ title: "Agents", links: ["Support", "Finance", "Sales", "Phone"] }, { title: "Company", links: ["Process", "Results", "Careers", "Contact"] }, { title: "Trust", links: ["Security", "Data processing", "Status"] }]} />
      </div>
    </MotionConfig>
  );
}

export default ClauraAgencyPage;

