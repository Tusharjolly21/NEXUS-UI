"use client";
/**
 * Asteria: landing page template for an AI tool that turns a rough product
 * idea into a launch page. The hero is a night sky: every build starts as a
 * constellation in the shape of the page, and each part lights up where its
 * stars were. Fraunces for headings, Hanken Grotesk for text, one indigo.
 * Built from Motion Kit components: Upload Chips, Pixel Select (as a tone
 * picker), Fan Deck, Scrub Inputs, Before / After, Progress Button, Copy
 * Buttons, Matrix Loaders, the Switch from Animated Tabs and the rolling
 * number from Price Odometer.
 */
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { NightSky, Constellation } from "@/components/templates/asteria/Sky";
import { BASE_CSS, FONT_CSS, FONT_SANS, NIGHT } from "@/components/templates/asteria/theme";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import UploadChips from "@/components/templates/kit/components/UploadChips";
import FanDeck from "@/components/templates/kit/components/FanDeck";
import { ScrubField } from "@/components/templates/kit/components/ScrubInput";
import ProgressButton from "@/components/templates/kit/components/ProgressButton";
import { CopyChip, CopyCommand } from "@/components/templates/kit/components/CopyButton";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import { Switch } from "@/components/templates/kit/components/AnimatedTabs";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import ToneSelect from "@/components/templates/asteria/ToneSelect";
import { CtaBand, Faq, Fit, Footer, Marquee, Nav, Reveal, SectionHead, Stagger, Words, card, scrollToId } from "@/components/templates/kit/parts";
import StickyStory from "@/components/templates/asteria/StickyStory";
import NotesToPage from "@/components/templates/asteria/NotesToPage";

const A = "#3f3cbb"; // indigo: buttons, graphics and accent text (8.4:1 on white)
const INK = "#1d1d1f";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
const spring = { type: "spring", stiffness: 260, damping: 24 } as const;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <span className="relative flex h-[26px] w-[26px] items-center justify-center rounded-[8px]" style={{ background: A }} aria-hidden="true">
        <motion.svg width="16" height="16" viewBox="0 0 24 24" animate={{ rotate: [0, 90] }} transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2.6, type: "spring", stiffness: 120, damping: 14 }}>
          <path d="M12 2.5l2.4 7.1 7.1 2.4-7.1 2.4L12 21.5l-2.4-7.1L2.5 12l7.1-2.4z" fill="#fff" />
        </motion.svg>
      </span>
      Asteria
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: type or pick an idea and watch the launch page assemble.      */
/* ------------------------------------------------------------------ */

type Art = "moon" | "loaf" | "peak" | "spark";
interface Idea {
  id: string;
  idea: string;
  brand: string;
  headline: string;
  sub: string;
  cta: string;
  p: [string, string, string, string]; // ink, primary, highlight, background
  features: [string, string][];
  price: string;
  art: Art;
  guessed?: boolean;
}

const IDEAS: Idea[] = [
  {
    id: "paws",
    idea: "Dog walking for people who work night shifts",
    brand: "Nightpaws",
    headline: "Walks at 2am, by people who are awake anyway.",
    sub: "Vetted walkers on night rotas, a live map of every walk, and a photo the moment your dog is home.",
    cta: "Book a night walk",
    p: ["#1e1b4b", "#4f46e5", "#fbbf24", "#f5f3ff"],
    features: [["Night rotas", "Walkers who sleep in the day."], ["Live map", "Follow the whole walk."], ["Home photo", "Proof they are back inside."]],
    price: "From $18 a walk",
    art: "moon",
  },
  {
    id: "bread",
    idea: "A sourdough subscription for one small town",
    brand: "Crumb Club",
    headline: "A fresh loaf on your step every Friday.",
    sub: "Baked overnight on Mill Lane and delivered by bike before 8am. Skip any week with one tap.",
    cta: "Start my loaf",
    p: ["#431407", "#c2410c", "#fcd34d", "#fff7ed"],
    features: [["Baked overnight", "Out of the oven at 5am."], ["Bike delivery", "On your step by 8."], ["Skip a week", "No fees, no forms."]],
    price: "$9 a loaf, weekly",
    art: "loaf",
  },
  {
    id: "climb",
    idea: "A training log for indoor climbers",
    brand: "Crux Log",
    headline: "Log every send. Watch your grade climb.",
    sub: "Tap in a route between attempts, tag what beat you, and get a plan for next session.",
    cta: "Start logging free",
    p: ["#052e2b", "#0f766e", "#5eead4", "#f0fdfa"],
    features: [["Ten-second logs", "Grade, tries, done."], ["Weak spots", "Crimps, slopers, heel hooks."], ["Session plans", "Built from your own data."]],
    price: "Free, or $4 a month",
    art: "peak",
  },
];

const CUSTOM_PALETTES: Idea["p"][] = [
  ["#3b0764", "#9333ea", "#f0abfc", "#faf5ff"],
  ["#0c4a6e", "#0284c7", "#7dd3fc", "#f0f9ff"],
  ["#3f1d0b", "#b45309", "#fde68a", "#fffbeb"],
  ["#1f2937", "#db2777", "#fbcfe8", "#fdf2f8"],
];
const ARTS: Art[] = ["spark", "moon", "peak", "loaf"];
const STOP = /^(a|an|the|for|of|to|and|with|my|our|app|that|who|which|in|on|at|by|is|it)$/i;

/** Builds a deterministic first draft from whatever the visitor typed. */
function fromText(t: string): Idea {
  const clean = t.trim().replace(/\s+/g, " ").slice(0, 72);
  const words = clean.replace(/[^\p{L}\p{N}\s'-]/gu, "").split(" ").filter((w) => w && !STOP.test(w));
  const brand = (words.slice(0, 2).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ") || "Untitled").slice(0, 20);
  let h = 0;
  for (const ch of clean) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return {
    id: `custom-${h}`,
    idea: clean,
    brand,
    headline: clean[0].toUpperCase() + clean.slice(1).replace(/[.!?]*$/, "."),
    sub: "A first draft from one sentence. Anything Asteria had to guess is marked, so you check it before it goes live.",
    cta: "Join the waitlist",
    p: CUSTOM_PALETTES[h % CUSTOM_PALETTES.length],
    features: [["What it does", "One clear line, in your words."], ["Who it is for", "The people you described."], ["How to start", "A waitlist from day one."]],
    price: "Waitlist open",
    art: ARTS[h % ARTS.length],
    guessed: true,
  };
}

const STEPS = ["Name and navigation", "Headline", "Pitch and button", "Palette and artwork", "Features", "Pricing"];

/** Runs the assembly timeline: stage 0 is the empty skeleton, 6 is ready. */
function useAssembler() {
  const [idea, setIdea] = useState<Idea>(IDEAS[0]);
  const [stage, setStage] = useState(0);
  const [typed, setTyped] = useState(0);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const build = (next: Idea) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIdea(next);
    setStage(0);
    setTyped(0);
    setRun((r) => r + 1);
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const L = next.headline.length;
    const c = 1500; // the constellation draws first
    at(c, () => setStage(1));
    at(c + 440, () => setStage(2));
    for (let i = 1; i <= L; i++) at(c + 440 + i * 24, () => setTyped(i));
    const t = c + 440 + L * 24 + 260;
    at(t, () => setStage(3));
    at(t + 480, () => setStage(4));
    at(t + 960, () => setStage(5));
    at(t + 1440, () => setStage(6));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return { idea, stage, typed, run, build };
}

/** Swaps a grey placeholder for the real block with a spring when its stage arrives. */
function Slot({ show, k, skel, children, className = "", block }: { show: boolean; k: string; skel: ReactNode; children: ReactNode; className?: string; block: string }) {
  return (
    <div className={`relative ${className}`} data-block={block}>
      <AnimatePresence mode="popLayout" initial={false}>
        {show ? (
          <motion.div key={`r${k}`} initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }} transition={spring}>
            {children}
          </motion.div>
        ) : (
          <motion.div key={`s${k}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.12 } }}>
            {skel}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** A placeholder's footprint. It draws nothing itself: the constellation puts stars on it. */
const Bar = ({ w, h = 12, box = false }: { w: number | string; h?: number; box?: boolean }) => <span className="block" data-star={box ? "box" : "bar"} style={{ width: w, height: h }} />;

function Artwork({ idea }: { idea: Idea }) {
  const [ink, pri, hi, bg] = idea.p;
  return (
    <div className="relative h-full w-full overflow-hidden rounded-[22px]" style={{ background: `linear-gradient(140deg, ${pri}, ${ink})` }}>
      <span className="absolute -right-10 -top-12 h-48 w-48 rounded-full opacity-40" style={{ background: hi, filter: "blur(30px)" }} />
      {idea.art === "moon" && (
        <>
          <span className="absolute left-[54%] top-[18%] h-24 w-24 rounded-full" style={{ background: hi }} />
          <span className="absolute left-[60%] top-[14%] h-24 w-24 rounded-full" style={{ background: pri }} />
          {[[18, 22], [30, 60], [74, 70], [44, 30], [84, 34]].map(([x, y], i) => (
            <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%` }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2 + i * 0.4, repeat: Infinity }} />
          ))}
          <span className="absolute inset-x-0 bottom-0 h-[30%]" style={{ background: `linear-gradient(180deg, transparent, ${ink})` }} />
        </>
      )}
      {idea.art === "loaf" && (
        <>
          <span className="absolute bottom-[18%] left-1/2 h-[46%] w-[70%] -translate-x-1/2 rounded-t-[999px] rounded-b-[26px]" style={{ background: hi, boxShadow: `inset 0 -18px 0 ${pri}55` }} />
          {[30, 46, 62].map((l) => <span key={l} className="absolute bottom-[40%] h-2 w-12 -rotate-[30deg] rounded-full" style={{ left: `${l}%`, background: `${pri}99` }} />)}
          <span className="absolute bottom-[12%] left-[10%] h-2 w-[80%] rounded-full" style={{ background: `${bg}55` }} />
        </>
      )}
      {idea.art === "peak" && (
        <>
          <span className="absolute bottom-0 left-[-6%] h-[70%] w-[70%]" style={{ background: hi, clipPath: "polygon(0 100%, 50% 0, 100% 100%)", opacity: 0.85 }} />
          <span className="absolute bottom-0 right-[-8%] h-[86%] w-[72%]" style={{ background: bg, clipPath: "polygon(0 100%, 52% 0, 100% 100%)", opacity: 0.9 }} />
          <span className="absolute right-[24%] top-[14%] h-7 w-1 rounded-full" style={{ background: pri }} />
        </>
      )}
      {idea.art === "spark" && (
        <>
          {[[22, 26, 64], [58, 48, 96], [30, 64, 40]].map(([x, y, s], i) => (
            <motion.span key={i} className="absolute rounded-full" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, background: i === 1 ? hi : bg, opacity: i === 1 ? 1 : 0.7 }} animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }} />
          ))}
        </>
      )}
    </div>
  );
}

/** The generated page. Fixed size; the hero wraps it in Fit so it scales on phones. */
function PagePreview({ idea, stage, typed, run }: { idea: Idea; stage: number; typed: number; run: number }) {
  const [ink, pri, hi, bg] = idea.p;
  const big = idea.headline.length > 46;
  const k = `${run}`;
  const root = useRef<HTMLDivElement>(null);
  return (
    <div ref={root} className="ast-page relative h-[560px] w-[880px] overflow-hidden text-left" style={{ background: NIGHT.mid }}>
      {/* the page's own background floods in from the top-left once the constellation has drawn */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: bg }}
        initial={false}
        animate={{ clipPath: stage >= 1 ? "circle(150% at 6% 4%)" : "circle(0% at 6% 4%)" }}
        transition={{ duration: stage >= 1 ? 0.9 : 0, ease: [0.22, 1, 0.36, 1] }}
      />
    <div className="relative flex h-full flex-col gap-7 px-10 pb-8 pt-6">
      <Slot block="nav" show={stage >= 1} k={`nav${k}`} skel={<div className="flex h-9 items-center justify-between"><Bar w={120} h={16} /><span className="flex gap-6"><Bar w={54} /><Bar w={54} /><Bar w={54} /></span><Bar w={110} h={34} box /></div>}>
        <div className="flex h-9 items-center justify-between">
          <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]" style={{ color: ink }}>
            <span className="h-6 w-6 rounded-[7px]" style={{ background: pri }} />
            {idea.brand}
          </span>
          <span className="flex gap-7 text-[13px] font-medium" style={{ color: ink, opacity: 0.75 }}><span>How it works</span><span>Pricing</span><span>FAQ</span></span>
          <span className="rounded-full px-4 py-2 text-[13px] font-semibold text-white" style={{ background: ink }}>{idea.cta}</span>
        </div>
      </Slot>
      <div className="grid flex-1 grid-cols-[1.15fr_1fr] gap-9">
        <div className="flex flex-col justify-center gap-5">
          <Slot block="headline" show={stage >= 2} k={`h${k}`} skel={<div className="flex flex-col gap-3"><Bar w="92%" h={34} /><Bar w="70%" h={34} /></div>}>
            <h3 className={`m-0 font-semibold leading-[1.05] tracking-[-0.04em] ${big ? "text-[34px]" : "text-[44px]"}`} style={{ color: ink }}>
              {idea.headline.slice(0, typed)}
              {stage === 2 && <motion.span className="ml-0.5 inline-block h-[0.9em] w-[3px] translate-y-[0.12em] rounded-full" style={{ background: pri }} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />}
            </h3>
          </Slot>
          <Slot block="pitch" show={stage >= 3} k={`s${k}`} skel={<div className="flex flex-col gap-2.5"><Bar w="96%" /><Bar w="84%" /><span className="mt-3 flex gap-3"><Bar w={150} h={42} box /><Bar w={110} h={42} box /></span></div>}>
            <p className="m-0 max-w-[400px] text-[16px] leading-[1.5]" style={{ color: ink, opacity: 0.78 }}>{idea.sub}</p>
            <span className="mt-5 flex items-center gap-3">
              <span className="rounded-full px-5 py-3 text-[14px] font-semibold text-white" style={{ background: pri }}>{idea.cta}</span>
              <span className="rounded-full px-5 py-3 text-[14px] font-semibold" style={{ color: ink, boxShadow: `inset 0 0 0 1.5px ${ink}33` }}>See pricing</span>
            </span>
            {idea.guessed && <span className="mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium" style={{ background: "#fef3c7", color: "#92400e" }}>2 lines guessed. Check before publishing.</span>}
          </Slot>
        </div>
        <Slot block="art" show={stage >= 4} k={`a${k}`} className="h-[270px]" skel={<Bar w="100%" h={270} box />}>
          <div className="h-[270px]"><Artwork idea={idea} /></div>
        </Slot>
      </div>
      <Slot block="features" show={stage >= 5} k={`f${k}`} skel={<div className="grid grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Bar key={i} w="100%" h={76} box />)}</div>}>
        <div className="grid grid-cols-3 gap-4">
          {idea.features.map(([t, d], i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: i * 0.07 }} className="flex h-[76px] items-center gap-3 rounded-2xl bg-white px-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
              <span className="h-9 w-9 flex-none rounded-xl" style={{ background: `${pri}1f`, boxShadow: `inset 0 0 0 6px ${bg}` }}><span className="m-[10px] block h-4 w-4 rounded-full" style={{ background: pri }} /></span>
              <span className="flex flex-col">
                <span className="text-[14px] font-semibold" style={{ color: ink }}>{t}</span>
                <span className="text-[12px]" style={{ color: ink, opacity: 0.7 }}>{d}</span>
              </span>
            </motion.div>
          ))}
        </div>
      </Slot>
      <Slot block="price" show={stage >= 6} k={`p${k}`} skel={<Bar w="100%" h={44} box />}>
        <div className="flex h-11 items-center justify-between rounded-2xl px-5" style={{ background: ink }}>
          <span className="text-[14px] font-semibold text-white">{idea.price}</span>
          <span className="flex items-center gap-2 text-[13px] font-medium" style={{ color: hi }}>{idea.cta} <span aria-hidden="true">→</span></span>
        </div>
      </Slot>
    </div>
      <Constellation root={root} run={run} stage={stage} color={pri} w={880} h={560} />
    </div>
  );
}

function StepRail({ stage, running }: { stage: number; running: boolean }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-1 p-0">
      {STEPS.map((s, i) => {
        const done = stage === 6 || stage >= i + 2;
        const active = !done && running && stage === i + 1;
        return (
          <li key={s} className="flex h-10 items-center gap-3 rounded-xl px-3" style={{ background: active ? "#f0f0fc" : "transparent" }}>
            <span className="flex h-5 w-5 flex-none items-center justify-center">
              {done ? (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 600, damping: 18 }} className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: A }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </motion.span>
              ) : active ? (
                <MatrixLoader pattern={1} size={18} color={A} />
              ) : (
                <span className="h-2 w-2 rounded-full bg-[#d2d2d7]" />
              )}
            </span>
            <span className="text-[14px] font-medium" style={{ color: done || active ? INK : "#6e6e73" }}>{s}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Hero() {
  const { idea, stage, typed, run, build } = useAssembler();
  const [text, setText] = useState("");
  const touched = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const running = run > 0 && stage < 6;

  // Until the visitor touches the composer, type each sample idea and build it.
  useEffect(() => {
    const ts: number[] = [];
    let k = 0;
    const demo = () => {
      if (touched.current) return;
      const next = IDEAS[k++ % IDEAS.length];
      setText("");
      for (let i = 1; i <= next.idea.length; i++) ts.push(window.setTimeout(() => !touched.current && setText(next.idea.slice(0, i)), i * 22));
      ts.push(window.setTimeout(() => !touched.current && build(next), next.idea.length * 22 + 250));
    };
    ts.push(window.setTimeout(demo, 600));
    const loop = window.setInterval(demo, 10500);
    return () => { ts.forEach(clearTimeout); clearInterval(loop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const touch = () => { touched.current = true; };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    touch();
    const t = text.trim();
    if (!t) { input.current?.focus(); return; }
    build(IDEAS.find((i) => i.idea.toLowerCase() === t.toLowerCase()) ?? fromText(t));
  };

  const host = `${idea.brand.toLowerCase().replace(/[^a-z0-9]+/g, "")}.asteria.page`;
  const glass = "bg-white/[.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] backdrop-blur-md";

  return (
    <section id="top" className="relative -mt-[76px]">
      <div className="relative overflow-hidden pb-[230px] pt-[136px] sm:pb-[290px] sm:pt-[168px]">
        <NightSky />
        <div className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-6 px-5 text-center">
          <motion.button
            type="button"
            onClick={() => scrollToId("publish")}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 24 }}
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-[13.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#ffb648] ${glass}`}
            style={{ color: NIGHT.star }}
          >
            <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: NIGHT.lamp, color: NIGHT.lampInk }}>New</span>
            Export any page as Next.js code
          </motion.button>
          <h1 className="m-0 max-w-[980px] text-[clamp(46px,7.8vw,108px)] font-[560] leading-[0.94] tracking-[-0.035em] [text-wrap:balance]" style={{ color: NIGHT.star }}>
            <Words text="A rough idea in. A launch page out." className="justify-center" />
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.35 }} className="m-0 max-w-[600px] text-[clamp(17px,2.1vw,20px)] leading-[1.5]" style={{ color: NIGHT.mist }}>
            Describe what you are making in one sentence. Asteria writes the copy, picks a palette and lays out a page you can edit, publish or export tonight.
          </motion.p>
        </div>

        <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 22, delay: 0.25 }} className="relative mx-auto mt-9 max-w-[760px] px-5" onPointerDown={touch} onFocus={touch}>
          <form onSubmit={submit} className={`flex flex-col gap-2 rounded-[24px] p-2.5 sm:flex-row sm:items-center ${glass}`}>
            <label htmlFor="asteria-idea" className="sr-only">Describe your product idea</label>
            <input
              id="asteria-idea"
              ref={input}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe your idea, e.g. a tea club for night owls"
              maxLength={72}
              autoComplete="off"
              className="h-12 min-w-0 flex-1 rounded-[16px] bg-transparent px-4 text-[17px] text-white outline-none placeholder:text-[#a9aed6] focus-visible:bg-white/[.05]"
            />
            <motion.button type="submit" whileTap={{ scale: 0.95 }} className="inline-flex h-12 flex-none items-center justify-center gap-2 rounded-[16px] px-6 text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#141a4a]" style={{ background: NIGHT.lamp, color: NIGHT.lampInk }}>
              {running ? "Building…" : "Build my page"}
            </motion.button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[13.5px]" style={{ color: NIGHT.mist }}>Or try</span>
            {IDEAS.map((i) => {
              const on = idea.id === i.id;
              return (
                <motion.button
                  key={i.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { touch(); setText(i.idea); build(i); }}
                  className="h-8 rounded-full px-3.5 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffb648]"
                  style={{ background: on ? "rgba(255,182,72,.16)" : "rgba(255,255,255,.06)", color: on ? "#ffd9a0" : "#d9dbf5", boxShadow: `inset 0 0 0 1px ${on ? "rgba(255,182,72,.45)" : "rgba(255,255,255,.12)"}` }}
                  aria-pressed={on}
                >
                  {i.brand}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* the build, rising out of the horizon */}
      <div className="relative mx-auto -mt-[170px] grid max-w-[1180px] grid-cols-1 gap-5 px-5 sm:-mt-[220px] lg:grid-cols-[250px_1fr]">
        <motion.aside initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 22, delay: 0.45 }} className={`${card} hidden flex-col gap-3 self-start p-3 lg:flex`} aria-label="Build progress">
          <span className="px-3 pt-2 text-[13px] font-semibold text-[#6e6e73]">Building your page</span>
          <StepRail stage={stage} running={running} />
          <div className="mx-1 mb-1 mt-1 rounded-2xl bg-[#f5f5f7] p-3 text-[13px] leading-[1.45] text-[#6e6e73]" aria-live="polite">
            {stage === 6 ? "Draft ready. Every word, colour and section is editable." : stage === 0 && running ? "Reading your sentence and sketching the page." : running ? "Writing from your sentence. Nothing is published yet." : "Type an idea or pick one above."}
          </div>
        </motion.aside>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 22, delay: 0.35 }} className={`${card} min-w-0 overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,.06),0_40px_80px_-40px_rgba(20,26,74,.55)]`}>
          <div className="flex items-center gap-2 border-b border-black/[.06] px-4 py-3 sm:px-5">
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 flex-none rounded-full" style={{ background: c }} />)}
            <span className="ml-2 min-w-0 truncate rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#6e6e73] tabular-nums">{host}</span>
            <span className="ml-auto flex flex-none items-center gap-1.5 text-[12px] font-medium" style={{ color: stage === 6 ? "#1a7f42" : A }}>
              <motion.span className="h-2 w-2 rounded-full" style={{ background: stage === 6 ? "#30d158" : A }} animate={running ? { opacity: [1, 0.3, 1] } : { opacity: 1 }} transition={{ duration: 1, repeat: running ? Infinity : 0 }} />
              {stage === 6 ? "Draft ready" : running && stage === 0 ? "Sketching" : running ? `Step ${Math.max(1, stage)} of 6` : "Waiting"}
            </span>
          </div>
          <Fit><PagePreview idea={idea} stage={stage} typed={typed} run={run} /></Fit>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/* --------------------------- How it works --------------------------- */

const TONES = [
  { id: "plain", label: "Plain", color: "#94a3b8" },
  { id: "warm", label: "Warm", color: "#fb923c" },
  { id: "bold", label: "Bold", color: "#3f3cbb" },
  { id: "playful", label: "Playful", color: "#f472b6" },
  { id: "calm", label: "Calm", color: "#38bdf8" },
  { id: "technical", label: "Technical", color: "#22c55e" },
];
const TONE_LINES: Record<string, string> = {
  plain: "Dog walks at night, booked in a minute.",
  warm: "Someone kind will walk your dog tonight.",
  bold: "Night shift? Your dog still gets the walk.",
  playful: "Midnight zoomies, professionally handled.",
  calm: "A quiet walk for your dog while you work.",
  technical: "Vetted walkers, live GPS, 10pm to 6am.",
};

function ToneDemo() {
  const [tone, setTone] = useState("warm");
  const t = TONES.find((x) => x.id === tone)!;
  return (
    <div className={`${card} flex w-[520px] items-start gap-6 p-6`}>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold text-[#6e6e73]">Voice</span>
        <ToneSelect options={TONES} defaultValue="warm" onChange={setTone} autoplay label="Tone of voice" accent={A} />
      </div>
      <div className="mt-7 flex min-h-[230px] flex-1 flex-col justify-between rounded-[20px] bg-[#f0f0fc] p-5">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[#312e9c]"><motion.span className="h-2.5 w-2.5 rounded-[3px]" animate={{ backgroundColor: t.color }} />Nightpaws headline</span>
        <div className="relative min-h-[110px]">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p key={tone} initial={{ opacity: 0, y: 12, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(6px)" }} transition={spring} className="m-0 text-[24px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#1e1b4b]">
              {TONE_LINES[tone]}
            </motion.p>
          </AnimatePresence>
        </div>
        <span className="text-[12px] text-[#312e9c]">Same facts, different voice.</span>
      </div>
    </div>
  );
}

const PALETTE = [
  { name: "Midnight", hex: "#1E1B4B" },
  { name: "Ink", hex: "#312E81" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Periwinkle", hex: "#818CF8" },
  { name: "Lilac", hex: "#C7D2FE" },
  { name: "Mist", hex: "#EEF2FF" },
  { name: "Lamp", hex: "#FBBF24" },
  { name: "Ember", hex: "#F59E0B" },
  { name: "Collar", hex: "#EF4444" },
  { name: "Park", hex: "#22C55E" },
  { name: "Pavement", hex: "#64748B" },
  { name: "Chalk", hex: "#F8FAFC" },
];

function PaletteDemo() {
  return (
    <div className={`${card} flex w-[500px] flex-col items-center gap-2 px-6 pb-6 pt-6`}>
      <span className="self-start text-[13px] font-semibold text-[#6e6e73]">Nightpaws palette, 12 colours</span>
      <FanDeck chips={PALETTE} autoplay />
      <span className="text-[13px] text-[#6e6e73]">Click a chip to copy its hex.</span>
    </div>
  );
}

function TweakDemo() {
  const [size, setSize] = useState(34);
  const [radius, setRadius] = useState(18);
  const [gap, setGap] = useState(16);
  return (
    <div className={`${card} flex w-[520px] flex-col gap-5 p-6`}>
      <span className="text-[13px] font-semibold text-[#6e6e73]">Fine-tune the hero</span>
      <div className="flex h-[230px] items-center justify-center overflow-hidden rounded-[20px] bg-[#f0f0fc] px-6">
        <motion.div layout transition={spring} className="flex w-full flex-col bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_36px_-24px_rgba(30,27,75,.5)]" style={{ borderRadius: radius, gap }}>
          <motion.span layout transition={spring} className="font-semibold leading-[1.04] tracking-[-0.04em] text-[#1e1b4b]" style={{ fontSize: size }}>Walks at 2am.</motion.span>
          <motion.span layout transition={spring} className="text-[14px] text-[#4b5563]">By people who are awake anyway.</motion.span>
          <motion.span layout transition={spring} className="w-fit px-4 py-2 text-[13px] font-semibold text-white" style={{ background: "#4f46e5", borderRadius: Math.max(6, radius - 6) }}>Book a night walk</motion.span>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 pt-2 sm:grid-cols-3">
        <ScrubField label="Size" value={size} onChange={setSize} min={22} max={48} unit="px" accent={A} />
        <ScrubField label="Radius" value={radius} onChange={setRadius} min={0} max={32} unit="px" accent={A} />
        <ScrubField label="Gap" value={gap} onChange={setGap} min={6} max={28} unit="px" accent={A} />
      </div>
      <span className="text-[13px] text-[#6e6e73]">Drag a label sideways, or type a number. Shift for big steps.</span>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead title="It drafts. You decide." sub="Asteria does the first ninety percent in minutes. You keep the say over every word, colour and claim before anything goes live." accent={A} />
      <div className="mt-6">
        <StickyStory
          accent={A}
          steps={[
            { kicker: "Step 1", title: "Start with whatever you have.", body: "A sentence is enough. Notes, a pitch deck, screenshots or a price list make it better. Asteria pulls out names, prices and real quotes, and never invents a testimonial.", visual: <div className={`${card} flex w-[460px] flex-col gap-4 p-6`}><span className="text-[13px] font-semibold text-[#6e6e73]">Your material</span><UploadChips accent={A} autoplay /></div> },
            { kicker: "Step 2", title: "Pick how it should sound.", body: "Six voices from plain to playful. Switching voice rewrites the copy but keeps the facts, so the price and the promise stay the same.", visual: <ToneDemo /> },
            { kicker: "Step 3", title: "A palette that fits the idea.", body: "Asteria proposes twelve colours from your notes and any logo you dropped in, all checked for readable contrast. Fan them out and copy any hex.", visual: <PaletteDemo /> },
            { kicker: "Step 4", title: "Nudge it like a design tool.", body: "Scrub type size, corner radius and spacing directly on the page. Every section is a real component, not a screenshot.", visual: <TweakDemo /> },
          ]}
        />
      </div>
    </section>
  );
}

/* --------------------------- Before / After --------------------------- */

/** Notes to page: as you scroll, each phrase in the founder's notes draws a line to the part of the page it became. */
function Compare() {
  return (
    <section id="compare" className="bg-[#f5f5f7] pt-20 sm:pt-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="From a notes file to a page people trust." sub="These are the real notes behind the Nightpaws sample. Follow each line to the part of the page it became, and see what Asteria left out." accent={A} center />
      </div>
      <div className="mt-10 pb-20 sm:pb-24">
        <NotesToPage />
      </div>
    </section>
  );
}

/* ------------------------------ Publish ------------------------------ */

const publishTask = (onProgress: (p: number) => void) =>
  new Promise<void>((resolve) => {
    const steps = [0.18, 0.42, 0.66, 0.84, 1];
    steps.forEach((p, i) => setTimeout(() => { onProgress(p); if (p === 1) resolve(); }, 380 * (i + 1)));
  });

function Publish() {
  return (
    <section id="publish" className="mx-auto max-w-[1180px] px-5 py-20 sm:py-24">
      <SectionHead title="Go live, or take the code with you." sub="Host on an asteria.page address or your own domain. Or export clean Next.js and Tailwind and never come back. We would rather you stayed because you like it." accent={A} />
      <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Reveal y={16}>
          <div className={`${card} flex h-full flex-col gap-8 p-7 sm:p-8`}>
            <div>
              <h3 className="m-0 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f]">One button to publish.</h3>
              <p className="m-0 mt-1.5 max-w-[420px] text-[15px] leading-[1.5] text-[#6e6e73]">HTTPS, a waitlist form and privacy-friendly analytics are switched on for you. Unpublish whenever you like.</p>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-8 rounded-[22px] bg-[#f0f0fc] px-4 py-10">
              <ProgressButton label="Publish page" doneLabel="Live" accent={A} task={publishTask} autoplay />
              <div className="flex flex-col items-center gap-2">
                <span className="text-[12px] font-medium text-[#312e9c]">Your address</span>
                <CopyChip value="https://nightpaws.asteria.page" display="nightpaws.asteria.page" label="Copy address" accent={A} />
              </div>
            </div>
          </div>
        </Reveal>
        <Reveal y={16} delay={0.08}>
          <div className="flex h-full flex-col gap-8 rounded-[28px] bg-[#1d1d1f] p-7 text-white sm:p-8">
            <div>
              <h3 className="m-0 text-[24px] font-semibold tracking-[-0.03em] text-[#f5f5f7]">Or export the source.</h3>
              <p className="m-0 mt-1.5 max-w-[420px] text-[15px] leading-[1.5] text-[#a1a1a6]">A plain Next.js project with Tailwind. No Asteria runtime, no lock-in, MIT licensed.</p>
            </div>
            <CopyCommand command="npx asteria export nightpaws" autoplay />
            <ul className="m-0 flex list-none flex-col gap-0.5 rounded-[20px] bg-white/[.04] p-4 text-[13.5px] leading-[1.9] text-[#d2d2d7]" style={{ fontFamily: MONO }} aria-label="Exported files">
              {["app/page.tsx", "app/layout.tsx", "components/hero.tsx", "components/features.tsx", "components/pricing.tsx", "components/waitlist-form.tsx", "tailwind.config.ts"].map((f, i, all) => (
                <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ ...spring, delay: i * 0.05 }} className="flex items-center gap-3">
                  <span className="text-[#c4b5fd]" aria-hidden="true">{i === all.length - 1 ? "└─" : "├─"}</span>
                  {f}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------ Pricing ------------------------------ */

const PLANS = [
  { id: "sketch", name: "Sketch", m: 0, y: 0, blurb: "Try it on one idea.", features: ["1 published page", "asteria.page address", "Small Asteria badge"], cta: "Start free" },
  { id: "launch", name: "Launch", m: 16, y: 12, blurb: "For a product going live.", features: ["5 pages, custom domain", "Waitlist and analytics", "Export to Next.js"], cta: "Choose Launch", featured: true },
  { id: "studio", name: "Studio", m: 48, y: 38, blurb: "For people who launch for others.", features: ["Unlimited pages", "5 seats and client handoff", "Shared brand kits"], cta: "Choose Studio" },
];

function Pricing() {
  const [yearly, setYearly] = useState(true);
  return (
    <section id="pricing" className="bg-[#f5f5f7] py-20 sm:py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <SectionHead title="Free until it is worth paying for." sub="Your first page is free for good. Upgrade when you want your own domain or the source code." accent={A} center />
        <Reveal y={12} className="mt-10 flex items-center justify-center gap-3">
          <span className="text-[15px] font-medium text-[#1d1d1f]">Billed yearly</span>
          <Switch checked={yearly} onChange={setYearly} label="Billed yearly" accent={A} />
          <span className="rounded-full bg-[#e7e8fb] px-2.5 py-1 text-[12px] font-semibold text-[#312e9c]">Save about 25%</span>
        </Reveal>
        <Stagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={`${card} relative flex h-full flex-col gap-6 p-7`} style={p.featured ? { boxShadow: `0 0 0 2px ${A}, 0 24px 48px -32px rgba(124,58,237,.6)` } : undefined}>
              {p.featured && <span className="absolute right-6 top-6 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white" style={{ background: A }}>Most picked</span>}
              <div>
                <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.name}</h3>
                <p className="m-0 mt-1 text-[15px] text-[#6e6e73]">{p.blurb}</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="flex text-[48px] font-semibold leading-none tabular-nums tracking-[-0.045em] text-[#1d1d1f]">$<RollingNumber value={yearly ? p.y : p.m} /></span>
                <span className="text-[14px] text-[#6e6e73]">{p.m === 0 ? "forever" : "per month"}</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-[#1d1d1f]">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#e7e8fb]" style={{ color: A }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={() => scrollToId("top")} className="mt-auto h-12 rounded-full text-[15px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#3f3cbb] focus-visible:ring-offset-2" style={p.featured ? { background: A, color: "#fff" } : { background: "#f5f5f7", color: INK }}>
                {p.cta}
              </motion.button>
            </div>
          ))}
        </Stagger>
        <p className="m-0 mt-6 text-center text-[13px] text-[#6e6e73]">Prices in US dollars. Cancel any time and keep your exported code.</p>
      </div>
    </section>
  );
}

/* ------------------------------ Quotes ------------------------------ */

const QUOTES = [
  { q: "I had a notes app full of half ideas. Asteria turned one into a waitlist page before my coffee went cold. 212 sign-ups that week.", n: "Priya Raman", c: "Founder, Crumb Club" },
  { q: "The flagged guesses are the feature. It never let me publish a number I had not checked.", n: "Tomás Ibarra", c: "Solo maker, Ferrous" },
  { q: "I build pages for clients. Drafts that used to take a day now take an hour, and the export is code I would have written.", n: "Hana Okafor", c: "Studio lead, North Row" },
  { q: "Switching the voice from bold to calm fixed our pitch. Same facts, and people finally read past the headline.", n: "Ollie Brandt", c: "Co-founder, Tidewater" },
];

function Quotes() {
  return (
    <section className="py-20" aria-label="What makers say">
      <Marquee speed={26}>
        {QUOTES.map((q) => (
          <figure key={q.n} className={`${card} m-0 mx-2.5 flex w-[340px] flex-none flex-col gap-5 p-7 sm:w-[380px]`}>
            <blockquote className="m-0 text-[18px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f]">“{q.q}”</blockquote>
            <figcaption className="text-[14px] text-[#6e6e73]"><span className="font-semibold text-[#1d1d1f]">{q.n}</span> · {q.c}</figcaption>
          </figure>
        ))}
      </Marquee>
    </section>
  );
}

export function NexusAiLaunchTemplatePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="ast min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT_SANS }}>
        <style>{FONT_CSS + BASE_CSS}</style>
        <Nav dark brand={<Logo />} accent={A} cta="Build a page" onCta={() => scrollToId("top")} links={[{ label: "How it works", id: "how" }, { label: "From notes", id: "compare" }, { label: "Publish", id: "publish" }, { label: "Pricing", id: "pricing" }, { label: "FAQ", id: "faq" }]} />
        <main>
          <Hero />
          <HowItWorks />
          <Compare />
          <Publish />
          <Pricing />
          <Quotes />
          <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-20 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
            <SectionHead title="Fair questions." accent={A} />
            <Reveal y={16}>
              <Faq
                accent={A}
                items={[
                  { q: "Does Asteria write the whole page?", a: "It writes a complete first draft: headline, pitch, features, pricing and FAQ. Most people change a few lines. Anything it could not find in what you gave it is marked as a guess until you confirm or delete it." },
                  { q: "Will it invent testimonials or numbers?", a: "No. Quotes only appear if you supplied them, and every number on the page traces back to your notes or to you typing it in. Unconfirmed claims block publishing." },
                  { q: "Who owns the copy and the code?", a: "You do, on every plan. Exports are a plain Next.js project under the MIT licence, with no Asteria runtime." },
                  { q: "Can I use my own domain?", a: "Yes, on Launch and Studio. Point a CNAME at us and HTTPS is issued in a couple of minutes." },
                  { q: "Is it good for SEO?", a: "Pages are static HTML with real headings, alt text and a sitemap. Asteria writes a title and description you can edit, and it will not stuff keywords." },
                ]}
              />
            </Reveal>
          </section>
          <div className="mx-auto max-w-[1180px] px-5 pb-20">
            <CtaBand title="Your idea deserves a page tonight." sub="Your first page is free. No card, and you can export it whenever you like." cta="Build my page" secondary="See examples" accent={A} glow="rgba(63,60,187,.35)" />
          </div>
        </main>
        <Footer brand={<Logo />} note="The AI page builder for people with more ideas than evenings. Draft, check, publish." columns={[{ title: "Product", links: ["How it works", "Examples", "Pricing", "Changelog"] }, { title: "Makers", links: ["Guides", "Templates", "Export docs", "Community"] }, { title: "Company", links: ["About", "Privacy", "Terms", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}

export default NexusAiLaunchTemplatePage;
