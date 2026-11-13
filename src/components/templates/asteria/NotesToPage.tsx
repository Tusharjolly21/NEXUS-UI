"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ScaleBox } from "@/components/templates/kit/blocks";
import { useMedia } from "@/components/templates/kit/parts";

/**
 * The scroll story under Asteria's hero: one founder's notes file on the left, the page Asteria made from it on the
 * right. As you scroll, a line draws from each phrase in the notes to the exact place on the page it became, and
 * that part of the page fills in when the line lands. The struck-out idea gets no line; at the end it is marked
 * "left out" and the page goes live. Everything sits on a fixed 1120 × 620 canvas scaled to the column, so every
 * line lands on its target at any width. Phones get each phrase above the part of the page it became; reduced
 * motion shows the finished page.
 */

const W = 1120;
const H = 620;
const INK = "#1e1b4b";
const PRI = "#4f46e5";
const HI = "#fbbf24";
const BG = "#f5f3ff";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

/** Note lines, top to bottom, in design pixels (left card). `to` is the index of the link it starts, if any. */
const NOTES: { t: string; y: number; struck?: boolean; to?: number }[] = [
  { t: "dog walking but at NIGHT??", y: 128, to: 1 },
  { t: "- nurses, warehouse ppl, bakers", y: 176 },
  { t: "- just an app for dogs??", y: 224, struck: true },
  { t: "- walkers who are up anyway", y: 272, to: 2 },
  { t: "- send a photo when dog is home!!", y: 320, to: 3 },
  { t: "price ~18/walk?? ask dog park grp", y: 368, to: 4 },
  { t: "name: nightpaws / moonwalk / owl&dog", y: 416, to: 0 },
];

/** Where each link lands on the page card, in design pixels, in the order they draw. */
const LINKS: { from: number; end: [number, number]; top?: boolean }[] = [
  { from: 6, end: [576, 71] }, // the name
  { from: 0, end: [576, 150] }, // the headline
  { from: 3, end: [576, 476] }, // night rotas
  { from: 4, end: [1014, 424], top: true }, // home photo, from above so it doesn't cross the other cards
  { from: 5, end: [576, 566] }, // the price, still a guess
];

const START = 0.06;
const STEP = 0.15;
const windowFor = (i: number) => [START + i * STEP, START + i * STEP + 0.11] as const;
const LIVE_AT = START + LINKS.length * STEP;

function useStep(p: MotionValue<number>, i: number) {
  const [a, b] = windowFor(i);
  const draw = useTransform(p, [a, b], [0, 1], { clamp: true });
  const land = useTransform(p, [b - 0.03, b + 0.03], [0, 1], { clamp: true });
  return { draw, land };
}

function Link({ p, i }: { p: MotionValue<number>; i: number }) {
  const { draw, land } = useStep(p, i);
  const { from, end, top } = LINKS[i];
  const [, b] = windowFor(i);
  const sx = 418;
  const sy = NOTES[from].y + 4;
  const [ex, ey] = end;
  const d = top ? `M ${sx} ${sy} C ${sx + 160} ${sy}, ${ex} ${ey - 150}, ${ex} ${ey}` : `M ${sx} ${sy} C ${sx + 90} ${sy}, ${ex - 90} ${ey}, ${ex} ${ey}`;
  // the newest line is strong; once the next one starts, it steps back so the page stays readable
  const fade = useTransform(p, [b + 0.04, b + 0.1], [1, 0.32], { clamp: true });
  return (
    <motion.g style={{ opacity: fade }}>
      <motion.path d={d} fill="none" stroke={PRI} strokeWidth={2} strokeLinecap="round" style={{ pathLength: draw, opacity: useTransform(draw, [0, 0.02], [0, 1]) }} />
      <motion.circle cx={sx} cy={sy} r={4.5} fill={PRI} style={{ opacity: useTransform(draw, [0, 0.05], [0, 1]) }} />
      <motion.circle cx={ex} cy={ey} r={5} fill="#fff" stroke={PRI} strokeWidth={2.5} style={{ scale: land, opacity: land }} />
    </motion.g>
  );
}

/** A part of the page that fills in when its link lands. */
function Slot({ p, i, children, style }: { p: MotionValue<number>; i: number; children: ReactNode; style: CSSProperties }) {
  const { land } = useStep(p, i);
  return (
    <motion.div
      className="absolute"
      style={{ ...style, opacity: useTransform(land, [0, 1], [0.0, 1]), filter: useTransform(land, [0, 1], ["blur(6px)", "blur(0px)"]), y: useTransform(land, [0, 1], [8, 0]) }}
    >
      {children}
    </motion.div>
  );
}

/** The grey placeholder a slot replaces, so the page reads as a draft before it fills in. */
function Ghost({ p, i, style }: { p: MotionValue<number>; i: number; style: CSSProperties }) {
  const { land } = useStep(p, i);
  return <motion.span className="absolute rounded-[10px] bg-[#e4e1f5]" style={{ ...style, opacity: useTransform(land, [0, 1], [1, 0]) }} />;
}

function NoteLine({ p, n }: { p: MotionValue<number>; n: (typeof NOTES)[number] }) {
  const linked = n.to !== undefined;
  const done = useTransform(p, (v): number => (linked && v >= windowFor(n.to!)[0] ? 1 : 0));
  const left = useTransform(p, [LIVE_AT - 0.02, LIVE_AT + 0.03], [0, 1], { clamp: true });
  return (
    <div className="absolute left-[28px] right-[24px] flex items-center gap-3 text-[17px]" style={{ top: n.y - 13, fontFamily: MONO }}>
      <motion.span
        className="relative whitespace-nowrap rounded-[4px] px-1"
        style={{ color: n.struck ? "#9a917a" : "#3f3a2e", textDecoration: n.struck ? "line-through" : undefined, backgroundColor: useTransform(done, (d): string => (d ? "rgba(79,70,229,0.12)" : "rgba(79,70,229,0)")) }}
      >
        {n.t}
      </motion.span>
      {n.struck ? (
        <motion.span className="ml-auto rounded-full bg-[#fde68a] px-2.5 py-0.5 text-[12px] font-semibold text-[#713f12]" style={{ opacity: left, scale: left, fontFamily: "inherit" }}>
          Left out
        </motion.span>
      ) : null}
    </div>
  );
}

function Canvas({ p }: { p: MotionValue<number> }) {
  const live = useTransform(p, [LIVE_AT - 0.01, LIVE_AT + 0.05], [0, 1], { clamp: true });
  return (
    <div className="relative" style={{ width: W, height: H }}>
      {/* the notes */}
      <div className="absolute left-0 top-[40px] h-[520px] w-[440px] rounded-[22px] bg-[#fdfbf3] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_24px_48px_-32px_rgba(0,0,0,.35)]">
        <span className="absolute left-[30px] top-[30px] text-[13px] text-[#857a5b]" style={{ fontFamily: MONO }}>notes.txt · last edited 01:12</span>
        {NOTES.map((n) => (
          <NoteLine key={n.t} p={p} n={{ ...n, y: n.y - 40 }} />
        ))}
        <span className="absolute bottom-[34px] right-[30px] rotate-[4deg] rounded-[8px] bg-[#fde68a] px-3 py-2 text-[15px] text-[#3f3a2e] shadow-[0_8px_16px_-8px_rgba(0,0,0,.3)]" style={{ fontFamily: MONO }}>launch before xmas</span>
      </div>

      {/* the page */}
      <motion.div
        className="absolute right-0 top-0 h-[620px] w-[560px] overflow-hidden rounded-[22px]"
        style={{ background: BG, boxShadow: useTransform(live, [0, 1], ["0 0 0 1px rgba(0,0,0,.06), 0 24px 48px -32px rgba(0,0,0,.35)", "0 0 0 2px rgba(79,70,229,.55), 0 30px 60px -30px rgba(79,70,229,.55)"]) }}
      >
        <div className="absolute inset-x-0 top-0 flex h-[44px] items-center gap-2 border-b border-black/[.06] bg-white/70 px-4">
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
          <span className="ml-2 rounded-full bg-[#efedf9] px-3 py-1 text-[12px] font-medium text-[#5b5675]">nightpaws.asteria.page</span>
          <motion.span className="ml-auto flex items-center gap-1.5 text-[12px] font-semibold text-[#1a7f42]" style={{ opacity: live }}>
            <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            Live
          </motion.span>
        </div>

        <Ghost p={p} i={0} style={{ left: 28, top: 64, width: 120, height: 22 }} />
        <Slot p={p} i={0} style={{ left: 28, top: 60 }}>
          <span className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: INK }}>
            <span className="h-4 w-4 rounded-[5px]" style={{ background: PRI }} />
            Nightpaws
          </span>
        </Slot>
        <span className="absolute right-[28px] top-[58px] rounded-full px-3.5 py-1.5 text-[12px] font-semibold text-white" style={{ background: INK }}>Book a night walk</span>

        <Ghost p={p} i={1} style={{ left: 28, top: 118, width: 300, height: 108 }} />
        <Slot p={p} i={1} style={{ left: 28, top: 112, width: 300 }}>
          <span className="block text-[33px] font-semibold leading-[1.05] tracking-[-0.035em]" style={{ color: INK }}>Walks at 2am, by people who are awake anyway.</span>
        </Slot>
        <span className="absolute left-[28px] top-[262px] w-[300px] text-[14px] leading-[1.45]" style={{ color: INK, opacity: 0.72 }}>Vetted walkers on night rotas, a live map of every walk, and a photo the moment your dog is home.</span>
        <span className="absolute left-[28px] top-[340px] rounded-full px-4 py-2 text-[13px] font-semibold text-white" style={{ background: PRI }}>Book a night walk</span>

        {/* artwork */}
        <div className="absolute right-[28px] top-[112px] h-[260px] w-[176px] overflow-hidden rounded-[18px]" style={{ background: `linear-gradient(160deg, ${PRI}, ${INK})` }}>
          <span className="absolute left-[46%] top-[14%] h-[64px] w-[64px] rounded-full" style={{ background: HI }} />
          <span className="absolute left-[56%] top-[10%] h-[64px] w-[64px] rounded-full" style={{ background: PRI }} />
          {[[18, 60], [70, 72], [30, 82], [84, 40]].map(([x, y], k) => <span key={k} className="absolute h-1 w-1 rounded-full bg-white/80" style={{ left: `${x}%`, top: `${y}%` }} />)}
        </div>

        {/* features */}
        {[
          ["Night rotas", "Walkers who sleep in the day.", 28, 2],
          ["Live map", "Follow the whole walk.", 202, -1],
          ["Home photo", "Proof they are back inside.", 376, 3],
        ].map(([t, d, x, link]) => {
          const box = { left: x as number, top: 430, width: 156, height: 92 };
          const body = (
            <div className="h-[92px] w-[156px] rounded-[14px] bg-white p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
              <span className="block text-[14px] font-semibold" style={{ color: INK }}>{t}</span>
              <span className="mt-1 block text-[12px] leading-[1.35] text-[#5b5675]">{d}</span>
            </div>
          );
          return (link as number) >= 0 ? (
            <div key={t as string}>
              <Ghost p={p} i={link as number} style={box} />
              <Slot p={p} i={link as number} style={{ left: box.left, top: box.top }}>{body}</Slot>
            </div>
          ) : (
            <div key={t as string} className="absolute" style={{ left: box.left, top: box.top }}>{body}</div>
          );
        })}

        {/* the price: filled in, and still marked as a guess */}
        <Ghost p={p} i={4} style={{ left: 28, top: 552, width: 210, height: 34 }} />
        <Slot p={p} i={4} style={{ left: 28, top: 550 }}>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-white px-3.5 py-1.5 text-[14px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,.06)]" style={{ color: INK }}>From $18 a walk</span>
            <span className="rounded-full border border-dashed border-[#b45309] px-2.5 py-1 text-[11.5px] font-semibold text-[#92400e]">Check this</span>
          </span>
        </Slot>
      </motion.div>

      {/* the lines, over both cards */}
      <svg className="pointer-events-none absolute inset-0" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        {LINKS.map((_, i) => <Link key={i} p={p} i={i} />)}
      </svg>
    </div>
  );
}

const CAPTIONS = [
  "It reads your notes the way you wrote them.",
  "Your name, from the list you could not decide on.",
  "Your headline, in your words.",
  "The walkers who are up anyway became a feature.",
  "So did the photo when the dog is home.",
  "The price is in, and marked until you confirm it.",
  "The app-for-dogs idea you crossed out stays out. The page is live.",
];

function Caption({ p }: { p: MotionValue<number> }) {
  return (
    <div className="relative h-[28px]" aria-hidden="true">
      {CAPTIONS.map((c, k) => {
        const a = k === 0 ? 0 : windowFor(k - 1)[0];
        const b = k === CAPTIONS.length - 1 ? 1 : k === 0 ? START : windowFor(k)[0];
        return <CaptionLine key={c} p={p} a={a} b={b} text={c} first={k === 0} last={k === CAPTIONS.length - 1} />;
      })}
    </div>
  );
}

function CaptionLine({ p, a, b, text, first, last }: { p: MotionValue<number>; a: number; b: number; text: string; first: boolean; last: boolean }) {
  // scroll-linked opacity runs on the compositor, which only takes offsets between 0 and 1
  const o = useTransform(
    p,
    first ? [0, b - 0.02, b] : last ? [a, a + 0.02] : [a, a + 0.02, b - 0.02, b],
    first ? [1, 1, 0] : last ? [0, 1] : [0, 1, 1, 0],
  );
  return <motion.p className="absolute inset-x-0 m-0 text-center text-[17px] font-medium tracking-[-0.01em] text-[#1d1d1f]" style={{ opacity: o }}>{text}</motion.p>;
}

/** Phones: each phrase from the notes above the part of the page it became, joined by a line that draws in view. */
const PAIRS: { note: string; struck?: boolean; out: ReactNode }[] = [
  {
    note: "name: nightpaws / moonwalk / owl&dog",
    out: (
      <span className="flex items-center gap-2 text-[17px] font-semibold" style={{ color: INK }}>
        <span className="h-4 w-4 rounded-[5px]" style={{ background: PRI }} />
        Nightpaws
      </span>
    ),
  },
  {
    note: "dog walking but at NIGHT??",
    out: <span className="block text-[24px] font-semibold leading-[1.1] tracking-[-0.03em]" style={{ color: INK }}>Walks at 2am, by people who are awake anyway.</span>,
  },
  {
    note: "- walkers who are up anyway",
    out: (
      <span className="block">
        <span className="block text-[15px] font-semibold" style={{ color: INK }}>Night rotas</span>
        <span className="block text-[14px] text-[#5b5675]">Walkers who sleep in the day.</span>
      </span>
    ),
  },
  {
    note: "- send a photo when dog is home!!",
    out: (
      <span className="block">
        <span className="block text-[15px] font-semibold" style={{ color: INK }}>Home photo</span>
        <span className="block text-[14px] text-[#5b5675]">Proof they are back inside.</span>
      </span>
    ),
  },
  {
    note: "price ~18/walk?? ask dog park grp",
    out: (
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-[15px] font-semibold" style={{ color: INK }}>From $18 a walk</span>
        <span className="rounded-full border border-dashed border-[#b45309] px-2.5 py-0.5 text-[12px] font-semibold text-[#92400e]">Check this</span>
      </span>
    ),
  },
  { note: "- just an app for dogs??", struck: true, out: <span className="rounded-full bg-[#fde68a] px-2.5 py-1 text-[13px] font-semibold text-[#713f12]">Left out</span> },
];

function PhonePairs({ still }: { still: boolean }) {
  const show = still ? {} : { initial: "hide", whileInView: "show", viewport: { once: true, amount: 0.6 } };
  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 px-5">
      {PAIRS.map((x) => (
        <motion.li key={x.note} {...show} className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)]">
          <div className="bg-[#fdfbf3] px-4 py-3 text-[14px]" style={{ fontFamily: MONO, color: x.struck ? "#9a917a" : "#3f3a2e", textDecoration: x.struck ? "line-through" : undefined }}>
            {x.note}
          </div>
          <div className="relative flex items-start gap-3 px-4 pb-4 pt-3" style={{ background: BG }}>
            <motion.span
              aria-hidden="true"
              className="absolute left-[21px] top-0 h-[22px] w-[2px] origin-top"
              style={{ background: PRI }}
              variants={{ hide: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } } }}
            />
            <motion.span
              aria-hidden="true"
              className="mt-[18px] h-[10px] w-[10px] flex-none rounded-full border-[2.5px] bg-white"
              style={{ borderColor: PRI }}
              variants={{ hide: { scale: 0 }, show: { scale: 1, transition: { delay: 0.3, type: "spring", stiffness: 500, damping: 22 } } }}
            />
            <motion.div
              className="min-w-0 pt-3"
              variants={{ hide: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { delay: 0.38, duration: 0.4, ease: [0.22, 1, 0.36, 1] } } }}
            >
              {x.out}
            </motion.div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

const noop = () => () => {};

export default function NotesToPage() {
  const ref = useRef<HTMLDivElement>(null);
  // false while hydrating (the server can't know the setting), then the visitor's real setting
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const still = hydrated && !!reduce;
  const phone = useMedia("(max-width: 767px)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const done = useTransform(scrollYProgress, () => 1);
  // a derived value, so nothing here is handed to the browser's scroll-linked fast path, which keeps a keyframe's
  // starting value outside its range instead of the last one
  const live = useTransform(scrollYProgress, (v) => v);
  const p = still || phone ? done : live;

  if (phone) return <PhonePairs still={still} />;

  return (
    <div ref={ref} className="relative" style={{ height: still ? "auto" : "300vh" }}>
      <div className={still ? "px-5" : "sticky top-0 flex h-screen flex-col justify-center gap-6 px-5"}>
        <div className="mx-auto w-full max-w-[min(1120px,calc((100vh-140px)*1.8))]">
          <ScaleBox w={W} h={H}><Canvas p={p} /></ScaleBox>
        </div>
        {still ? null : <Caption p={p} />}
      </div>
    </div>
  );
}
