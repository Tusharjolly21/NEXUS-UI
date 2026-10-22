"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface RiffleCard {
  /** Card title. */
  t: string;
  /** One line under the title. */
  d: string;
  /** Top-left and bottom-right colour of the card. */
  c: [string, string];
  /** SVG path data for the icon, drawn on a 24 by 24 grid. */
  icon: string;
}

export interface RiffleStackProps {
  /** The deck. Needs an even number of cards so the two halves match. Defaults to eight feature cards. */
  cards?: RiffleCard[];
  /** Riffles and cuts the deck by itself every 2.8s until someone presses a button. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  /** Called with the title of the card that lands on top after each shuffle. */
  onShuffle?: (top: string) => void;
  /** Extra classes for the root. */
  className?: string;
}

const DEFAULT_CARDS: RiffleCard[] = [
  { t: "Spring physics", d: "Every move settles like it has weight.", c: ["#0a84ff", "#5e5ce6"], icon: "M4 12c3-6 5-6 8 0s5 6 8 0" },
  { t: "Layout morphs", d: "Elements travel instead of jumping.", c: ["#30d158", "#0a84ff"], icon: "M4 4h7v7H4zM13 13h7v7h-7z" },
  { t: "Gestures", d: "Drag, fling and pinch, out of the box.", c: ["#ff9f0a", "#ff375f"], icon: "M8 13V5a2 2 0 014 0v6m0 0V4a2 2 0 014 0v8m-8 1l-2-2a2 2 0 00-3 3l4 5a5 5 0 004 2h3a5 5 0 005-5v-4" },
  { t: "Scroll scenes", d: "Pin, scrub and reveal with scroll.", c: ["#bf5af2", "#ff375f"], icon: "M12 4v16M8 16l4 4 4-4" },
  { t: "Accessible", d: "Respects reduced motion and focus.", c: ["#64d2ff", "#30d158"], icon: "M12 4a2 2 0 110 4 2 2 0 010-4zM5 9l7 1 7-1M12 10v10M9 20l3-6 3 6" },
  { t: "Copy & own", d: "One file per component. Yours to edit.", c: ["#ffd60a", "#ff9f0a"], icon: "M8 8h10v12H8zM6 16H4V4h12v2" },
  { t: "Dark mode", d: "Every piece has a dark fill.", c: ["#1d1d1f", "#5e5ce6"], icon: "M20 14A8 8 0 1110 4a7 7 0 0010 10z" },
  { t: "Tiny bundle", d: "Only React and Framer Motion.", c: ["#ff375f", "#ff9f0a"], icon: "M4 8l8-4 8 4-8 4zM4 8v8l8 4 8-4V8" },
];

const W = 220;
const H = 300;
/** Layout width of the deck, and the room the split needs on either side. */
const DECK_W = W + 200;
const SPAN = 440;
const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

type Phase = "idle" | "split" | "fall" | "cut";

/** A ref that reads true while the element is on screen and the tab is visible. Read it inside timers. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const on = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => {
      on.current = inView && !document.hidden;
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: 0.1 });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/** Interleaves the two halves in random clumps of one or two, like real thumbs. Index 0 of the result is the top card. */
function interleave(order: number[]) {
  const n = order.length;
  const left = order.slice(0, n / 2);
  const right = order.slice(n / 2);
  const out: number[] = [];
  let side = Math.random() > 0.5;
  while (left.length || right.length) {
    const src = (side ? left : right).length ? (side ? left : right) : side ? right : left;
    const clump = Math.random() > 0.65 ? 2 : 1;
    for (let k = 0; k < clump && src.length; k++) out.unshift(src.pop() as number);
    side = !side;
  }
  return out;
}

function Face({ c }: { c: RiffleCard }) {
  return (
    <div className="flex h-full w-full flex-col justify-between rounded-[20px] p-5 text-white" style={{ background: `linear-gradient(150deg, ${c.c[0]}, ${c.c[1]})` }}>
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/20 backdrop-blur">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={c.icon} />
        </svg>
      </span>
      <span>
        <span className="block text-[22px] font-semibold leading-tight tracking-[-0.02em]">{c.t}</span>
        <span className="mt-1 block text-[13px] leading-[1.35] text-white/80">{c.d}</span>
      </span>
    </div>
  );
}

/**
 * A feature deck you can shuffle like real cards. Riffle splits it into two
 * halves that bow apart, then cards fall back in alternately from each side
 * in little clumps and the deck squares itself up. Cut lifts the top half off
 * and slides it under. Whatever lands on top is the feature you see.
 */
export function RiffleStack({ cards = DEFAULT_CARDS, autoplay = false, onShuffle, enableSound = true, className }: RiffleStackProps) {
  const play = useSound(enableSound);
  const still = useReducedMotion() === true;
  const n = cards.length;
  const [order, setOrder] = useState(() => cards.map((_, i) => i)); // order[0] is the top card
  const [phase, setPhase] = useState<Phase>("idle");
  const [scale, setScale] = useState(1);
  const [live, setLive] = useState(false);
  const deck = useAnimationControls();
  const root = useRef<HTMLDivElement>(null);
  const orderRef = useRef(order);
  const busy = useRef(false);
  const touched = useRef(false);
  const alive = useRef(true);
  const timers = useRef<number[]>([]);
  const onShuffleRef = useRef(onShuffle);
  const onScreen = useOnScreen(root);

  useEffect(() => {
    orderRef.current = order;
  }, [order]);
  useEffect(() => {
    onShuffleRef.current = onShuffle;
  }, [onShuffle]);
  useEffect(() => {
    alive.current = true;
    const t = timers;
    return () => {
      alive.current = false;
      t.current.forEach((id) => window.clearTimeout(id));
      t.current = [];
    };
  }, []);

  // Fit the whole spread inside narrow containers by scaling the deck down.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.offsetWidth / SPAN)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Resolves true after `ms`, or never if the component unmounts first. */
  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        timers.current.push(window.setTimeout(() => resolve(alive.current), ms));
      }),
    [],
  );

  const report = useCallback((o: number[]) => {
    const top = cards[o[0]];
    if (top) onShuffleRef.current?.(top.t);
  }, [cards]);

  const riffle = useCallback(async (byUser = false) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    if (still) {
      if (byUser) play("drop", 0.7);
      const out = interleave(orderRef.current);
      setOrder(out);
      report(out);
      busy.current = false;
      return;
    }
    if (byUser) play("lift", 0.7);
    setPhase("split");
    if (!(await wait(520))) return;
    const out = interleave(orderRef.current);
    setOrder(out);
    setPhase("fall");
    if (byUser) play("swipe", 0.7);
    if (!(await wait(70 * n + 350))) return;
    if (byUser) play("drop", 0.7);
    await deck.start({ scaleY: [1, 0.94, 1.02, 1], transition: { duration: 0.35 } });
    if (!alive.current) return;
    setPhase("idle");
    busy.current = false;
    report(out);
  }, [n, still, wait, deck, report, play]);

  const cut = useCallback(async (byUser = false) => {
    if (busy.current || n < 2) return;
    busy.current = true;
    const cutOrder = (o: number[]) => [...o.slice(n / 2), ...o.slice(0, n / 2)];
    if (still) {
      if (byUser) play("drop", 0.7);
      const out = cutOrder(orderRef.current);
      setOrder(out);
      report(out);
      busy.current = false;
      return;
    }
    if (byUser) play("lift", 0.7);
    setPhase("cut");
    if (!(await wait(420))) return;
    if (byUser) play("drop", 0.7);
    const out = cutOrder(orderRef.current);
    setOrder(out);
    setPhase("idle");
    report(out);
    if (!(await wait(450))) return;
    busy.current = false;
  }, [n, still, wait, report, play]);

  // Autoplay shuffles while the deck is on screen and the tab is visible: riffle, riffle, cut.
  useEffect(() => {
    if (!autoplay || still) return;
    let k = 0;
    const id = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(id);
        return;
      }
      if (!onScreen.current) return;
      void (k++ % 3 === 2 ? cut(false) : riffle(false));
    }, 2800);
    return () => window.clearInterval(id);
  }, [autoplay, still, riffle, cut, onScreen]);

  const press = (action: (byUser: boolean) => Promise<void>) => {
    touched.current = true;
    setLive(true);
    void action(true);
  };

  const top = cards[order[0]];
  if (!top) return null;

  return (
    <div ref={root} className={cn("flex w-full max-w-[440px] flex-col items-center gap-5 text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
      <div style={{ transform: `scale(${scale})`, marginBlock: (-(H + 40) * (1 - scale)) / 2 }} className="flex w-full justify-center">
        <motion.div animate={deck} className="relative max-w-full" style={{ width: DECK_W, height: H + 40 }} role="img" aria-label={`Top card: ${top.t}. ${top.d}`}>
          {order.map((ci, pos) => {
            const depth = n - 1 - pos; // 0 at the bottom
            const half = pos < n / 2 ? -1 : 1; // which hand it's in during the split
            let x = 0;
            let y = -depth * 2;
            let rotate = 0;
            let rotateY = 0;
            let delay = 0;
            if (phase === "split") {
              x = half * 105;
              y = -((pos % (n / 2)) * 2) - 6;
              rotate = half * 7;
              rotateY = half * -18;
              delay = (pos % (n / 2)) * 0.02;
            }
            if (phase === "fall") delay = (n - 1 - pos) * 0.07;
            if (phase === "cut" && pos < n / 2) {
              x = 120;
              y = -60 - depth * 2;
              rotate = 6;
            }
            return (
              <motion.div
                key={ci}
                aria-hidden="true"
                className="absolute left-1/2 top-[20px] shadow-[0_1px_0_rgba(255,255,255,.4)_inset,0_1px_2px_rgba(0,0,0,.12),0_16px_30px_-18px_rgba(0,0,0,.45)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1),0_1px_0_rgba(255,255,255,.2)_inset,0_16px_30px_-18px_rgba(0,0,0,.9)]"
                style={{ width: W, height: H, marginLeft: -W / 2, zIndex: depth, borderRadius: 20, transformPerspective: 900 }}
                initial={false}
                animate={phase === "fall" ? { x: [null, 0], y: [null, -30, y], rotate: [null, 0], rotateY: [null, 0] } : { x, y, rotate, rotateY }}
                transition={{ type: phase === "fall" ? "tween" : "spring", duration: phase === "fall" ? 0.32 : undefined, stiffness: 300, damping: 26, delay, ease: [0.3, 0, 0.3, 1] }}
              >
                <Face c={cards[ci]} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <motion.button
          type="button"
          whileTap={still ? undefined : { scale: 0.95 }}
          onClick={() => press(riffle)}
          className={cn("h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]", FOCUS)}
        >
          Riffle
        </motion.button>
        <motion.button
          type="button"
          whileTap={still ? undefined : { scale: 0.95 }}
          onClick={() => press(cut)}
          className={cn("h-10 rounded-full bg-white px-5 text-[14px] font-medium text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]", FOCUS)}
        >
          Cut
        </motion.button>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={top.t}
            aria-hidden="true"
            className="ml-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
            initial={still ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={still ? { opacity: 0 } : { opacity: 0, y: -6 }}
          >
            On top: {top.t}
          </motion.span>
        </AnimatePresence>
        <span className="sr-only" aria-live={live ? "polite" : "off"}>
          On top: {top.t}
        </span>
      </div>
    </div>
  );
}
