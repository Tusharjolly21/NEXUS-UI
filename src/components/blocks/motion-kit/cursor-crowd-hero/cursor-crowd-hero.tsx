"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTypedText } from "@/lib/typing-sound";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface CursorCrowdHeroProps {
  /** Words the last word of the headline is retyped through. The first is shown at rest. Pass a stable array. */
  words?: string[];
  /** Runs the teammates (select and retype the word, tug the button, drop a comment) until the visitor first presses or types in the section. */
  autoplay?: boolean;
  /** Called with the button that was pressed. Buttons never navigate. */
  onAction?: (label: "primary" | "secondary") => void;
  className?: string;
}

const PEOPLE = [
  { name: "Maya", color: "#bf5af2" },
  { name: "Leo", color: "#0a84ff" },
  { name: "Ari", color: "#ff9f0a" },
] as const;
const DEFAULT_WORDS = ["faster", "together", "tonight", "better"];
const SEP = "\u0000";
const EASE = [0.45, 0, 0.2, 1] as const;
const ring =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
const usePageVisible = () =>
  useSyncExternalStore(subscribeVisibility, () => !document.hidden, () => true);
const subscribeNothing = () => () => {};
const useIsClient = () => useSyncExternalStore(subscribeNothing, () => true, () => false);

/** Small seeded generator, so the teammates wander the same way every run. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Cursor({
  x,
  y,
  name,
  color,
  pressed,
  me = false,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  name: string;
  color?: string;
  pressed?: boolean;
  me?: boolean;
}) {
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0 z-30" style={{ x, y }} aria-hidden="true">
      <motion.svg
        width="20"
        height="22"
        viewBox="0 0 20 22"
        animate={{ scale: pressed ? 0.85 : 1 }}
        style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.25))" }}
      >
        <path
          d="M2 2l15 8.2-6.6 1.6L7 18.6z"
          fill={me ? undefined : color}
          className={me ? "fill-[#1d1d1f] stroke-white dark:fill-[#f5f5f7] dark:stroke-black" : "stroke-white"}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </motion.svg>
      <span
        className={cn(
          "absolute left-4 top-5 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white",
          me && "bg-[#1d1d1f] dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
        )}
        style={me ? undefined : { background: color }}
      >
        {name}
      </span>
    </motion.div>
  );
}

/**
 * A hero that is being worked on while you watch. Three teammates' cursors share the section: one
 * selects the last word of the headline and retypes it, one grabs the button and tugs it, one drops
 * a comment. Move in with a mouse and you get your own cursor too. At rest (no autoplay, reduced
 * motion, off screen or a hidden tab) the crowd is parked in a still frame.
 */
export function CursorCrowdHero({ words = DEFAULT_WORDS, autoplay = false, onAction, className }: CursorCrowdHeroProps) {
  const root = useRef<HTMLDivElement>(null);
  const wordEl = useRef<HTMLSpanElement>(null);
  const btnEl = useRef<HTMLButtonElement>(null);
  const subEl = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(root, { amount: 0.2 });
  const visible = usePageVisible();
  const mounted = useIsClient();
  const [stopped, setStopped] = useState(false);
  const active = autoplay && !reduce && !stopped && inView && visible;

  const m0x = useMotionValue(0);
  const m0y = useMotionValue(0);
  const m1x = useMotionValue(0);
  const m1y = useMotionValue(0);
  const m2x = useMotionValue(0);
  const m2y = useMotionValue(0);
  const meX = useMotionValue(-100);
  const meY = useMotionValue(-100);
  const btnX = useMotionValue(0);

  const [inside, setInside] = useState(false);
  const [word, setWord] = useState<string | null>(null);
  useTypedText(word ?? "");
  const [selRun, setSel] = useState(0); // 0..1 selection sweep across the word
  const [typingRun, setTyping] = useState(false);
  const [pressedRun, setPressed] = useState<number | null>(null);
  const [commentRun, setComment] = useState(false);

  const wordsKey = words.filter((w) => w.trim()).join(SEP) || DEFAULT_WORDS.join(SEP);
  const firstWord = wordsKey.split(SEP)[0];
  // At rest the parked frame is drawn: word selected, comment open, nobody mid-click.
  const shownWord = active ? (word ?? firstWord) : firstWord;
  const sel = active ? selRun : 1;
  const typing = active ? typingRun : false;
  const pressed = active ? pressedRun : null;
  const commentOn = active ? commentRun : true;

  // Park the crowd where the still frame wants it, and keep it there when the section resizes.
  useLayoutEffect(() => {
    if (active) return;
    const rootEl = root.current;
    if (!rootEl) return;
    const park = () => {
      const r = rootEl.getBoundingClientRect();
      const rel = (el: Element | null) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
      };
      const w = rel(wordEl.current);
      const b = rel(btnEl.current);
      const s = rel(subEl.current);
      if (!w || !b || !s) return;
      m0x.set(w.x + w.w + 2);
      m0y.set(w.y + w.h * 0.55);
      m1x.set(b.x + b.w * 0.6);
      m1y.set(b.y + b.h * 0.5);
      m2x.set(Math.min(s.x + s.w + 10, r.width - 200));
      m2y.set(s.y - 6);
      btnX.set(0);
    };
    park();
    const ro = new ResizeObserver(park);
    ro.observe(rootEl);
    return () => ro.disconnect();
  }, [active, shownWord, mounted, m0x, m0y, m1x, m1y, m2x, m2y, btnX]);

  // The teammates' loop.
  useEffect(() => {
    if (!active) return;
    const rootEl = root.current;
    if (!rootEl) return;
    const list = wordsKey.split(SEP);
    const rand = seeded(11);
    let alive = true;
    const controls = new Set<ReturnType<typeof animate>>();
    const timers = new Set<number>();
    const halt = new Error("stopped");

    const sleep = (ms: number) =>
      new Promise<void>((res, rej) => {
        const id = window.setTimeout(() => {
          timers.delete(id);
          if (alive) res();
          else rej(halt);
        }, ms);
        timers.add(id);
      });
    const play = (c: ReturnType<typeof animate>) => {
      controls.add(c);
      return Promise.resolve(c).then(() => {
        controls.delete(c);
        if (!alive) throw halt;
      });
    };
    const rel = (el: Element | null) => {
      const r = rootEl.getBoundingClientRect();
      const b = (el ?? rootEl).getBoundingClientRect();
      return { x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height };
    };
    const move = (mx: MotionValue<number>, my: MotionValue<number>, x: number, y: number, d = 0.9) =>
      Promise.all([play(animate(mx, x, { duration: d, ease: EASE })), play(animate(my, y, { duration: d, ease: EASE }))]);
    const wander = (mx: MotionValue<number>, my: MotionValue<number>) => {
      const r = rootEl.getBoundingClientRect();
      return move(
        mx,
        my,
        40 + rand() * Math.max(0, r.width - 120),
        40 + rand() * Math.max(0, r.height - 100),
        1.6,
      ).catch(() => undefined);
    };

    const run = async () => {
      let k = 0;
      await sleep(600);
      while (alive) {
        // Maya: select the last word and retype it
        const w = rel(wordEl.current);
        void wander(m1x, m1y);
        void wander(m2x, m2y);
        await move(m0x, m0y, w.x - 4, w.y + w.h * 0.55);
        setPressed(0);
        await play(
          animate(m0x, w.x + w.w + 2, {
            duration: 0.7,
            ease: "easeInOut",
            onUpdate: (v) => setSel(Math.min(1, Math.max(0, (v - w.x) / (w.w || 1)))),
          }),
        );
        setPressed(null);
        await sleep(350);
        setTyping(true);
        setSel(0);
        const prevWord = list[k % list.length];
        k += 1;
        const next = list[k % list.length];
        for (let n = prevWord.length; n >= 0; n--) {
          setWord(prevWord.slice(0, n));
          await sleep(35);
        }
        for (let n = 1; n <= next.length; n++) {
          setWord(next.slice(0, n));
          await sleep(85);
        }
        await sleep(500);
        setTyping(false);
        // Leo: tug the button
        const b = rel(btnEl.current);
        void wander(m0x, m0y);
        await move(m1x, m1y, b.x + b.w * 0.6, b.y + b.h * 0.5);
        setPressed(1);
        await Promise.all([
          play(animate(m1x, b.x + b.w * 0.6 + 46, { duration: 0.45 })),
          play(animate(btnX, 46, { duration: 0.45 })),
        ]);
        await sleep(200);
        setPressed(null);
        controls.add(animate(btnX, 0, { type: "spring", stiffness: 500, damping: 14 }));
        await sleep(400);
        // Ari: leave a comment by the subheading
        const s = rel(subEl.current);
        void wander(m0x, m0y);
        const spotX = Math.min(s.x + s.w + 10, rootEl.getBoundingClientRect().width - 200);
        await move(m2x, m2y, spotX, s.y - 6);
        setPressed(2);
        setComment(true);
        await sleep(180);
        setPressed(null);
        await sleep(2200);
        setComment(false);
        await sleep(300);
      }
    };
    run().catch(() => undefined);

    return () => {
      alive = false;
      controls.forEach((c) => c.stop());
      timers.forEach((id) => window.clearTimeout(id));
      btnX.set(0);
      setWord(null);
      setSel(0);
      setTyping(false);
      setPressed(null);
      setComment(false);
    };
  }, [active, wordsKey, m0x, m0y, m1x, m1y, m2x, m2y, btnX]);

  const color = PEOPLE[0].color;
  const crowd = [
    { x: m0x, y: m0y },
    { x: m1x, y: m1y },
    { x: m2x, y: m2y },
  ];

  return (
    <div
      ref={root}
      className={cn(
        "relative flex min-h-[540px] w-full flex-col items-center justify-center overflow-hidden bg-white px-6 py-16 text-center [--cc-dot:rgba(0,0,0,.06)] dark:bg-black dark:[--cc-dot:rgba(255,255,255,.09)]",
        className,
      )}
      style={{
        cursor: inside ? "none" : undefined,
        backgroundImage: "radial-gradient(var(--cc-dot) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
      }}
      onPointerDownCapture={() => setStopped(true)}
      onKeyDownCapture={() => setStopped(true)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        meX.set(e.clientX - r.left);
        meY.set(e.clientY - r.top);
      }}
      onPointerEnter={(e) => e.pointerType === "mouse" && setInside(true)}
      onPointerLeave={() => setInside(false)}
    >
      <div className="flex items-center gap-2 rounded-full bg-[#f5f5f7] py-1 pl-1 pr-3 text-[13px] font-medium text-[#1d1d1f] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]">
        <span className="flex -space-x-1.5" aria-hidden="true">
          {PEOPLE.map((p) => (
            <span
              key={p.name}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-[#f5f5f7] dark:ring-[#1c1c1e]"
              style={{ background: p.color }}
            >
              {p.name[0]}
            </span>
          ))}
        </span>
        3 people editing
      </div>
      <h1 className="m-0 mt-6 text-[clamp(40px,7vw,80px)] font-semibold leading-[1.02] tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <span className="sr-only">Design together, ship {firstWord}.</span>
        <span aria-hidden="true">
          Design together,
          <br />
          ship{" "}
          <span ref={wordEl} className="relative inline-block min-w-[0.5em] text-left">
            <span className="relative z-10" style={{ color: typing ? color : undefined }}>
              {shownWord || " "}
            </span>
            {sel > 0 && (
              <span
                className="absolute inset-y-[6%] left-0 rounded-[4px]"
                style={{ width: `${sel * 100}%`, background: `${color}26`, boxShadow: `inset 0 0 0 2px ${color}` }}
              >
                <span
                  className="absolute -left-[3px] -top-[3px] h-[6px] w-[6px] rounded-full bg-white dark:bg-black"
                  style={{ boxShadow: `0 0 0 2px ${color}` }}
                />
                <span
                  className="absolute -bottom-[3px] -right-[3px] h-[6px] w-[6px] rounded-full bg-white dark:bg-black"
                  style={{ boxShadow: `0 0 0 2px ${color}` }}
                />
              </span>
            )}
            {typing && (
              <motion.span
                className="absolute -right-[4px] top-[10%] h-[80%] w-[3px] rounded-full"
                style={{ background: color }}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </span>
          .
        </span>
      </h1>
      <p
        ref={subEl}
        className="m-0 mt-5 max-w-[460px] text-[18px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]"
      >
        One canvas for the whole team. Every cursor, comment and change, live.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <motion.button
          ref={btnEl}
          type="button"
          onClick={() => onAction?.("primary")}
          style={{ x: btnX, boxShadow: pressed === 1 ? `0 0 0 3px ${PEOPLE[1].color}` : undefined }}
          className={cn(
            "rounded-full bg-[#1d1d1f] px-6 py-3.5 text-[16px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]",
            ring,
          )}
        >
          Start a file
        </motion.button>
        <button
          type="button"
          onClick={() => onAction?.("secondary")}
          className={cn(
            "rounded-full bg-[#f0f0f3] px-6 py-3.5 text-[16px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]",
            ring,
          )}
        >
          Watch the demo
        </button>
      </div>

      <AnimatePresence>
        {commentOn && mounted && (
          <motion.div
            key="c"
            className="pointer-events-none absolute left-0 top-0 z-20"
            style={{ x: m2x, y: m2y }}
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            <div className="-ml-2 -mt-10 flex items-start gap-2">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full rounded-bl-none text-[12px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,.5)]"
                style={{ background: PEOPLE[2].color }}
              >
                {PEOPLE[2].name[0]}
              </span>
              <span className="rounded-[14px] bg-white px-3 py-2 text-left text-[13px] text-[#1d1d1f] shadow-[0_10px_30px_-12px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,.8),0_0_0_1px_#3a3a3c]">
                This line is perfect.
                <span className="block text-[11px] text-[#86868b] dark:text-[#a1a1a6]">{PEOPLE[2].name} · now</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("pointer-events-none absolute inset-0 z-30 transition-opacity duration-300", !mounted && "opacity-0")} aria-hidden="true">
        {PEOPLE.map((p, i) => (
          <Cursor key={p.name} x={crowd[i].x} y={crowd[i].y} name={p.name} color={p.color} pressed={pressed === i} />
        ))}
      </div>
      {inside && <Cursor x={meX} y={meY} name="You" me />}
    </div>
  );
}
