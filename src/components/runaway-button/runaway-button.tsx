"use client";
import { useCallback, useEffect, useRef, useState, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface RunawayButtonProps {
  /** Called when the cancel button is finally clicked (or activated from the keyboard). */
  onCancel?: () => void;
  /** Called when "Keep my plan" is clicked. */
  onKeep?: () => void;
  /** Hops the cancel button around the dialog every 1.1 s, until someone points at or focuses it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const W = 320,
  H = 230,
  BW = 120,
  BH = 40;
const HOME = { x: W - BW - 20, y: H - BH - 20 };
/** Label for each try: it gets less sure of itself every time it runs. */
export const RUNAWAY_LINES = ["Yes, cancel", "Are you sure?", "Really?", "Fine.", "Okay, cancel"];
/** Dodges before it gives up and lets the pointer click it. */
const MAX_TRIES = 4;

/**
 * A cancel button with opinions. Bring the pointer close and it slips away to
 * another spot in the dialog; after a few tries it gives up, sighs back into
 * place and lets you click it. Keyboard users get a normal button: it never
 * moves while it has keyboard focus, and Enter or Space always activates it.
 */
export function RunawayButton({ onCancel, onKeep, autoplay = false, enableSound = true }: RunawayButtonProps) {
  const play = useSound(enableSound);
  const x = useSpring(HOME.x, { stiffness: 260, damping: 18 });
  const y = useSpring(HOME.y, { stiffness: 260, damping: 18 });
  const [tries, setTriesState] = useState(0);
  const [done, setDone] = useState<"none" | "kept" | "cancelled">("none");
  const box = useRef<HTMLDivElement>(null);
  const cool = useRef(0);
  const touched = useRef(false);
  const triesRef = useRef(0);
  const keyboardFocus = useRef(false);
  /** Set when a screen was left from the keyboard, so focus moves to the next screen's button. */
  const refocus = useRef<"keep" | "restart" | null>(null);
  const tired = tries >= MAX_TRIES;

  const setTries = useCallback((n: number) => {
    triesRef.current = n;
    setTriesState(n);
  }, []);

  const goHome = useCallback(() => {
    x.set(HOME.x);
    y.set(HOME.y);
  }, [x, y]);

  const flee = useCallback(
    (px: number, py: number) => {
      const now = performance.now();
      if (triesRef.current >= MAX_TRIES || keyboardFocus.current || now - cool.current < 260) return;
      cool.current = now;
      let best = { x: 20, y: 70 },
        bestD = -1;
      for (let k = 0; k < 24; k++) {
        const c = { x: 16 + Math.random() * (W - BW - 32), y: 92 + Math.random() * (H - BH - 108) };
        if (c.x < 165 && c.y + BH > H - 72) continue; // keep clear of "Keep my plan"
        const d = Math.hypot(c.x + BW / 2 - px, c.y + BH / 2 - py);
        if (d > bestD) {
          bestD = d;
          best = c;
        }
      }
      x.set(best.x);
      y.set(best.y);
      setTries(triesRef.current + 1);
    },
    [x, y, setTries],
  );

  useEffect(() => {
    if (!tired) return;
    const t = window.setTimeout(goHome, 300);
    return () => window.clearTimeout(t);
  }, [tired, goHome]);

  useEffect(() => {
    if (!autoplay) return;
    const t = window.setInterval(() => {
      if (touched.current) return window.clearInterval(t);
      if (triesRef.current >= MAX_TRIES) {
        goHome();
        setTries(0);
        return;
      }
      flee(x.get() + BW / 2, y.get() + BH / 2);
    }, 1100);
    return () => window.clearInterval(t);
  }, [autoplay, flee, goHome, setTries, x, y]);

  const move = (e: RPointerEvent) => {
    touched.current = true;
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = e.clientX - r.left,
      py = e.clientY - r.top;
    const bx = x.get() + BW / 2,
      by = y.get() + BH / 2;
    if (Math.hypot(px - bx, py - by) < 78) flee(px, py);
  };

  // A click with detail 0 came from the keyboard (Enter / Space).
  const finish = (e: RMouseEvent, how: "kept" | "cancelled") => {
    refocus.current = e.detail === 0 ? "restart" : null;
    play(how === "cancelled" ? "success" : "tap");
    setDone(how);
    if (how === "kept") onKeep?.();
    else onCancel?.();
  };

  const restart = (e: RMouseEvent) => {
    refocus.current = e.detail === 0 ? "keep" : null;
    play("tap", 0.6);
    setDone("none");
    setTries(0);
    goHome();
  };

  const focusIfAsked = (target: "keep" | "restart") => (el: HTMLButtonElement | null) => {
    if (el && refocus.current === target) {
      refocus.current = null;
      el.focus();
    }
  };

  return (
    <div
      ref={box}
      onPointerMove={done === "none" ? move : undefined}
      onKeyDown={() => {
        touched.current = true;
      }}
      role="group"
      aria-label="Cancel your subscription?"
      className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-28px_rgba(0,0,0,.4)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-28px_rgba(0,0,0,.9)]"
      style={{ width: W, height: H }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done === "none" ? (
          <motion.div key="ask" exit={{ opacity: 0, scale: 0.96 }} className="absolute inset-0">
            <div className="p-5">
              <h3 className="m-0 text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Cancel your subscription?</h3>
              <p className="m-0 mt-1 text-[13px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">You&apos;ll lose your saved boards at the end of the month.</p>
            </div>
            <motion.button
              ref={focusIfAsked("keep")}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={(e) => finish(e, "kept")}
              className="absolute bottom-5 left-5 h-10 rounded-full bg-[#1d1d1f] px-4 text-[14px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e]"
            >
              Keep my plan
            </motion.button>
            <motion.button
              type="button"
              onPointerDown={(e) => {
                // A mouse press that lands while it is still dodging gets a bump. Touch has no dodge, so it goes straight to the click.
                if (e.pointerType !== "touch" && !tired) play("knock", 0.7);
              }}
              onClick={(e) => finish(e, "cancelled")}
              onFocus={(e) => {
                touched.current = true;
                keyboardFocus.current = e.currentTarget.matches(":focus-visible");
              }}
              onBlur={() => {
                keyboardFocus.current = false;
              }}
              style={{ x, y, width: BW, height: BH }}
              // The last keyframe alternates by a hair so every dodge re-runs the wobble.
              animate={{ rotate: tired ? 0 : [0, -4, 3, (tries % 2) * 0.001] }}
              transition={{ duration: 0.4 }}
              className="absolute left-0 top-0 flex items-center justify-center rounded-full bg-[#f0f0f3] text-[14px] font-medium text-[#d70015] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#ff453a] dark:focus-visible:ring-[#0a84ff]"
            >
              {RUNAWAY_LINES[Math.min(tries, RUNAWAY_LINES.length - 1)]}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
          >
            <span className="text-[16px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" role="status">
              {done === "kept" ? "Good call. Nothing changes." : "Cancelled. Sorry to see you go."}
            </span>
            <button
              ref={focusIfAsked("restart")}
              type="button"
              onClick={restart}
              className="text-[13px] font-medium text-[#0071e3] outline-none focus-visible:underline dark:text-[#2997ff]"
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
