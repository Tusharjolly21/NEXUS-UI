"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export interface StreamingAnswerSource {
  /** The number a citation chip in the answer points at, starting at 1. */
  n: number;
  title: string;
  /** Where it lives, shown above the title (for example "Analytics"). */
  where: string;
  /** Accent colour of the card ring, the number badge and the lit citation chip. */
  c: string;
  /** Text colour on top of `c`. Defaults to white. */
  ink?: string;
  /** Optional link. Without one the card is a focus target only. */
  href?: string;
}

export interface StreamingAnswerProps {
  /** The user's message, shown in the bubble above the answer. */
  question?: string;
  /** Thinking steps, ticked off one by one before the answer streams. */
  steps?: string[];
  /** The sources that slide in once thinking is done. Up to three fit the grid. */
  sources?: StreamingAnswerSource[];
  /** The answer. Write `{1}`, `{2}` ... straight after a word to put a citation chip there. */
  answer?: string;
  /** What the folded thinking line says, in seconds: "Thought for 4s". */
  thoughtSeconds?: number;
  /** Plays the whole run again every 13 seconds until someone touches the component. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  /** Width of the card in px. It never grows past its container. Default 520. */
  width?: number;
  /** Extra classes for the card. */
  className?: string;
}

export const STREAMING_ANSWER_QUESTION = "Why are people dropping off during onboarding?";
export const STREAMING_ANSWER_STEPS = ["Searching 3 sources", "Reading Onboarding funnel, Q3", "Comparing with last quarter"];
export const STREAMING_ANSWER_SOURCES: StreamingAnswerSource[] = [
  { n: 1, title: "Onboarding funnel, Q3", where: "Analytics", c: "#0a84ff" },
  { n: 2, title: "Support tickets: setup", where: "Helpdesk", c: "#ff9f0a", ink: "#1d1d1f" },
  { n: 3, title: "Interview notes, Oct", where: "Docs", c: "#30d158", ink: "#1d1d1f" },
];
export const STREAMING_ANSWER_TEXT =
  "Most people leave at the workspace step, not at sign-up. 41% of new accounts stop when asked to invite teammates {1}, and the top setup ticket is about not knowing who to invite yet {2}. Interviews say the same: people want to try it alone first {3}. Making the invite step skippable should recover most of that drop.";

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const GAP = 800; // between thinking steps
const LEAD = 700; // before the first step ticks
const RUN_EVERY = 13000; // autoplay loop

type RunMode = "mount" | "user" | "auto";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * An AI answer that shows its work without making you wait on a spinner. The
 * thinking steps tick off one by one and then fold into a single "Thought for
 * 4s" line you can reopen. Sources slide in, the answer streams word by word
 * with citation chips popping in where they belong, and pointing at (or
 * focusing) a chip lights up the source it came from. Regenerate plays the
 * run again. Under reduced motion the answer arrives whole after a short beat.
 */
export function StreamingAnswer({
  question = STREAMING_ANSWER_QUESTION,
  steps = STREAMING_ANSWER_STEPS,
  sources = STREAMING_ANSWER_SOURCES,
  answer = STREAMING_ANSWER_TEXT,
  thoughtSeconds = 4,
  autoplay = false,
  enableSound = true,
  width = 520,
  className = "",
}: StreamingAnswerProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0); // steps finished
  const [thinking, setThinking] = useState(true);
  const [openThoughts, setOpenThoughts] = useState(false);
  const [shown, setShown] = useState(0); // words visible
  const [hot, setHot] = useState<number | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const mode = useRef<RunMode>(autoplay ? "auto" : "mount");
  const active = useDemoActive(box, autoplay && !reduce);
  // an autoplaying card waits until it is on screen; a plain one just streams once
  const live = !autoplay || reduce || active;

  const tokens = useMemo(() => answer.split(/(\s+)/).filter((t) => t.trim()), [answer]);

  // The timers read the latest sound player without restarting the run.
  const sound = (name: SoundName, vol: number) => {
    if (mode.current === "user") play(name, vol);
    else if (mode.current === "auto") play.auto(name, vol);
  };
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  });

  useEffect(() => {
    if (!live) return;
    const ids: number[] = [];
    const at = (fn: () => void, t: number) => ids.push(window.setTimeout(fn, t));
    const finish = () => {
      setStep(steps.length);
      setThinking(false);
      setShown(tokens.length);
      soundRef.current("done", 0.5);
    };
    // start from the top (also how a run resumes after the card was off screen)
    at(() => {
      setStep(0);
      setThinking(true);
      setShown(0);
      setOpenThoughts(false);
    }, 0);
    if (reduce) {
      at(finish, 450);
    } else {
      steps.forEach((_, i) =>
        at(() => {
          setStep(i + 1);
          soundRef.current("tick", 0.35);
        }, LEAD + i * GAP),
      );
      const start = LEAD + steps.length * GAP + 200;
      at(() => setThinking(false), start);
      tokens.forEach((_, i) =>
        at(
          () => {
            setShown(i + 1);
            if (i === tokens.length - 1) soundRef.current("done", 0.5);
          },
          start + 400 + i * 55 + (i > 0 && tokens[i - 1].endsWith(".") ? 180 : 0) + Math.floor(i / 12) * 60,
        ),
      );
    }
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [run, live, reduce, steps, tokens]);

  // Autoplay: run it again every 13 seconds until someone touches the card.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const id = window.setInterval(() => {
      if (touched.current) return;
      mode.current = "auto";
      setRun((r) => r + 1);
    }, RUN_EVERY);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active]);

  const done = !thinking && shown >= tokens.length;
  const spring = reduce ? { duration: 0.15 } : { type: "spring" as const, stiffness: 300, damping: 32 };

  return (
    <div
      ref={box}
      style={{ maxWidth: width }}
      className={`w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
      onFocusCapture={() => {
        touched.current = true;
      }}
    >
      <div className="ml-auto w-fit max-w-[85%] rounded-[18px] bg-[#f5f5f7] px-4 py-2.5 text-[14.5px] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">{question}</div>

      {/* thinking: live steps, then a one-line summary you can reopen */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => {
            if (!thinking) setOpenThoughts((o) => !o);
          }}
          aria-expanded={thinking || openThoughts}
          className={`flex items-center gap-2 rounded-full text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6] ${FOCUS}`}
        >
          {thinking ? (
            <span className="relative overflow-hidden">
              Thinking
              {!reduce && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/90 to-transparent dark:via-[#1c1c1e]/90"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </span>
          ) : (
            <motion.span className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              Thought for {thoughtSeconds}s
              <motion.svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                animate={{ rotate: openThoughts ? 90 : 0 }}
                transition={reduce ? { duration: 0 } : undefined}
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </motion.svg>
            </motion.span>
          )}
        </button>
        <AnimatePresence initial={false}>
          {(thinking || openThoughts) && (
            <motion.ul
              className="m-0 mt-2 list-none overflow-hidden border-l-2 border-[#ececf0] p-0 pl-3 dark:border-[#3a3a3c]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={spring}
            >
              {steps.map((s, i) =>
                i <= step ? (
                  <motion.li
                    key={s}
                    className="flex items-center gap-2 py-1 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]"
                    initial={reduce ? false : { opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="relative flex h-3.5 w-3.5 items-center justify-center" aria-hidden="true">
                      {i < step ? (
                        <svg width="14" height="14" viewBox="0 0 24 24">
                          <motion.path
                            d="M5 12.5l4.5 4.5L19 7.5"
                            fill="none"
                            className="stroke-[#34c759] dark:stroke-[#30d158]"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={reduce ? false : { pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                          />
                        </svg>
                      ) : (
                        <motion.span
                          className="h-3 w-3 rounded-full border-2 border-[#c7c7cc] border-t-[#0071e3] dark:border-[#48484a] dark:border-t-[#0a84ff]"
                          animate={reduce ? undefined : { rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </span>
                    <span className="sr-only">{i < step ? "Done: " : "In progress: "}</span>
                    {s}
                  </motion.li>
                ) : null,
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      {/* sources */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        {sources.map((s, i) => (
          <motion.a
            key={s.n}
            href={s.href ?? "#"}
            onClick={(e) => {
              if (!s.href) e.preventDefault();
            }}
            onPointerEnter={() => setHot(s.n)}
            onPointerLeave={() => setHot(null)}
            onFocus={() => setHot(s.n)}
            onBlur={() => setHot(null)}
            className={`min-w-0 rounded-[14px] bg-[#f5f5f7] p-2.5 no-underline dark:bg-[#2c2c2e] ${FOCUS}`}
            initial={false}
            animate={{
              opacity: thinking ? 0 : 1,
              y: thinking && !reduce ? 10 : 0,
              scale: hot === s.n && !reduce ? 1.04 : 1,
              boxShadow: hot === s.n ? `0 0 0 2px ${s.c}` : "0 0 0 0px rgba(0,0,0,0)",
            }}
            transition={
              reduce
                ? { duration: 0.15 }
                : { delay: thinking ? 0 : hot === null ? 0.1 + i * 0.08 : 0, type: "spring", stiffness: 400, damping: 28 }
            }
            inert={thinking}
          >
            <span className="flex items-center gap-1.5 text-[11px] text-[#6e6e73] dark:text-[#a1a1a6]">
              <span className="flex h-4 w-4 items-center justify-center rounded-[4px] text-[9px] font-bold" style={{ background: s.c, color: s.ink ?? "#fff" }}>
                {s.n}
              </span>
              {s.where}
            </span>
            <span className="mt-1 block truncate text-[12.5px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{s.title}</span>
          </motion.a>
        ))}
      </div>

      {/* the streamed answer */}
      <p className="m-0 mt-4 min-h-[110px] text-[15.5px] leading-[1.6] text-[#1d1d1f] dark:text-[#f5f5f7]" aria-busy={!done}>
        {tokens.slice(0, shown).map((t, i) => {
          const cite = t.match(/^\{(\d)\}(.*)$/);
          if (cite) {
            const n = +cite[1];
            const s = sources.find((x) => x.n === n);
            if (!s) return <span key={i}>{cite[2]} </span>;
            const lit = hot === n;
            return (
              <span key={i}>
                <motion.button
                  type="button"
                  onPointerEnter={() => setHot(n)}
                  onPointerLeave={() => setHot(null)}
                  onFocus={() => setHot(n)}
                  onBlur={() => setHot(null)}
                  aria-label={`Source ${n}: ${s.title}`}
                  className={`relative -top-[1px] mx-[1px] inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 align-middle text-[10.5px] font-bold ${lit ? "" : "bg-[#ececf0] text-[#6e6e73] dark:bg-[#3a3a3c] dark:text-[#a1a1a6]"} ${FOCUS}`}
                  style={lit ? { background: s.c, color: s.ink ?? "#fff" } : undefined}
                  initial={reduce ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                >
                  {n}
                </motion.button>
                {cite[2]}{" "}
              </span>
            );
          }
          return (
            <motion.span key={i} initial={reduce ? false : { opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.3 }}>
              {t}{" "}
            </motion.span>
          );
        })}
        {!thinking && !done && (
          <motion.span
            aria-hidden="true"
            className="inline-block h-[1em] w-[7px] translate-y-[2px] rounded-[2px] bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            animate={reduce ? undefined : { opacity: [1, 0.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </p>
      <span className="sr-only" role="status" aria-live="polite">
        {done ? "Answer ready" : ""}
      </span>

      <AnimatePresence>
        {done && (
          <motion.div
            className="mt-3 flex items-center gap-1"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {[
              { l: "Copy", d: "M8 8h10v12H8zM6 16H4V4h12v2" },
              { l: "Good answer", d: "M7 11v9H4v-9zM7 11l4-8a2 2 0 012 2v4h5a2 2 0 012 2.3l-1.2 7A2 2 0 0116.8 20H7" },
            ].map((b) => (
              <button
                key={b.l}
                type="button"
                aria-label={b.l}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[#6e6e73] hover:bg-[#f5f5f7] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] ${FOCUS}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={b.d} />
                </svg>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                touched.current = true;
                mode.current = "user";
                setRun((r) => r + 1);
              }}
              className={`ml-1 flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium text-[#6e6e73] hover:bg-[#f5f5f7] dark:text-[#a1a1a6] dark:hover:bg-[#2c2c2e] ${FOCUS}`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />
              </svg>
              Regenerate
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
