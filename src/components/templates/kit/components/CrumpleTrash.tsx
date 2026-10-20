"use client";
import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, useMotionValue } from "framer-motion";

/**
 * "Move to trash", literally. The page scrunches into a ball (an SVG
 * displacement filter that ramps up while the sheet shrinks and rounds off),
 * then arcs into the bin, which tips its lid and wobbles. Undo throws it back
 * out and smooths it flat.
 */
export default function CrumpleTrash({ autoplay = false }: { autoplay?: boolean }) {
  const fid = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [crumple, setCrumple] = useState(0);
  const [gone, setGone] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rot = useMotionValue(0);
  const lid = useAnimationControls();
  const bin = useAnimationControls();
  const busy = useRef(false);
  const touched = useRef(false);

  const toss = async () => {
    if (busy.current || gone) return;
    busy.current = true;
    await animate(0, 1, { duration: 0.55, ease: [0.4, 0, 0.2, 1], onUpdate: setCrumple });
    lid.start({ rotate: -70, transition: { type: "spring", stiffness: 300, damping: 14 } });
    const dx = 244, dy = 34;
    await Promise.all([
      animate(x, [0, dx * 0.5, dx], { duration: 0.6, ease: "easeIn" }),
      animate(y, [0, -110, dy], { duration: 0.6, ease: ["easeOut", "easeIn"] }),
      animate(rot, 540, { duration: 0.6 }),
    ]);
    setGone(true);
    lid.start({ rotate: 0, transition: { type: "spring", stiffness: 500, damping: 12 } });
    bin.start({ rotate: [0, -6, 5, -3, 0], transition: { duration: 0.5 } });
    busy.current = false;
  };

  const undo = async () => {
    if (busy.current || !gone) return;
    busy.current = true;
    lid.start({ rotate: -70, transition: { type: "spring", stiffness: 300, damping: 14 } });
    setGone(false);
    await Promise.all([
      animate(x, [244, 120, 0], { duration: 0.6, ease: "easeOut" }),
      animate(y, [34, -120, 0], { duration: 0.6, ease: ["easeOut", "easeIn"] }),
      animate(rot, 0, { duration: 0.6 }),
    ]);
    lid.start({ rotate: 0, transition: { type: "spring", stiffness: 500, damping: 12 } });
    await animate(1, 0, { type: "spring", stiffness: 140, damping: 16, onUpdate: setCrumple });
    busy.current = false;
  };

  useEffect(() => {
    if (!autoplay) return;
    let state = false;
    const run = () => { if (touched.current) return; state = !state; state ? toss() : undo(); };
    const a = setTimeout(run, 900);
    const t = setInterval(run, 3000);
    return () => { clearTimeout(a); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, gone]);

  const c = crumple;
  const scale = 1 - c * 0.72;

  return (
    <div className="flex flex-col items-center gap-4">
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
                  className="absolute inset-0 overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_26px_-14px_rgba(0,0,0,.35)]"
                  style={{ transform: `scale(${scale})`, borderRadius: `${8 + c * 80}px`, filter: c > 0.01 ? `url(#${fid})` : undefined, background: `linear-gradient(${140 + c * 40}deg, #fff, ${c > 0.1 ? "#ececf0" : "#fff"})` }}
                >
                  <div className="flex flex-col gap-2 p-4" style={{ opacity: 1 - c * 0.5 }}>
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">Draft · Q4 notes</span>
                    {[92, 80, 86, 60, 88, 74, 66, 82].map((w, i) => (
                      <span key={i} className="h-[5px] rounded-full bg-[#d2d2d7]" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                  <svg className="absolute inset-0" viewBox="0 0 160 200" preserveAspectRatio="none" style={{ opacity: c }} aria-hidden="true">
                    <path d="M0 40 L70 90 L160 60 M20 200 L80 110 L150 180 M80 0 L70 90 L80 110 M0 140 L80 110" stroke="rgba(0,0,0,.18)" strokeWidth="1.2" fill="none" />
                  </svg>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* bin */}
        <motion.div className="absolute bottom-6 right-8 h-[96px] w-[76px]" animate={bin} style={{ originY: 1 }}>
          <motion.div className="absolute -top-2 left-[-6px] h-[12px] w-[88px] rounded-[6px] bg-[#c7c7cc]" animate={lid} style={{ originX: 0, originY: 1 }}>
            <span className="absolute -top-[6px] left-1/2 h-[7px] w-[22px] -translate-x-1/2 rounded-t-[4px] bg-[#aeaeb2]" />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 top-[8px] overflow-hidden rounded-b-[14px] rounded-t-[3px] bg-[linear-gradient(90deg,#e5e5ea,#f5f5f7_40%,#d1d1d6)] shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]">
            {[18, 38, 58].map((l) => <span key={l} className="absolute bottom-3 top-4 w-[3px] rounded-full bg-black/10" style={{ left: l }} />)}
          </div>
        </motion.div>
      </div>
      <div className="flex h-10 items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={() => { touched.current = true; gone ? undo() : toss(); }}
          className="h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          {gone ? "Undo" : "Move to trash"}
        </motion.button>
        <AnimatePresence>
          {gone && (
            <motion.span role="status" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="text-[13px] text-[#6e6e73]">
              Deleted.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
