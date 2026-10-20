"use client";
/** Aureon's copy of the Motion Kit Hold to Confirm: same hold-to-fill and burst, with a send icon and copy for placing orders. */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { AnimationPlaybackControls } from "framer-motion";

export interface HoldToConfirmProps {
  label?: string;
  holdingLabel?: string;
  doneLabel?: string;
  holdMs?: number;
  color?: string;
  onConfirm?: () => void;
  /** Shows a short hold-and-release tease until the user interacts. */
  autoplay?: boolean;
}

const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + 0.2;
  const r = 60 + (i % 3) * 18;
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, dark: i % 3 === 0 };
});

export default function HoldToSend({
  label = "Hold to Delete",
  holdingLabel = "Keep holding…",
  doneLabel = "Project deleted",
  holdMs = 1500,
  color = "#ff3b30",
  onConfirm,
  autoplay = false,
}: HoldToConfirmProps) {
  const progress = useMotionValue(0);
  const clip = useTransform(progress, (v) => `inset(0 ${(1 - Math.max(0, Math.min(1, v))) * 100}% 0 0)`);
  const restOpacity = useTransform(progress, [0, 0.03], [1, 0]);
  const [done, setDone] = useState(false);
  const [left, setLeft] = useState(5);
  const ctl = useRef<AnimationPlaybackControls | null>(null);
  const holding = useRef(false);
  const demoHolding = useRef(false);
  const touched = useRef(false);

  const stop = () => ctl.current?.stop();

  const press = (demo = false) => {
    if (done) return;
    if (!demo) {
      touched.current = true;
      if (demoHolding.current) { holding.current = false; demoHolding.current = false; }
    }
    if (holding.current) return;
    holding.current = true;
    demoHolding.current = demo;
    stop();
    const target = demo ? 0.6 : 1;
    ctl.current = animate(progress, target, {
      duration: ((target - progress.get()) * holdMs) / 1000,
      ease: "linear",
      onComplete: () => {
        if (demo || !holding.current) return;
        holding.current = false;
        setDone(true);
        setLeft(5);
        onConfirm?.();
      },
    });
  };

  const release = () => {
    if (!holding.current) return;
    holding.current = false;
    demoHolding.current = false;
    stop();
    ctl.current = animate(progress, 0, { type: "spring", stiffness: 260, damping: 22 });
  };

  const undo = () => {
    setDone(false);
    progress.set(0);
  };

  useEffect(() => {
    if (!done) return;
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [done, left]);

  useEffect(() => {
    if (!autoplay) return;
    const tease = () => {
      if (touched.current) return;
      press(true);
      setTimeout(() => demoHolding.current && release(), 1100);
    };
    const first = setTimeout(tease, 1200);
    const loop = setInterval(tease, 4200);
    return () => { clearTimeout(first); clearInterval(loop); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-[58px] justify-center">
        <motion.button
          type="button"
          aria-label={label}
          animate={{ width: done ? 58 : 300, backgroundColor: done ? color : "#e8e8ed" }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          whileTap={done ? undefined : { scale: 0.97 }}
          onPointerDown={(e) => { if (e.button === 0) press(); }}
          onPointerUp={release}
          onPointerLeave={release}
          onPointerCancel={release}
          onKeyDown={(e) => {
            if (e.key !== " " && e.key !== "Enter") return;
            e.preventDefault();
            if (!e.repeat) press();
          }}
          onKeyUp={release}
          onContextMenu={(e) => e.preventDefault()}
          className="relative h-[58px] touch-none select-none overflow-hidden rounded-full text-[17px] font-semibold tracking-[-0.01em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          style={{ color: "#1d1d1f", outlineColor: color }}
        >
          <motion.span className="absolute inset-0 origin-left" style={{ scaleX: progress, background: color }} />
          <AnimatePresence initial={false}>
            {!done && (
              <motion.span key="labels" exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }} className="absolute inset-0">
                <motion.span className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap" style={{ opacity: restOpacity }}>
                  <SendIcon />
                  {label}
                </motion.span>
                <motion.span className="absolute inset-0 flex items-center justify-center gap-2 whitespace-nowrap text-white" style={{ clipPath: clip }}>
                  <SendIcon />
                  {holdingLabel}
                </motion.span>
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {done && (
              <motion.span key="tick" className="absolute inset-0 flex items-center justify-center" initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.15 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.25 }} />
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <AnimatePresence>
          {done &&
            PARTICLES.map((p, i) => (
              <motion.span
                key={i}
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full"
                style={{ background: p.dark ? "#1d1d1f" : color }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              />
            ))}
        </AnimatePresence>
      </div>

      <div className="flex h-[52px] items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="toast"
              role="status"
              initial={{ y: 24, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 320, damping: 24, delay: 0.25 }}
              className="flex h-[52px] items-center gap-3.5 rounded-full bg-[#1d1d1f] pl-5 pr-2 text-[15px] font-medium text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,.45)]"
            >
              {left > 0 ? doneLabel : "Orders sent"}
              <button type="button" onClick={undo} className="inline-flex h-[38px] items-center gap-2 rounded-full bg-white/15 pl-2 pr-3.5 font-semibold hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="11" cy="11" r="8" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="2.2" />
                  <motion.circle cx="11" cy="11" r="8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" initial={{ pathLength: 1 }} animate={{ pathLength: left / 5 }} transition={{ duration: 1, ease: "linear" }} />
                </svg>
                {left > 0 ? "Undo" : "Replay"}
              </button>
            </motion.div>
          ) : (
            <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[13px] text-[#6e6e73]">
              Press and hold. Let go early to cancel.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
    </svg>
  );
}
