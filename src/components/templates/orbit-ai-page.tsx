"use client";
/**
 * Orbit: landing page template for five AI agents that review every pull
 * request (tests, security, performance, style, docs). The hero is an
 * orrery: the pull request at the centre, each agent on its own tilted orbit,
 * a scan beam from the selected one. Chivo and Chivo Mono on cool paper.
 * Kit components: Progress Button, Hold to Confirm, Ruler Picker, Switch
 * (from Animated Tabs), Liquid Dial, Standing Calendar and Price Odometer.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ScaleBox } from "@/components/templates/kit/blocks";
import { fontFaces } from "@/components/templates/kit/fonts";
import { Orrery, STAGE } from "@/components/templates/orbit-ai/Orrery";
import ProgressButton from "@/components/templates/kit/components/ProgressButton";
import HoldToConfirm from "@/components/templates/kit/components/HoldToConfirm";
import RulerPicker from "@/components/templates/orbit-ai/budget-ruler";
import { Switch } from "@/components/templates/kit/components/AnimatedTabs";
import GooeyDial from "@/components/templates/kit/components/GooeyDial";
import StandingCalendar from "@/components/templates/kit/components/StandingCalendar";
import PriceOdometer from "@/components/templates/kit/components/PriceOdometer";
import { CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, StickyStory, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const A = "#2340e0"; // cobalt: fills, graphics and text (6.9:1 on white)
const INK = "#0e141b";
const PAPER = "#eceff2";
const RULE = "#b9c2cb";
const SANS = "'Chivo Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'Chivo Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace";
const FONT_CSS = fontFaces("orbit", [
  { family: "Chivo Variable", file: "chivo" },
  { family: "Chivo Mono Variable", file: "chivo-mono" },
]);
const OK = "#1a7f37";
const WARN = "#b25000";
const BLOCK = "#d70015";

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <ellipse cx="16" cy="16" rx="13" ry="6" fill="none" stroke={A} strokeWidth="2.4" transform="rotate(-24 16 16)" />
        <circle cx="16" cy="16" r="5.2" fill={INK} />
        <motion.circle r="2.6" cx={4.6} cy={21.2} fill={A} initial={{ cx: 4.6, cy: 21.2 }} animate={{ cx: [4.6, 27.4, 4.6], cy: [21.2, 10.8, 21.2] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
      Orbit
    </span>
  );
}

type Status = "pass" | "warn" | "block";
const STATUS: Record<Status, { c: string; bg: string; l: string }> = {
  pass: { c: OK, bg: "rgba(52,199,89,.14)", l: "Pass" },
  warn: { c: WARN, bg: "rgba(255,159,10,.16)", l: "Note" },
  block: { c: BLOCK, bg: "rgba(255,59,48,.12)", l: "Blocking" },
};

const AGENTS: { id: string; name: string; status: Status; verdict: string; finding: string; where: string; d: string }[] = [
  { id: "tests", name: "Tests", status: "warn", verdict: "2 untested branches", finding: "retry() gained two branches with no test. Orbit drafted both in deliver.test.ts for you to keep or bin.", where: "webhooks/deliver.ts:44", d: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" },
  { id: "security", name: "Security", status: "block", verdict: "Secret written to logs", finding: "The signing secret is logged at debug level on every retry. Blocking the merge until it's removed.", where: "webhooks/deliver.ts:58", d: "M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" },
  { id: "perf", name: "Performance", status: "warn", verdict: "+38 ms at p95", finding: "Backoff sleeps on the request thread. In the load replay p95 went from 212 to 250 ms, over your 25 ms budget.", where: "webhooks/deliver.ts:51", d: "M13 3L5 13h6l-1 8 8-10h-6z" },
  { id: "style", name: "Style", status: "pass", verdict: "1 nit", finding: "Matches house style. One nit: an early return on line 31 would drop a level of nesting.", where: "webhooks/deliver.ts:31", d: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" },
  { id: "docs", name: "Docs", status: "pass", verdict: "Docs drafted", finding: "RETRY_MAX is a new public option. Orbit added it to docs/webhooks.md and the changelog.", where: "docs/webhooks.md", d: "M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5" },
];


const Icon = ({ d, size = 20, color = "currentColor" }: { d: string; size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/* ------------------------------------------------------------------ */
/* Hero: the agent ring                                                 */
/* ------------------------------------------------------------------ */

function PrCard({ sel, onPick }: { sel: number; onPick: (i: number) => void }) {
  const a = AGENTS[sel];
  const blocked = AGENTS.some((x) => x.status === "block");
  return (
    <div className={`${card} flex w-[420px] flex-col gap-4 p-5`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full" style={{ background: "rgba(35,64,224,.1)", color: A }}>
          <Icon d="M7 5v14M7 5a2 2 0 1 0 0 .1M17 19a2 2 0 1 0 0-.1M17 17V9a3 3 0 0 0-3-3h-3M13 4l-2 2 2 2" size={16} />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="text-[16px] font-semibold leading-[1.3] tracking-[-0.01em] text-[#1d1d1f]">Retry failed webhook deliveries</span>
          <span className="text-[12px] text-[#6e6e73]"><span className="tabular-nums">#4127</span>, mara.okafor wants to merge into main, <span className="tabular-nums" style={{ color: OK }}>+184</span> <span className="tabular-nums" style={{ color: BLOCK }}>−37</span></span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {AGENTS.map((g, i) => {
          const s = STATUS[g.status];
          const on = i === sel;
          return (
            <button key={g.id} type="button" onClick={() => onPick(i)} className="relative flex items-center gap-3 rounded-xl px-2.5 py-1.5 text-left outline-none focus-visible:ring-2" style={{ ["--tw-ring-color" as string]: A }} aria-pressed={on}>
              {on && <motion.span layoutId="orbit-row" className="absolute inset-0 rounded-xl bg-[#eef1fd]" transition={{ type: "spring", stiffness: 480, damping: 36 }} />}
              <span className="relative" style={{ color: on ? A : "#6e6e73" }}><Icon d={g.d} size={16} /></span>
              <span className="relative flex-1 text-[14px] font-medium text-[#1d1d1f]">{g.name}</span>
              <span className="relative text-[12px] text-[#6e6e73]">{g.verdict}</span>
              <span className="relative rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ color: s.c, background: s.bg }}>{s.l}</span>
            </button>
          );
        })}
      </div>
      <div className="relative min-h-[80px] overflow-hidden rounded-2xl bg-[#f5f5f7] p-3.5" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={a.id} initial={{ opacity: 0, y: 14, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -14, filter: "blur(4px)" }} transition={{ type: "spring", stiffness: 340, damping: 30 }}>
            <span className="block text-[11px] font-semibold" style={{ color: A, fontFamily: MONO }}>{a.where}</span>
            <span className="mt-1 block text-[13.5px] leading-[1.45] text-[#1d1d1f]">{a.finding}</span>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[12px] text-[#6e6e73]">Reviewed in 3 min 40 s</span>
        <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={blocked ? { background: "rgba(255,59,48,.1)", color: BLOCK } : { background: "rgba(52,199,89,.14)", color: OK }}>
          {blocked ? "Merge blocked by Security" : "Ready to merge"}
        </span>
      </div>
    </div>
  );
}

const TONES = AGENTS.map((g) => STATUS[g.status].c);

function OrbitHero() {
  const [sel, setSel] = useState(1);
  const touched = useRef(0);
  const pick = (i: number) => { touched.current = Date.now(); setSel(i); };
  // bring the next agent's finding up every few seconds while nobody is choosing
  useEffect(() => {
    const t = setInterval(() => { if (Date.now() - touched.current > 7000) setSel((s) => (s + 1) % AGENTS.length); }, 4200);
    return () => clearInterval(t);
  }, []);
  const agents = AGENTS.map((g, i) => ({ id: g.id, name: g.name, tone: TONES[i], icon: g.d }));
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="hidden w-full md:block">
        <ScaleBox w={STAGE.w} h={STAGE.h}>
          <Orrery agents={agents} sel={sel} onPick={pick} card={<PrCard sel={sel} onPick={pick} />} ink={INK} paper="#ffffff" line={RULE} accent={A} />
        </ScaleBox>
      </div>
      <div className="w-full md:hidden">
        <ScaleBox w={STAGE.w} h={STAGE.h}>
          <Orrery agents={agents} sel={sel} onPick={pick} ink={INK} paper="#ffffff" line={RULE} accent={A} />
        </ScaleBox>
        <div className="mt-4"><Fit><PrCard sel={sel} onPick={pick} /></Fit></div>
      </div>
      <p className="m-0 text-center text-[13.5px] text-[#4a5561]">Each agent reviews on its own orbit. Press one to read what it found.</p>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative -mt-[76px] overflow-hidden" style={{ background: PAPER }}>
      <div className="relative mx-auto max-w-[1180px] px-5 pt-[124px] lg:pt-[140px]">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-5">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="text-[13px]" style={{ color: "#4a5561", fontFamily: MONO }}>
              Pull request #4127, under review by five agents
            </motion.span>
            <h1 className="m-0 text-[clamp(42px,6vw,82px)] font-[640] leading-[0.95] tracking-[-0.045em] text-[#0e141b] [text-wrap:balance]">
              <Words text="Five reviewers on every pull request." />
            </h1>
          </div>
          <motion.div className="flex flex-col gap-6 lg:pb-3" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.3 }}>
            <p className="m-0 text-[clamp(17px,1.9vw,19px)] leading-[1.5] text-[#4a5561]">
              Orbit runs a tests, security, performance, style and docs agent on each PR, then posts one combined review. Your human reviewers get to talk about the design.
            </p>
            <div className="flex flex-wrap gap-3">
              <Magnetic className="text-white" style={{ background: INK }} onClick={() => scrollToId("pricing")}>Add to GitHub</Magnetic>
              <Magnetic className="text-[#0e141b] shadow-[inset_0_0_0_1px_rgba(14,20,27,.2)]" style={{ background: "transparent" }} onClick={() => scrollToId("diff")}>Read a sample review</Magnetic>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="relative mx-auto mt-8 max-w-[1240px] px-5 pb-16">
        <OrbitHero />
      </div>
    </section>
  );
}

function AgentHead({ i }: { i: number }) {
  const a = AGENTS[i];
  const s = STATUS[a.status];
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: A }}><Icon d={a.d} size={18} /></span>
      <span className="flex flex-1 flex-col">
        <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{a.name} agent</span>
        <span className="text-[12px] text-[#6e6e73]" style={{ fontFamily: MONO }}>{a.where}</span>
      </span>
      <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ color: s.c, background: s.bg }}>{s.l}</span>
    </div>
  );
}

function TestsCard() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-6`}>
      <AgentHead i={0} />
      <div className="rounded-2xl bg-[#f5f5f7] p-4 text-[12.5px] leading-[1.85]" style={{ fontFamily: MONO }}>
        {[
          { l: "  if (res.status >= 500) {", c: 2 },
          { l: "    return schedule(attempt + 1);", c: 0 },
          { l: "  }", c: -1 },
          { l: "  if (attempt >= RETRY_MAX) {", c: 2 },
          { l: "    return deadLetter(event);", c: 0 },
          { l: "  }", c: -1 },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="h-4 w-[3px] flex-none rounded-full" style={{ background: r.c === 0 ? "#ff3b30" : r.c === 2 ? "#34c759" : "transparent" }} aria-hidden="true" />
            <span className="whitespace-pre text-[#1d1d1f]">{r.l}</span>
          </div>
        ))}
      </div>
      <p className="m-0 text-[14px] leading-[1.5] text-[#6e6e73]">Red lines never run in your test suite. Orbit wrote a test for each, using your existing fixtures.</p>
      <div className="flex justify-center"><ProgressButton label="Add 2 tests to this PR" doneLabel="View the commit" accent={A} autoplay /></div>
    </div>
  );
}

function SecurityCard() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-6`}>
      <AgentHead i={1} />
      <div className="rounded-2xl bg-[#1d1d1f] p-4 text-[12.5px] leading-[1.85] text-[#e8e8ed]" style={{ fontFamily: MONO }}>
        <div className="whitespace-pre"><span style={{ color: "#8e8e93" }}>{"57  "}</span>{"  log.debug(\"retrying\", {"}</div>
        <div className="whitespace-pre rounded-[4px]" style={{ background: "rgba(255,59,48,.22)" }}><span style={{ color: "#8e8e93" }}>{"58  "}</span>{"    url, attempt, secret: hook.secret,"}</div>
        <div className="whitespace-pre"><span style={{ color: "#8e8e93" }}>{"59  "}</span>{"  });"}</div>
      </div>
      <p className="m-0 text-[14px] leading-[1.5] text-[#6e6e73]">Blocking findings stop the merge. If you really need to ship, an owner can override. It takes a deliberate hold, and it goes in the audit log.</p>
      <div className="flex justify-center"><HoldToConfirm label="Hold to merge anyway" holdingLabel="Keep holding…" doneLabel="Override logged" color={INK} holdMs={1600} autoplay /></div>
    </div>
  );
}

function PerfCard() {
  const [budget, setBudget] = useState(25);
  const cost = 38;
  const over = cost > budget;
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-6`}>
      <AgentHead i={2} />
      <div className="flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-4 py-3">
        <span className="text-[14px] text-[#1d1d1f]">This PR adds <b className="font-semibold tabular-nums">+{cost} ms</b> at p95</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={String(over)} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring", stiffness: 500, damping: 26 }} className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={over ? { color: WARN, background: STATUS.warn.bg } : { color: OK, background: STATUS.pass.bg }}>
            {over ? "Over budget" : "Within budget"}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[13px] font-medium text-[#6e6e73]">Latency budget per pull request. Drag the ruler.</span>
      <RulerPicker min={0} max={90} defaultValue={25} unit="ms" presets={[10, 25, 50]} accent={A} onChange={setBudget} autoplay />
    </div>
  );
}

function StyleCard() {
  const [rules, setRules] = useState([
    { l: "Prefer early returns", n: 1, on: true },
    { l: "No default exports in lib/", n: 0, on: true },
    { l: "Booleans start with is or has", n: 2, on: false },
    { l: "Only comment on changed lines", n: 0, on: true },
  ]);
  const nits = rules.reduce((s, r) => s + (r.on ? r.n : 0), 0);
  return (
    <div className={`${card} flex w-[440px] flex-col gap-4 p-6`}>
      <AgentHead i={3} />
      <div className="flex flex-col divide-y divide-black/[.06]">
        {rules.map((r, i) => (
          <div key={r.l} className="flex items-center justify-between gap-4 py-3">
            <span className="flex flex-col">
              <span className="text-[15px] text-[#1d1d1f]">{r.l}</span>
              <span className="text-[12px] text-[#6e6e73]">{r.n ? `${r.n} in this PR` : "Nothing in this PR"}</span>
            </span>
            <Switch checked={r.on} onChange={(v) => setRules((rs) => rs.map((x, k) => (k === i ? { ...x, on: v } : x)))} label={r.l} accent={A} />
          </div>
        ))}
      </div>
      <span className="text-[13px] text-[#6e6e73]">Orbit will leave <b className="font-semibold tabular-nums text-[#1d1d1f]">{nits}</b> {nits === 1 ? "nit" : "nits"}. Rules live in .orbit.yml.</span>
    </div>
  );
}

function DocsCard() {
  return (
    <div className={`${card} flex w-[440px] flex-col gap-5 p-6`}>
      <AgentHead i={4} />
      <div className="overflow-hidden rounded-2xl bg-[#f5f5f7] text-[12.5px] leading-[1.85]" style={{ fontFamily: MONO }}>
        <div className="border-b border-black/[.06] px-4 py-2 text-[11px] font-semibold text-[#6e6e73]">docs/webhooks.md</div>
        <div className="p-4">
          <div className="whitespace-pre text-[#6e6e73]">{"  ## Retries"}</div>
          {["+ Failed deliveries retry with backoff.", "+ Set RETRY_MAX (default 5) to change", "+ how many times before dead-letter."].map((l, i) => (
            <motion.div key={l} className="whitespace-pre" style={{ color: OK }} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.25 + i * 0.18 }}>{l}</motion.div>
          ))}
        </div>
      </div>
      <p className="m-0 text-[14px] leading-[1.5] text-[#6e6e73]">New config, new endpoints and breaking changes get a docs and changelog draft in the same PR. Accept it, edit it, or ignore it.</p>
    </div>
  );
}

function Agents() {
  return (
    <section id="agents" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead title="Each one does one job, properly." sub="Specialists beat one generalist bot. Every agent has its own checks, its own config and its own line in the review." accent={A} />
      <div className="mt-10">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Tests agent", title: "Finds the lines your tests never run.", body: "Orbit runs coverage on the diff, not the repo. New branches with no test get a drafted test that uses your fixtures and naming.", visual: <TestsCard /> },
            { kicker: "Security agent", title: "Stops secrets and injections at the door.", body: "Leaked credentials, unsafe queries, risky dependencies. Blocking findings hold the merge until fixed or deliberately overridden.", visual: <SecurityCard /> },
            { kicker: "Performance agent", title: "Measures the change against a real budget.", body: "Orbit replays recorded traffic against the branch and compares p95 with main. You set the budget; it tells you when a PR spends it.", visual: <PerfCard /> },
            { kicker: "Style agent", title: "Your style guide, not a generic one.", body: "Rules come from your .orbit.yml and your history. Turn one off and its comments disappear from every open PR.", visual: <StyleCard /> },
            { kicker: "Docs agent", title: "Docs that ship with the code.", body: "When a PR changes something users can see, the docs agent drafts the update in the same branch, so the docs never lag a release.", visual: <DocsCard /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The review, in the diff (whitespace preserved)                       */
/* ------------------------------------------------------------------ */

type DiffLine = { n: string; k: " " | "+" | "-"; t: string; note?: { agent: number; text: string } };
const DIFF: DiffLine[] = [
  { n: "41", k: " ", t: "export async function deliver(hook: Hook, event: Event) {" },
  { n: "42", k: "-", t: "  const res = await post(hook.url, event);" },
  { n: "42", k: "+", t: "  for (let attempt = 1; ; attempt++) {" },
  { n: "43", k: "+", t: "    const res = await post(hook.url, event);" },
  { n: "44", k: "+", t: "    if (res.ok) return res;" },
  { n: "45", k: "+", t: "    if (attempt >= RETRY_MAX) {" },
  { n: "46", k: "+", t: "      return deadLetter(event);", note: { agent: 0, text: "No test reaches this line. Drafted one in deliver.test.ts." } },
  { n: "47", k: "+", t: "    }" },
  { n: "48", k: "+", t: "    log.debug(\"retrying\", { attempt, secret: hook.secret });", note: { agent: 1, text: "Signing secret written to logs. Remove it before merge." } },
  { n: "49", k: "+", t: "    await sleep(backoff(attempt));", note: { agent: 2, text: "Blocks the request thread. Move retries to the queue worker." } },
  { n: "50", k: "+", t: "  }" },
  { n: "51", k: " ", t: "}" },
];

function DiffPanel() {
  return (
    <div className="overflow-hidden rounded-[24px] bg-[#16181d] shadow-[0_0_0_1px_rgba(255,255,255,.06),0_40px_80px_-40px_rgba(35,64,224,.4)]">
      <div className="flex items-center gap-2 border-b border-white/[.08] px-5 py-3.5">
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} aria-hidden="true" />)}
        <span className="ml-2 text-[12px] font-medium text-[#a1a1a6]" style={{ fontFamily: MONO }}>webhooks/deliver.ts</span>
        <span className="ml-auto text-[12px] tabular-nums text-[#a1a1a6]">3 comments</span>
      </div>
      <div className="overflow-x-auto py-3 text-[12.5px] leading-[1.8] sm:text-[13px]" style={{ fontFamily: MONO }}>
        <div className="min-w-max">
          {DIFF.map((d, i) => (
            <div key={i}>
              <div className="flex whitespace-pre pr-6" style={{ background: d.k === "+" ? "rgba(46,160,67,.16)" : d.k === "-" ? "rgba(248,81,73,.16)" : undefined }}>
                <span className="w-12 flex-none select-none pr-3 text-right tabular-nums text-[#8b949e]">{d.n}</span>
                <span className="w-5 flex-none select-none text-center" style={{ color: d.k === "+" ? "#56d364" : d.k === "-" ? "#f85149" : "#8b949e" }}>{d.k}</span>
                <code className="whitespace-pre text-[#e6edf3]">{d.t}</code>
              </div>
              {d.note && (
                <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ type: "spring", stiffness: 260, damping: 24 }} className="sticky left-[68px] my-1.5 ml-[68px] mr-5 flex w-[min(520px,calc(100vw-120px))] items-start gap-2.5 rounded-xl bg-[#22262e] px-3 py-2.5" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-white" style={{ background: A }}><Icon d={AGENTS[d.note.agent].d} size={13} /></span>
                  <span className="flex flex-col whitespace-normal">
                    <span className="text-[12px] font-semibold text-[#f5f5f7]">Orbit, {AGENTS[d.note.agent].name} agent</span>
                    <span className="text-[13px] leading-[1.45] text-[#c9d1d9]">{d.note.text}</span>
                  </span>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Diff() {
  const [picked, setPicked] = useState<string | null>(null);
  const said: Record<string, string> = { fix: "Fix pushed as a commit on your branch.", explain: "Orbit replied with the reasoning and a link to the rule.", rerun: "Security agent re-running on the latest commit.", dismiss: "Comment dismissed. Orbit won't raise it on this PR again." };
  return (
    <section id="diff" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="Comments where the problem is." sub="One review, posted as you'd want a colleague to post it: on the exact line, with the reason, and with a fix when there is one." accent={A} />
        <div className="mt-12 grid grid-cols-1 items-center gap-6 lg:grid-cols-[1.5fr_1fr]">
          <Reveal y={18} amount={0.15}><DiffPanel /></Reveal>
          <Reveal y={18} delay={0.1}>
            <div className={`${card} flex flex-col items-center gap-2 p-6`}>
              <span className="self-start text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Answer a comment</span>
              <span className="self-start text-[14px] text-[#6e6e73]">Press the button and pick what Orbit should do with the security finding.</span>
              <Fit>
                <GooeyDial
                  accent={A}
                  color={INK}
                  autoplay
                  onSelect={setPicked}
                  actions={[
                    { id: "fix", label: "Apply fix", d: "M5 12.5l4.5 4.5L19 7.5" },
                    { id: "explain", label: "Explain", d: "M12 18h.01M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" },
                    { id: "rerun", label: "Re-run", d: "M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" },
                    { id: "dismiss", label: "Dismiss", d: "M7 7l10 10M17 7L7 17" },
                  ]}
                />
              </Fit>
              <p className="m-0 min-h-[40px] text-center text-[13px] text-[#6e6e73]" aria-live="polite">{picked ? said[picked] : "Nothing picked yet."}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Setup                                                                */
/* ------------------------------------------------------------------ */

const YML = `# .orbit.yml
agents:
  tests:
    min_diff_coverage: 80
  security:
    block_on: [secrets, sql_injection]
  performance:
    p95_budget_ms: 25
    replay: traffic/checkout-api
  style:
    rules: ./docs/style.md
  docs:
    paths: [docs/, CHANGELOG.md]
quiet_on_clean: true`;

function Setup() {
  const steps = [
    { t: "Install the GitHub app", b: "Pick the repositories. Orbit only asks for read access to code and write access to PR comments." },
    { t: "Add .orbit.yml, or don't", b: "Sensible defaults work on day one. The file lets you set budgets, blocking rules and which agents run." },
    { t: "Open a pull request", b: "The first review lands in about four minutes. After that, every push gets a fresh pass on the new commits only." },
  ];
  return (
    <section id="setup" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-10">
          <SectionHead title="Ten minutes, then forget it." accent={A} />
          <Stagger className="flex flex-col gap-6">
            {steps.map((s, i) => (
              <div key={s.t} className="flex gap-4">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-[14px] font-semibold tabular-nums text-white" style={{ background: A }}>{i + 1}</span>
                <span className="flex flex-col gap-1">
                  <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{s.t}</span>
                  <span className="text-[15px] leading-[1.5] text-[#6e6e73]">{s.b}</span>
                </span>
              </div>
            ))}
          </Stagger>
        </div>
        <Reveal y={18}>
          <div className={`${card} overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-black/[.06] px-5 py-3.5">
              <span className="text-[12px] font-medium text-[#6e6e73]" style={{ fontFamily: MONO }}>.orbit.yml</span>
              <span className="text-[12px] text-[#6e6e73]">optional</span>
            </div>
            <pre className="m-0 overflow-x-auto whitespace-pre p-5 text-[13px] leading-[1.75] text-[#1d1d1f]" style={{ fontFamily: MONO }}>
              {YML.split("\n").map((l, i) => {
                const m = l.match(/^(\s*)([\w_]+)(:)(.*)$/);
                return (
                  <div key={i} className="whitespace-pre">
                    {l.startsWith("#") ? <span className="text-[#6e6e73]">{l}</span> : m ? <>{m[1]}<span style={{ color: A }}>{m[2]}</span>{m[3]}<span className="text-[#9a3412]">{m[4]}</span></> : l}
                  </div>
                );
              })}
            </pre>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Activity, pricing                                                    */
/* ------------------------------------------------------------------ */

function Activity() {
  return (
    <section id="activity" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-12 px-5">
        <SectionHead title="Every review, standing up." sub="A day's column is as tall as the pull requests Orbit reviewed. Hover a column for the day. Press the button to stand the grid up." accent={A} center />
        <Reveal y={18} className="w-full">
          <div className={`${card} flex w-full justify-center px-4 py-10`}><Fit><StandingCalendar weeks={30} noun="pull requests reviewed" autoplay /></Fit></div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-8">
          <SectionHead title="Pay for the people who open PRs." sub="All five agents on every plan. Reviewers and bots are free. Open-source repositories are free forever." accent={A} />
          <Stagger className="flex flex-col gap-3">
            {["Unlimited repositories and reviews", "Self-hosted runners for private networks", "SSO, audit log and data residency on Business", "14-day trial with the full product, no card"].map((t) => (
              <span key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: "rgba(35,64,224,.1)", color: A }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
                {t}
              </span>
            ))}
          </Stagger>
        </div>
        <Reveal y={18} className="flex justify-center">
          <Fit><div className="w-[460px]"><PriceOdometer monthlyRate={24} yearlyRate={19} maxSeats={200} accent={A} autoplay /></div></Fit>
        </Reveal>
      </div>
    </section>
  );
}

export default function OrbitAIPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: SANS }}>
        <style>{FONT_CSS}</style>
        <Nav brand={<Logo />} accent={A} cta="Add to GitHub" onCta={() => scrollToId("pricing")} links={[{ label: "Agents", id: "agents" }, { label: "Review", id: "diff" }, { label: "Setup", id: "setup" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <Hero />
        <Agents />
        <Diff />
        <Setup />
        <Activity />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead title="Before you install." accent={A} />
          <Reveal y={14}>
            <Faq
              accent={A}
              items={[
                { q: "Does Orbit replace human review?", a: "No, and it shouldn't. It takes the mechanical checks off your reviewers' plate so they can talk about design, naming and whether the change is a good idea at all. Many teams keep one required human approval." },
                { q: "Will it flood our PRs with comments?", a: "It posts one combined review, comments only on changed lines, and says nothing when a PR is clean. Dismiss a comment once and it won't come back on that PR." },
                { q: "Where does our code go?", a: "Reviews run in an isolated container per pull request that is deleted when the review is posted. Code is never used to train models. Business plans can run agents on self-hosted runners inside your network." },
                { q: "How does the performance agent measure anything?", a: "You point it at recorded traffic (we provide a small recorder) or a load script. It replays the same requests against main and the branch and compares latency percentiles." },
                { q: "Which languages and CI systems work?", a: "TypeScript, JavaScript, Python, Go, Java, Kotlin, Ruby and Rust today. Orbit reads results from GitHub Actions, CircleCI, Buildkite and GitLab CI if you already run tests there." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Get your next PR reviewed five ways." sub="Install on one repository, open a pull request, and read the review in about four minutes." cta="Add to GitHub" secondary="Talk to us" accent={A} glow="rgba(37,99,235,.32)" />
        </div>
        <Footer brand={<Logo />} note="Five AI agents that review every pull request, so people can review the ideas." columns={[{ title: "Product", links: ["Agents", "Reviews", "Self-hosting", "Pricing"] }, { title: "Developers", links: ["Docs", ".orbit.yml", "Changelog", "Status"] }, { title: "Company", links: ["About", "Security", "Careers", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}
