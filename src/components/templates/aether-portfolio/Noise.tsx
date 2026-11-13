"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Aether's hero opener, about the one thing the studio sells: quiet software. The page loads covered in the usual
 * noise (a notifications prompt, unread badges, an upsell banner, a countdown, a chat bubble, a rating toast, a
 * cookie card), and then it is hushed away one piece at a time until only the headline is left. "Put the noise
 * back" plays it again. Decorative only; with reduced motion it never appears.
 */

const shell = "pointer-events-none flex rounded-[14px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.08),0_18px_36px_-18px_rgba(0,0,0,.45)]";
const btn = "rounded-full px-2.5 py-1 text-[11px] font-semibold";

type Piece = { id: string; at: React.CSSProperties; tilt: number; phone?: boolean; el: ReactNode };

const PIECES: Piece[] = [
  {
    id: "notify", at: { right: "16%", top: "6%" }, tilt: -2, phone: true,
    el: (
      <div className={`${shell} w-[min(250px,70vw)] flex-col gap-2 p-3`}>
        <span className="text-[12px] leading-[1.35]"><b>aether.studio</b> wants to show you notifications</span>
        <span className="flex justify-end gap-1.5"><span className={`${btn} bg-[#f1f1f3]`}>Block</span><span className={`${btn} bg-[#2563eb] text-white`}>Allow</span></span>
      </div>
    ),
  },
  { id: "badge", at: { left: "31%", top: "20%" }, tilt: 0, phone: true, el: <span className="pointer-events-none flex h-8 min-w-8 items-center justify-center rounded-full bg-[#ef2b2b] px-2 text-[13px] font-bold text-white shadow-[0_6px_14px_-4px_rgba(239,43,43,.7)]">99+</span> },
  {
    id: "upsell", at: { left: "0%", top: "52%" }, tilt: 1.5,
    el: (
      <div className="pointer-events-none flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#7c3aed] to-[#db2777] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_14px_30px_-12px_rgba(124,58,237,.8)]">
        Upgrade to Pro, 50% off today only <span className="rounded-full bg-white/25 px-2 py-0.5 text-[11px]">Claim</span>
      </div>
    ),
  },
  {
    id: "ai", at: { right: "4%", top: "30%" }, tilt: 3, phone: true,
    el: <span className={`${shell} items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold`}><span className="text-[#a855f7]">✦</span> New: try our AI assistant</span>,
  },
  {
    id: "timer", at: { left: "36%", top: "44%" }, tilt: -1,
    el: <span className="pointer-events-none whitespace-nowrap rounded-[10px] bg-[#111] px-3 py-1.5 text-[12px] font-semibold tabular-nums text-[#fde047]">Offer ends in 04:59</span>,
  },
  {
    id: "rate", at: { right: "2%", top: "56%" }, tilt: 2, phone: true,
    el: (
      <div className={`${shell} w-[220px] flex-col gap-1 p-3`}>
        <span className="text-[12px] font-semibold">Enjoying Aether?</span>
        <span className="text-[15px] tracking-[2px] text-[#f59e0b]">★★★★★</span>
        <span className="text-[11px] text-[#6e6e73]">Rate us, it only takes a second</span>
      </div>
    ),
  },
  { id: "dot", at: { left: "88%", top: "4%" }, tilt: 0, el: <span className="pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-[#ef2b2b] text-[11px] font-bold text-white">3</span> },
  {
    id: "chat", at: { right: "3%", top: "80%" }, tilt: -2,
    el: (
      <div className={`${shell} items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4`}>
        <span className="h-7 w-7 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#f97316]" />
        <span className="whitespace-nowrap text-[12px] font-medium">Hi there! Got a minute to chat?</span>
      </div>
    ),
  },
  {
    id: "cookie", at: { left: "2%", top: "74%" }, tilt: -1.5, phone: true,
    el: (
      <div className={`${shell} w-[260px] flex-col gap-2 p-3`}>
        <span className="text-[12px] font-semibold">We value your privacy</span>
        <span className="text-[11px] leading-[1.4] text-[#6e6e73]">We and our 842 partners use cookies to improve your experience.</span>
        <span className="flex gap-1.5"><span className={`${btn} bg-[#16a34a] text-white`}>Accept all</span><span className={`${btn} bg-[#f1f1f3]`}>Manage</span></span>
      </div>
    ),
  },
  { id: "unread", at: { left: "14%", top: "2%" }, tilt: 1, el: <span className={`${shell} whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold`}>You have 12 unread messages</span> },
  {
    id: "wait", at: { left: "58%", top: "62%" }, tilt: 2.5,
    el: (
      <div className={`${shell} w-[200px] flex-col gap-1 p-3`}>
        <span className="text-[13px] font-bold">Wait! Don&rsquo;t go yet</span>
        <span className="text-[11px] text-[#6e6e73]">Join 40,000 others on our list</span>
      </div>
    ),
  },
];

const noop = () => () => {};

export default function Noise({ ink, accent }: { ink: string; accent: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduce = useReducedMotion();
  const [run, setRun] = useState(0);
  const [shown, setShown] = useState(0); // how many pieces have popped in
  const [gone, setGone] = useState(0); // how many have been hushed away
  const calm = gone >= PIECES.length;

  useEffect(() => {
    if (!hydrated || reduce) return;
    const ts: number[] = [];
    ts.push(window.setTimeout(() => { setShown(0); setGone(0); }, 0));
    PIECES.forEach((_, i) => ts.push(window.setTimeout(() => setShown(i + 1), 350 + i * 110)));
    const hush = 350 + PIECES.length * 110 + 1500;
    PIECES.forEach((_, i) => ts.push(window.setTimeout(() => setGone(i + 1), hush + i * 280)));
    return () => ts.forEach(clearTimeout);
  }, [run, hydrated, reduce]);

  if (!hydrated || reduce) return null;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-20" aria-hidden="true">
        <AnimatePresence>
          {PIECES.map((p, i) =>
            i < shown && i >= gone ? (
              <motion.div
                key={`${run}-${p.id}`}
                className={`absolute ${p.phone ? "" : "hidden md:block"}`}
                style={p.at}
                initial={{ opacity: 0, scale: 0.6, rotate: p.tilt * 3, y: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: p.tilt, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -6, filter: "blur(6px)", transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] } }}
                transition={{ type: "spring", stiffness: 520, damping: 18 }}
              >
                <div className="relative">{p.el}</div>
              </motion.div>
            ) : null,
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {calm ? (
          <motion.button
            key="again"
            type="button"
            onClick={() => setRun((r) => r + 1)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-30 text-[13px] font-medium underline decoration-1 underline-offset-[5px] outline-none focus-visible:rounded focus-visible:ring-2"
            style={{ color: ink, textDecorationColor: accent, ["--tw-ring-color" as string]: accent }}
          >
            Put the noise back
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  );
}
