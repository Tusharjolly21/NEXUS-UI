"use client";
/** Copy of the Motion Kit Progress Button, worded for booking a Lumis call (and with an AA-contrast done state). */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";

type Stage = "idle" | "loading" | "done";

export interface ProgressButtonProps {
  label?: string;
  doneLabel?: string;
  accent?: string;
  /** Replace with real work; call onProgress(0..1) and resolve when finished. */
  task?: (onProgress: (p: number) => void) => Promise<void>;
  /** Runs itself on a loop until the user interacts. */
  autoplay?: boolean;
}

const fakeTask = (onProgress: (p: number) => void) =>
  new Promise<void>((resolve) => {
    let p = 0;
    const t = setInterval(() => {
      p = Math.min(1, p + Math.random() * 0.09 + 0.02);
      onProgress(p);
      if (p >= 1) { clearInterval(t); resolve(); }
    }, 90);
  });

const morph = { type: "spring", stiffness: 300, damping: 28 } as const;

export default function BookButton({ label = "Download", doneLabel = "Open file", accent = "#0071e3", task = fakeTask, autoplay = false }: ProgressButtonProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const progress = useMotionValue(0);
  const fillW = useTransform(progress, (p) => `${p * 100}%`);
  const touched = useRef(false);
  useMotionValueEvent(progress, "change", (v) => setPct(Math.round(v * 100)));

  const run = async () => {
    if (stage !== "idle") return;
    progress.set(0);
    setStage("loading");
    await task((p) => animate(progress, p, { type: "spring", stiffness: 120, damping: 20 }));
    animate(progress, 1, { duration: 0.2 });
    setTimeout(() => setStage("done"), 350);
  };

  const runRef = useRef(run);
  useEffect(() => { runRef.current = run; });

  useEffect(() => {
    if (!autoplay) return;
    const t1 = setTimeout(() => !touched.current && runRef.current(), 900);
    const t2 = setInterval(() => {
      if (touched.current) return;
      setStage("idle");
      progress.set(0);
      setTimeout(() => !touched.current && runRef.current(), 900);
    }, 6000);
    return () => { clearTimeout(t1); clearInterval(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const width = stage === "loading" ? 240 : stage === "done" ? 236 : 176;

  return (
    <div className="flex flex-col items-start gap-3">
      <motion.button
        type="button"
        onClick={() => {
          touched.current = true;
          if (stage === "done") { setStage("idle"); progress.set(0); return; }
          run();
        }}
        aria-live="polite"
        aria-busy={stage === "loading"}
        initial={false}
        animate={{ width, height: stage === "loading" ? 44 : 52, backgroundColor: stage === "done" ? "#248a3d" : stage === "loading" ? "#e8e8ed" : accent }}
        whileTap={stage === "loading" ? undefined : { scale: 0.95 }}
        transition={morph}
        className="relative flex items-center justify-center overflow-hidden rounded-full text-[16px] font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={{ outlineColor: accent }}
      >
        <AnimatePresence>
          {stage === "loading" && (
            <motion.span key="fill" className="absolute inset-y-0 left-0 rounded-full" style={{ width: fillW, background: accent }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={stage}
            initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="relative flex items-center gap-2 whitespace-nowrap"
          >
            {stage === "idle" && (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 6h14v14H5zM5 10h14M9 3v4M15 3v4" /></svg>
                {label}
              </>
            )}
            {stage === "loading" && <span className="text-[14px] tabular-nums" style={{ color: pct > 52 ? "#fff" : "#1d1d1f" }}>Holding your slot · {pct}%</span>}
            {stage === "done" && (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.15 }} /></svg>
                {doneLabel}
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <span className="text-[13px] text-[#6e6e73]">{stage === "done" ? "Invite sent. Click to pick another time." : "You get a calendar invite and a video link."}</span>
    </div>
  );
}
