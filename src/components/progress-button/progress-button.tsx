"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

type Stage = "idle" | "loading" | "done";

export interface ProgressButtonProps {
  label?: string;
  doneLabel?: string;
  accent?: string;
  /** Replace with real work; call onProgress(0..1) and resolve when finished. */
  task?: (onProgress: (p: number) => void) => Promise<void>;
  /** Runs itself on a loop until the user interacts. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
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

export function ProgressButton({ label = "Download", doneLabel = "Open file", accent = "#0071e3", task = fakeTask, autoplay = false, enableSound = true }: ProgressButtonProps) {
  const play = useSound(enableSound);
  const [stage, setStage] = useState<Stage>("idle");
  const [pct, setPct] = useState(0);
  const progress = useMotionValue(0);
  const fillW = useTransform(progress, (p) => `${p * 100}%`);
  const touched = useRef(false);
  useMotionValueEvent(progress, "change", (v) => setPct(Math.round(v * 100)));

  const run = async (user = false) => {
    if (stage !== "idle") return;
    if (!user) play.auto("tap");
    progress.set(0);
    setStage("loading");
    await task((p) => animate(progress, p, { type: "spring", stiffness: 120, damping: 20 }));
    animate(progress, 1, { duration: 0.2 });
    setTimeout(() => {
      if (user) play("done");
      else play.auto("done");
      setStage("done");
    }, 350);
  };

  const runRef = useRef(run);
  useEffect(() => {
    runRef.current = run;
  });

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

  const width = stage === "loading" ? 260 : stage === "done" ? 156 : 152;

  return (
    <div className="flex flex-col items-center gap-5">
      <motion.button
        type="button"
        onClick={() => {
          touched.current = true;
          if (stage === "loading") return;
          play("tap");
          if (stage === "done") { setStage("idle"); progress.set(0); return; }
          run(true);
        }}
        aria-live="polite"
        aria-busy={stage === "loading"}
        initial={false}
        animate={{ width, height: stage === "loading" ? 44 : 52 }}
        whileTap={stage === "loading" ? undefined : { scale: 0.95 }}
        transition={morph}
        className="relative flex items-center justify-center overflow-hidden rounded-full text-[16px] font-semibold text-white transition-colors duration-300 [--pb-track:#e8e8ed] [--pb-ink:#1d1d1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 dark:[--pb-track:#3a3a3c] dark:[--pb-ink:#f5f5f7]"
        style={{ outlineColor: accent, backgroundColor: stage === "done" ? "#34c759" : stage === "loading" ? "var(--pb-track)" : accent }}
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
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>
                {label}
              </>
            )}
            {stage === "loading" && <span className="text-[14px] tabular-nums" style={{ color: pct > 52 ? "#fff" : "var(--pb-ink)" }}>{pct}%</span>}
            {stage === "done" && (
              <>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><motion.path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.15 }} /></svg>
                {doneLabel}
              </>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
      <span className="text-[13px] text-[#86868b] dark:text-[#98989d]">{stage === "done" ? "Click again to reset." : "The button becomes its own progress bar."}</span>
    </div>
  );
}
