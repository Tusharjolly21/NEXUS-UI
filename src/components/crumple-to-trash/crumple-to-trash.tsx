"use client";
import { useEffect, useEffectEvent, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, useMotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export interface CrumpleToTrashProps {
  /** Heading printed on the page. */
  title?: string;
  /** Called once the ball has landed in the bin. */
  onTrash?: () => void;
  /** Called once Undo has smoothed the page flat again. */
  onRestore?: () => void;
  /** Throws the page away and brings it back every 3s until someone clicks. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
}

const LINES = [92, 80, 86, 60, 88, 74, 66, 82];
/** Where the ball lands, relative to the page's resting spot (inside the bin). */
const DX = 244;
const DY = 34;

/**
 * "Move to trash", literally. The page scrunches into a ball (an SVG
 * displacement filter that ramps up while the sheet shrinks and rounds off),
 * then arcs into the bin, which tips its lid and wobbles. Undo throws it back
 * out and smooths it flat.
 */
export function CrumpleToTrash({ title = "Draft · Q4 notes", onTrash, onRestore, autoplay = false, enableSound = true }: CrumpleToTrashProps) {
  const play = useSound(enableSound);
  const fid = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [crumple, setCrumple] = useState(0);
  const [gone, setGone] = useState(false);
  const goneRef = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rot = useMotionValue(0);
  const lid = useAnimationControls();
  const bin = useAnimationControls();
  const busy = useRef(false);
  const touched = useRef(false);

  const markGone = (v: boolean) => {
    goneRef.current = v;
    setGone(v);
  };

  const toss = async (user = false) => {
    if (busy.current || goneRef.current) return;
    busy.current = true;
    if (user) play("swipe");
    else play.auto("swipe");
    await animate(0, 1, { duration: 0.55, ease: [0.4, 0, 0.2, 1], onUpdate: setCrumple });
    lid.start({ rotate: -70, transition: { type: "spring", stiffness: 300, damping: 14 } });
    await Promise.all([
      animate(x, [0, DX * 0.5, DX], { duration: 0.6, ease: "easeIn" }),
      animate(y, [0, -110, DY], { duration: 0.6, ease: ["easeOut", "easeIn"] }),
      animate(rot, 540, { duration: 0.6 }),
    ]);
    markGone(true);
    if (user) play("drop");
    else play.auto("drop");
    lid.start({ rotate: 0, transition: { type: "spring", stiffness: 500, damping: 12 } });
    bin.start({ rotate: [0, -6, 5, -3, 0], transition: { duration: 0.5 } });
    busy.current = false;
    onTrash?.();
  };

  const undo = async (user = false) => {
    if (busy.current || !goneRef.current) return;
    busy.current = true;
    lid.start({ rotate: -70, transition: { type: "spring", stiffness: 300, damping: 14 } });
    markGone(false);
    await Promise.all([
      animate(x, [DX, 120, 0], { duration: 0.6, ease: "easeOut" }),
      animate(y, [DY, -120, 0], { duration: 0.6, ease: ["easeOut", "easeIn"] }),
      animate(rot, 0, { duration: 0.6 }),
    ]);
    lid.start({ rotate: 0, transition: { type: "spring", stiffness: 500, damping: 12 } });
    if (user) play("swipe", 0.7);
    else play.auto("swipe", 0.7);
    await animate(1, 0, { type: "spring", stiffness: 140, damping: 16, onUpdate: setCrumple });
    busy.current = false;
    onRestore?.();
  };

  const run = useEffectEvent(() => {
    if (touched.current) return;
    if (goneRef.current) undo();
    else toss();
  });

  useEffect(() => {
    if (!autoplay) return;
    const a = setTimeout(() => run(), 900);
    const t = setInterval(() => run(), 3000);
    return () => {
      clearTimeout(a);
      clearInterval(t);
    };
  }, [autoplay]);

  const c = crumple;
  const scale = 1 - c * 0.72;

  return (
    <div className="flex flex-col items-center gap-4 [--ct-paper-2:#ececf0] [--ct-paper:#ffffff] dark:[--ct-paper-2:#1f1f21] dark:[--ct-paper:#2c2c2e]">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={c * 46} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="relative flex h-[250px] w-[420px] max-w-full items-center">
        <div className="relative ml-6 h-[200px] w-[160px]">
          <AnimatePresence>
            {!gone && (
              <motion.div
                key="page"
                className="absolute inset-0"
                style={{ x, y, rotate: rot }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.12 } }}
              >
                <div
                  className="absolute inset-0 overflow-hidden shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_26px_-14px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_26px_-14px_rgba(0,0,0,.8)]"
                  style={{
                    transform: `scale(${scale})`,
                    borderRadius: `${8 + c * 80}px`,
                    filter: c > 0.01 ? `url(#${fid})` : undefined,
                    background: `linear-gradient(${140 + c * 40}deg, var(--ct-paper), ${c > 0.1 ? "var(--ct-paper-2)" : "var(--ct-paper)"})`,
                  }}
                >
                  <div className="flex flex-col gap-2 p-4" style={{ opacity: 1 - c * 0.5 }}>
                    <span className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
                    {LINES.map((w, i) => (
                      <span key={i} className="h-[5px] rounded-full bg-[#d2d2d7] dark:bg-[#48484a]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <svg
                    className="absolute inset-0 text-black/[.18] dark:text-white/[.14]"
                    viewBox="0 0 160 200"
                    preserveAspectRatio="none"
                    style={{ opacity: c }}
                    aria-hidden="true"
                  >
                    <path d="M0 40 L70 90 L160 60 M20 200 L80 110 L150 180 M80 0 L70 90 L80 110 M0 140 L80 110" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* bin */}
        <motion.div className="absolute bottom-6 right-8 h-[96px] w-[76px]" animate={bin} style={{ originY: 1 }} aria-hidden="true">
          <motion.div className="absolute -top-2 left-[-6px] h-[12px] w-[88px] rounded-[6px] bg-[#c7c7cc] dark:bg-[#636366]" animate={lid} style={{ originX: 0, originY: 1 }}>
            <span className="absolute -top-[6px] left-1/2 h-[7px] w-[22px] -translate-x-1/2 rounded-t-[4px] bg-[#aeaeb2] dark:bg-[#8e8e93]" />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 top-[8px] overflow-hidden rounded-b-[14px] rounded-t-[3px] bg-[linear-gradient(90deg,#e5e5ea,#f5f5f7_40%,#d1d1d6)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[linear-gradient(90deg,#3a3a3c,#48484a_40%,#2c2c2e)] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]">
            {[18, 38, 58].map((l) => (
              <span key={l} className="absolute bottom-3 top-4 w-[3px] rounded-full bg-black/10 dark:bg-black/30" style={{ left: l }} />
            ))}
          </div>
        </motion.div>
      </div>
      <div className="flex h-10 items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            touched.current = true;
            if (gone) undo(true);
            else toss(true);
          }}
          className="h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:outline-[#0a84ff]"
        >
          {gone ? "Undo" : "Move to trash"}
        </motion.button>
        <AnimatePresence>
          {gone && (
            <motion.span
              role="status"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
            >
              Deleted.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
