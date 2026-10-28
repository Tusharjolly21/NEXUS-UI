"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

export type IslandMode = "idle" | "timer" | "call" | "music";

export interface IslandMorphProps {
  /** Cycles through the states by itself until a control is pressed. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** How firmly the pill springs to its next shape. Higher is snappier. Kept between 120 and 800. */
  stiffness?: number;
  /** How quickly the pill settles. Lower overshoots and wobbles, higher stops dead. Kept between 10 and 60. */
  damping?: number;
  /** How blurry the content is as it fades in and out, in pixels. 0 is a plain fade. Kept between 0 and 24. */
  blur?: number;
  /** How long, in seconds, the content waits for the shape to land before it appears. Kept between 0 and 0.6. */
  contentDelay?: number;
  /** Colour of the pill (any CSS colour, such as #000000). */
  surface?: string;
  /** Colour of the timer's clock icon and numbers (any CSS colour, such as #ff9f0a). */
  timerColor?: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

const SIZES: Record<IslandMode, { width: number; height: number; radius: number }> = {
  idle: { width: 126, height: 37, radius: 22 },
  timer: { width: 230, height: 37, radius: 22 },
  call: { width: 350, height: 76, radius: 40 },
  music: { width: 370, height: 186, radius: 46 },
};

export function IslandMorph({ autoplay = false, enableSound = true, stiffness = 380, damping = 30, blur = 10, contentDelay = 0.08, surface = "#000000", timerColor = "#ff9f0a" }: IslandMorphProps) {
  const play = useSound(enableSound);
  const morph = { type: "spring", stiffness: clamp(stiffness, 120, 800), damping: clamp(damping, 10, 60), mass: 0.9 } as const;
  const fuzz = `blur(${clamp(blur, 0, 24)}px)`;
  const wait = clamp(contentDelay, 0, 0.6);
  const uid = useId();
  const [mode, setMode] = useState<IslandMode>("idle");
  const [secs, setSecs] = useState(272);
  const [playing, setPlaying] = useState(true);
  const touched = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => (s > 0 ? s - 1 : 299)), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    const order: IslandMode[] = ["timer", "call", "music", "idle"];
    let k = 0;
    const t = setInterval(() => {
      if (touched.current) return clearInterval(t);
      play.auto("whoosh", 0.5);
      setMode(order[k++ % order.length]);
    }, 2600);
    return () => clearInterval(t);
  }, [autoplay, play]);

  const pick = (m: IslandMode) => {
    touched.current = true;
    if (m !== mode) play("whoosh", 0.5);
    setMode(m);
  };

  const size = SIZES[mode];
  const mm = String(Math.floor(secs / 60)).padStart(1, "0");
  const ss = String(secs % 60).padStart(2, "0");

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div className="flex h-[190px] w-full items-start justify-center">
        <motion.div
          layout
          initial={false}
          animate={{ width: size.width, height: size.height, borderRadius: size.radius }}
          transition={morph}
          style={{ background: surface }}
          className="relative overflow-hidden text-white shadow-[0_20px_40px_-20px_rgba(0,0,0,.5)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12),0_20px_40px_-20px_rgba(0,0,0,.8)]"
          role="status"
          aria-live="polite"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.9, filter: fuzz }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)", transition: { ...morph, delay: wait } }}
              exit={{ opacity: 0, scale: 0.9, filter: fuzz, transition: { duration: 0.18 } }}
              className="absolute inset-0"
            >
              {mode === "timer" && (
                <div className="flex h-full items-center justify-between pl-3 pr-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: `color-mix(in srgb, ${timerColor} 20%, transparent)` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={timerColor} strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2M10 2h4" /></svg>
                  </span>
                  <span className="text-[17px] font-semibold tabular-nums" style={{ color: timerColor }}>{mm}:{ss}</span>
                </div>
              )}
              {mode === "call" && (
                <div className="flex h-full items-center gap-3 px-3">
                  <span className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#5e5ce6,#bf5af2)] text-[18px] font-semibold">AR</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[13px] text-white/55">Incoming call</span>
                    <span className="truncate text-[17px] font-semibold">Alex Rivera</span>
                  </span>
                  <motion.button whileTap={{ scale: 0.88 }} type="button" onClick={() => pick("idle")} aria-label="Decline" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff3b30]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true" style={{ transform: "rotate(135deg)" }}><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" /></svg>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                    type="button"
                    onClick={() => pick("timer")}
                    aria-label="Accept"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-[#34c759]"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" /></svg>
                  </motion.button>
                </div>
              )}
              {mode === "music" && (
                <div className="flex h-full flex-col justify-between p-5">
                  <div className="flex items-center gap-3.5">
                    <span className="h-[58px] w-[58px] flex-none rounded-[14px] bg-[conic-gradient(from_200deg,#ff375f,#ff9f0a,#ffd60a,#30d158,#0a84ff,#bf5af2,#ff375f)]" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[17px] font-semibold">Night Drive</span>
                      <span className="truncate text-[14px] text-white/55">Coastal Lines</span>
                    </span>
                    <span className="flex h-7 items-end gap-[3px]" aria-hidden="true">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] rounded-full bg-[#ff375f]"
                          animate={playing ? { height: [[6, 22, 8], [12, 26, 6], [8, 18, 24], [16, 6, 20]][i] } : { height: 4 }}
                          transition={{ duration: 0.8 + i * 0.12, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                        />
                      ))}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="h-[5px] overflow-hidden rounded-full bg-white/20">
                      <motion.div className="h-full rounded-full bg-white" initial={{ width: "18%" }} animate={{ width: playing ? "92%" : undefined }} transition={{ duration: 40, ease: "linear" }} />
                    </div>
                    <div className="flex justify-between text-[11px] tabular-nums text-white/45"><span>0:42</span><span>-2:51</span></div>
                  </div>
                  <div className="flex items-center justify-center gap-10">
                    <IconBtn label="Previous"><path d="M6 5v14M18 5L9 12l9 7V5z" /></IconBtn>
                    <motion.button whileTap={{ scale: 0.85 }} type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"} className="flex h-10 w-10 items-center justify-center rounded-full">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.svg key={playing ? "pause" : "play"} initial={{ scale: 0.4, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0, rotate: 40 }} transition={{ type: "spring", stiffness: 500, damping: 22 }} width="30" height="30" viewBox="0 0 24 24" fill="white" aria-hidden="true">
                          {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M7 4.5v15l12.5-7.5z" />}
                        </motion.svg>
                      </AnimatePresence>
                    </motion.button>
                    <IconBtn label="Next"><path d="M18 5v14M6 5l9 7-9 7V5z" /></IconBtn>
                  </div>
                </div>
              )}
              {mode === "idle" && (
                <div className="flex h-full items-center justify-end pr-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#1c1c1e] shadow-[inset_0_0_0_2px_#2c2c2e]" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <div role="group" aria-label="Island state" className="relative grid grid-cols-4 rounded-xl bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]">
        {(["idle", "timer", "call", "music"] as IslandMode[]).map((m) => (
          <button key={m} type="button" onClick={() => pick(m)} aria-pressed={mode === m} className="relative z-10 h-8 rounded-[9px] px-4 text-[13px] font-medium capitalize text-[#1d1d1f] dark:text-[#f5f5f7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0071e3]">
            {mode === m && <motion.span layoutId={`${uid}-seg`} transition={{ type: "spring", stiffness: 420, damping: 32 }} className="absolute inset-0 -z-10 rounded-[9px] bg-white dark:bg-[#636366] shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)]" />}
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

function IconBtn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <motion.button whileTap={{ scale: 0.82 }} type="button" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full text-white/90">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </motion.button>
  );
}
