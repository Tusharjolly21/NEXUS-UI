"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const DEFAULT_CODE = "482913";
const LEN = 6;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

type Fly = { i: number; d: string; from: [number, number]; to: [number, number] };
type Phase = "idle" | "banner" | "flying" | "checking" | "merge" | "done" | "error";

export interface OtpAutofillProps {
  /** The six digit code the pretend text message carries, and the only code that verifies. Anything else is treated as "482913". */
  code?: string;
  /** Plays the whole story by itself (message arrives, Fill, verify, start over) until someone interacts. Never runs under reduced motion and pauses off screen or in a hidden tab. */
  autoplay?: boolean;
  /** Called once a code verifies. */
  onVerified?: (code: string) => void;
  /** Called when "Resend code" is pressed. */
  onResend?: () => void;
  /** Extra classes for the card. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const subscribeVisibility = (cb: () => void) => {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
};
const getVisible = () => document.visibilityState === "visible";
const getServerVisible = () => true;

/** True while an autoplay loop may run: enabled, motion allowed, tab visible and the element on screen. */
function useAutoplayGate(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const reduce = useReducedMotion() ?? false;
  const tabVisible = useSyncExternalStore(subscribeVisibility, getVisible, getServerVisible);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, ref]);
  return enabled && !reduce && tabVisible && inView;
}

/**
 * A one-time-code field that fills itself the way phones do. The text message
 * drops in at the top; tap Fill and each digit lifts out of the message and
 * flies into its box. The boxes ripple while the code is checked, then slide
 * together into a single Verified pill. Typing or pasting works as normal, and
 * a wrong code shakes and clears.
 */
export function OtpAutofill({ code: codeProp = DEFAULT_CODE, autoplay = false, onVerified, onResend, className = "", enableSound = true }: OtpAutofillProps) {
  const play = useSound(enableSound);
  const CODE = /^\d{6}$/.test(codeProp) ? codeProp : DEFAULT_CODE;
  const reduce = useReducedMotion() ?? false;
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [flies, setFlies] = useState<Fly[]>([]);
  const [mergeX, setMergeX] = useState<number[]>([]);
  const [focused, setFocused] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const rowBox = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const row = useAnimationControls();
  const touched = useRef(false);
  // true while the current run was started by the visitor (typing or pressing Fill); the autoplay demo keeps it false
  const loud = useRef(false);
  const timers = useRef<number[]>([]);
  const onVerifiedRef = useRef(onVerified);
  const running = useAutoplayGate(card, autoplay);

  useEffect(() => {
    onVerifiedRef.current = onVerified;
  }, [onVerified]);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach(clearTimeout);
  }, []);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setValue("");
    setFlies([]);
    setPhase("idle");
  }, []);

  const check = useCallback(
    (entered: string) => {
      setPhase("checking");
      later(() => {
        if (entered === CODE) {
          // measure how far each box has to slide to meet in the middle
          const mid = rowBox.current ? rowBox.current.getBoundingClientRect() : null;
          if (mid) {
            const cx = mid.left + mid.width / 2;
            setMergeX(
              boxRefs.current.map((el) => {
                if (!el) return 0;
                const r = el.getBoundingClientRect();
                return cx - (r.left + r.width / 2);
              }),
            );
          }
          if (loud.current) play("success");
          setPhase("merge");
          later(() => {
            setPhase("done");
            onVerifiedRef.current?.(entered);
          }, 380);
        } else {
          if (loud.current) play("error");
          setPhase("error");
          if (!reduce) void row.start({ x: [0, -10, 9, -7, 5, -2, 0], transition: { duration: 0.45 } });
          later(() => {
            setValue("");
            setPhase("idle");
          }, 700);
        }
      }, 900);
    },
    [CODE, later, play, reduce, row],
  );

  // the message arrives a moment after the screen opens
  useEffect(() => {
    if (phase !== "idle" || value) return;
    const t = window.setTimeout(() => setPhase((p) => (p === "idle" ? "banner" : p)), 900);
    return () => clearTimeout(t);
  }, [phase, value]);

  const fill = useCallback((byUser = false) => {
    loud.current = byUser;
    if (reduce) {
      // no flight under reduced motion: the digits simply arrive
      setValue(CODE);
      check(CODE);
      return;
    }
    const cardEl = card.current;
    if (!cardEl) return;
    const c = cardEl.getBoundingClientRect();
    const at = (el: Element | null): [number, number] => {
      if (!el) return [c.width / 2, c.height / 2];
      const r = el.getBoundingClientRect();
      return [r.left + r.width / 2 - c.left, r.top + r.height / 2 - c.top];
    };
    setFlies([...CODE].map((d, i) => ({ i, d, from: at(digitRefs.current[i]), to: at(boxRefs.current[i]) })));
    setPhase("flying");
  }, [CODE, check, reduce]);

  const landed = (i: number) => {
    if (loud.current) play("tick", 0.4);
    setValue(CODE.slice(0, i + 1));
    if (i === CODE.length - 1) {
      setFlies([]);
      check(CODE);
    }
  };

  // demo loop: message arrives, fills, verifies, starts over
  useEffect(() => {
    if (!running || touched.current) return;
    if (phase === "banner") {
      const t = window.setTimeout(() => {
        if (!touched.current) fill(false);
      }, 1300);
      return () => clearTimeout(t);
    }
    if (phase === "done") {
      const t = window.setTimeout(() => {
        if (!touched.current) reset();
      }, 2600);
      return () => clearTimeout(t);
    }
  }, [phase, running, fill, reset]);

  const onType = (v: string) => {
    touched.current = true;
    if (phase === "checking" || phase === "done" || phase === "flying" || phase === "merge") return;
    const clean = v.replace(/\D/g, "").slice(0, LEN);
    loud.current = true;
    if (clean.length > value.length) play("tick", 0.45);
    setValue(clean);
    if (phase === "error") setPhase("idle");
    if (clean.length === LEN) check(clean);
  };
  const done = phase === "done";
  const active = Math.min(value.length, LEN - 1);
  const bannerUp = phase === "banner" || phase === "flying";
  const quick = reduce ? { duration: 0.01 } : null;

  return (
    <div
      ref={card}
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`relative w-[380px] max-w-full overflow-hidden rounded-[28px] bg-white px-6 pb-7 pt-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] max-[360px]:px-4 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
    >
      {/* the incoming text message */}
      <AnimatePresence>
        {bannerUp && (
          <motion.div
            role="group"
            aria-label="New text message"
            className="absolute inset-x-3 top-3 z-10 flex items-start gap-3 rounded-[18px] bg-white/80 p-3 shadow-[0_10px_30px_-12px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] backdrop-blur-xl dark:bg-[#2c2c2e]/85 dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.1)]"
            initial={{ y: -90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -90, opacity: 0, transition: { duration: reduce ? 0.01 : 0.3, ease: [0.4, 0, 1, 1] } }}
            transition={quick ?? { type: "spring", stiffness: 380, damping: 30 }}
          >
            <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-[9px] bg-gradient-to-b from-[#5ef08a] to-[#22c55e]" aria-hidden="true">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff"><path d="M12 3C6.5 3 2 6.6 2 11c0 2.4 1.3 4.6 3.4 6.1L4.5 21l4.2-2.2c1 .3 2.1.4 3.3.4 5.5 0 10-3.6 10-8.1S17.5 3 12 3z" /></svg>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex justify-between text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Messages</span>now
              </span>
              <span className="mt-0.5 block text-[13px] leading-[1.35] text-[#1d1d1f] dark:text-[#f5f5f7]">
                Your Nexus code is{" "}
                <span className="font-semibold tabular-nums">
                  {[...CODE].map((d, i) => (
                    <span
                      key={i}
                      ref={(el) => {
                        digitRefs.current[i] = el;
                      }}
                      style={{ opacity: phase === "flying" && flies.some((f) => f.i === i) ? 0.25 : 1 }}
                      className="transition-opacity"
                    >
                      {d}
                    </span>
                  ))}
                </span>
                . Don&apos;t share it.
              </span>
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                touched.current = true;
                play("tap");
                fill(true);
              }}
              disabled={phase === "flying"}
              className={`mt-1 h-8 flex-none rounded-full bg-[#0071e3] px-3.5 text-[13px] font-semibold text-white dark:bg-[#0a84ff] ${FOCUS}`}
            >
              Fill
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* sits where the message will land; steps aside when it arrives */}
      <motion.div
        className="absolute left-1/2 top-7 -ml-6 flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5f5f7] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
        animate={{ opacity: bannerUp ? 0 : 1, scale: bannerUp ? 0.8 : 1 }}
        transition={quick ?? undefined}
        aria-hidden="true"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
      </motion.div>
      <div className="mt-[86px] text-center">
        <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Check your messages</h3>
        <p className="m-0 mt-1.5 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Enter the code we sent to •• ••• 4821</p>
      </div>

      <div ref={rowBox} className="relative mt-6 flex h-[60px] justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {!done ? (
            <motion.div
              key="boxes"
              animate={row}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: reduce ? 0.01 : 0.2 } }}
              className="relative flex w-full max-w-[316px] items-center gap-2"
              onClick={() => input.current?.focus()}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const d = value[i];
                const isActive = focused && i === active && phase !== "checking";
                const err = phase === "error";
                const merging = phase === "merge";
                const surface = err ? "bg-[#fff1f0] dark:bg-[#3a1f1e]" : "bg-[#f5f5f7] dark:bg-[#2c2c2e]";
                const ring = err
                  ? "shadow-[0_0_0_1.5px_#ff3b30] dark:shadow-[0_0_0_1.5px_#ff453a]"
                  : isActive
                    ? "shadow-[0_0_0_2px_#0071e3] dark:shadow-[0_0_0_2px_#0a84ff]"
                    : d
                      ? "shadow-[0_0_0_1px_rgba(0,0,0,.1)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.16)]"
                      : "shadow-[0_0_0_1px_rgba(0,0,0,0)]";
                return (
                  <motion.div
                    key={i}
                    ref={(el) => {
                      boxRefs.current[i] = el;
                    }}
                    className={`relative flex h-[56px] min-w-0 max-w-[44px] flex-1 items-center justify-center rounded-[14px] text-[26px] font-semibold tabular-nums transition-[background-color,box-shadow] duration-200 ${surface} ${ring} ${i === 3 ? "ml-3" : ""}`}
                    animate={{
                      y: phase === "checking" && !reduce ? [0, -5, 0] : 0,
                      // slide in toward the middle before turning into the pill
                      x: merging && !reduce ? (mergeX[i] ?? 0) : 0,
                      scale: merging && !reduce ? 0.7 : 1,
                      opacity: merging ? 0 : 1,
                    }}
                    transition={
                      reduce
                        ? { duration: 0.01 }
                        : phase === "checking"
                          ? { y: { duration: 0.5, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" } }
                          : merging
                            ? { duration: 0.36, ease: [0.5, 0, 0.2, 1] }
                            : { duration: 0.2 }
                    }
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {d && (
                        <motion.span
                          key={d + i}
                          className={err ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}
                          initial={{ scale: 0.4, opacity: 0, y: 6 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 14, transition: { duration: 0.15, delay: (5 - i) * 0.03 } }}
                          transition={quick ?? { type: "spring", stiffness: 600, damping: 26 }}
                        >
                          {d}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && !d && (
                      <motion.span
                        className="absolute h-7 w-[2px] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
                        animate={{ opacity: reduce ? 1 : [1, 1, 0, 0] }}
                        transition={reduce ? { duration: 0 } : { duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
                      />
                    )}
                  </motion.div>
                );
              })}
              <GroupDash />
            </motion.div>
          ) : (
            <motion.div
              key="ok"
              className="flex h-[56px] items-center gap-2 rounded-full bg-[#e9f9ee] px-6 text-[17px] font-semibold text-[#1a7f37] dark:bg-[#30d158]/15 dark:text-[#30d158]"
              initial={{ scaleX: 0.35, scaleY: 0.8, opacity: 0 }}
              animate={{ scaleX: 1, scaleY: 1, opacity: 1 }}
              transition={quick ?? { type: "spring", stiffness: 380, damping: 22 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="11" className="fill-[#34c759] dark:fill-[#30d158]" />
                <motion.path
                  d="M7 12.5l3.2 3.2L17 9"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="dark:stroke-[#1c1c1e]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: reduce ? 0 : 0.25, duration: reduce ? 0.01 : 0.35 }}
                />
              </svg>
              <motion.span initial={{ opacity: 0, x: reduce ? 0 : -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : 0.2, duration: reduce ? 0.01 : undefined }}>
                Verified
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          ref={input}
          value={value}
          onChange={(e) => onType(e.target.value)}
          onFocus={() => {
            touched.current = true;
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="One-time code, 6 digits"
          aria-invalid={phase === "error"}
          maxLength={LEN}
          disabled={done}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {phase === "checking" || phase === "merge" ? "Checking the code" : phase === "error" ? "That code did not match. Try again." : done ? "Code verified" : ""}
      </span>
      <div className="mt-5 flex h-5 justify-center text-[13px]">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "checking" || phase === "merge" ? (
            <motion.span key="c" className="text-[#6e6e73] dark:text-[#a1a1a6]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Checking…
            </motion.span>
          ) : phase === "error" ? (
            <motion.span key="e" className="text-[#ff3b30] dark:text-[#ff453a]" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              That code didn&apos;t match. Try again.
            </motion.span>
          ) : done ? (
            <motion.button
              key="r"
              type="button"
              onClick={() => {
                touched.current = true;
                reset();
              }}
              className={`rounded font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: reduce ? 0 : 0.4 } }}
              exit={{ opacity: 0 }}
            >
              Start over
            </motion.button>
          ) : (
            <motion.button
              key="s"
              type="button"
              onClick={() => {
                touched.current = true;
                reset();
                onResend?.();
              }}
              className={`rounded font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              Resend code
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* digits in flight from the message to the boxes */}
      {flies.map((f) => (
        <motion.span
          key={f.i}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-20 flex h-5 w-5 items-center justify-center text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:text-[#f5f5f7]"
          initial={{ x: f.from[0] - 10, y: f.from[1] - 10, scale: 1 }}
          animate={{
            x: [f.from[0] - 10, (f.from[0] + f.to[0]) / 2 - 10, f.to[0] - 10],
            y: [f.from[1] - 10, Math.min(f.from[1], f.to[1]) - 10 + 40, f.to[1] - 10],
            scale: [1, 1.6, 2],
          }}
          transition={{ duration: 0.55, delay: f.i * 0.08, ease: [0.3, 0, 0.2, 1] }}
          onAnimationComplete={() => landed(f.i)}
        >
          {f.d}
        </motion.span>
      ))}
    </div>
  );
}

// a quiet divider between the two groups of three
function GroupDash() {
  return <span className="pointer-events-none absolute left-1/2 top-1/2 -ml-1 h-[2px] w-2 -translate-y-1/2 rounded-full bg-[#d2d2d7] dark:bg-[#48484a]" />;
}
