"use client";
/**
 * Forge: landing page template for an AI coding copilot that has read the
 * whole repository. The hero is dark iron: an editor with an X-ray lens beside
 * a heat map of the whole repo, one square per file, and lines that run from
 * the code under the lens to the files it's about. Archivo, set wide, for
 * headings; JetBrains Mono for code.
 */
import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, MotionConfig, animate, motion, useMotionTemplate, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import { ScaleBox } from "@/components/templates/kit/blocks";
import { HeatLegend, RepoMap } from "@/components/templates/forge/RepoMap";
import Terminal from "@/components/templates/forge/Terminal";
import { BASE_CSS, FONT_CSS, FONT_MONO, FONT_SANS, IRON } from "@/components/templates/forge/theme";
import FolderPeek from "@/components/templates/kit/components/FolderPeek";
import { MatrixLoader } from "@/components/templates/kit/components/MatrixLoaders";
import StaggerMenu from "@/components/templates/kit/components/StaggerMenu";
import BeforeAfter from "@/components/templates/kit/components/BeforeAfter";
import { CopyCommand } from "@/components/templates/kit/components/CopyButton";
import { CapsuleToggle } from "@/components/templates/kit/components/CapsuleToggle";
import ElasticStepper from "@/components/templates/kit/components/ElasticStepper";
import { RollingNumber } from "@/components/templates/kit/components/PriceOdometer";
import { CtaBand, Faq, Fit, Footer, Magnetic, Nav, Reveal, SectionHead, Stagger, StickyStory, Words, card, ease, scrollToId } from "@/components/templates/kit/parts";

const A = "#d97706"; // amber, for fills and graphics
const AD = "#b45309"; // darker amber for text and buttons on white (5:1)
const INK = "#1d1d1f";
const MONO = FONT_MONO;

function Logo() {
  return (
    <span className="flex items-center gap-2 text-[19px] font-semibold tracking-[-0.03em]">
      <span className="relative flex h-[26px] w-[26px] items-center justify-center rounded-[8px]" style={{ background: IRON.raise, boxShadow: "inset 0 0 0 1px rgba(255,255,255,.14)" }} aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M5 15h14l-2 4H7z" fill="#fff" />
          <motion.path d="M12 3c2 3 3.5 4.6 3.5 7a3.5 3.5 0 0 1-7 0c0-1.2.5-2.2 1.3-3 .2 1.3.9 2 1.7 2.2C11 7.6 11.2 5.4 12 3z" fill={A} animate={{ scaleY: [1, 1.08, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }} style={{ originY: "12px" }} />
        </svg>
      </span>
      Forge
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Syntax colouring for the light code panels                           */
/* ------------------------------------------------------------------ */

const KW = /^(import|from|export|async|function|const|await|if|return|switch|case|throw|new|type)$/;

const LIGHT = { text: INK, str: "#2f7d32", com: "#6e6e73", kw: "#9b2c9b" };
const LIGHT_DIM = { text: "#a1a1a6", str: "#b8c9b0", com: "#c7c7cc", kw: "#c9b3d9" };
const DARK = { text: "#dcd9d2", str: "#b5d98a", com: "#6c717a", kw: "#ff9a5c" };
const DARK_DIM = { text: "#6a665f", str: "#5f6b4f", com: "#4a4e55", kw: "#80533a" };

function hl(line: string, dim = false, dark = false) {
  const pal = dark ? (dim ? DARK_DIM : DARK) : dim ? LIGHT_DIM : LIGHT;
  const parts = line.split(/("[^"]*"|'[^']*'|\/\/.*$|\b(?:import|from|export|async|function|const|await|if|return|switch|case|throw|new|type)\b)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    let c = pal.text;
    if (/^["']/.test(p)) c = pal.str;
    else if (/^\/\//.test(p)) c = pal.com;
    else if (KW.test(p)) c = pal.kw;
    return <span key={i} style={{ color: c }}>{p}</span>;
  });
}

/* ------------------------------------------------------------------ */
/* Hero: the X-ray lens                                                 */
/* ------------------------------------------------------------------ */

const CODE = [
  `import { rules } from "@/pricing/rules";`,
  `import { round } from "@/money/round";`,
  ``,
  `export async function applyDiscount(`,
  `  cart: Cart,`,
  `  code: string,`,
  `): Promise<Cart> {`,
  `  const rule = await rules.find(code);`,
  `  if (!rule) return cart;`,
  ``,
  `  if (rule.kind === "percent") {`,
  `    const off = cart.total * rule.value;`,
  `    return withTotal(cart, round(cart.total - off));`,
  `  }`,
  `  return withTotal(cart, cart.total - rule.value);`,
  `}`,
];

/** What Forge knows about a symbol. line / col / len locate it in CODE. */
const NOTES = [
  { key: "Callers", line: 3, col: 22, len: 13, tone: IRON.ember, title: "14 callers in 3 packages", short: "Two callers ignore the result.", body: "Two of them, in cart/ and pos/, ignore the returned cart." },
  { key: "Throws", line: 7, col: 21, len: 10, tone: "#ff6b6b", title: "rules.find can throw", short: "RuleExpired, for codes past their end date.", body: "RuleExpired, for codes past their end date. pricing/rules.ts:41" },
  { key: "Missing case", line: 10, col: 6, len: 9, tone: "#f5c542", title: "'bogo' isn't handled", short: "Added to RuleKind last week.", body: "Added to RuleKind in #2291 last week. Falls through to fixed." },
  { key: "Untested", line: 14, col: 25, len: 22, tone: "#5cc8ff", title: "Can go below zero", short: "Only percent discounts are tested.", body: "total.test.ts only covers percent. No test for fixed > total." },
];

/** Coverage per line in the X-ray layer: 2 covered, 1 partly, 0 not, -1 no code. */
const COVER = [-1, -1, -1, 2, 2, 2, 2, 1, 2, -1, 2, 2, 2, -1, 0, -1];

const LH = 26; // line height
const PADX = 20;
const PADY = 18;
const GUT = 34; // gutter width
const PANEL_W = 556;
const R = 124; // lens radius
const HEAD = 46; // editor title bar height
const PANEL_H = PADY * 2 + CODE.length * LH;

/** Counts the files read as the map lights up. */
function FilesRead() {
  const n = useMotionValue(0);
  const text = useTransform(n, (v) => `${Math.round(v).toLocaleString("en-US")} files read`);
  useEffect(() => {
    const c = animate(n, 4812, { duration: 1.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [n]);
  return <motion.span className="tabular-nums">{text}</motion.span>;
}

function XrayEditor({ onActive }: { onActive?: (i: number) => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const [cw, setCw] = useState(7.8);
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const idleTimer = useRef<number | undefined>(undefined);
  const dragging = useRef(false);
  const tx = useMotionValue(300);
  const ty = useMotionValue(130);
  const sx = useSpring(tx, { stiffness: 210, damping: 24, mass: 0.9 });
  const sy = useSpring(ty, { stiffness: 210, damping: 24, mass: 0.9 });
  const clip = useMotionTemplate`circle(${R}px at ${sx}px ${sy}px)`;
  const ringX = useTransform(sx, (v) => v - R);
  const ringY = useTransform(sy, (v) => v - R);
  const panelH = PANEL_H;
  const pillId = `forge-note-pill-${useId()}`; // one per editor, so the phone and desktop copies don't share a pill
  useEffect(() => { onActive?.(active); }, [active, onActive]);

  useLayoutEffect(() => {
    // offsetWidth ignores the stage's scale, which is 0 on the first paint; re-measure once the web font is in
    const m = () => { if (meter.current && meter.current.offsetWidth) setCw(meter.current.offsetWidth / 20); };
    m();
    document.fonts?.ready.then(m);
  }, []);

  const centre = (i: number) => {
    const n = NOTES[i];
    const symX = PADX + GUT + (n.col + n.len / 2) * cw;
    return { x: Math.max(R - 10, Math.min(PANEL_W - R + 10, symX)), y: PADY + n.line * LH + 46 };
  };

  // Which note is under the lens. Only re-renders when that changes.
  const pick = () => {
    let best = -1, bd = Infinity;
    NOTES.forEach((_, i) => {
      const c = centre(i);
      const d = Math.hypot(c.x - sx.get(), c.y - sy.get());
      if (d < bd) { bd = d; best = i; }
    });
    const next = bd < R * 0.9 ? best : -1;
    setActive((a) => (a === next ? a : next));
  };
  useMotionValueEvent(sx, "change", pick);
  useMotionValueEvent(sy, "change", pick);

  // Tour the notes until someone takes over; resume after a quiet spell.
  useEffect(() => {
    let k = 0;
    const go = () => {
      if (touched.current) return;
      const c = centre(k % NOTES.length);
      tx.set(c.x);
      ty.set(c.y);
      k++;
    };
    const a = window.setTimeout(go, 900);
    const t = window.setInterval(go, 3000);
    return () => { clearTimeout(a); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cw]);

  const hold = () => {
    touched.current = true;
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => { touched.current = false; }, 6000);
  };

  const toLocal = (e: RPointerEvent) => {
    const el = panel.current!;
    const r = el.getBoundingClientRect();
    const s = el.offsetWidth / r.width; // undo the Fit scale
    return { x: (e.clientX - r.left) * s, y: (e.clientY - r.top) * s };
  };

  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && !dragging.current) return; // touch moves the lens only by dragging it
    const p = toLocal(e);
    hold();
    tx.set(Math.max(0, Math.min(PANEL_W, p.x)));
    ty.set(Math.max(0, Math.min(panelH, p.y)));
  };

  const jump = (i: number) => {
    hold();
    const c = centre(i);
    tx.set(c.x);
    ty.set(c.y);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="overflow-hidden rounded-[20px]" style={{ width: PANEL_W, background: IRON.panel, boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 40px 80px -30px rgba(0,0,0,.7)" }}>
        <div className="flex items-center gap-2 border-b px-4" style={{ height: HEAD, borderColor: IRON.line }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-3 w-3 rounded-full" style={{ background: c }} aria-hidden="true" />)}
          <span className="ml-2 text-[12px] font-medium" style={{ fontFamily: MONO, color: IRON.muted }}>checkout/applyDiscount.ts</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: "rgba(255,122,26,.14)", color: "#ffb27a" }}>
            <MatrixLoader pattern={1} size={12} color={IRON.ember} />
            <FilesRead />
          </span>
        </div>
        <div
          ref={panel}
          className="relative select-none"
          style={{ height: panelH, touchAction: "pan-y", fontFamily: MONO }}
          onPointerMove={onMove}
          onPointerUp={() => { dragging.current = false; }}
          onPointerCancel={() => { dragging.current = false; }}
          aria-label="Code with Forge's annotations. Use the buttons below to move the lens."
          role="group"
        >
          <span ref={meter} className="invisible absolute left-0 top-0 whitespace-pre text-[13.5px]" aria-hidden="true">{"0".repeat(20)}</span>
          {/* Plain editor */}
          <CodeLayer />
          {/* What Forge sees: only inside the lens */}
          <motion.div className="pointer-events-none absolute inset-0" style={{ clipPath: clip, WebkitClipPath: clip, background: "#1f1912" }} aria-hidden="true">
            <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(255,122,26,.2) 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
            <CodeLayer xray cw={cw} active={active} />
          </motion.div>
          {/* Lens ring, draggable on touch */}
          <motion.div
            className="absolute left-0 top-0 cursor-grab rounded-full active:cursor-grabbing"
            style={{ x: ringX, y: ringY, width: R * 2, height: R * 2, touchAction: "none", boxShadow: `0 0 0 2px ${IRON.ember}, 0 0 0 7px rgba(255,122,26,.16), 0 0 60px -10px rgba(255,122,26,.45)` }}
            onPointerDown={(e) => { dragging.current = true; hold(); (e.target as Element).setPointerCapture?.(e.pointerId); }}
            aria-hidden="true"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ background: IRON.ember, color: IRON.emberInk, fontFamily: FONT_SANS }}>What Forge sees</span>
          </motion.div>
        </div>
      </div>
      <div className="flex w-full max-w-[556px] flex-wrap items-center justify-center gap-2" role="group" aria-label="Move the lens to">
        {NOTES.map((n, i) => (
          <button
            key={n.key}
            type="button"
            onClick={() => jump(i)}
            className="relative h-9 rounded-full px-3.5 text-[13.5px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131416]"
            style={{ color: active === i ? IRON.emberInk : IRON.text, ["--tw-ring-color" as string]: IRON.ember }}
            aria-pressed={active === i}
          >
            {active === i ? (
              <motion.span layoutId={pillId} className="absolute inset-0 rounded-full" style={{ background: n.tone }} transition={{ type: "spring", stiffness: 480, damping: 34 }} />
            ) : (
              <span className="absolute inset-0 rounded-full" style={{ background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" }} />
            )}
            <span className="relative">{n.key}</span>
          </button>
        ))}
      </div>
      <p className="m-0 h-5 text-center text-[13.5px]" style={{ color: IRON.muted }} aria-live="polite">
        {active >= 0 ? <><span className="font-semibold" style={{ color: IRON.text }}>{NOTES[active].title}.</span> {NOTES[active].short}</> : "Move the lens over the code to see what Forge knows."}
      </p>
    </div>
  );
}

function CodeLayer({ xray = false, cw = 7.8, active = -1 }: { xray?: boolean; cw?: number; active?: number }) {
  return (
    <div className="absolute inset-0" style={{ padding: `${PADY}px ${PADX}px` }}>
      {CODE.map((l, i) => (
        <div key={i} className="relative flex text-[13.5px]" style={{ height: LH, lineHeight: `${LH}px` }}>
          <span className="flex-none select-none pr-3 text-right tabular-nums" style={{ width: GUT, color: xray ? "#a65a24" : "#4b4f57" }}>
            {xray && COVER[i] >= 0 ? (
              <span className="absolute left-[-12px] top-[5px] h-4 w-[3px] rounded-full" style={{ background: COVER[i] === 2 ? "#34c759" : COVER[i] === 1 ? "#ff9f0a" : "#ff3b30" }} />
            ) : null}
            {i + 1}
          </span>
          <code className="whitespace-pre">{hl(l, xray, true)}{l === "" ? " " : null}</code>
        </div>
      ))}
      {xray && NOTES.map((n, k) => {
        const left = PADX + GUT + n.col * cw;
        const top = PADY + n.line * LH;
        const boxW = 232;
        const boxLeft = Math.max(8, Math.min(PANEL_W - boxW - 8, left + (n.len * cw) / 2 - boxW / 2));
        return (
          <div key={n.key}>
            <span className="absolute rounded-[5px]" style={{ left: left - 2, top: top + 3, width: n.len * cw + 4, height: LH - 6, background: `${n.tone}2e`, boxShadow: `inset 0 -2px 0 ${n.tone}` }} />
            <AnimatePresence>
              {active === k && (
                <motion.div key="c" className="absolute rounded-[12px] px-3 py-2" style={{ left: boxLeft, top: n.line > CODE.length - 4 ? top - 64 : top + LH + 2, width: boxW, fontFamily: FONT_SANS, background: IRON.raise, boxShadow: "0 0 0 1px rgba(255,255,255,.1), 0 14px 30px -12px rgba(0,0,0,.7)" }} initial={{ opacity: 0, y: -6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4, scale: 0.98 }} transition={{ type: "spring", stiffness: 420, damping: 30 }}>
                  <span className="flex items-center gap-1.5 text-[12.5px] font-semibold" style={{ color: IRON.text }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: n.tone }} />{n.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-[1.4]" style={{ color: IRON.muted }}>{n.body}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/** Stage pixels: the editor at the left, the repo map filling the right. */
const STAGE = { w: 1180, h: 650, ex: 30, ey: 24 };

function HeroStage() {
  const [active, setActive] = useState(-1);
  const origin = (i: number): [number, number] => [STAGE.ex + PANEL_W, STAGE.ey + HEAD + PADY + NOTES[i].line * LH + LH / 2];
  return (
    <div className="relative" style={{ width: STAGE.w, height: STAGE.h }}>
      <RepoMap active={active} w={STAGE.w} h={STAGE.h - 40} origin={origin} />
      <div className="absolute" style={{ left: STAGE.ex, top: STAGE.ey }}>
        <XrayEditor onActive={setActive} />
      </div>
      <div className="absolute bottom-0 right-[30px]"><HeatLegend /></div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" className="relative -mt-[76px] overflow-hidden" style={{ background: IRON.bg, color: IRON.text }}>
      {/* heat rising off the map, kept low and to the right */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]" aria-hidden="true" style={{ background: "radial-gradient(60% 50% at 75% 85%, rgba(255,122,26,.10), transparent 70%)" }} />
      <div className="relative mx-auto max-w-[1180px] px-5 pb-16 pt-[132px] sm:pt-[156px] lg:pb-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-14">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13.5px] font-medium" style={{ background: "rgba(255,255,255,.06)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)" }}>
              <span className="h-2 w-2 rounded-full" style={{ background: IRON.ember }} aria-hidden="true" />
              Reads monorepos up to 4 million lines
            </motion.span>
            <h1 className="m-0 text-[clamp(40px,6vw,78px)] leading-[0.98] tracking-[-0.03em] [text-wrap:balance]">
              <Words text="It already read the rest of your code." />
            </h1>
          </div>
          <motion.div className="flex min-w-0 flex-col items-start gap-6" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease, delay: 0.35 }}>
            <p className="m-0 max-w-[460px] text-[clamp(16px,1.7vw,18px)] leading-[1.55]" style={{ color: IRON.muted }}>
              Forge indexes every file, commit and open pull request in your repo. Its suggestions call the helpers you already wrote, and it warns you about the caller three packages away before you break it.
            </p>
            <div className="flex flex-wrap gap-3">
              <Magnetic className="font-semibold" style={{ background: IRON.ember, color: IRON.emberInk }} onClick={() => scrollToId("pricing")}>Install Forge</Magnetic>
              <Magnetic className="text-[#eceae4] shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)]" style={{ background: "rgba(255,255,255,.05)" }} onClick={() => scrollToId("review")}>See a review</Magnetic>
            </div>
            <div className="w-full max-w-[360px]"><CopyCommand command="npx forge init" /></div>
          </motion.div>
        </div>

        <motion.div className="mt-14 hidden md:block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 110, damping: 22, delay: 0.2 }}>
          <ScaleBox w={STAGE.w} h={STAGE.h}><HeroStage /></ScaleBox>
        </motion.div>
        <div className="mt-12 md:hidden"><Fit><XrayEditor /></Fit></div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Story visuals                                                        */
/* ------------------------------------------------------------------ */

function IndexCard() {
  const rows = [
    { t: "packages/payments", s: "1,204 files", state: "done" },
    { t: "Commit history", s: "18,330 commits", state: "run" },
    { t: "Open pull requests", s: "37 of 41", state: "run2" },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col items-center gap-2 px-6 pb-6`}>
      <FolderPeek title="northwind/checkout" meta="4,812 files, 1.2M lines" color={A} autoplay />
      <div className="mt-2 flex w-full flex-col gap-1">
        {rows.map((r, i) => (
          <div key={r.t} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 hover:bg-[#f5f5f7]">
            {r.state === "done" ? (
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full" style={{ background: "#34c759" }} aria-label="Done">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
            ) : (
              <MatrixLoader pattern={i === 1 ? 0 : 3} size={22} color={A} />
            )}
            <span className="flex-1 text-[15px] font-medium text-[#1d1d1f]">{r.t}</span>
            <span className="text-[13px] tabular-nums text-[#6e6e73]">{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const I = (d: string) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

function AskCard() {
  return (
    <div className={`${card} flex h-[440px] w-[440px] flex-col gap-5 p-6`}>
      <div className="rounded-2xl bg-[#f5f5f7] p-4 text-[13px] leading-[1.9]" style={{ fontFamily: MONO }}>
        <div className="whitespace-pre text-[#86868b]">{"  if (!rule) return cart;"}</div>
        <div className="whitespace-pre">
          {"  const off = "}
          <span className="rounded-[4px] px-0.5" style={{ background: "rgba(217,119,6,.2)", boxShadow: `inset 0 -2px 0 ${A}` }}>discountFor</span>
          {"(rule, cart);"}
        </div>
        <div className="whitespace-pre text-[#86868b]">{"  return withTotal(cart, off);"}</div>
      </div>
      <div className="flex flex-1 justify-center">
        <StaggerMenu
          label="Ask Forge"
          autoplay
          items={[
            { id: "explain", label: "Explain this", icon: I("M12 18h.01M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"), done: "Explained in chat" },
            { id: "callers", label: "Find every caller", icon: I("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4"), done: "14 callers found" },
            { id: "test", label: "Write a test", icon: I("M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"), done: "Test drafted" },
            { id: "refactor", label: "Refactor safely", icon: I("M4 7h11l-3-3M20 17H9l3 3"), done: "Plan ready" },
            { id: "forget", label: "Forget this file", icon: I("M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3"), danger: true, done: "Removed from index" },
          ]}
        />
      </div>
    </div>
  );
}

const GHOST = [`  const rule = await findActiveRule(code);`, `  if (!rule) return cart;`, `  const off = discountFor(rule, cart);`, `  return withTotal(cart, atLeast0(cart.total - off));`];

function SuggestCard() {
  return (
    <div className={`${card} flex w-[480px] flex-col gap-5 p-6`}>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-semibold text-[#1d1d1f]">Suggestion</span>
        <span className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
          <kbd className="rounded-md bg-[#f5f5f7] px-1.5 py-0.5 text-[11px] font-semibold text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)]">Tab</kbd> to accept
        </span>
      </div>
      <div className="rounded-2xl bg-[#f5f5f7] p-4 text-[12px] leading-[1.9]" style={{ fontFamily: MONO }}>
        <div className="whitespace-pre text-[#1d1d1f]">{"export async function applyDiscount(cart, code) {"}</div>
        {GHOST.map((g, i) => (
          <motion.div key={i} className="whitespace-pre" style={{ color: "#a16207" }} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 0.85, x: 0 }} transition={{ type: "spring", stiffness: 200, damping: 24, delay: 0.3 + i * 0.25 }}>
            {g}
          </motion.div>
        ))}
        <div className="whitespace-pre text-[#1d1d1f]">{"}"}</div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-medium text-[#1d1d1f]">Read before suggesting</span>
        <div className="flex flex-wrap gap-2">
          {["pricing/active.ts", "pricing/off.ts", "money/clamp.ts", "total.test.ts"].map((f, i) => (
            <motion.span key={f} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 22, delay: 1.3 + i * 0.1 }} className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[12px] font-medium" style={{ color: AD, fontFamily: MONO }}>
              {f}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LearnCard() {
  const rows = [
    { t: "Errors return Result<T>, they don't throw", p: 94 },
    { t: "Tests build carts with makeCart()", p: 97 },
    { t: "zod schemas sit next to each handler", p: 88 },
    { t: "No default exports under /lib", p: 100 },
  ];
  return (
    <div className={`${card} flex w-[440px] flex-col gap-4 p-6`}>
      <div className="flex flex-col gap-1">
        <span className="text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">House style, learned</span>
        <span className="text-[13px] text-[#6e6e73]">From 18,330 commits. Share of the codebase that follows each one.</span>
      </div>
      {rows.map((r, i) => (
        <div key={r.t} className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3 text-[14px]">
            <span className="text-[#1d1d1f]">{r.t}</span>
            <span className="font-semibold tabular-nums" style={{ color: AD }}>{r.p}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#f0f0f2]">
            <motion.div className="h-full origin-left rounded-full" style={{ background: A, width: `${r.p}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.2 + i * 0.12 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Story() {
  return (
    <section id="how" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead title="Context is the whole product." sub="Most assistants see the file you have open. Forge sees the package that imports it, the test that covers it, and the pull request that changed it last week." accent={AD} />
      <div className="mt-10">
        <StickyStory
          accent={AD}
          steps={[
            { kicker: "Step 1", title: "It reads the whole repo, not the open tab.", body: "Point Forge at a repository and it builds a map of every symbol, import, test and commit. Pushes update the map in seconds, so it never answers from last month's code.", visual: <IndexCard /> },
            { kicker: "Step 2", title: "Ask about any symbol, from where you are.", body: "Select something and ask. Forge answers with the callers, the tests and the history it found, and links each claim to the line it came from.", visual: <AskCard /> },
            { kicker: "Step 3", title: "Suggestions that use your helpers.", body: "Instead of inventing a new rounding function, Forge calls the one in money/. Every suggestion lists the files it read, so you can check its homework.", visual: <SuggestCard /> },
            { kicker: "Step 4", title: "It picks up how your team writes.", body: "Naming, error handling, where tests live. Forge learns the conventions from your history and follows them. When the codebase disagrees with itself, it tells you.", visual: <LearnCard /> },
          ]}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Review: Before / After                                               */
/* ------------------------------------------------------------------ */

const BEFORE = [
  `// checkout/applyDiscount.ts, your draft`,
  `const rule = await rules.find(code);`,
  `if (!rule) return cart;`,
  ``,
  `if (rule.kind === "percent") {`,
  `  const off = cart.total * rule.value;`,
  `  return withTotal(cart, cart.total - off);`,
  `}`,
  `return withTotal(cart, cart.total - rule.value);`,
];

const AFTER = [
  `// Forge: handles "bogo" (#2291), never below 0`,
  `const rule = await findActiveRule(code);`,
  `if (!rule) return cart;`,
  ``,
  `const off = discountFor(rule, cart);`,
  `return withTotal(cart, atLeast0(cart.total - off));`,
  ``,
  `// + total.test.ts: 3 new cases`,
  ``,
];

function CodePane({ lines, tone, bg, mark }: { lines: string[]; tone: string; bg: string; mark: number[] }) {
  return (
    <div className="flex h-full w-full items-center justify-center px-3 py-5 text-[9.5px] leading-[1.75] sm:text-[14px] lg:text-[17px]" style={{ background: bg, fontFamily: MONO }}>
      <div className="flex w-[34em] max-w-full flex-col">
      {lines.map((l, i) => (
        <div key={i} className="relative flex gap-3 sm:gap-5">
          <span className="w-3 flex-none select-none text-right tabular-nums text-[#86868b] sm:w-5">{i + 1}</span>
          {mark.includes(i) && <span className="absolute -left-2 top-0 h-full w-[3px] rounded-full sm:-left-4" style={{ background: tone }} aria-hidden="true" />}
          <code className="whitespace-pre">{hl(l)}{l === "" ? " " : null}</code>
        </div>
      ))}
      </div>
    </div>
  );
}

function Review() {
  return (
    <section id="review" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto max-w-[1180px] px-5">
        <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <SectionHead title="Drag to see what it would change." accent={AD} />
          <Reveal y={14}>
            <p className="m-0 max-w-[460px] text-[17px] leading-[1.5] text-[#6e6e73]">Forge reviews your branch before you open the pull request. It ran your tests on this suggestion, found the missing case, and reused two helpers you already had.</p>
          </Reveal>
        </div>
        <Reveal className="mt-12" y={20} amount={0.15}>
          <BeforeAfter
            autoplay
            beforeLabel="Your draft"
            afterLabel="Forge"
            before={<CodePane lines={BEFORE} tone="#ff3b30" bg="#fff" mark={[4, 5, 6, 8]} />}
            after={<CodePane lines={AFTER} tone="#34c759" bg="#fffaf0" mark={[1, 4, 5, 7]} />}
          />
        </Reveal>
        <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { t: "Runs your tests first", b: "Suggestions that break the suite never reach you. This one passed 42 of 42." },
            { t: "Cites its sources", b: "Every change links the files and pull requests it was based on." },
            { t: "One click to undo", b: "Accepted changes land as a separate commit you can revert on its own." },
          ].map((f) => (
            <div key={f.t} className={`${card} h-full p-6`}>
              <h3 className="m-0 text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{f.t}</h3>
              <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73]">{f.b}</p>
            </div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Editors: Dock                                                        */
/* ------------------------------------------------------------------ */

function Editors() {
  return (
    <section id="editors" className="mx-auto max-w-[1180px] px-5 py-24">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <SectionHead title="Same index in every editor." sub="One index, shared by the extension, the CLI and the pull request bot. Ask in your terminal, pick it up in the IDE, see the review on the pull request." accent={AD} />
          <Reveal y={12}>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {["Extensions for VS Code, JetBrains IDEs and Neovim", "A CLI for scripts and CI: forge ask, forge review", "Review comments on every pull request, if you want them"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full" style={{ background: "rgba(217,119,6,.14)", color: AD }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal y={18}>
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy: Capsule toggles                                             */
/* ------------------------------------------------------------------ */

function Privacy() {
  const [retain, setRetain] = useState(false);
  const [train, setTrain] = useState(false);
  const [vpc, setVpc] = useState(true);
  const rows = [
    { id: "retain", label: "Keep request logs for 30 days", hint: retain ? "Logs kept for 30 days, encrypted, then deleted." : "Snippets are dropped as soon as the answer is sent.", v: retain, set: setRetain },
    { id: "train", label: "Use my code to improve models", hint: train ? "Only for your own fine-tuned model. Never shared." : "Off. Your code never trains anyone's model.", v: train, set: setTrain },
    { id: "vpc", label: "Keep the index in my cloud", hint: vpc ? "The index lives in your VPC. Forge only sees the snippets it needs." : "The index is hosted by Forge, encrypted per repo.", v: vpc, set: setVpc },
  ];
  return (
    <section id="privacy" className="bg-[#f5f5f7] py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <SectionHead title="Your code stays your code." sub="Every setting is visible and every default is the strict one. Admins can lock them for the whole organisation." accent={AD} />
        <Reveal y={18}>
          <div className={`${card} flex flex-col divide-y divide-black/[.06] px-6`}>
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-5 py-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[16px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{r.label}</span>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={String(r.v)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="text-[13px] leading-[1.4] text-[#6e6e73]">
                      {r.hint}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <CapsuleToggle checked={r.v} onChange={r.set} label={r.label} onColor={A} />
              </div>
            ))}
            <div className="flex flex-wrap items-center gap-2 py-4 text-[12px] text-[#6e6e73]">
              {["SOC 2 Type II", "SSO and SCIM", "Audit log export", "Self-hosted option"].map((b) => (
                <span key={b} className="rounded-full bg-[#f5f5f7] px-2.5 py-1 font-medium text-[#424245]">{b}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing: plans + seat stepper with rolling total                     */
/* ------------------------------------------------------------------ */

function Pricing() {
  const [seats, setSeats] = useState(8);
  const plans = [
    { n: "Solo", p: "Free", s: "For public repos and side projects", f: ["Repos up to 200k lines", "Editor and CLI", "Community support"] },
    { n: "Team", p: "$19", s: "per seat, per month", f: ["Repos up to 4M lines", "Pull request reviews", "Shared conventions", "Admin controls"], hot: true },
    { n: "Enterprise", p: "Custom", s: "For regulated teams", f: ["Index in your VPC", "SSO, SCIM, audit log", "99.9% uptime SLA"] },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-[1180px] px-5 py-24">
      <SectionHead title="Priced per seat. Repos are free." sub="Index as many repositories as you like on any plan. Try Team free for 14 days, no card." accent={AD} center />
      <Stagger className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <div key={p.n} className={`${card} relative flex h-full flex-col gap-5 p-7`} style={p.hot ? { boxShadow: `0 0 0 2px ${A}, 0 24px 48px -32px rgba(180,83,9,.5)` } : undefined}>
            {p.hot && <span className="absolute right-6 top-6 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: AD }}>Most teams</span>}
            <div className="flex flex-col gap-1">
              <h3 className="m-0 text-[20px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{p.n}</h3>
              <span className="text-[40px] font-semibold tracking-[-0.045em] text-[#1d1d1f] tabular-nums">{p.p}</span>
              <span className="text-[14px] text-[#6e6e73]">{p.s}</span>
            </div>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {p.f.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[15px] text-[#1d1d1f]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={AD} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Stagger>
      <Reveal className="mt-5" y={16}>
        <div className={`${card} grid grid-cols-1 items-center gap-6 p-7 lg:grid-cols-[1fr_auto_1fr]`}>
          <div className="flex flex-col gap-1 text-center lg:text-left">
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Team, for your whole team</span>
            <span className="text-[14px] text-[#6e6e73]">Add or remove seats any time. We prorate to the day.</span>
          </div>
          <div className="flex justify-center"><Fit><ElasticStepper label="Seats" min={1} max={30} defaultValue={8} accent={AD} onChange={setSeats} /></Fit></div>
          <div className="flex items-baseline justify-center gap-1.5 whitespace-nowrap text-[#1d1d1f] lg:justify-end">
            <span className="flex text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">$<RollingNumber value={seats * 19} /></span>
            <span className="text-[14px] text-[#6e6e73]">/ month</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function AiStartupForgePage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="fg min-h-screen overflow-x-clip bg-[#fbfbfd] text-[#1d1d1f] antialiased" style={{ colorScheme: "light", fontFamily: FONT_SANS }}>
        <style>{FONT_CSS + BASE_CSS}</style>
        <Nav dark brand={<Logo />} accent={AD} cta="Install Forge" onCta={() => scrollToId("pricing")} links={[{ label: "How it works", id: "how" }, { label: "Review", id: "review" }, { label: "Editors", id: "editors" }, { label: "Privacy", id: "privacy" }, { label: "Pricing", id: "pricing" }]} />
        <Hero />
        <Story />
        <Review />
        <Editors />
        <Privacy />
        <Pricing />
        <section id="faq" className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 px-5 py-24 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead title="Fair questions." accent={AD} />
          <Reveal y={14}>
            <Faq
              accent={AD}
              items={[
                { q: "Does Forge send my whole repo to a model?", a: "No. The index lives on Forge's servers or in your cloud. For each request Forge retrieves the few snippets that matter, usually 10 to 20, and sends only those. They are not stored after the answer comes back unless you turn on logging." },
                { q: "How big a repo can it handle?", a: "Team indexes repositories up to 4 million lines; Enterprise has no hard limit. A 1M-line repo takes about six minutes to index the first time and a few seconds per push after that." },
                { q: "Which languages does it understand?", a: "Symbol-level indexing covers TypeScript, JavaScript, Python, Go, Rust, Java, Kotlin, C# and Ruby. Other languages are indexed as text, which still works for search and questions but not for call graphs." },
                { q: "Will it write code in our style?", a: "It tries. Forge learns conventions from your history and shows you what it learned, so you can correct it. Where the codebase disagrees with itself, it follows the newer code and says so." },
                { q: "What happens when it's wrong?", a: "Every answer links to the lines it relied on, so mistakes are easy to spot. Suggestions run against your tests before you see them, and accepted changes land as their own commit." },
              ]}
            />
          </Reveal>
        </section>
        <div className="mx-auto max-w-[1180px] px-5 pb-20">
          <CtaBand title="Point Forge at your repo." sub="Free for public repositories, and for 14 days on private ones. Indexing starts the moment you connect." cta="Install Forge" secondary="Book a demo" accent={AD} glow="rgba(217,119,6,.32)" />
        </div>
        <Footer brand={<Logo />} note="The coding assistant that reads your whole repository before it answers." columns={[{ title: "Product", links: ["Editor", "CLI", "Reviews", "Pricing"] }, { title: "Developers", links: ["Docs", "Changelog", "Status", "Security"] }, { title: "Company", links: ["About", "Careers", "Privacy", "Contact"] }]} />
      </div>
    </MotionConfig>
  );
}
