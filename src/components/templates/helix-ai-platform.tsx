"use client";
/**
 * Helix: landing page template for an AI workflow automation platform where
 * agents do the work and people approve the risky steps.
 * Built from Motion Kit components: Todo List, Matrix Loaders, Stagger Menu,
 * Sign & Seal, Stretch Nav, Switch (Settings Tabs), Hold to Confirm (as a
 * kill switch) and Elastic Stepper. The hero is a live approval queue.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import TodoList from "@/components/templates/kit/components/TodoList";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import StaggerMenu from "@/components/templates/kit/components/StaggerMenu";
import SignBadge from "@/components/templates/kit/components/SignBadge";
import StretchNav from "@/components/templates/kit/components/StretchNav";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import { Switch } from "@/components/templates/kit/components/AnimatedTabs";
import HoldToPause from "@/components/templates/helix/hold-to-pause";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Words, ease, scrollToId } from "@/components/templates/kit/parts";
import { StickyStory } from "@/components/templates/kit-ports/sticky-story";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const A = "#4f46e5";
const INK = "#1d1d1f";
const C = "rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M9 4c0 8 14 8 14 16s-14 8-14 8" fill="none" stroke={A} strokeWidth="3.2" strokeLinecap="round" />
        <path d="M23 4c0 8-14 8-14 16s14 8 14 8" fill="none" stroke="#a5b4fc" strokeWidth="3.2" strokeLinecap="round" />
        <motion.circle r="2.6" fill={A} cx="16" cy="12" animate={{ y: [0, 8, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Helix
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: the approval queue                                            */
/* ------------------------------------------------------------------ */

interface Req {
  id: string;
  agent: string;
  pattern: number;
  title: string;
  risk: string;
  waiting: string;
  evidence: { t: string; flag?: boolean }[];
  ok: string;
  back: string;
}

const REQS: Req[] = [
  {
    id: "r1",
    agent: "Refunds agent",
    pattern: 0,
    title: "Refund $1,240.00 to Marisol Ortega",
    risk: "Over the $500 auto-refund limit",
    waiting: "waiting 2 min",
    evidence: [
      { t: "Order #48213 arrived damaged. Customer photo attached." },
      { t: "Customer since 2021, no previous refunds." },
      { t: "Policy R-4 allows a full refund, except for the amount.", flag: true },
    ],
    ok: "Refund of $1,240.00 sent. Ticket #48213 closed.",
    back: "Will offer $500 back plus store credit instead.",
  },
  {
    id: "r2",
    agent: "Payables agent",
    pattern: 2,
    title: "Pay invoice INV-2207 from Kestrel Freight, $18,400.00",
    risk: "Payee bank details changed 2 days ago",
    waiting: "waiting 6 min",
    evidence: [
      { t: "Invoice matches PO-5512 and the delivery receipt." },
      { t: "Bank account changed by an email request on Oct 18.", flag: true },
      { t: "The last 11 payments went to the old account.", flag: true },
    ],
    ok: "Payment to Kestrel Freight scheduled for Friday.",
    back: "Calling Kestrel on the number on file to confirm.",
  },
  {
    id: "r3",
    agent: "Access agent",
    pattern: 3,
    title: "Give Theo Lindqvist read access to the production database for 4 hours",
    risk: "Touches production data",
    waiting: "waiting 1 min",
    evidence: [
      { t: "Requested in ticket IT-3318 for incident INC-2291." },
      { t: "His manager approved the ticket." },
      { t: "Access expires on its own at 18:00." },
    ],
    ok: "Read access granted to Theo until 18:00.",
    back: "Asked Theo which tables he actually needs.",
  },
  {
    id: "r4",
    agent: "Renewals agent",
    pattern: 1,
    title: "Send 3,212 renewal reminders with a 10% loyalty discount",
    risk: "Bulk send, discount above 5%",
    waiting: "just now",
    evidence: [
      { t: "Accounts that renew in the next 30 days." },
      { t: "Copy checked against your brand guide." },
      { t: "10% is above the 5% default discount.", flag: true },
    ],
    ok: "3,212 reminders queued for 9:00 tomorrow.",
    back: "Redrafting with the 5% default discount.",
  },
  {
    id: "r5",
    agent: "Support agent",
    pattern: 5,
    title: "Merge 46 duplicate tickets into #9921 and reply once to everyone",
    risk: "Bulk change to more than 25 tickets",
    waiting: "just now",
    evidence: [
      { t: "All 46 mention the same checkout error." },
      { t: "Reply drafted from the status page update." },
      { t: "Nobody on the thread is a VIP account." },
    ],
    ok: "46 tickets merged. One reply sent.",
    back: "Will reply to each ticket separately.",
  },
];

const WORK: [string, string, number][] = [
  ["Support agent", "Answered ticket #9934 from the help center", 5],
  ["Payables agent", "Matched 38 invoices to purchase orders", 2],
  ["Refunds agent", "Issued 9 refunds under $500 on its own", 0],
  ["Access agent", "Removed 6 access grants that had expired", 3],
  ["Renewals agent", "Drafted 214 renewal emails", 1],
  ["Support agent", "Tagged 120 tickets by product area", 5],
];

type Verdict = "ok" | "back";
interface FeedItem { k: number; agent: string; text: string; pattern: number; tone?: Verdict }

function Check({ size = 12, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  );
}
function BackArrow({ size = 12, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" /></svg>
  );
}

function QueueItem({ r, open, stamp, onDecide }: { r: Req; open: boolean; stamp: Verdict | null; onDecide: (v: Verdict) => void }) {
  return (
    <motion.li
      layout
      custom={stamp}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.96, transition: { duration: 0.2 } }}
      transition={spring}
      className="relative overflow-hidden rounded-[18px]"
      style={{ background: open ? "#ffffff" : "#f5f5f7", boxShadow: open ? `0 0 0 1.5px ${A}, 0 18px 36px -24px rgba(79,70,229,.6)` : "none" }}
    >
      <motion.div layout="position" className={open ? "p-5" : "flex items-center gap-3 px-4 py-3"}>
        <div className="flex min-w-0 items-center gap-2.5">
          <MatrixLoader pattern={r.pattern} size={22} color={A} />
          <span className="flex-none text-[13px] font-semibold text-[#1d1d1f]">{r.agent}</span>
          {open && <span className="text-[13px] text-[#6e6e73]">· {r.waiting}</span>}
        </div>
        {!open && <span className="min-w-0 flex-1 truncate text-[13px] text-[#424245]">{r.title}</span>}
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }}>
            <h3 className="m-0 mt-3 text-[clamp(18px,2vw,21px)] font-semibold leading-[1.25] tracking-[-0.02em] text-[#1d1d1f]">{r.title}</h3>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fff4e0] px-2.5 py-1 text-[12px] font-semibold text-[#8a4b00]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 8v5M12 16.5v.5M10.3 3.9L2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
              Stopped: {r.risk}
            </span>
            <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0">
              {r.evidence.map((e, i) => (
                <motion.li key={e.t} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.12 + i * 0.06 }} className="flex items-start gap-2.5 text-[14px] leading-[1.4] text-[#424245]">
                  <span className="mt-[2px] flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full" style={{ background: e.flag ? "#fff4e0" : "#eef0ff" }}>
                    {e.flag ? <span className="text-[11px] font-bold text-[#8a4b00]">!</span> : <Check size={10} color={A} />}
                  </span>
                  {e.t}
                </motion.li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => onDecide("ok")} disabled={!!stamp} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-[14px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ background: A, ["--tw-ring-color" as string]: A }}>
                <Check size={13} /> Approve <kbd className="ml-1 rounded bg-white/20 px-1.5 text-[11px] font-semibold">A</kbd>
              </motion.button>
              <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => onDecide("back")} disabled={!!stamp} className="inline-flex h-11 items-center gap-2 rounded-full bg-[#f0f0f3] px-5 text-[14px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-offset-2" style={{ ["--tw-ring-color" as string]: A }}>
                <BackArrow size={13} /> Send back <kbd className="ml-1 rounded bg-black/[.07] px-1.5 text-[11px] font-semibold">R</kbd>
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>
      <AnimatePresence>
        {stamp && (
          <motion.span
            key="stamp"
            aria-hidden="true"
            initial={{ scale: 1.9, opacity: 0, rotate: -18 }}
            animate={{ scale: 1, opacity: 1, rotate: -9 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="pointer-events-none absolute right-5 top-5 rounded-[10px] border-[2.5px] px-3 py-1 text-[15px] font-bold uppercase tracking-[0.08em]"
            style={{ color: stamp === "ok" ? A : INK, borderColor: stamp === "ok" ? A : INK, background: "rgba(255,255,255,.85)" }}
          >
            {stamp === "ok" ? "Approved" : "Sent back"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function ApprovalQueue() {
  const [arrived, setArrived] = useState(3);
  const [decided, setDecided] = useState<{ id: string; v: Verdict }[]>([]);
  const [stamp, setStamp] = useState<{ id: string; v: Verdict } | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([{ k: 0, agent: WORK[0][0], text: WORK[0][1], pattern: WORK[0][2] }]);
  const [runs, setRuns] = useState(37);
  const key = useRef(1);
  const busy = useRef(false);
  const pending = REQS.slice(0, arrived).filter((r) => !decided.some((d) => d.id === r.id));
  const okCount = decided.filter((d) => d.v === "ok").length;
  const backCount = decided.length - okCount;

  const push = (agent: string, text: string, pattern: number, tone?: Verdict) => {
    const k = key.current++;
    setFeed((f) => [{ k, agent, text, pattern, tone }, ...f].slice(0, 3));
  };

  // New requests keep arriving while the agents work.
  useEffect(() => {
    const t = setInterval(() => setArrived((a) => Math.min(REQS.length, a + 1)), 9000);
    return () => clearInterval(t);
  }, []);

  // Background work that never needed a person.
  useEffect(() => {
    let i = 1;
    const t = setInterval(() => {
      const w = WORK[i % WORK.length];
      i++;
      push(w[0], w[1], w[2]);
      setRuns((r) => r + 1 + (i % 3));
    }, 2900);
    return () => clearInterval(t);
  }, []);

  const decide = (v: Verdict) => {
    const top = pending[0];
    if (!top || busy.current) return;
    busy.current = true;
    setStamp({ id: top.id, v });
    window.setTimeout(() => {
      setDecided((d) => [...d, { id: top.id, v }]);
      setStamp(null);
      push(top.agent, v === "ok" ? top.ok : top.back, top.pattern, v);
      busy.current = false;
    }, 620);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLInputElement) return;
    if (e.key === "a" || e.key === "A") { e.preventDefault(); decide("ok"); }
    if (e.key === "r" || e.key === "R") { e.preventDefault(); decide("back"); }
  };

  const reset = () => { setDecided([]); setArrived(3); };

  return (
    <div className={`${C} w-full overflow-hidden`} role="region" aria-label="Approval queue demo" onKeyDown={onKey}>
      <div className="flex items-center justify-between gap-3 border-b border-black/[.06] px-5 py-4">
        <span className="flex items-center gap-2.5">
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Needs your call</span>
          <span className="relative flex h-6 min-w-6 items-center justify-center overflow-hidden rounded-full px-2 text-[12px] font-semibold tabular-nums text-white" style={{ background: pending.length ? A : "#6e6e73" }} aria-live="polite">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={pending.length} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{pending.length}</motion.span>
            </AnimatePresence>
          </span>
        </span>
        <span className="flex items-center gap-3 text-[13px] tabular-nums text-[#6e6e73]">
          <span className="flex items-center gap-1"><Check size={12} color={A} /> {okCount} approved</span>
          <span className="flex items-center gap-1"><BackArrow size={12} /> {backCount} sent back</span>
        </span>
      </div>

      <div className="min-h-[392px] p-3">
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          <AnimatePresence mode="popLayout" initial={false}>
            {pending.map((r, i) => (
              <QueueItem key={r.id} r={r} open={i === 0} stamp={stamp?.id === r.id ? stamp.v : null} onDecide={decide} />
            ))}
          </AnimatePresence>
        </ul>
        <AnimatePresence>
          {pending.length === 0 && (
            <motion.div key="clear" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.1 }} className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: A }}>
                <Check size={24} />
              </motion.span>
              <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Queue clear.</span>
              <span className="max-w-[300px] text-[14px] leading-[1.45] text-[#6e6e73]">The agents kept going while you decided. New requests land here the moment something needs a person.</span>
              <button type="button" onClick={reset} className="mt-1 h-10 rounded-full bg-[#f0f0f3] px-5 text-[14px] font-medium text-[#1d1d1f] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }}>Refill the queue</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="border-t border-black/[.06] bg-[#fafafc] px-5 py-4">
        <div className="flex items-center justify-between text-[12px] font-semibold text-[#6e6e73]">
          <span>Meanwhile, without asking</span>
          <span className="tabular-nums"><Counter to={runs} from={Math.max(0, runs - 3)} duration={0.6} /> runs finished</span>
        </div>
        <ul className="m-0 mt-2 flex h-[84px] list-none flex-col gap-1 overflow-hidden p-0" aria-live="polite">
          <AnimatePresence initial={false} mode="popLayout">
            {feed.map((f) => (
              <motion.li key={f.k} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="flex h-[26px] items-center gap-2.5 text-[13px] text-[#424245]">
                <span className="flex h-5 w-5 flex-none items-center justify-center">
                  {f.tone ? (
                    <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full" style={{ background: f.tone === "ok" ? A : "#e8e8ed", color: INK }}>
                      {f.tone === "ok" ? <Check size={10} /> : <BackArrow size={10} />}
                    </span>
                  ) : (
                    <MatrixLoader pattern={f.pattern} size={20} color={A} />
                  )}
                </span>
                <span className="flex-none font-semibold text-[#1d1d1f]">{f.agent}</span>
                <span className="min-w-0 truncate">{f.text}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(48% 55% at 78% 30%, rgba(79,70,229,.16), transparent 70%), radial-gradient(40% 40% at 10% 0%, rgba(165,180,252,.25), transparent 70%)" }} />
      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 pb-16 pt-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="flex flex-col items-start gap-7">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">
            <motion.span className="h-2 w-2 rounded-full" style={{ background: A }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
            Live demo: five agents, one of you
          </motion.span>
          <h1 className="m-0 text-[clamp(44px,7vw,84px)] font-semibold leading-[0.98] tracking-[-0.05em] text-[#1d1d1f] [text-wrap:balance]">
            <Words text="Agents do the work. You make the calls." accentWords={["make", "the", "calls."]} accent={A} />
          </h1>
          <Reveal delay={0.35} y={14}>
            <p className="m-0 max-w-[520px] text-[clamp(18px,2vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
              Helix runs back-office workflows end to end: refunds, renewals, access requests, supplier payments. When a step is risky, the agent stops, attaches the evidence and asks the right person.
            </p>
          </Reveal>
          <Reveal delay={0.45} y={14} className="flex flex-wrap gap-3">
            <Magnetic className="text-white shadow-[0_12px_30px_-12px_rgba(79,70,229,.8)]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Start free</Magnetic>
            <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("how")}>See how it works</Magnetic>
          </Reveal>
          <Reveal delay={0.55} y={10}>
            <span className="text-[13px] text-[#6e6e73]">Try the queue: approve or send back each request. With the queue focused, A and R work too.</span>
          </Reveal>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }} className="w-full">
          <ApprovalQueue />
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Stats() {
  const items = [
    { to: 1.8, f: (n: number) => `${n.toFixed(1)}M`, l: "steps run by agents last month" },
    { to: 94, f: (n: number) => `${Math.round(n)}%`, l: "of runs finish without a person" },
    { to: 2.7, f: (n: number) => `${n.toFixed(1)} min`, l: "median wait for an approval" },
    { to: 100, f: (n: number) => `${Math.round(n)}%`, l: "of decisions signed and logged" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-14" aria-label="Helix in numbers">
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.l} delay={i * 0.06} y={16} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(36px,4.6vw,52px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </Reveal>
        ))}
      </div>
      <p className="m-0 mt-8 text-[12px] text-[#6e6e73]">Sample figures from a demo workspace. Your numbers depend on which workflows you hand over.</p>
    </section>
  );
}

function AgentGrid() {
  const agents = [
    { n: "Refunds", s: "Reading 14 tickets", p: 0 },
    { n: "Payables", s: "Matching 38 invoices", p: 2 },
    { n: "Access", s: "Checking 6 requests", p: 3 },
    { n: "Renewals", s: "Drafting 214 emails", p: 1 },
  ];
  return (
    <div className={`${C} grid w-[420px] grid-cols-2 gap-2 p-3`}>
      {agents.map((a, i) => (
        <motion.div key={a.n} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...spring, delay: i * 0.07 }} className="flex flex-col gap-4 rounded-[18px] bg-[#f5f5f7] p-4">
          <MatrixLoader pattern={a.p} size={40} color={A} />
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold text-[#1d1d1f]">{a.n} agent</span>
            <span className="text-[13px] text-[#6e6e73]">{a.s}</span>
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function RoutePanel() {
  const I = (d: string) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
  );
  return (
    <div className={`${C} flex w-[420px] flex-col gap-4 p-6`}>
      <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f]"><MatrixLoader pattern={2} size={18} color={A} /> Payables agent stopped</span>
      <span className="text-[19px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#1d1d1f]">INV-2207 · $18,400.00 to a bank account that changed two days ago.</span>
      <span className="text-[13px] text-[#6e6e73]">Helix suggests Finance. You can send it anywhere.</span>
      <StaggerMenu
        label="Route to"
        autoplay
        items={[
          { id: "fin", label: "Finance on-call", icon: I("M4 7h16v10H4zM8 12h.01M12 12a2 2 0 1 0 0-.01"), done: "Sent to Finance" },
          { id: "ctrl", label: "The controller", icon: I("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0"), done: "Sent to controller" },
          { id: "sec", label: "Security team", icon: I("M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z"), done: "Sent to Security" },
          { id: "chan", label: "Post in #approvals", icon: I("M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"), done: "Posted" },
        ]}
      />
    </div>
  );
}

function How() {
  return (
    <section id="how" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="How it works" title="Hand over the busywork. Keep the judgement." sub="Every Helix workflow follows the same four beats. You decide where the line between them sits." accent={A} />
      <div className="mt-10">
        <StickyStory
          accent={A}
          steps={[
            {
              kicker: "01 · Plan",
              title: "Describe the job. The agent writes the plan.",
              body: "Say what a good outcome looks like in a sentence or two. Helix turns it into steps you can read, then works through them and ticks each one off.",
              visual: (
                <div className={`${C} flex w-[420px] flex-col gap-4 p-6`}>
                  <span className="text-[13px] font-semibold text-[#6e6e73]">Refund request · ticket #48213</span>
                  <TodoList accent={A} autoplay initial={["Pull the order and delivery record", "Check refund policy R-4", "Draft a reply to the customer", "Issue the refund in billing"]} />
                </div>
              ),
            },
            {
              kicker: "02 · Work",
              title: "Agents work in parallel, all day and all night.",
              body: "Each workflow gets its own agent with its own permissions. They read your tools, do the routine steps and write down what they did.",
              visual: <AgentGrid />,
            },
            {
              kicker: "03 · Stop",
              title: "Risky steps stop and go to the right person.",
              body: "Money over a limit, production access, bulk sends, anything new. The agent pauses, explains why, and routes the decision to whoever owns it.",
              visual: <RoutePanel />,
            },
            {
              kicker: "04 · Sign",
              title: "Every decision is signed into the record.",
              body: "Approvals carry a name, a time and the evidence the approver saw. Auditors get the whole story without anyone digging through chat.",
              visual: (
                <div className={`${C} flex w-[420px] justify-center px-6 py-8`}>
                  <SignBadge name="Priya Raman" title="Approved · INV-2207" autoplay />
                </div>
              ),
            },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const CASES = [
  {
    n: "Finance",
    t: "Supplier payments",
    steps: [["Read the invoice", 0], ["Match PO and receipt", 0], ["Check payee details", 0], ["Approve over $10k", 1], ["Schedule payment", 0], ["Update the ledger", 0]] as [string, number][],
    s: [["1,240", "invoices a week"], ["7%", "stop for a person"], ["3.1 min", "median approval"]],
  },
  {
    n: "Support",
    t: "Refunds and credits",
    steps: [["Read the ticket", 0], ["Check order history", 0], ["Apply refund policy", 0], ["Approve over $500", 1], ["Issue refund", 0], ["Reply and close", 0]] as [string, number][],
    s: [["3,800", "tickets a week"], ["4%", "stop for a person"], ["1.9 min", "median approval"]],
  },
  {
    n: "IT",
    t: "Access requests",
    steps: [["Read the request", 0], ["Check role and manager", 0], ["Approve production", 1], ["Grant with expiry", 0], ["Revoke on time", 0]] as [string, number][],
    s: [["620", "requests a week"], ["11%", "stop for a person"], ["4.4 min", "median approval"]],
  },
  {
    n: "Revenue",
    t: "Renewals",
    steps: [["Find renewals due", 0], ["Draft the email", 0], ["Check discount", 0], ["Approve over 5% off", 1], ["Send and track", 0]] as [string, number][],
    s: [["9,100", "accounts a month"], ["2%", "stop for a person"], ["6.0 min", "median approval"]],
  },
];

function Cases() {
  const [i, setI] = useState(0);
  const c = CASES[i];
  return (
    <section id="cases" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Use cases" title="Same idea, every team." sub="Pick a team to see a real workflow, which steps run on their own, and where a person signs off." accent={A} center />
        <Reveal y={16} className="mt-10 flex justify-center overflow-x-auto pb-2">
          <StretchNav items={CASES.map((x) => x.n)} onChange={setI} />
        </Reveal>
        <Reveal y={20} className="mt-8">
          <div className={`${C} min-h-[300px] p-6 sm:p-10`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={c.n} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="m-0 text-[clamp(24px,3vw,32px)] font-semibold tracking-[-0.03em] text-[#1d1d1f]">{c.t}</h3>
                  <span className="flex items-center gap-4 text-[13px] text-[#6e6e73]">
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#d2d2d7]" /> Runs on its own</span>
                    <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: A }} /> Needs a person</span>
                  </span>
                </div>
                <ol className="m-0 mt-8 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3 lg:flex lg:items-stretch">
                  {c.steps.map(([label, gate], k) => (
                    <motion.li key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: k * 0.05 }} className="flex flex-1 items-center gap-2">
                      <span className="flex h-full min-h-[64px] w-full flex-col justify-center gap-1 rounded-[16px] px-4 py-3" style={{ background: gate ? A : "#f5f5f7", color: gate ? "#fff" : INK }}>
                        <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: gate ? "rgba(255,255,255,.85)" : "#6e6e73" }}>{gate ? "Approval" : `Step ${k + 1}`}</span>
                        <span className="text-[14px] font-semibold leading-[1.25]">{label}</span>
                      </span>
                      {k < c.steps.length - 1 && <span className="hidden text-[#a1a1a6] lg:block" aria-hidden="true">→</span>}
                    </motion.li>
                  ))}
                </ol>
                <div className="mt-8 grid grid-cols-3 gap-4 border-t border-black/[.06] pt-6">
                  {c.s.map(([v, l]) => (
                    <div key={l} className="flex flex-col gap-1">
                      <span className="text-[clamp(22px,3vw,30px)] font-semibold tabular-nums tracking-[-0.04em] text-[#1d1d1f]">{v}</span>
                      <span className="text-[13px] text-[#6e6e73]">{l}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const RULES = [
  { id: "money", r: "Refunds over $500 need someone in Finance.", n: "Stopped 142 runs this month" },
  { id: "payee", r: "A new or changed payee always stops, whatever the amount.", n: "Stopped 9 runs this month" },
  { id: "prod", r: "Production access needs a manager and expires in 8 hours.", n: "Stopped 61 runs this month" },
  { id: "bulk", r: "Anything that touches more than 25 customers at once needs a person.", n: "Stopped 18 runs this month" },
];

function Guardrails() {
  const [on, setOn] = useState<Record<string, boolean>>({ money: true, payee: true, prod: true, bulk: true });
  return (
    <section id="guardrails" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Guardrails" title="Rules your auditor can read." sub="Policies are sentences, not code. Turn one off and Helix tells you exactly what the agents will now do on their own." accent={A} />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Reveal y={20} className="lg:col-span-2">
          <div className={`${C} flex h-full flex-col p-6 sm:p-8`}>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Approval policies</h3>
            <p className="m-0 mt-1.5 text-[15px] text-[#6e6e73]">Flip one to see what changes.</p>
            <ul className="m-0 mt-6 flex list-none flex-col p-0">
              {RULES.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-5 border-t border-black/[.06] py-4">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-[16px] font-medium leading-[1.35] text-[#1d1d1f]">{r.r}</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={String(on[r.id])} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={spring} className="text-[13px]" style={{ color: on[r.id] ? "#6e6e73" : "#8a4b00" }}>
                        {on[r.id] ? r.n : "Off: agents will do this without asking"}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <Switch checked={on[r.id]} onChange={(v) => setOn((s) => ({ ...s, [r.id]: v }))} label={r.r} accent={A} />
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <div className={`${C} flex h-full flex-col p-6 sm:p-8`}>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">One switch stops everything.</h3>
            <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">If something looks wrong, pause every agent at once. Work in progress waits exactly where it is.</p>
            <div className="flex flex-1 items-center justify-center py-10"><Fit><HoldToPause color={A} label="Hold to pause all agents" doneLabel="12 agents paused" holdMs={1400} autoplay /></Fit></div>
          </div>
        </Reveal>
        <Reveal y={20}>
          <div className={`${C} flex h-full flex-col gap-4 p-6 sm:p-8`}>
            <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Evidence comes attached.</h3>
            <p className="m-0 text-[15px] leading-[1.5] text-[#6e6e73]">No approval arrives without the documents, the policy it hit and what the agent will do next.</p>
            <div className="mt-auto flex flex-wrap gap-2">
              {["invoice.pdf", "PO-5512", "receipt.jpg", "Policy P-2", "bank-change.eml"].map((f, i) => (
                <motion.span key={f} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ ...spring, delay: i * 0.05 }} className="rounded-full bg-[#f5f5f7] px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f]">{f}</motion.span>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08} className="lg:col-span-2">
          <div className={`${C} grid h-full grid-cols-1 items-center gap-6 p-6 sm:p-8 md:grid-cols-[1fr_1.1fr]`}>
            <div>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Approve where you already are.</h3>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Requests reach people in Slack, email or the Helix app. One tap decides, and the answer flows back to the agent.</p>
            </div>
            <div className="rounded-[18px] bg-[#f5f5f7] p-4">
              <span className="text-[12px] font-semibold text-[#6e6e73]">#approvals · 09:41</span>
              <div className="mt-2 rounded-[14px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1d1d1f]"><span className="h-2 w-2 rounded-full" style={{ background: A }} /> Helix · Access agent</span>
                <p className="m-0 mt-1.5 text-[14px] leading-[1.45] text-[#424245]">Theo Lindqvist needs read access to the production database for 4 hours (INC-2291).</p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full px-3 py-1 text-[12px] font-semibold text-white" style={{ background: A }}>Approve</span>
                  <span className="rounded-full bg-[#f0f0f3] px-3 py-1 text-[12px] font-semibold text-[#1d1d1f]">Send back</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const QUOTES = [
  { q: "Month-end used to be four people and a spreadsheet. Now it is one person approving thirty payments with the receipts already attached.", n: "Ana Duarte", r: "Controller, Brightwater Supply" },
  { q: "The agents do the dull 94 percent. The requests that reach me are the ones I would want to see anyway.", n: "Kenji Mori", r: "Support Operations, Fernhill" },
  { q: "Security signed off quickly because every access grant has a name, a reason and an expiry on it.", n: "Rosa Vidal", r: "IT Manager, Northpine Clinics" },
];

function Quotes() {
  return (
    <section className="bg-[#f5f5f7] py-24" aria-label="What teams say">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="From the queue" title="Fewer clicks. Better decisions." accent={A} />
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {QUOTES.map((q, i) => (
            <Reveal key={q.n} delay={i * 0.06} y={18}>
              <figure className={`${C} m-0 flex h-full flex-col justify-between gap-6 p-7`}>
                <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: A }}>{q.n.split(" ").map((w) => w[0]).join("")}</span>
                  <span className="flex flex-col text-[14px]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span><span className="text-[#6e6e73]">{q.r}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Rolling({ value }: { value: string }) {
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        {value.split("").map((ch, i) => (
          <motion.span key={`${i}-${ch}`} className="inline-block" initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 30, delay: i * 0.025 }}>
            {ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

const PLANS = [
  { id: "starter", n: "Starter", p: 0, d: "For trying one workflow.", f: ["1 approver", "500 agent runs a month", "Email approvals", "7-day history"] },
  { id: "team", n: "Team", p: 39, d: "For teams handing over real work.", f: ["Unlimited agent runs", "Slack and email approvals", "Audit log export", "Custom policies"] },
  { id: "business", n: "Business", p: 79, d: "For regulated teams.", f: ["Everything in Team", "SSO and SCIM", "Two-person approvals", "Data residency (EU or US)"] },
];

function Pricing() {
  const [plan, setPlan] = useState("team");
  const [seats, setSeats] = useState(3);
  const p = PLANS.find((x) => x.id === plan)!;
  const total = p.p === 0 ? 0 : p.p * seats;
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Pricing" title="Agents are free. Pay for the people who approve." sub="Every plan includes unlimited agents. You pay per approver, so the bill grows with oversight, not with automation." accent={A} center />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_1fr]">
        <Reveal y={20}>
          <div className={`${C} flex h-full flex-col gap-3 p-4 sm:p-6`} role="radiogroup" aria-label="Plan">
            {PLANS.map((x) => {
              const sel = plan === x.id;
              return (
                <button key={x.id} type="button" role="radio" aria-checked={sel} onClick={() => setPlan(x.id)} className="relative rounded-[18px] p-5 text-left outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }}>
                  {sel && <motion.span layoutId="helix-plan" className="absolute inset-0 rounded-[18px]" style={{ boxShadow: `0 0 0 2px ${A}`, background: "#f7f7ff" }} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative flex items-start justify-between gap-4">
                    <span className="flex flex-col gap-1">
                      <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{x.n}</span>
                      <span className="text-[14px] text-[#6e6e73]">{x.d}</span>
                    </span>
                    <span className="text-right text-[15px] font-semibold tabular-nums text-[#1d1d1f]">{x.p === 0 ? "Free" : `$${x.p}`}<span className="block text-[12px] font-normal text-[#6e6e73]">{x.p === 0 ? "forever" : "per approver / mo"}</span></span>
                  </span>
                  <span className="relative mt-3 flex flex-wrap gap-x-4 gap-y-1">
                    {x.f.map((f) => <span key={f} className="flex items-center gap-1.5 text-[13px] text-[#424245]"><Check size={11} color={A} />{f}</span>)}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <div className={`${C} flex h-full flex-col items-center gap-6 p-8 text-center`}>
            <span className="text-[15px] font-semibold text-[#1d1d1f]">How many people approve?</span>
            <ElasticStepper label="Approvers" min={1} max={20} defaultValue={3} accent={A} onChange={setSeats} />
            <div className="flex flex-col items-center gap-1 border-t border-black/[.06] pt-6">
              <span className="flex items-baseline text-[52px] font-semibold tracking-[-0.045em] text-[#1d1d1f]">$<Rolling value={String(total)} /></span>
              <span className="text-[14px] text-[#6e6e73]">{p.p === 0 ? "Starter includes one approver" : `per month on ${p.n}, billed monthly`}</span>
            </div>
            <Magnetic className="w-full text-white" style={{ background: A }} onClick={() => scrollToId("top")}>{p.p === 0 ? "Start free" : `Try ${p.n} free for 14 days`}</Magnetic>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HelixAIPlatformPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Start free" onCta={() => scrollToId("pricing")} links={[{ label: "How it works", id: "how" }, { label: "Use cases", id: "cases" }, { label: "Guardrails", id: "guardrails" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Stats />
        <How />
        <Cases />
        <Guardrails />
        <Quotes />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Questions, answered." accent={A} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "What counts as a risky step?", a: "You decide. Helix ships with sensible defaults (money over a limit, production access, bulk changes, new payees) and every rule is a sentence you can edit, switch off or tighten per workflow." },
                { q: "What happens if nobody approves?", a: "The run waits. After a time you set, Helix reminds the approver, then escalates to a backup. Nothing risky goes ahead by default." },
                { q: "Can agents act on their own mistakes?", a: "Agents can only use the permissions you give each workflow, and every action is logged with what the agent saw. You can pause one agent or all of them from a single switch." },
                { q: "Where does our data live?", a: "In the region you choose, EU or US. Documents an agent reads stay in your workspace and are never used to train shared models." },
                { q: "How long does setup take?", a: "Most teams run their first workflow the same day. Connecting billing, helpdesk or identity tools takes a few minutes each with read-only access first." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Clear your first queue this afternoon." sub="Free for one workflow and one approver. No card needed." cta="Start free" secondary="Book a walkthrough" accent={A} glow="rgba(79,70,229,.32)" />
        </div>
        <Footer brand={<Logo />} note="Workflow automation where agents do the work and people approve the risky steps. Helix is a template; the company and figures are placeholders." columns={[{ title: "Product", links: ["Workflows", "Guardrails", "Audit log", "Pricing"] }, { title: "Teams", links: ["Finance", "Support", "IT", "Revenue"] }, { title: "Company", links: ["About", "Security", "Careers", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default HelixAIPlatformPage;
