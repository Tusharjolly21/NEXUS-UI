"use client";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, LayoutGroup, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

const LEN = 6;
const DEFAULT_CODE = "905172";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

type State = "typing" | "checking" | "error" | "done";

export interface OtpLineProps {
  /** The six digit code that verifies. Anything that is not six digits falls back to "905172". */
  code?: string;
  /** Types a wrong code and then the right one on a loop until someone interacts. Never runs under reduced motion and pauses off screen or in a hidden tab. */
  autoplay?: boolean;
  /** Called once the right code is entered. */
  onVerified?: (code: string) => void;
  /** Extra classes for the card. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
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
 * A quieter OTP field: no boxes, just six underlines with a dot waiting on
 * each. Typing turns each dot into its digit, a caret glides to the next slot,
 * and the underline under it stretches in. A wrong code drops its digits off
 * the line one by one; the right one pulls the digits together, joins the
 * underlines into one green line and checks itself.
 */
export function OtpLine({ code: codeProp = DEFAULT_CODE, autoplay = false, onVerified, className = "", enableSound = true }: OtpLineProps) {
  const play = useSound(enableSound);
  const code = /^\d{6}$/.test(codeProp) ? codeProp : DEFAULT_CODE;
  const uid = useId();
  const reduce = useReducedMotion() ?? false;
  const [v, setV] = useState("");
  useTypedText(v, enableSound);
  const [state, setState] = useState<State>("typing");
  const [focus, setFocus] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const shake = useAnimationControls();
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const autoIds = useRef<number[]>([]);
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
  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const submit = useCallback(
    // `audible` is true for codes the visitor typed; the autoplay demo answers through `play.auto`.
    (val: string, audible = false) => {
      setState("checking");
      later(() => {
        if (val === code) {
          if (audible) play("success");
          else play.auto("success");
          setState("done");
          onVerifiedRef.current?.(val);
        } else {
          if (audible) play("error");
          else play.auto("error");
          setState("error");
          if (!reduce) void shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.4 } });
          later(() => {
            setV("");
            later(() => setState("typing"), 500);
          }, 650);
        }
      }, 700);
    },
    [code, later, play, reduce, shake],
  );

  const interact = () => {
    touched.current = true;
    setInteracted(true);
    autoIds.current.forEach(clearTimeout);
    autoIds.current = [];
  };

  const change = (raw: string) => {
    if (state !== "typing") return;
    const val = raw.replace(/\D/g, "").slice(0, LEN);
    if (val.length > v.length) play("tick", 0.45);
    setV(val);
    if (val.length === LEN) submit(val, true);
  };

  // demo: a wrong code first, then the right one
  useEffect(() => {
    if (!running || touched.current) return;
    const ids: number[] = [];
    autoIds.current = ids;
    const at = (fn: () => void, ms: number) => {
      ids.push(
        window.setTimeout(() => {
          if (!touched.current) fn();
        }, ms),
      );
    };
    const typeOut = (s: string) => {
      for (let i = 0; i < s.length; i++) {
        at(() => {
          setV(s.slice(0, i + 1));
          if (i === s.length - 1) submit(s);
        }, 160 * (i + 1));
      }
    };
    const loop = () => {
      clearTimers();
      setState("typing");
      setV("");
      at(() => typeOut("123450"), 600);
      at(() => typeOut(code), 4200);
      at(loop, 9000);
    };
    loop();
    return () => ids.forEach(clearTimeout);
  }, [running, code, submit, clearTimers]);

  const done = state === "done";
  const err = state === "error";
  const caretAt = Math.min(v.length, LEN - 1);
  const showCaret = (focus || (running && !interacted)) && state === "typing" && v.length < LEN;
  const layoutSpring = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 300, damping: 28 } as const);

  return (
    <div
      ref={card}
      className={`flex w-[380px] max-w-full flex-col items-center rounded-[28px] bg-white px-6 py-9 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] max-[360px]:px-4 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
    >
      <h3 className="m-0 text-center text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Two-step verification</h3>
      <p className="m-0 mt-1.5 text-center text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">Enter the 6-digit code from your authenticator app.</p>
      <motion.div animate={shake} className="relative mt-8 max-w-full cursor-text" onClick={() => input.current?.focus()}>
        <LayoutGroup>
          <motion.div layout className="flex items-end" style={{ gap: done ? 2 : 12 }} transition={layoutSpring}>
            {Array.from({ length: LEN }, (_, i) => {
              const d = v[i];
              const lineOn = Boolean(d) || (showCaret && i === caretAt);
              const lineColor = err ? "bg-[#ff3b30] dark:bg-[#ff453a]" : d ? "bg-[#1d1d1f] dark:bg-[#f5f5f7]" : "bg-[#0071e3] dark:bg-[#0a84ff]";
              return (
                <motion.div layout key={i} className="relative flex h-[54px] w-[34px] items-center justify-center max-[340px]:w-[30px]" transition={layoutSpring}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {d ? (
                      <motion.span
                        key={"d" + i + d}
                        className={`text-[32px] font-semibold tabular-nums tracking-[-0.02em] ${err ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}
                        initial={{ opacity: 0, y: reduce ? 0 : 10, scaleY: reduce ? 1 : 0.3, filter: reduce ? "blur(0px)" : "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, scaleY: 1, filter: "blur(0px)" }}
                        exit={
                          reduce
                            ? { opacity: 0, transition: { duration: 0.15 } }
                            : { opacity: 0, y: 34, rotate: (i % 2 ? 1 : -1) * (8 + i * 3), transition: { duration: 0.4, delay: (LEN - 1 - i) * 0.05, ease: [0.5, 0, 1, 1] } }
                        }
                        transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 500, damping: 28, filter: { duration: 0.2 } }}
                      >
                        {d}
                      </motion.span>
                    ) : (
                      <motion.span
                        key={"o" + i}
                        aria-hidden="true"
                        className="h-[7px] w-[7px] rounded-full bg-[#d2d2d7] dark:bg-[#48484a]"
                        initial={{ scale: reduce ? 1 : 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: reduce ? 1 : 2.4, opacity: 0, transition: { duration: 0.15 } }}
                      />
                    )}
                  </AnimatePresence>
                  {showCaret && i === caretAt && (
                    <motion.span
                      layoutId={`${uid}-caret`}
                      aria-hidden="true"
                      className="absolute bottom-[12px] top-[10px] w-[2px] rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
                      style={{ left: d ? "auto" : "50%", right: d ? 2 : "auto" }}
                      animate={{ opacity: reduce ? 1 : [1, 1, 0.15, 1] }}
                      transition={{ opacity: reduce ? { duration: 0 } : { duration: 1.1, repeat: Infinity }, layout: reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 36 } }}
                    />
                  )}
                  {/* underline: grey track, then the coloured part stretching from the middle */}
                  <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]" />
                  <motion.span
                    className={`absolute inset-x-0 bottom-0 h-[2px] rounded-full transition-colors duration-200 ${lineColor}`}
                    initial={false}
                    animate={{ scaleX: lineOn ? 1 : 0 }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </LayoutGroup>
        {/* on success, one continuous line draws over the separate ones */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[3px] origin-center rounded-full bg-[#34c759] dark:bg-[#30d158]"
          initial={false}
          animate={{ scaleX: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 160, damping: 20, delay: done ? 0.15 : 0 }}
        />
        <AnimatePresence>
          {done && (
            <motion.span
              aria-hidden="true"
              className="absolute -right-11 bottom-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#34c759] dark:bg-[#30d158]"
              initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : -40, opacity: reduce ? 0 : 1 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
              transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 500, damping: 18, delay: 0.35 }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="dark:stroke-[#1c1c1e]"
                  initial={{ pathLength: reduce ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: reduce ? 0 : 0.5, duration: reduce ? 0.01 : 0.3 }}
                />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        <label htmlFor={`${uid}-field`} className="sr-only">
          Authenticator code, 6 digits
        </label>
        <input
          id={`${uid}-field`}
          ref={input}
          value={v}
          onChange={(e) => {
            interact();
            clearTimers();
            change(e.target.value);
          }}
          onFocus={() => {
            setFocus(true);
            if (!touched.current) {
              interact();
              clearTimers();
              setV("");
              setState("typing");
            }
          }}
          onBlur={() => setFocus(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-invalid={err}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </motion.div>
      <div className="mt-6 h-5 text-[13px]" role="status" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={state}
            className={err ? "text-[#ff3b30] dark:text-[#ff453a]" : done ? "font-medium text-[#1a7f37] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}
            initial={{ opacity: 0, y: reduce ? 0 : 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -5 }}
            transition={{ duration: 0.18 }}
          >
            {err ? "Wrong code. Try again." : done ? "You're in." : state === "checking" ? "Checking…" : "Codes refresh every 30 seconds"}
          </motion.span>
        </AnimatePresence>
      </div>
      {done && interacted && (
        <button
          type="button"
          onClick={() => {
            clearTimers();
            setV("");
            setState("typing");
            input.current?.focus();
          }}
          className={`mt-2 rounded text-[13px] font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
        >
          Try again
        </button>
      )}
    </div>
  );
}
