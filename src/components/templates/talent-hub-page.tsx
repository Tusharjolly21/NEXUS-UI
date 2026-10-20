"use client";
/**
 * TalentHub: landing page template for a staffing agency that places vetted
 * remote professionals with startups. Built on Motion Kit: Bubble Cluster (the
 * talent bench), Stagger Menu, Swipe Stack (a candidate shortlist), Folder
 * Peek, Todo List and Price Odometer, plus the shared template parts.
 */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import StaggerMenu from "@/components/templates/kit/components/StaggerMenu";
import FolderPeek from "@/components/templates/kit/components/FolderPeek";
import TodoList from "@/components/templates/kit/components/TodoList";
import TalentPool from "@/components/templates/talent-hub/TalentPool";
import CandidateStack from "@/components/templates/talent-hub/CandidateStack";
import HireOdometer from "@/components/templates/talent-hub/HireOdometer";
import { StickyStory } from "@/components/templates/talent-hub/StickyStory";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, card, scrollToId } from "@/components/templates/kit/parts";

const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#0369a1"; // sky, 5.9:1 on white
const TINT = "#e0f2fe";
const spring = { type: "spring", stiffness: 320, damping: 28 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="16" cy="16" r="13" fill={TINT} />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} style={{ originX: "16px", originY: "16px" }}>
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            return <circle key={i} cx={16 + Math.cos(a) * 9} cy={16 + Math.sin(a) * 9} r="3.4" fill={A} />;
          })}
        </motion.g>
        <circle cx="16" cy="16" r="3" fill="#1d1d1f" />
      </svg>
      TalentHub
    </span>
  );
}

/* ------------------------------------------------------------------ hero: shared-hours planner */

const CITIES = [
  { name: "San Francisco", off: -8 },
  { name: "New York", off: -5 },
  { name: "London", off: 0 },
  { name: "Berlin", off: 1 },
];

// Where our people are, their UTC offset, the local hour their day starts, and how many are available now.
const HUBS = [
  { name: "Bogotá", off: -5, start: 9, people: 46 },
  { name: "Buenos Aires", off: -3, start: 9, people: 63 },
  { name: "Lisbon", off: 0, start: 9, people: 38 },
  { name: "Kraków", off: 1, start: 9, people: 41 },
  { name: "Cape Town", off: 2, start: 9, people: 29 },
  { name: "Manila", off: 8, start: 21, people: 72, note: "night shift" },
];

const LEN = 8;
const mod = (n: number) => ((n % 24) + 24) % 24;
const fmt = (h: number) => `${Math.floor(mod(h)).toString().padStart(2, "0")}:${h % 1 ? "30" : "00"}`;

/** Splits a block that may run past midnight into one or two [start, end) pieces inside 0–24. */
function pieces(start: number): [number, number][] {
  const s = mod(start);
  return s + LEN <= 24 ? [[s, s + LEN]] : [[s, 24], [0, s + LEN - 24]];
}
function intersect(a: [number, number][], b: [number, number][]) {
  const out: [number, number][] = [];
  for (const [a0, a1] of a) for (const [b0, b1] of b) {
    const lo = Math.max(a0, b0), hi = Math.min(a1, b1);
    if (hi > lo) out.push([lo, hi]);
  }
  return out;
}

function Planner() {
  const [city, setCity] = useState(1);
  const [s, setS] = useState(9); // your day starts at this local hour
  const track = useRef<HTMLDivElement>(null);
  const [tw, setTw] = useState(0);
  const bx = useMotionValue(0);
  const off = CITIES[city].off;
  const you: [number, number][] = [[s, s + LEN]];

  const rows = HUBS.map((h) => {
    const base = pieces(h.start - h.off + off);
    const ov = intersect(you, base);
    const hours = ov.reduce((t, [a, b]) => t + b - a, 0);
    return { ...h, base, ov, hours };
  });
  const matched = rows.filter((r) => r.hours >= 4).reduce((t, r) => t + r.people, 0);
  const count = useSpring(matched, { stiffness: 140, damping: 22 });
  const shown = useTransform(count, (v) => Math.round(v).toString());
  useEffect(() => { count.set(matched); }, [matched, count]);

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const on = () => setTw(el.clientWidth);
    on();
    const ro = new ResizeObserver(on);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => { if (tw) bx.set((s / 24) * tw); }, [tw]); // eslint-disable-line react-hooks/exhaustive-deps

  useMotionValueEvent(bx, "change", (v) => {
    if (!tw) return;
    const h = Math.max(0, Math.min(24 - LEN, Math.round((v / tw) * 48) / 2));
    if (h !== s) setS(h);
  });

  const settle = (h: number) => {
    const c = Math.max(0, Math.min(24 - LEN, h));
    setS(c);
    animate(bx, (c / 24) * tw, { type: "spring", stiffness: 420, damping: 32 });
  };

  const bw = `${(LEN / 24) * 100}%`;
  const labels = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <div className={`${card} p-4 sm:p-7`}>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2.5">
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Where is your team?</span>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Your city">
            {CITIES.map((c, i) => (
              <button key={c.name} type="button" role="radio" aria-checked={city === i} onClick={() => setCity(i)} className="relative h-9 rounded-full px-3.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] focus-visible:ring-offset-2" style={{ color: city === i ? "#fff" : "#1d1d1f" }}>
                {city === i ? <motion.span layoutId="th-city" className="absolute inset-0 rounded-full" style={{ background: A }} transition={{ type: "spring", stiffness: 480, damping: 34 }} /> : <span className="absolute inset-0 rounded-full bg-[#f0f0f3]" />}
                <span className="relative">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3" aria-live="polite">
          <motion.span className="text-[clamp(48px,6vw,68px)] font-semibold leading-[0.9] tracking-[-0.05em] tabular-nums" style={{ color: A }}>{shown}</motion.span>
          <span className="max-w-[190px] pb-1 text-[13px] leading-[1.35] text-[#6e6e73]">vetted people share at least 4 hours of your {fmt(s)}–{fmt(s + LEN)} day</span>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-2.5">
        {/* hour scale */}
        <div className="grid grid-cols-1 sm:grid-cols-[150px_1fr_64px] sm:gap-4">
          <span className="hidden sm:block" />
          <div className="relative h-4 text-[11px] tabular-nums text-[#6e6e73]" aria-hidden="true">
            {labels.map((h, i) => (
              <span key={h} className={`absolute top-0 -translate-x-1/2 ${i % 2 ? "hidden sm:block" : ""} ${i === 0 ? "translate-x-0" : ""} ${i === labels.length - 1 ? "!-translate-x-full" : ""}`} style={{ left: `${(h / 24) * 100}%` }}>{fmt(h)}</span>
            ))}
          </div>
          <span className="hidden sm:block" />
        </div>

        {/* your row */}
        <div className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[150px_1fr_64px] sm:gap-4">
          <span className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:gap-0">
            <span className="text-[14px] font-semibold text-[#1d1d1f]">You · {CITIES[city].name}</span>
            <span className="text-[12px] text-[#6e6e73]">Drag your day</span>
          </span>
          <div ref={track} className="relative h-11 rounded-[12px] bg-[#f5f5f7]">
            <motion.div
              role="slider"
              tabIndex={0}
              aria-label="Your working day"
              aria-valuemin={0}
              aria-valuemax={16}
              aria-valuenow={s}
              aria-valuetext={`${fmt(s)} to ${fmt(s + LEN)}`}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") { e.preventDefault(); settle(s - 0.5); }
                if (e.key === "ArrowRight") { e.preventDefault(); settle(s + 0.5); }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: Math.max(0, tw - (LEN / 24) * tw) }}
              dragElastic={0.06}
              dragMomentum={false}
              onDragEnd={() => settle(s)}
              whileDrag={{ scaleY: 1.08 }}
              className="absolute inset-y-0 left-0 flex cursor-grab items-center justify-center rounded-[12px] text-[13px] font-semibold tabular-nums text-white shadow-[0_10px_24px_-12px_rgba(3,105,161,.9)] outline-none focus-visible:ring-2 focus-visible:ring-[#0369a1] focus-visible:ring-offset-2 active:cursor-grabbing"
              style={{ x: bx, width: bw, background: A, opacity: tw ? 1 : 0 }}
            >
              <span className="pointer-events-none flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" /></svg>
                {fmt(s)}–{fmt(s + LEN)}
              </span>
            </motion.div>
          </div>
          <span className="hidden sm:block" />
        </div>

        {/* hub rows */}
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-1 items-center gap-1.5 sm:grid-cols-[150px_1fr_64px] sm:gap-4">
            <span className="flex items-baseline justify-between gap-2 sm:flex-col sm:items-start sm:gap-0">
              <span className="text-[14px] font-medium text-[#1d1d1f]">{r.name}{r.note && <span className="text-[12px] font-normal text-[#6e6e73]"> · {r.note}</span>}</span>
              <span className="text-[12px] tabular-nums text-[#6e6e73]">{r.people} available<span className="sm:hidden"> · <b className="font-semibold" style={{ color: r.hours >= 4 ? A : "#6e6e73" }}>{r.hours} h shared</b></span></span>
            </span>
            <div className="relative h-7 overflow-hidden rounded-[9px] bg-[#f5f5f7]">
              <motion.div className="pointer-events-none absolute inset-y-0 left-0 bg-[#0369a1]/[.06]" style={{ x: bx, width: bw }} aria-hidden="true" />
              {r.base.map(([a, b], i) => (
                <motion.div key={`b${i}`} className="absolute inset-y-1 rounded-[6px] bg-[#cfe3f1]" initial={false} animate={{ left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%` }} transition={spring} aria-hidden="true" />
              ))}
              <AnimatePresence initial={false}>
                {r.ov.map(([a, b], i) => (
                  <motion.div key={`o${i}`} className="absolute inset-y-1 rounded-[6px]" style={{ background: r.hours >= 4 ? A : "#7aa7c7" }} initial={{ opacity: 0 }} animate={{ opacity: 1, left: `${(a / 24) * 100}%`, width: `${((b - a) / 24) * 100}%` }} exit={{ opacity: 0 }} transition={spring} aria-hidden="true" />
                ))}
              </AnimatePresence>
            </div>
            <span className="hidden text-right text-[14px] font-semibold tabular-nums sm:block" style={{ color: r.hours >= 4 ? A : "#6e6e73" }}>{r.hours} h</span>
          </div>
        ))}
      </div>
      <p className="m-0 mt-5 text-[12px] leading-[1.45] text-[#6e6e73]">Light bars are each city&apos;s working day, shown in your time. Dark bars are the hours you share. Times ignore daylight saving.</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(50% 45% at 15% 10%, rgba(14,165,233,.16), transparent 70%), radial-gradient(40% 40% at 90% 30%, rgba(3,105,161,.10), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-12 sm:pt-16">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div className="flex flex-col items-start gap-5">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="text-[14px] font-semibold" style={{ color: A }}>Remote staffing for startups</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.06 }} className="m-0 text-[clamp(44px,7vw,88px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
              Great people who share your <span style={{ color: A }}>working day.</span>
            </motion.h1>
          </div>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.14 }} className="flex flex-col gap-5">
            <p className="m-0 text-[clamp(17px,1.8vw,20px)] leading-[1.45] tracking-[-0.01em] text-[#6e6e73]">
              TalentHub places vetted engineers, designers and operators from Latin America, Europe, Africa and Asia with startups. We handle contracts, payroll and compliance. You get a shortlist in three days.
            </p>
            <div className="flex flex-wrap gap-3">
              <Magnetic className="text-white shadow-[0_10px_30px_-12px_rgba(3,105,161,.8)] focus-visible:ring-[#0369a1]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Start hiring</Magnetic>
              <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.1)] focus-visible:ring-[#0369a1]" onClick={() => scrollToId("process")}>How it works</Magnetic>
            </div>
            <span className="text-[13px] text-[#6e6e73]">No fee until your hire starts. Free replacement in the first 90 days.</span>
          </motion.div>
        </div>
        <motion.div className="mt-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.25 }}>
          <Planner />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ numbers + bench */

function Numbers() {
  const items = [
    { to: 2140, f: (n: number) => Math.round(n).toLocaleString("en-US"), l: "people applied last month" },
    { to: 3, f: (n: number) => `${Math.round(n)}%`, l: "made it through vetting" },
    { to: 72, f: (n: number) => `${Math.round(n)} h`, l: "median time to a shortlist" },
    { to: 94, f: (n: number) => `${Math.round(n)}%`, l: "still placed after twelve months" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14" aria-label="TalentHub in numbers">
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

const ROLES = [
  { g: "Engineering", r: ["Full-stack and frontend", "Backend and data", "DevOps and QA"] },
  { g: "Design", r: ["Product design", "Brand and marketing design", "UX research"] },
  { g: "Operations", r: ["Operations and executive support", "Customer support leads", "Bookkeeping and finance ops"] },
];

function Bench() {
  return (
    <section id="talent" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="The bench" title="Who's available this month." sub="A live slice of our bench by discipline. Bubble size is years of experience; switch discipline and the team re-forms." accent={A} />
          <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {ROLES.map((x) => (
              <div key={x.g} className="flex flex-col gap-1 border-t border-black/[.08] pt-3 lg:flex-row lg:items-baseline lg:gap-4">
                <span className="w-[110px] flex-none text-[15px] font-semibold text-[#1d1d1f]">{x.g}</span>
                <span className="text-[14px] leading-[1.5] text-[#6e6e73]">{x.r.join(" · ")}</span>
              </div>
            ))}
          </Stagger>
        </div>
        <Reveal y={16}>
          <div className={`${card} flex justify-center px-4 py-8`}>
            <Fit><TalentPool accent={A} autoplay /></Fit>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ process */

const I = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const ROLE_ITEMS = [
  { id: "fs", label: "Full-stack engineer", icon: I("M8 8l-4 4 4 4M16 8l4 4-4 4"), done: "Brief started" },
  { id: "pd", label: "Product designer", icon: I("M12 19l7-7-4-4-7 7v4h4zM14 7l3 3"), done: "Brief started" },
  { id: "ops", label: "Operations manager", icon: I("M4 6h16M4 12h10M4 18h7"), done: "Brief started" },
  { id: "sup", label: "Support lead", icon: I("M4 12a8 8 0 0 1 16 0v4a2 2 0 0 1-2 2h-1v-6h3M4 12v4a2 2 0 0 0 2 2h1v-6H4"), done: "Brief started" },
  { id: "fin", label: "Bookkeeper", icon: I("M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"), done: "Brief started" },
];

function BriefCard() {
  const [role, setRole] = useState<string | null>(null);
  const picked = ROLE_ITEMS.find((r) => r.id === role);
  return (
    <div className={`${card} flex w-[420px] flex-col gap-4 p-6`}>
      <span className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#6e6e73]">New role brief</span>
      <div className="flex h-[290px] gap-5">
        <StaggerMenu label="Role to fill" items={ROLE_ITEMS} onSelect={setRole} autoplay />
      </div>
      <div className="flex items-center gap-2 rounded-[14px] px-4 py-3 text-[14px]" style={{ background: TINT, color: "#075985" }} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={picked?.id ?? "none"} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={spring}>
            {picked ? `${picked.label} · full time · 4 h overlap` : "Pick a role and we draft the brief with you."}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Process() {
  return (
    <section id="process" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead eyebrow="How it works" title="From brief to first day in about two weeks." accent={A} />
      <div className="mt-6">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Day 1 · Brief", title: "Twenty minutes on the role, not a form.", body: "A talent partner who has hired for startups asks what the person will actually do in month one, the hours you need covered and the budget. You approve the brief before we search.", visual: <BriefCard /> },
            { kicker: "Day 3 · Shortlist", title: "Three to five people, already vetted.", body: "Every candidate has passed a skills test, a live interview and two reference calls. Swipe through your shortlist: right to book an interview, left to pass and tell us why.", visual: <div className={`${card} p-6`}><CandidateStack accent={A} autoplay /></div> },
            { kicker: "Day 5 · Interview", title: "See the paper trail, not just a CV.", body: "Each profile opens to the test they took, notes from our interview and what their last two managers said. Hover the folder to look inside.", visual: <div className={`${card} flex h-[380px] w-[420px] items-end justify-center pb-10`}><FolderPeek title="Ana Ribeiro · full-stack" meta="Code test · interview notes · 2 references" color={A} autoplay /></div> },
            { kicker: "Day 14 · Start", title: "Day one, sorted.", body: "We sign the local contract, run payroll and ship the laptop. Your onboarding list is shared with your new hire and their talent partner, who checks in at 30, 60 and 90 days.", visual: <div className={`${card} w-[420px] p-6`}><TodoList accent={A} autoplay initial={["Contract signed under Portuguese law", "Laptop shipped, arrives Thursday", "Accounts: GitHub, Slack, Linear", "30-day check-in booked"]} /></div> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ comparison */

const COMPARE = [
  { k: "Time to a shortlist", a: "4–8 weeks of sourcing", b: "3 days" },
  { k: "Contracts and payroll", a: "Your lawyer, each country", b: "Handled by us, one invoice" },
  { k: "If it doesn't work out", a: "Start again", b: "Free replacement for 90 days" },
  { k: "Upfront cost", a: "Recruiter fee, 20% of salary", b: "Nothing until they start" },
];

function Compare() {
  return (
    <section id="why" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Why a staffing partner" title="Hiring abroad yourself is possible. It's just slow." sub="Here is what changes when we do the parts that aren't interviewing." accent={A} center />
        <Reveal y={16}>
          <div className={`${card} mt-12 overflow-hidden`} role="table" aria-label="Hiring directly compared with TalentHub">
            <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-4 border-b border-black/[.06] px-5 py-4 text-[13px] font-semibold text-[#6e6e73] sm:px-8" role="row">
              <span role="columnheader" />
              <span role="columnheader">Hiring directly</span>
              <span role="columnheader" style={{ color: A }}>With TalentHub</span>
            </div>
            {COMPARE.map((c, i) => (
              <motion.div key={c.k} role="row" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ ...spring, delay: i * 0.06 }} className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-4 border-b border-black/[.06] px-5 py-5 last:border-0 sm:px-8">
                <span role="rowheader" className="text-[15px] font-semibold text-[#1d1d1f]">{c.k}</span>
                <span role="cell" className="text-[14px] text-[#6e6e73]">{c.a}</span>
                <span role="cell" className="flex items-center gap-2 text-[14px] font-medium text-[#1d1d1f]">
                  <svg className="hidden flex-none sm:block" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={A} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {c.b}
                </span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ pricing */

function Pricing() {
  const inc = ["Salary, benefits and local payroll", "Contracts and compliance in 14 countries", "Equipment and a co-working allowance", "A talent partner for 30, 60 and 90-day check-ins", "Free replacement in the first 90 days"];
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Pricing" title="One monthly price per person. Everything in it." sub="Shown for a mid-level engineer. Design and operations roles start lower; we quote every role before you interview." accent={A} />
          <Stagger className="flex flex-col gap-3.5">
            {inc.map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: TINT, color: A }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={16} className="flex justify-center">
          <HireOdometer monthlyRate={4200} yearlyRate={3800} maxSeats={25} accent={A} autoplay />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ voices */

const VOICES = [
  { q: "We hired two backend engineers in Buenos Aires in eleven days. They overlap our whole morning, which is all we needed.", n: "Maya Chen", r: "CTO, Brindle Labs · 14 people" },
  { q: "The reference calls were better than ours. One of them told us exactly how to manage our new designer, and they were right.", n: "Tom Adeyemi", r: "Founder, Quillon Health" },
  { q: "Payroll in four countries used to be my second job. Now it's one invoice on the first of the month.", n: "Sofia Lund", r: "COO, Tessel Analytics" },
];

function Voices() {
  return (
    <section className="bg-[#f5f5f7] py-20 sm:py-24" aria-label="What founders say">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="From founders" title="Small teams, long placements." accent={A} />
        <Stagger className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {VOICES.map((v) => (
            <motion.figure key={v.n} whileHover={{ y: -4 }} transition={spring} className={`${card} m-0 flex h-full flex-col justify-between gap-6 p-7`}>
              <blockquote className="m-0 text-[17px] leading-[1.5] tracking-[-0.01em] text-[#1d1d1f]">&ldquo;{v.q}&rdquo;</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: A }} aria-hidden="true">{v.n.split(" ").map((w) => w[0]).join("")}</span>
                <span className="flex flex-col text-[13px]">
                  <span className="font-semibold text-[#1d1d1f]">{v.n}</span>
                  <span className="text-[#6e6e73]">{v.r}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ page */

export function TalentHubPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SYSTEM_FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Start hiring" onCta={() => scrollToId("pricing")} links={[{ label: "Talent", id: "talent" }, { label: "Process", id: "process" }, { label: "Why us", id: "why" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Numbers />
        <Bench />
        <Process />
        <Compare />
        <Pricing />
        <Voices />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="What founders ask first." accent={A} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "Where do your people come from?", a: "Mostly Latin America and Europe for engineering and design, with operations and support teams in South Africa and the Philippines. We pick the region from the hours you need, not the other way round." },
                { q: "Are they employees or contractors?", a: "They're employed by our local entity or a vetted partner in their country, with proper contracts, holidays and benefits. They work full time on your team and only yours." },
                { q: "Can we hire them directly later?", a: "Yes. After twelve months there's no conversion fee. Before that, it's one month of the placement price." },
                { q: "What if a hire isn't working out?", a: "Tell your talent partner. In the first 90 days we find a replacement at no cost; after that, we still help, and you can end the placement with 30 days' notice." },
                { q: "Do you place people part time?", a: "Operations and support roles, yes, from 20 hours a week. Engineering and design placements are full time so the person is really part of your team." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Your next hire is already awake." sub="Tell us the role on a 20-minute call. Your shortlist arrives in three days." cta="Start hiring" secondary="Talk to a talent partner" accent={A} glow="rgba(14,165,233,.30)" />
        </div>
        <Footer brand={<Logo />} note="Vetted remote engineers, designers and operators for startups, with contracts and payroll handled." columns={[{ title: "Hire", links: ["Engineering", "Design", "Operations", "Pricing"] }, { title: "Company", links: ["How it works", "For talent", "Careers", "Contact"] }, { title: "Resources", links: ["Salary guide", "Time zone planner", "Compliance"] }]} />
      </div>
    </MotionConfig>
  );
}

export default TalentHubPage;
