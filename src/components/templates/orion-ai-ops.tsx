"use client";
/**
 * Orion: landing page template for autonomous enterprise operations. Agents
 * run runbooks and incidents inside guardrails, with a full audit trail.
 * Built from Motion Kit components: Capsule Toggles, Folder Peek, Copy Buttons
 * (command line), Page Curl, Standing Calendar (teal copy), Radio Cards and
 * Matrix Loaders. The hero is an incident console with an autonomy dial.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useSpring, useTransform, useVelocity } from "framer-motion";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import FolderPeek from "@/components/templates/kit/components/FolderPeek";
import { CopyCommand } from "@/components/templates/kit/components/CopyButton";
import PageCurl from "@/components/templates/kit/components/PageCurl";
import RadioCards from "@/components/templates/kit/components/RadioCards";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import IncidentCalendar from "@/components/templates/orion/incident-calendar";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, StickyStory, Words, ease, scrollToId } from "@/components/templates/kit/parts";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const A = "#0e7490";
const AMBER = "#8a4b00";
const C = "rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 22L16 16L26 10" stroke="#a5dbe6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="6" cy="22" r="3.4" fill={A} />
        <motion.circle cx="16" cy="16" r="3.4" fill={A} animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
        <circle cx="26" cy="10" r="3.4" fill={A} />
      </svg>
      Orion
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: incident console with an autonomy dial                        */
/* ------------------------------------------------------------------ */

const STAGES = ["Detect", "Diagnose", "Plan", "Act", "Verify", "Close"];
const LEVELS = [
  { n: "Observe", d: "Diagnose and page a person. Never act." },
  { n: "Suggest", d: "Prepare the fix. A person approves every action." },
  { n: "Safe actions", d: "Run reversible steps alone. Ask before anything else." },
  { n: "Autonomous", d: "Act inside the guardrails. Tell people afterwards." },
];
const CAPS = [25, 50, 100];

type Who = "agent" | "human" | "gate";
interface Ev { s: number; t: string; who: Who; text: string }

function script(level: number, cap: number): { ev: Ev[]; mttr: string; paged: number } {
  const base: Ev[] = [
    { s: 0, t: "02:14:07", who: "agent", text: "Alert: checkout-api p95 at 2.4 s for 3 min (SLO 400 ms)" },
    { s: 1, t: "02:14:19", who: "agent", text: "Linked to deploy 4f2a1c from 12 min ago. Errors up from 0.4% to 6.1%" },
    { s: 2, t: "02:14:31", who: "agent", text: "Matched runbook RB-12, roll back a bad deploy. Touches 38 hosts" },
  ];
  const ask = (t: string, why: string, ok: string): Ev[] => [
    { s: 3, t, who: "gate", text: `${why} Asked Dana Okafor (on call)` },
    { s: 3, t: ok, who: "human", text: "Dana approved the rollback from Slack" },
  ];
  if (level === 0)
    return {
      ev: [...base, { s: 2, t: "02:14:32", who: "gate", text: "Policy is Observe. Paged Dana Okafor with the plan" }, { s: 3, t: "02:27:48", who: "human", text: "Dana rolled back deploy 4f2a1c by hand" }, { s: 4, t: "02:33:10", who: "agent", text: "p95 back to 310 ms. Error rate 0.3%" }, { s: 5, t: "02:39:02", who: "agent", text: "Closed. Timeline and postmortem draft attached" }],
      mttr: "24m 55s",
      paged: 1,
    };
  if (level === 1)
    return {
      ev: [...base, ...ask("02:14:32", "Policy is Suggest.", "02:19:05"), { s: 3, t: "02:19:06", who: "agent", text: "Rolling back 38 hosts in 4 waves" }, { s: 4, t: "02:22:40", who: "agent", text: "p95 back to 320 ms. Error rate 0.3%" }, { s: 5, t: "02:24:15", who: "agent", text: "Closed. Postmortem draft attached" }],
      mttr: "10m 08s",
      paged: 1,
    };
  if (level === 2 || cap < 38)
    return {
      ev: [
        ...base,
        { s: 3, t: "02:14:33", who: "agent", text: "Scaled checkout-api from 12 to 18 pods (reversible, allowed)" },
        ...ask("02:14:34", level === 2 ? "A rollback is not on the safe list." : `Rollback needs 38 hosts, the limit is ${cap}.`, "02:16:50"),
        { s: 3, t: "02:16:51", who: "agent", text: "Rolling back 38 hosts in 4 waves" },
        { s: 4, t: "02:19:30", who: "agent", text: "p95 back to 315 ms. Error rate 0.3%" },
        { s: 5, t: "02:20:12", who: "agent", text: "Closed. Pods scaled back to 12" },
      ],
      mttr: "6m 05s",
      paged: 1,
    };
  return {
    ev: [
      ...base,
      { s: 3, t: "02:14:33", who: "agent", text: `Inside the guardrails: 38 of ${cap} hosts, reversible. Running RB-12` },
      { s: 3, t: "02:14:34", who: "agent", text: "Rolling back 38 hosts in 4 waves" },
      { s: 4, t: "02:17:02", who: "agent", text: "p95 back to 305 ms. Error rate 0.3%" },
      { s: 5, t: "02:18:40", who: "agent", text: "Closed. Dana gets the summary when she wakes up" },
    ],
    mttr: "4m 33s",
    paged: 0,
  };
}

/** The signature control: a dial with four detents. Drag the knob, it stretches with speed and snaps. */
function AutonomyDial({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const track = useRef<HTMLDivElement>(null);
  const frac = useMotionValue(value / 3);
  const smooth = useSpring(frac, { stiffness: 520, damping: 34 });
  const left = useTransform(smooth, (f) => `${f * 100}%`);
  const vel = useVelocity(smooth);
  const stretch = useTransform(vel, (v) => 1 + Math.min(0.5, Math.abs(v) * 0.12));
  const [drag, setDrag] = useState<number | null>(null);
  const shown = drag ?? value;

  useEffect(() => {
    if (drag === null) frac.set(value / 3);
  }, [value, drag, frac]);

  const at = (e: RPointerEvent) => {
    const r = track.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const f = at(e);
    frac.set(f);
    setDrag(Math.round(f * 3));
  };
  const move = (e: RPointerEvent) => {
    if (drag === null) return;
    const f = at(e);
    frac.set(f);
    const n = Math.round(f * 3);
    if (n !== drag) setDrag(n);
  };
  const up = () => {
    if (drag === null) return;
    const n = drag;
    setDrag(null);
    animate(frac, n / 3, { type: "spring", stiffness: 500, damping: 26 });
    if (n !== value) onChange(n);
  };
  const key = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); onChange(Math.min(3, value + 1)); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); onChange(Math.max(0, value - 1)); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">Autonomy</span>
        <span className="relative h-5 overflow-hidden text-right text-[13px] font-semibold" style={{ color: A }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={shown} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}>{LEVELS[shown].n}</motion.span>
          </AnimatePresence>
        </span>
      </div>
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label="Autonomy level"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={value}
        aria-valuetext={LEVELS[value].n}
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="relative mx-3 h-11 cursor-grab touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-4 active:cursor-grabbing"
        style={{ ["--tw-ring-color" as string]: A }}
      >
        <span className="absolute inset-x-[-12px] top-1/2 h-2 -translate-y-1/2 rounded-full bg-[#e3e6ea]" />
        <motion.span className="absolute left-[-12px] top-1/2 h-2 -translate-y-1/2 rounded-full" style={{ width: left, background: `linear-gradient(90deg, #a5dbe6, ${A})` }} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ left: `${(i / 3) * 100}%`, background: i <= shown ? A : "#c7ccd1" }} />
        ))}
        <motion.span className="absolute top-1/2 -ml-[17px] -mt-[17px] h-[34px] w-[34px] rounded-full bg-white shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_18px_-6px_rgba(0,0,0,.35)]" style={{ left, scaleX: stretch }}>
          <span className="absolute inset-[9px] rounded-full" style={{ background: A }} />
        </motion.span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {LEVELS.map((l, i) => (
          <button key={l.n} type="button" onClick={() => onChange(i)} className="rounded-lg px-1 py-1 text-center text-[11px] font-semibold leading-[1.2] outline-none focus-visible:ring-2" style={{ color: i === value ? A : "#6e6e73", ["--tw-ring-color" as string]: A }}>
            {l.n}
          </button>
        ))}
      </div>
    </div>
  );
}

function Console() {
  const [level, setLevel] = useState(3);
  const [cap, setCap] = useState(50);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);
  const { ev, mttr, paged } = script(level, cap);
  const cur = ev[Math.min(step, ev.length - 1)];
  const finished = step >= ev.length - 1;
  const pos = useSpring(0, { stiffness: 120, damping: 20 });
  const packet = useTransform(pos, (v) => `${(v / 5) * 100}%`);
  const fill = useTransform(pos, (v) => v / 5);

  useEffect(() => {
    pos.set(cur.s);
  }, [cur.s, pos]);

  // Replay the incident whenever the policy changes, one event at a time.
  useEffect(() => {
    const ts: number[] = [];
    ts.push(window.setTimeout(() => setStep(0), 0));
    let at = 500;
    const list = script(level, cap).ev;
    for (let i = 1; i < list.length; i++) {
      at += list[i - 1].who === "gate" ? 1700 : 850;
      ts.push(window.setTimeout(() => setStep(i), at));
    }
    return () => ts.forEach(clearTimeout);
  }, [level, cap, run]);

  const shownEv = ev.slice(0, step + 1);
  const agentActs = ev.filter((e) => e.who === "agent" && e.s >= 3).length;

  return (
    <div className={`${C} overflow-hidden`}>
      <div className="flex flex-wrap items-center gap-3 border-b border-black/[.06] px-5 py-3.5">
        <span className="flex items-center gap-2 text-[13px] font-medium text-[#424245]" style={{ fontFamily: MONO }}>orion / incidents / INC-2291</span>
        <span className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: finished ? A : AMBER }}>
          <motion.span className="h-2 w-2 rounded-full" style={{ background: finished ? A : "#f59e0b" }} animate={finished ? { opacity: 1 } : { opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: finished ? 0 : Infinity }} />
          {finished ? "Resolved" : "Replaying"}
        </span>
        <button type="button" onClick={() => setRun((r) => r + 1)} className="h-8 rounded-full bg-[#f0f0f3] px-3.5 text-[12px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }}>Replay</button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col gap-7 border-b border-black/[.06] bg-[#f7f8f9] p-6 lg:border-b-0 lg:border-r">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">Policy for checkout-api</span>
            <p className="m-0 mt-2 min-h-[42px] text-[14px] leading-[1.45] text-[#424245]">{LEVELS[level].d}</p>
          </div>
          <AutonomyDial value={level} onChange={setLevel} />
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-[#1d1d1f]">Max hosts per action</span>
            <div className="relative grid grid-cols-3 rounded-xl bg-[#e8e8ed] p-[3px]" role="radiogroup" aria-label="Max hosts per action">
              {CAPS.map((c) => (
                <button key={c} type="button" role="radio" aria-checked={cap === c} onClick={() => setCap(c)} className="relative z-10 h-8 rounded-[9px] text-[13px] font-semibold tabular-nums text-[#1d1d1f] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }}>
                  {cap === c && <motion.span layoutId="orion-cap" transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1)]" />}
                  {c}
                </button>
              ))}
            </div>
            <span className="text-[12px] leading-[1.4] text-[#6e6e73]">This rollback touches 38 hosts. Set 25 and watch Orion ask first.</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[12px] font-semibold text-[#6e6e73]">Sev 2 · started 02:14 · checkout-api</span>
              <h3 className="m-0 mt-1 text-[clamp(18px,2.2vw,22px)] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Checkout is slow after a deploy</h3>
            </div>
            <div className="flex gap-5">
              <span className="flex flex-col items-end">
                <span className="relative h-[30px] overflow-hidden text-[24px] font-semibold leading-[30px] tabular-nums tracking-[-0.03em] text-[#1d1d1f]">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={finished ? mttr : "run"} className="block" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -24, opacity: 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>{finished ? mttr : "…"}</motion.span>
                  </AnimatePresence>
                </span>
                <span className="text-[12px] text-[#6e6e73]">time to resolve</span>
              </span>
              <span className="flex flex-col items-end">
                <span className="h-[30px] text-[24px] font-semibold leading-[30px] tabular-nums tracking-[-0.03em] text-[#1d1d1f]">{paged}</span>
                <span className="text-[12px] text-[#6e6e73]">people woken</span>
              </span>
            </div>
          </div>

          {/* stage rail */}
          <div className="relative px-3 pt-2" aria-label={`Stage: ${STAGES[cur.s]}`}>
            <div className="relative h-1.5 rounded-full bg-[#e8eaed]">
              <motion.div className="absolute inset-y-0 left-0 w-full origin-left rounded-full" style={{ scaleX: fill, background: A }} />
              <motion.div className="absolute top-1/2 -ml-2.5 -mt-2.5 h-5 w-5 rounded-full" style={{ left: packet, background: A, boxShadow: "0 0 0 6px rgba(14,116,144,.18)" }} />
            </div>
            <ol className="m-0 mt-4 grid list-none grid-cols-6 p-0">
              {STAGES.map((s, i) => {
                const done = i < cur.s || (finished && i === cur.s);
                const active = i === cur.s && !finished;
                const waiting = active && cur.who === "gate";
                return (
                  <li key={s} className="flex flex-col items-center gap-1 text-center">
                    <motion.span
                      className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold"
                      animate={{ backgroundColor: done ? A : waiting ? "#fff4e0" : active ? "#e0f2f6" : "#f0f0f3", color: done ? "#fff" : waiting ? AMBER : active ? A : "#6e6e73", scale: active ? 1.1 : 1 }}
                      transition={spring}
                    >
                      {done ? "✓" : i + 1}
                    </motion.span>
                    <span className="text-[11px] font-semibold sm:text-[12px]" style={{ color: active || done ? "#1d1d1f" : "#6e6e73" }}>{s}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
            <div className="flex min-w-0 flex-col rounded-[18px] bg-[#f7f8f9] p-4">
              <span className="flex items-center justify-between text-[12px] font-semibold text-[#6e6e73]">
                <span>Audit trail</span>
                <span className="tabular-nums">{shownEv.length} of {ev.length} entries</span>
              </span>
              <ul className="m-0 mt-3 flex h-[204px] list-none flex-col justify-end gap-1.5 overflow-hidden p-0" aria-live="polite">
                <AnimatePresence initial={false}>
                  {shownEv.map((e, i) => (
                    <motion.li key={`${run}-${level}-${cap}-${i}`} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="flex min-w-0 items-start gap-2.5 text-[12.5px] leading-[1.4]">
                      <span className="flex-none tabular-nums text-[#6e6e73]" style={{ fontFamily: MONO }}>{e.t}</span>
                      <span className="mt-[1px] flex-none rounded px-1.5 text-[10.5px] font-bold uppercase tracking-[0.04em]" style={{ background: e.who === "agent" ? "#e0f2f6" : e.who === "gate" ? "#fff4e0" : "#ececf0", color: e.who === "agent" ? A : e.who === "gate" ? AMBER : "#1d1d1f" }}>
                        {e.who === "agent" ? "Orion" : e.who === "gate" ? "Policy" : "Human"}
                      </span>
                      <span className="min-w-0 text-[#1d1d1f]">{e.text}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>
            <div className="flex flex-row gap-4 rounded-[18px] bg-[#f7f8f9] p-4 md:flex-col">
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[12px] font-semibold text-[#6e6e73]">Now</span>
                <span className="flex items-center gap-2 text-[14px] font-semibold text-[#1d1d1f]">
                  {!finished && <MatrixLoader pattern={cur.who === "gate" ? 4 : 1} size={18} color={cur.who === "gate" ? "#d97706" : A} />}
                  {finished ? "Incident closed" : cur.who === "gate" ? "Waiting for a person" : cur.who === "human" ? "Person acting" : `Orion: ${STAGES[cur.s].toLowerCase()}`}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[12px] font-semibold text-[#6e6e73]">Agent actions</span>
                <span className="text-[14px] font-semibold tabular-nums text-[#1d1d1f]">{agentActs} logged, 0 outside policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-12 lg:pb-24 lg:pt-14">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(50% 45% at 20% 0%, rgba(165,219,230,.45), transparent 70%), radial-gradient(40% 40% at 90% 30%, rgba(14,116,144,.10), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1180px] px-5">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
          <div className="flex flex-col items-start gap-6">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]" style={{ fontFamily: MONO }}>
              <span className="h-2 w-2 rounded-full" style={{ background: A }} />
              INC-2291 is replaying below
            </motion.span>
            <h1 className="m-0 text-[clamp(40px,5.8vw,74px)] font-semibold leading-[1] tracking-[-0.05em] text-[#1d1d1f] [text-wrap:balance]">
              <Words text="Incidents fixed at machine speed, inside your rules." accentWords={["inside", "your", "rules."]} accent={A} />
            </h1>
          </div>
          <div className="flex flex-col items-start gap-6 lg:pb-3">
            <Reveal delay={0.35} y={14}>
              <p className="m-0 text-[clamp(17px,1.8vw,20px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
                Orion agents run your runbooks when alerts fire: diagnose, plan, act, verify. How far they go on their own is a policy you set per service, and every step lands in an audit trail you can hand to a regulator.
              </p>
            </Reveal>
            <Reveal delay={0.45} y={14} className="flex flex-wrap gap-3">
              <Magnetic className="text-white shadow-[0_12px_30px_-12px_rgba(14,116,144,.8)]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Book a pilot</Magnetic>
              <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("governance")}>How governance works</Magnetic>
            </Reveal>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.25 }} className="mt-10">
          <Console />
        </motion.div>
        <Reveal y={10} delay={0.2} className="mt-4">
          <p className="m-0 text-center text-[13px] text-[#6e6e73]">Drag the autonomy dial or change the host limit. The same 02:14 incident replays under your rule.</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Proof() {
  const items = [
    { to: 71, f: (n: number) => `${Math.round(n)}%`, l: "of Sev 2 and Sev 3 incidents closed without paging anyone" },
    { to: 4.6, f: (n: number) => `${n.toFixed(1)} min`, l: "median time to resolve with autonomy on" },
    { to: 0, f: () => "0", l: "actions taken outside a written policy" },
  ];
  return (
    <section className="border-y border-black/[.06] bg-white" aria-label="Orion in numbers">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-5 py-12 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.l} delay={i * 0.06} y={14} className="flex items-baseline gap-4">
            <Counter to={it.to} format={it.f} className="flex-none text-[clamp(36px,4.4vw,48px)] font-semibold tracking-[-0.045em]" />
            <span className="text-[15px] leading-[1.4] text-[#6e6e73]">{it.l}</span>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mb-0 mt-0 max-w-[1180px] px-5 pb-8 text-[12px] text-[#6e6e73]">Figures from a sample pilot of 40 services over 90 days. Placeholder data.</p>
    </section>
  );
}

function Runbooks() {
  return (
    <section id="runbooks" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <SectionHead eyebrow="Runbooks" title="The runbooks you already wrote, finally executable." sub="Import Markdown, wiki pages or scripts. Orion turns each one into steps, marks which are reversible, and runs them in a dry run before anything is live." accent={A} />
          <Reveal y={16} className="flex flex-col gap-3">
            <CopyCommand command="orion import ./runbooks --dry-run" />
            <span className="text-[13px] text-[#6e6e73]">Read-only by default. Nothing runs until a policy says it may.</span>
          </Reveal>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            { t: "Deploys", m: "14 runbooks · 9 reversible", c: A },
            { t: "Databases", m: "8 runbooks · 2 reversible", c: "#155e75" },
            { t: "Capacity", m: "11 runbooks · 11 reversible", c: "#0891b2" },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 0.06} y={18}>
              <div className={`${C} flex h-full flex-col items-center px-6 pb-6`}>
                <FolderPeek title={f.t} meta={f.m} color={f.c} autoplay={i === 1} />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const SCOPES = [
  { id: "restart", l: "Restart pods", h: "Reversible · used 212 times" },
  { id: "scale", l: "Scale up to 2x", h: "Reversible · used 87 times" },
  { id: "rollback", l: "Roll back a deploy", h: "Reversible · needs 38+ hosts check" },
  { id: "dns", l: "Change DNS", h: "Slow to undo" },
  { id: "db", l: "Fail over a database", h: "Not reversible" },
];

function ScopeCard() {
  const [on, setOn] = useState<Record<string, boolean>>({ restart: true, scale: true, rollback: true, dns: false, db: false });
  const count = Object.values(on).filter(Boolean).length;
  return (
    <div className={`${C} w-[420px] overflow-hidden`}>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">Scope · checkout-api</span>
        <span className="text-[13px] font-semibold tabular-nums" style={{ color: A }}>{count} of 5 allowed</span>
      </div>
      <ul className="m-0 list-none divide-y divide-[#f0f0f3] p-0">
        {SCOPES.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-5 py-3">
            <span className="flex flex-1 flex-col">
              <span className="text-[15px] font-medium text-[#1d1d1f]">{s.l}</span>
              <span className="text-[12px] text-[#6e6e73]">{on[s.id] ? s.h : "Orion will ask a person"}</span>
            </span>
            <CapsuleToggle label={s.l} checked={on[s.id]} onColor={A} onChange={(v) => setOn((x) => ({ ...x, [s.id]: v }))} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PauseCard() {
  const [paused, setPaused] = useState(false);
  const steps = ["Drain wave 1 of 4", "Roll back wave 1", "Check error rate", "Roll back wave 2"];
  return (
    <div className={`${C} flex w-[420px] flex-col gap-5 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">RB-12 · Roll back a bad deploy</span>
        <span className="text-[12px] font-semibold" style={{ color: paused ? AMBER : A }}>{paused ? "Paused at step 3" : "Running"}</span>
      </div>
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 rounded-xl bg-[#f7f8f9] px-3 py-2.5 text-[14px] text-[#1d1d1f]">
            {i < 2 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: A }}>✓</span>
            ) : i === 2 ? (
              paused ? <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fff4e0] text-[11px] font-bold" style={{ color: AMBER }}>II</span> : <MatrixLoader pattern={0} size={20} color={A} />
            ) : (
              <span className="h-5 w-5 rounded-full border-2 border-[#d2d2d7]" />
            )}
            {s}
          </li>
        ))}
      </ol>
      <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => setPaused((p) => !p)} className="h-11 rounded-full text-[14px] font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-offset-2" animate={{ backgroundColor: paused ? A : "#1d1d1f" }} style={{ ["--tw-ring-color" as string]: A }}>
        {paused ? "Resume from step 3" : "Pause this run"}
      </motion.button>
    </div>
  );
}

function TwoPersonCard() {
  const people = [
    { n: "Dana Okafor", r: "On call, payments", t: "02:16:41" },
    { n: "Luis Ferreira", r: "Database owner", t: "02:17:58" },
  ];
  return (
    <div className={`${C} flex w-[420px] flex-col gap-5 p-6`}>
      <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73]">Needs two people</span>
      <span className="text-[19px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1d1d1f]">Fail over the orders database to us-east-2</span>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {people.map((p, i) => (
          <motion.li key={p.n} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: 0.2 + i * 0.5 }} className="flex items-center gap-3 rounded-xl bg-[#f7f8f9] px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={{ background: A }}>{p.n.split(" ").map((w) => w[0]).join("")}</span>
            <span className="flex flex-1 flex-col"><span className="text-[14px] font-semibold text-[#1d1d1f]">{p.n}</span><span className="text-[12px] text-[#6e6e73]">{p.r}</span></span>
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.5 + i * 0.5 }} className="text-[12px] font-semibold tabular-nums" style={{ color: A }}>✓ {p.t}</motion.span>
          </motion.li>
        ))}
      </ul>
      <span className="text-[13px] text-[#6e6e73]">The second approver must be from a different team. Orion checks.</span>
    </div>
  );
}

function ChainCard() {
  const rows = [
    ["02:14:07", "alert.received", "9c1e"],
    ["02:14:31", "runbook.matched RB-12", "4b07"],
    ["02:14:33", "policy.allowed rollback", "e21a"],
    ["02:14:34", "action.started wave 1/4", "77d3"],
    ["02:17:02", "check.passed p95 305ms", "0fa8"],
  ];
  return (
    <div className={`${C} flex w-[440px] flex-col gap-3 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-semibold text-[#1d1d1f]">Audit trail · INC-2291</span>
        <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: A }}><MatrixLoader pattern={5} size={16} color={A} /> Chain verified</span>
      </div>
      <ul className="m-0 flex list-none flex-col p-0" style={{ fontFamily: MONO }}>
        {rows.map(([t, e, h], i) => (
          <motion.li key={h} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.08 }} className="flex items-center gap-3 border-b border-black/[.05] py-2 text-[12px]">
            <span className="text-[#6e6e73]">{t}</span>
            <span className="min-w-0 flex-1 truncate text-[#1d1d1f]">{e}</span>
            <span className="rounded bg-[#e0f2f6] px-1.5 py-0.5 text-[11px]" style={{ color: A }}>#{h}</span>
          </motion.li>
        ))}
      </ul>
      <span className="text-[12px] leading-[1.45] text-[#6e6e73]">Each entry includes the hash of the one before it, so a deleted or edited line breaks the chain.</span>
    </div>
  );
}

function Governance() {
  return (
    <section id="governance" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Governance" title="Autonomy you can explain to your auditor." sub="Every agent works inside a scope, can be stopped mid-step, and leaves a record that cannot be quietly edited." accent={A} />
      <div className="mt-10">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "01 · Scope", title: "Each service gets a scope.", body: "List what an agent may do on its own. Anything outside the list becomes a request to a person, with the plan and the evidence attached.", visual: <ScopeCard /> },
            { kicker: "02 · Pause", title: "Stop any run mid-step.", body: "Every runbook checkpoints between steps. Pause from the console, Slack or the API, and Orion resumes from exactly where it stopped.", visual: <PauseCard /> },
            { kicker: "03 · Two people", title: "Two people for the big moves.", body: "Database failovers, region moves and anything irreversible need two approvers from different teams. Orion enforces it, nobody has to remember.", visual: <TwoPersonCard /> },
            { kicker: "04 · Record", title: "A trail nobody can quietly edit.", body: "Alerts, decisions, approvals and commands are chained by hash and streamed to your SIEM. Export a full incident as one file.", visual: <ChainCard /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const PM_FRONT = (
  <div className="flex h-full flex-col gap-3 p-6">
    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6e6e73]">Postmortem draft · INC-2291</span>
    <span className="text-[20px] font-semibold leading-[1.2] tracking-[-0.025em] text-[#1d1d1f]">Checkout slowed for 4 minutes after deploy 4f2a1c.</span>
    <span className="text-[13px] leading-[1.5] text-[#424245]">A config change doubled database connections per pod. Orion rolled back in 4 waves; p95 recovered by 02:17. No orders were lost.</span>
    <span className="mt-auto text-[12px] text-[#6e6e73]">Grab the corner to see the raw evidence.</span>
  </div>
);
const PM_BACK = (
  <div className="flex h-full flex-col gap-1.5 bg-[#0b2a33] p-6 text-[11.5px] leading-[1.5] text-[#cfe9ef]" style={{ fontFamily: MONO }}>
    <span className="text-[#7fd0e0]">$ orion incident export INC-2291</span>
    <span>02:14:07 alert p95=2412ms slo=400ms</span>
    <span>02:14:19 deploy 4f2a1c db_pool 20→40</span>
    <span>02:14:31 runbook RB-12 hosts=38</span>
    <span>02:14:33 policy autonomous cap=50 ok</span>
    <span>02:17:02 check p95=305ms err=0.3%</span>
    <span>02:18:40 closed by orion</span>
    <span className="text-[#7fd0e0]">chain: 9c1e → 4b07 → e21a → 0fa8 ✓</span>
  </div>
);

function Postmortem() {
  return (
    <section id="audit" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Postmortems" title="It writes the postmortem. The evidence stays underneath." sub="Orion drafts the summary from the audit trail, so the story and the facts never drift apart. Peel back the page to see what it was written from." accent={A} />
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {["Timeline built from the chained trail", "Root cause linked to the change that caused it", "Follow-ups filed as tickets in your tracker"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#e0f2f6] text-[12px] font-bold" style={{ color: A }}>✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <Reveal y={20}>
          <div className={`${C} flex justify-center px-4 py-10`}>
            <Fit><PageCurl width={440} height={300} front={PM_FRONT} back={PM_BACK} autoplay /></Fit>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function History() {
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="History" title="Thirty weeks of incidents, standing up." sub="Every column is a day. Taller means busier. Hover a day for the count, switch to Standing for the shape of the quarter." accent={A} center />
      <Reveal y={20} className="mt-12">
        <div className={`${C} px-4 py-10 sm:px-10`}>
          <Fit><IncidentCalendar weeks={30} noun="incidents handled" autoplay /></Fit>
        </div>
      </Reveal>
    </section>
  );
}

const QUOTES = [
  { q: "We let Orion restart and scale on its own in week one. By week six it was closing most of our overnight pages before anyone woke up.", n: "Mei Tanaka", r: "SRE Lead, Lattice Freight" },
  { q: "Compliance asked how an AI could touch production. I exported one incident and the conversation was over.", n: "Owen Brandt", r: "Head of Infrastructure, Corvid Bank" },
  { q: "The autonomy dial is per service. Payments stays on Suggest, everything else runs. That nuance is why we bought it.", n: "Priya Nair", r: "VP Engineering, Tessellate" },
];

function Quotes() {
  return (
    <section className="bg-[#f5f5f7] py-24" aria-label="What teams say">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 px-5 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.n} delay={i * 0.06} y={18}>
            <figure className={`${C} m-0 flex h-full flex-col justify-between gap-6 p-7`}>
              <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
              <figcaption className="text-[14px] text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span> · {q.r}</figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Pricing" title="Priced per protected service." sub="Agents, runbooks and seats are unlimited on every plan. Start with a 30-day pilot on up to 10 services." accent={A} center />
      <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_1fr]">
        <Reveal y={20}>
          <div className={`${C} flex h-full flex-col gap-6 p-6 sm:p-8`}>
            <div>
              <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Choose a plan</h3>
              <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">Annual billing. Move up or down at renewal.</p>
            </div>
            <Fit>
              <RadioCards
                accent={A}
                defaultValue="business"
                options={[
                  { id: "team", title: "Team", description: "Up to 25 services", meta: "$900/mo", features: ["Observe and Suggest", "Slack approvals", "90-day audit trail"] },
                  { id: "business", title: "Business", description: "Up to 150 services", meta: "$3,600/mo", features: ["All four autonomy levels", "Two-person rule", "SIEM streaming"] },
                  { id: "enterprise", title: "Enterprise", description: "Unlimited services", meta: "Custom", features: ["Self-hosted runners", "Custom retention", "24/7 support"] },
                ]}
              />
            </Fit>
          </div>
        </Reveal>
        <Reveal y={20} delay={0.08}>
          <div className="flex h-full flex-col justify-between gap-8 rounded-[24px] p-8 text-white" style={{ background: "linear-gradient(160deg,#0b3b48,#0e7490)" }}>
            <div className="flex flex-col gap-3">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#bfe6ee]">Every plan includes</span>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {["Unlimited agents and runbooks", "Dry runs before anything goes live", "SSO, SCIM and role-based scopes", "Hash-chained audit trail export", "EU or US data residency"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[16px]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Magnetic className="w-full bg-white text-[#0b3b48]" onClick={() => scrollToId("top")}>Book a 30-day pilot</Magnetic>
              <span className="text-center text-[13px] text-[#cfe9ef]">A solutions engineer imports your first runbooks with you.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function OrionAIPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Book a pilot" onCta={() => scrollToId("pricing")} links={[{ label: "Runbooks", id: "runbooks" }, { label: "Governance", id: "governance" }, { label: "Audit", id: "audit" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Proof />
        <Runbooks />
        <Governance />
        <Postmortem />
        <History />
        <Quotes />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Questions from operators." accent={A} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "What stops an agent doing something we did not allow?", a: "Agents only receive credentials for the actions in a service's scope, and every action is checked against the policy before it runs. A check that fails becomes a request to a person instead." },
                { q: "Do we have to start autonomous?", a: "No. Most teams start every service on Observe, move quiet services to Safe actions after a few weeks, and keep critical paths like payments on Suggest." },
                { q: "Where do the agents run?", a: "In our cloud by default, or in self-hosted runners inside your network on Enterprise. Runners only make outbound connections." },
                { q: "Can we use our existing alerting and chat?", a: "Yes. Orion listens to the alerts you already send and asks for approvals in Slack, Microsoft Teams or the console." },
                { q: "What does the audit trail contain?", a: "Every alert, decision, approval, command and result, with timestamps and the policy that allowed it. Entries are hash-chained and can be streamed to your SIEM." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Let the 2 a.m. page handle itself." sub="A 30-day pilot on ten services, starting in Observe. You decide when it acts." cta="Book a pilot" secondary="Read the security paper" accent={A} glow="rgba(14,116,144,.38)" />
        </div>
        <Footer brand={<Logo />} note="Autonomous operations for enterprises, with governance and a full audit trail. Orion is a template; the company and figures are placeholders." columns={[{ title: "Product", links: ["Console", "Runbooks", "Governance", "Pricing"] }, { title: "Resources", links: ["Docs", "Security", "Status", "Changelog"] }, { title: "Company", links: ["About", "Customers", "Careers", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default OrionAIPage;
