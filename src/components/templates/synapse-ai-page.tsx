"use client";
/**
 * Synapse: landing page template for a visual builder that designs, tests and
 * deploys AI agents without code. The hero is a live node canvas.
 * Built from Motion Kit components: Before / After, Liquid Dial, Scrub Inputs,
 * Upload Chips, Voice Orb, Dock and Copy Buttons.
 */
import { useState, type MouseEvent } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import BeforeAfter from "@/components/templates/kit/components/BeforeAfter";
import GooeyDial from "@/components/templates/kit/components/GooeyDial";
import { ScrubField } from "@/components/templates/kit/components/ScrubInput";
import UploadChips from "@/components/templates/kit/components/UploadChips";
import VoiceOrb from "@/components/templates/kit/components/VoiceOrb";
import Dock, { type DockApp } from "@/components/templates/kit/components/Dock";
import { CopyChip } from "@/components/templates/kit/components/CopyButton";
import NodeCanvas from "@/components/templates/synapse/node-canvas";
import { Counter, CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Words, ease, scrollToId } from "@/components/templates/kit/parts";
import { StickyStory } from "@/components/templates/kit-ports/sticky-story";

const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", system-ui, sans-serif';
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";
const A = "#db2777"; // fills and graphics
const AD = "#be185d"; // accent text on light backgrounds
const C = "rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]";
const spring = { type: "spring", stiffness: 420, damping: 34 } as const;
const DOTS = "radial-gradient(circle, #cfcfd6 1.2px, transparent 1.3px)";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="28" height="26" viewBox="0 0 34 32" aria-hidden="true">
        <path d="M8 22C14 22 14 10 26 10" fill="none" stroke="#f9a8d4" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="7" cy="22" r="4.5" fill="#1d1d1f" />
        <motion.circle cx="27" cy="10" r="4.5" fill={A} animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Synapse
    </span>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-14 sm:pt-20">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ backgroundImage: DOTS, backgroundSize: "22px 22px", maskImage: "radial-gradient(80% 70% at 50% 45%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(80% 70% at 50% 45%, #000 40%, transparent 100%)" }} />
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{ background: "radial-gradient(40% 35% at 50% 8%, rgba(249,168,212,.35), transparent 70%)" }} />
      <div className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-6 px-5 text-center">
        <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-[13px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.07)]">
          <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: A }}>New</span>
          Branching on confidence is here
        </motion.span>
        <h1 className="m-0 max-w-[900px] text-[clamp(44px,7.6vw,96px)] font-semibold leading-[0.98] tracking-[-0.055em] text-[#1d1d1f] [text-wrap:balance]">
          <Words text="Draw your agent. Test it. Ship it." className="justify-center" accentWords={["Ship", "it."]} accent={AD} />
        </h1>
        <Reveal delay={0.35} y={14}>
          <p className="m-0 max-w-[640px] text-[clamp(18px,2.1vw,21px)] leading-[1.45] tracking-[-0.015em] text-[#6e6e73]">
            Synapse is a visual builder for AI agents. Connect steps on a canvas, try them on real inputs, and deploy to your site, inbox or API without writing glue code.
          </p>
        </Reveal>
        <Reveal delay={0.45} y={14} className="flex flex-wrap justify-center gap-3">
          <Magnetic className="text-white shadow-[0_12px_30px_-12px_rgba(219,39,119,.8)]" style={{ background: A }} onClick={() => scrollToId("pricing")}>Start building free</Magnetic>
          <Magnetic className="bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]" onClick={() => scrollToId("build")}>See the builder</Magnetic>
        </Reveal>
      </div>
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 110, damping: 20, delay: 0.3 }} className="relative mx-auto mt-10 max-w-[1180px] px-5">
        <NodeCanvas />
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const SPAGHETTI = [
  "const SYSTEM = `You are a support agent. If the user mentions",
  "  billing, refunds, invoices (but NOT refunds over $200 unless",
  "  plan === 'pro' && region !== 'EU') then ... see helper below`;",
  "async function handle(email) {",
  "  const intent = await llm(SYSTEM + PROMPT_V7_FINAL_2 + email);",
  "  if (intent.includes('bill') || intent.includes('Bill')) {",
  "    const docs = await search(email.slice(0, 2000)); // TODO",
  "    let reply = await llm(DRAFT + JSON.stringify(docs));",
  "    if (!reply) reply = await llm(DRAFT_RETRY + email); // ???",
  "    if (score(reply) > 0.8 || isFriday()) send(reply);",
  "  } else if (/* ask Sam */ true) { escalate(email); }",
  "}",
];

function Before() {
  return (
    <div className="h-full w-full overflow-hidden bg-[#1c1c1e] p-6 text-left sm:p-8">
      <div className="flex items-center gap-2 pb-4">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
        <span className="ml-2 text-[12px] text-[#a1a1a6]" style={{ fontFamily: MONO }}>agent-final-v7.ts</span>
      </div>
      <pre className="m-0 whitespace-pre-wrap text-[clamp(9px,1.25vw,13.5px)] leading-[1.7] text-[#e8e8ed]" style={{ fontFamily: MONO }}>
        {SPAGHETTI.map((l, i) => (
          <div key={i}><span className="mr-4 select-none text-[#6e6e73]">{String(i + 1).padStart(2, " ")}</span>{l}</div>
        ))}
      </pre>
    </div>
  );
}

function After() {
  const steps = [["Trigger", "New support email"], ["Model", "Classify the intent"], ["Knowledge", "Search help center"], ["Model", "Draft a reply"], ["Branch", "Send or hand over"]];
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#fbfbfd] p-4 sm:p-8" style={{ backgroundImage: DOTS, backgroundSize: "20px 20px" }}>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {steps.map(([k, t], i) => (
          <div key={t} className="flex items-center gap-2 sm:gap-3">
            <span className="flex flex-col rounded-[12px] bg-white px-3 py-2 text-left shadow-[0_0_0_1px_rgba(0,0,0,.06),0_10px_20px_-14px_rgba(0,0,0,.35)] sm:rounded-[14px] sm:px-4 sm:py-3">
              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] sm:text-[10px]" style={{ color: k === "Model" ? AD : "#6e6e73" }}>{k}</span>
              <span className="text-[11px] font-semibold text-[#1d1d1f] sm:text-[13px]">{t}</span>
            </span>
            {i < steps.length - 1 && <span className="h-[2px] w-3 rounded-full sm:w-6" style={{ background: A }} aria-hidden="true" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function Compare() {
  return (
    <section id="why" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Why a canvas" title="Same agent. One of these you can hand to a teammate." sub="Drag the divider. On the left, the prompt-and-glue file most agents start as. On the right, the same logic as steps anyone on the team can read and change." accent={AD} center />
      <Reveal y={20} className="mx-auto mt-12 max-w-[980px]">
        <BeforeAfter before={<Before />} after={<After />} beforeLabel="Glue code" afterLabel="Synapse" autoplay />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const DIAL = [
  { id: "model", label: "Model step", d: "M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" },
  { id: "tool", label: "Tool call", d: "M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" },
  { id: "branch", label: "Branch", d: "M6 4v16M6 12h6a6 6 0 0 0 6-6M12 12a6 6 0 0 1 6 6" },
  { id: "memory", label: "Memory", d: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" },
];

function Build() {
  const [added, setAdded] = useState<string[]>([]);
  const [temp, setTemp] = useState(0.3);
  const [steps, setSteps] = useState(6);
  const [timeout, setTimeoutS] = useState(30);
  return (
    <section id="build" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead eyebrow="Build" title="Everything an agent needs, one drag away." sub="Models, tools, branches and memory are blocks. Settings feel like a design tool. Knowledge is a folder you drop in." accent={AD} />
        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Reveal y={20}>
            <div className={`${C} flex h-full flex-col p-7`}>
              <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Add a step from anywhere.</h3>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Press the plus on any wire and pick what comes next.</p>
              <div className="flex flex-1 items-center justify-center pt-2">
                <Fit><GooeyDial actions={DIAL} accent={A} color="#1d1d1f" autoplay onSelect={(id) => setAdded((a) => [DIAL.find((d) => d.id === id)!.label, ...a].slice(0, 3))} /></Fit>
              </div>
              <div className="flex min-h-[32px] flex-wrap gap-2" aria-live="polite">
                <AnimatePresence initial={false}>
                  {added.map((a, i) => (
                    <motion.span key={`${a}-${added.length - i}`} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} className="rounded-full bg-[#fdf2f8] px-3 py-1 text-[13px] font-semibold" style={{ color: AD }}>+ {a}</motion.span>
                  ))}
                </AnimatePresence>
                {added.length === 0 && <span className="text-[13px] text-[#6e6e73]">Pick an action to add it to the flow.</span>}
              </div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.06}>
            <div className={`${C} flex h-full flex-col gap-5 p-7`}>
              <div>
                <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Tune it like a design tool.</h3>
                <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Drag a label sideways to change its value. Shift for big steps.</p>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                <ScrubField label="Creativity" value={temp} onChange={setTemp} min={0} max={1} step={0.05} accent={A} />
                <ScrubField label="Max steps" value={steps} onChange={setSteps} min={1} max={20} accent={A} />
                <ScrubField label="Timeout" value={timeout} onChange={setTimeoutS} min={5} max={120} unit="s" accent={A} />
              </div>
              <div className="mt-auto rounded-[16px] bg-[#f5f5f7] p-4">
                <div className="flex justify-between text-[12px] font-semibold text-[#6e6e73]"><span>Precise</span><span>Creative</span></div>
                <div className="relative mt-2 h-2 rounded-full bg-[#e3e3e8]">
                  <motion.span className="absolute inset-y-0 left-0 rounded-full" style={{ background: A }} animate={{ width: `${temp * 100}%` }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                </div>
                <p className="m-0 mt-3 text-[13px] leading-[1.45] text-[#424245]">
                  {temp < 0.35 ? "Replies stick closely to your help articles." : temp < 0.7 ? "Replies paraphrase your articles in a warmer tone." : "Replies get creative. Good for drafts, risky for policy."}
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal y={20} delay={0.12}>
            <div className={`${C} flex h-full flex-col gap-5 p-7`}>
              <div>
                <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Give it knowledge.</h3>
                <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">Drop PDFs, docs or exports. Synapse chunks, indexes and cites them.</p>
              </div>
              <div className="flex flex-1 justify-center"><UploadChips accent={A} autoplay /></div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function TraceCard() {
  const spans = [
    { n: "Classify the intent", s: 0, w: 18, k: "model" },
    { n: "Search help center", s: 18, w: 26, k: "tool" },
    { n: "Draft a reply", s: 44, w: 42, k: "model" },
    { n: "Send or hand over", s: 86, w: 8, k: "branch" },
  ];
  return (
    <div className={`${C} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-semibold text-[#1d1d1f]">Run 1,204 · billing question</span>
        <span className="text-[13px] tabular-nums text-[#6e6e73]">2.41 s · $0.004</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {spans.map((s, i) => (
          <div key={s.n} className="flex flex-col gap-1">
            <span className="flex justify-between text-[12px]"><span className="font-medium text-[#1d1d1f]">{s.n}</span><span className="tabular-nums text-[#6e6e73]">{((s.w / 100) * 2.41).toFixed(2)} s</span></span>
            <div className="relative h-3 rounded-full bg-[#f0f0f3]">
              <motion.span className="absolute inset-y-0 rounded-full" style={{ left: `${s.s}%`, background: s.k === "model" ? A : s.k === "tool" ? "#1d1d1f" : "#a1a1a6" }} initial={{ width: 0 }} animate={{ width: `${s.w}%` }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.15 + i * 0.12 }} />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[14px] bg-[#f5f5f7] p-3 text-[12.5px] leading-[1.5] text-[#424245]">
        <span className="font-semibold text-[#1d1d1f]">Draft a reply</span> cited <span style={{ fontFamily: MONO }}>refunds-policy.md</span> and <span style={{ fontFamily: MONO }}>billing-faq.md</span>.
      </div>
    </div>
  );
}

function EvalCard() {
  const rows = [
    { n: "Answers the question", a: 88, b: 94 },
    { n: "Cites a real article", a: 76, b: 91 },
    { n: "Hands over when unsure", a: 81, b: 85 },
    { n: "Stays under 120 words", a: 92, b: 90 },
  ];
  return (
    <div className={`${C} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold text-[#1d1d1f]">200 saved emails · v12 vs v13</span>
        <span className="flex items-center gap-3 text-[12px] text-[#6e6e73]"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#c7c7cc]" />v12</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: A }} />v13</span></span>
      </div>
      {rows.map((r, i) => (
        <div key={r.n} className="flex flex-col gap-1.5">
          <span className="flex justify-between text-[13px]"><span className="text-[#1d1d1f]">{r.n}</span><span className="font-semibold tabular-nums" style={{ color: r.b >= r.a ? AD : "#6e6e73" }}>{r.b}% {r.b >= r.a ? `+${r.b - r.a}` : `${r.b - r.a}`}</span></span>
          <div className="flex flex-col gap-1">
            <motion.span className="h-1.5 rounded-full bg-[#d2d2d7]" initial={{ width: 0 }} animate={{ width: `${r.a}%` }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: i * 0.08 }} />
            <motion.span className="h-1.5 rounded-full" style={{ background: A }} initial={{ width: 0 }} animate={{ width: `${r.b}%` }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.1 + i * 0.08 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function VersionCard() {
  const [live, setLive] = useState("v13");
  const versions = [
    { v: "v13", n: "Cite articles in every reply", t: "Today, 10:42" },
    { v: "v12", n: "Hand over below 0.8 confidence", t: "Mon, 16:05" },
    { v: "v11", n: "Shorter replies", t: "Oct 12" },
  ];
  return (
    <div className={`${C} flex w-[420px] flex-col gap-2 p-4`}>
      <span className="px-2 pb-1 pt-1 text-[13px] font-semibold text-[#6e6e73]">support-triage · versions</span>
      {versions.map((x) => {
        const on = live === x.v;
        return (
          <div key={x.v} className="relative flex items-center gap-3 rounded-[16px] px-3 py-3">
            {on && <motion.span layoutId="syn-live" className="absolute inset-0 rounded-[16px] bg-[#fdf2f8]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative w-9 text-[13px] font-semibold tabular-nums text-[#1d1d1f]">{x.v}</span>
            <span className="relative flex min-w-0 flex-1 flex-col"><span className="truncate text-[14px] font-medium text-[#1d1d1f]">{x.n}</span><span className="text-[12px] text-[#6e6e73]">{x.t}</span></span>
            {on ? (
              <span className="relative rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: A }}>Live</span>
            ) : (
              <button type="button" onClick={() => setLive(x.v)} className="relative h-8 rounded-full bg-[#f0f0f3] px-3 text-[12px] font-semibold text-[#1d1d1f] outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }}>Roll back</button>
            )}
          </div>
        );
      })}
      <span className="px-2 pt-1 text-[12px] text-[#6e6e73]">Rolling back takes effect on the next message. No redeploy.</span>
    </div>
  );
}

function Test() {
  return (
    <section id="test" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Test" title="Know it works before your customers find out." sub="Talk to the agent, read every step it took, and score new versions against real conversations before you publish." accent={AD} />
      <div className="mt-10">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "01 · Talk", title: "Test it out loud.", body: "Hold the orb and ask your agent a question the way a customer would. It listens, thinks and answers with the voice you picked.", visual: <div className={`${C} flex h-[400px] w-[420px] items-center justify-center`}><VoiceOrb accent={A} autoplay /></div> },
            { kicker: "02 · Trace", title: "See every step it took.", body: "Each run is a timeline: which step ran, how long it took, what it cost and which documents it read.", visual: <TraceCard /> },
            { kicker: "03 · Score", title: "Score versions on real conversations.", body: "Save tricky emails as test cases. Every new version runs against all of them, so you see what got better and what slipped.", visual: <EvalCard /> },
            { kicker: "04 · Version", title: "Publish, then roll back in one click.", body: "Every publish is a version with a note. If something feels off, put the last one back live while you look.", visual: <VersionCard /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const G = (d: string) => (
  <svg width="56%" height="56%" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const CHANNELS: DockApp[] = [
  { id: "home", label: "Website chat", bg: `linear-gradient(180deg,#f472b6,${A})`, glyph: G("M4 5h16v11H9l-5 4z") },
  { id: "email", label: "Email inbox", bg: "linear-gradient(180deg,#4b4b52,#1d1d1f)", glyph: G("M4 6h16v12H4zM4 7l8 6 8-6") },
  { id: "chat", label: "Team chat", bg: "linear-gradient(180deg,#a78bfa,#7c3aed)", glyph: G("M5 9h14M5 15h14M10 4L8 20M16 4l-2 16") },
  { id: "api", label: "REST API", bg: "linear-gradient(180deg,#9ca3af,#4b5563)", glyph: G("M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12") },
  { id: "sms", label: "SMS", bg: "linear-gradient(180deg,#fb923c,#ea580c)", glyph: G("M7 3h10v18H7zM11 18h2") },
  { id: "voice", label: "Phone line", bg: "linear-gradient(180deg,#34d399,#059669)", glyph: G("M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z") },
];

function Deploy() {
  const [live, setLive] = useState<string[]>(["Website chat"]);
  const onDockClick = (e: MouseEvent<HTMLDivElement>) => {
    const label = (e.target as HTMLElement).closest("button")?.getAttribute("aria-label");
    if (label && CHANNELS.some((c) => c.label === label)) setLive((l) => (l.includes(label) ? l : [...l, label]));
  };
  return (
    <section id="deploy" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead eyebrow="Deploy" title="One agent. Every place your customers are." sub="Publish once and switch channels on from the dock. The same version answers on your site, in email, in team chat and over the API." accent={AD} />
          <Reveal y={16} className="flex flex-col gap-3">
            <span className="text-[13px] font-semibold text-[#6e6e73]">Agent ID</span>
            <div><CopyChip value="agt_7Hq2Lx9PwR" display="agt_7Hq2…9PwR" label="Copy agent ID" accent={A} /></div>
          </Reveal>
        </div>
        <Reveal y={20}>
          <div className={`${C} flex flex-col gap-6 p-6 sm:p-8`}>
            <div onClickCapture={onDockClick}><Fit><Dock apps={CHANNELS} autoplay /></Fit></div>
            <div className="flex flex-col gap-2 border-t border-black/[.06] pt-5">
              <span className="text-[13px] font-semibold text-[#6e6e73]">Live on {live.length} of {CHANNELS.length} channels</span>
              <div className="flex min-h-[34px] flex-wrap gap-2" aria-live="polite">
                <AnimatePresence initial={false}>
                  {live.map((l) => (
                    <motion.span key={l} layout initial={{ opacity: 0, scale: 0.8, y: 6 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={spring} className="flex items-center gap-1.5 rounded-full bg-[#fdf2f8] px-3 py-1.5 text-[13px] font-semibold" style={{ color: AD }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: A }} />{l}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
              <span className="text-[12px] text-[#6e6e73]">Click an icon in the dock to switch that channel on.</span>
            </div>
            <pre className="m-0 overflow-x-auto rounded-[16px] bg-[#1c1c1e] p-4 text-[12.5px] leading-[1.7] text-[#e8e8ed]" style={{ fontFamily: MONO }}>
              <span className="text-[#a1a1a6]">{"<!-- paste before </body> -->"}</span>{"\n"}
              {"<script src=\"https://cdn.synapse.example/chat.js\""}{"\n"}
              {"  data-agent=\"agt_7Hq2Lx9PwR\" async></script>"}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Numbers() {
  const items = [
    { to: 38, f: (n: number) => `${Math.round(n)} min`, l: "median time from blank canvas to first deploy" },
    { to: 61, f: (n: number) => `${Math.round(n)}%`, l: "of builders on the Team plan have never written code" },
    { to: 1.4, f: (n: number) => `${n.toFixed(1)}M`, l: "test runs scored last month" },
  ];
  return (
    <section className="mx-auto max-w-[1180px] px-5 py-20" aria-label="Synapse in numbers">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.l} delay={i * 0.06} y={14} className="flex flex-col gap-2 border-t border-black/[.08] pt-6">
            <Counter to={it.to} format={it.f} className="text-[clamp(38px,4.6vw,54px)] font-semibold tracking-[-0.045em] text-[#1d1d1f]" />
            <span className="text-[15px] text-[#6e6e73]">{it.l}</span>
          </Reveal>
        ))}
      </div>
      <p className="m-0 mt-8 text-[12px] text-[#6e6e73]">Placeholder figures for this template.</p>
    </section>
  );
}

const QUOTES = [
  { q: "Our support lead built the triage agent herself on a Tuesday. Engineering only saw it when it was already answering a third of the inbox.", n: "Hana Okoye", r: "Head of CX, Pinecrest Outdoor" },
  { q: "The test cases changed how we ship. Nobody argues about prompts any more, we argue about scores.", n: "Marco Silva", r: "Product Lead, Lumenfold" },
  { q: "Being able to roll back a version in one click is what got legal comfortable with us going live.", n: "Ingrid Holm", r: "Operations, Alder Lane Insurance" },
];

function Quotes() {
  return (
    <section className="bg-[#f5f5f7] py-24" aria-label="What builders say">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 px-5 md:grid-cols-3">
        {QUOTES.map((q, i) => (
          <Reveal key={q.n} delay={i * 0.06} y={18}>
            <figure className={`${C} m-0 flex h-full flex-col justify-between gap-6 p-7`}>
              <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
              <figcaption className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: i === 1 ? "#1d1d1f" : A }}>{q.n.split(" ").map((w) => w[0]).join("")}</span>
                <span className="flex flex-col text-[14px]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span><span className="text-[#6e6e73]">{q.r}</span></span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PLANS = [
  { id: "free", n: "Free", m: 0, y: 0, d: "For your first agent.", f: ["1 agent", "1,000 runs a month", "Website chat", "Community support"] },
  { id: "pro", n: "Pro", m: 29, y: 23, d: "For a team shipping agents.", f: ["10 agents", "50,000 runs a month", "All channels and the API", "Test cases and scoring"], hot: true },
  { id: "team", n: "Team", m: 99, y: 79, d: "For agents that run the business.", f: ["Unlimited agents", "500,000 runs a month", "SSO and roles", "Version approvals"] },
];

function Price({ v }: { v: number }) {
  return (
    <span className="inline-flex items-baseline overflow-hidden text-[48px] font-semibold tracking-[-0.045em] text-[#1d1d1f]">
      $
      <AnimatePresence mode="popLayout" initial={false}>
        {String(v).split("").map((ch, i) => (
          <motion.span key={`${i}-${ch}`} className="inline-block tabular-nums" initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30, delay: i * 0.03 }}>{ch}</motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead eyebrow="Pricing" title="Free to draw. Pay when it goes to work." sub="Model usage is passed through at cost, or bring your own keys." accent={AD} center />
      <Reveal y={12} className="mt-8 flex justify-center">
        <div className="relative flex rounded-full bg-[#ececf0] p-1" role="radiogroup" aria-label="Billing period">
          {([["Monthly", false], ["Yearly · save 20%", true]] as const).map(([l, v]) => (
            <button key={l} type="button" role="radio" aria-checked={yearly === v} onClick={() => setYearly(v)} className="relative h-10 rounded-full px-5 text-[14px] font-medium outline-none focus-visible:ring-2" style={{ color: yearly === v ? "#1d1d1f" : "#6e6e73", ["--tw-ring-color" as string]: A }}>
              {yearly === v && <motion.span layoutId="syn-period" className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,.12)]" transition={{ type: "spring", stiffness: 500, damping: 34 }} />}
              <span className="relative">{l}</span>
            </button>
          ))}
        </div>
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.06} y={18}>
            <div className="h-full rounded-[26px] p-[1.5px]" style={{ background: p.hot ? `linear-gradient(140deg,#f472b6,${A})` : "rgba(0,0,0,.06)" }}>
              <motion.div whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }} className="flex h-full flex-col gap-5 rounded-[24.5px] bg-white p-7">
                <div className="flex items-center justify-between">
                  <span className="text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.n}</span>
                  {p.hot && <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: A }}>Most teams</span>}
                </div>
                <span className="text-[15px] text-[#6e6e73]">{p.d}</span>
                <span className="flex items-baseline gap-1"><Price v={yearly ? p.y : p.m} /><span className="text-[15px] text-[#6e6e73]">/ month</span></span>
                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                  {p.f.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[15px] text-[#1d1d1f]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={AD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2">
                  <Magnetic className="w-full" style={{ background: p.hot ? A : "#f0f0f3", color: p.hot ? "#fff" : "#1d1d1f" }} onClick={() => scrollToId("top")}>{p.m === 0 ? "Start free" : `Try ${p.n} for 14 days`}</Magnetic>
                </div>
              </motion.div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function SynapseAIPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT }}>
        <Nav brand={<Logo />} accent={A} cta="Start building" onCta={() => scrollToId("pricing")} links={[{ label: "Why", id: "why" }, { label: "Build", id: "build" }, { label: "Test", id: "test" }, { label: "Deploy", id: "deploy" }, { label: "Pricing", id: "pricing" }]} />
        <Hero />
        <Compare />
        <Build />
        <Test />
        <Deploy />
        <Numbers />
        <Quotes />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 pb-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow="FAQ" title="Good questions." accent={AD} />
          <Reveal y={16}>
            <Faq
              accent={A}
              items={[
                { q: "Do I need to know how to code?", a: "No. Every step is a block with plain settings. If you do code, any step can be swapped for a small TypeScript or Python function." },
                { q: "Which models can I use?", a: "Any major hosted model, plus your own endpoint. You can mix them in one agent, for example a fast model to classify and a stronger one to write." },
                { q: "How do test cases work?", a: "Save real conversations as cases with what a good answer looks like. Each new version runs against all of them and gets a score per check before you publish." },
                { q: "Where is our data stored?", a: "In the region you choose, EU or US. Knowledge you upload is only used by your agents and never to train shared models." },
                { q: "Can I export an agent?", a: "Yes. Any agent exports as a readable JSON definition, and you can call it from your own code through the API." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Your first agent is one wire away." sub="Free for one agent and a thousand runs a month. No card needed." cta="Start building free" secondary="Browse templates" accent={A} glow="rgba(219,39,119,.32)" />
        </div>
        <Footer brand={<Logo />} note="A visual builder to design, test and deploy AI agents without code. Synapse is a template; the company and figures are placeholders." columns={[{ title: "Product", links: ["Canvas", "Testing", "Channels", "Pricing"] }, { title: "Learn", links: ["Docs", "Templates", "Guides", "Changelog"] }, { title: "Company", links: ["About", "Security", "Careers", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default SynapseAIPage;
