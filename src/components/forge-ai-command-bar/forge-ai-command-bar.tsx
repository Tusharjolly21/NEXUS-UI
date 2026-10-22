"use client";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type AiCommandMode = "ask" | "edit" | "build";

export interface AiCommandBarProps {
  /** Placeholder while the field is empty. */
  placeholder?: string;
  /** One-tap prompts shown under the field while it is empty. */
  suggestions?: string[];
  /** Mode the switcher starts on. */
  defaultMode?: AiCommandMode;
  /** Called with the prompt and the selected mode when the user sends it. */
  onSubmit?: (prompt: string, mode: AiCommandMode) => void;
  /** Builds the progress steps shown while the copilot works. Defaults to four generic steps. */
  steps?: (prompt: string, mode: AiCommandMode) => string[];
  /** Key that focuses the bar together with Cmd (Mac) or Ctrl. Pass an empty string to turn the shortcut off. */
  hotkey?: string;
  /** Types and runs the suggestions in turn until someone touches the bar. */
  autoplay?: boolean;
  /** Extra classes for the root. */
  className?: string;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
}

const MODES: { id: AiCommandMode; label: string }[] = [
  { id: "ask", label: "Ask" },
  { id: "edit", label: "Edit" },
  { id: "build", label: "Build" },
];

const DEFAULT_SUGGESTIONS = ["Add a pricing table", "Make the hero animate in", "Switch the app to dark mode"];

const VERB: Record<AiCommandMode, string> = { ask: "Answering", edit: "Editing", build: "Building" };

const defaultSteps = (prompt: string, mode: AiCommandMode) => [
  "Reading the project",
  `${VERB[mode]}: ${prompt.length > 34 ? `${prompt.slice(0, 32).trimEnd()}...` : prompt}`,
  mode === "ask" ? "Checking 12 sources" : "Writing 3 files",
  "Done in 1.8s",
];

const SPRING = { type: "spring" as const, stiffness: 420, damping: 32 };
/** Low damping on the panel so it overshoots a touch as it grows: the signature move. */
const PANEL = { type: "spring" as const, stiffness: 260, damping: 20 };
const STEP_MS = 650;

type Phase = "idle" | "thinking" | "done";

function Spark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 1.5l1.9 5.2a2 2 0 0 0 1.2 1.2l5.2 1.9-5.2 1.9a2 2 0 0 0-1.2 1.2L10 18.1l-1.9-5.2a2 2 0 0 0-1.2-1.2L1.7 9.8l5.2-1.9a2 2 0 0 0 1.2-1.2L10 1.5z" fill="currentColor" />
    </svg>
  );
}

/**
 * A command bar for an AI copilot. Pick Ask, Edit or Build, type or tap a
 * suggestion and send: the bar grows a panel above the field where the prompt
 * lands as a heading and each step ticks off in turn, while a light runs round
 * the edge. Cmd/Ctrl+K focuses it, Esc stops a run.
 */
export function AiCommandBar({
  placeholder = "Describe what you need...",
  suggestions = DEFAULT_SUGGESTIONS,
  defaultMode = "build",
  onSubmit,
  steps = defaultSteps,
  hotkey = "k",
  autoplay = false,
  className = "",
  enableSound = true,
}: AiCommandBarProps) {
  const play = useSound(enableSound);
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion() === true;
  const [mode, setMode] = useState<AiCommandMode>(defaultMode);
  const [value, setValue] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [query, setQuery] = useState("");
  const [list, setList] = useState<string[]>([]);
  const [shown, setShown] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const timers = useRef<number[]>([]);
  const angle = useMotionValue(0);
  const ring = useMotionTemplate`conic-gradient(from ${angle}deg, #0071e3, #bf5af2, #ff9f0a, #30d158, #0071e3)`;

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  useEffect(() => {
    const pending = timers;
    return () => pending.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // The light round the edge only spins while the copilot is working.
  useEffect(() => {
    if (phase !== "thinking" || still) return;
    const run = animate(angle, [angle.get(), angle.get() + 360], { duration: 1.6, ease: "linear", repeat: Infinity });
    return () => run.stop();
  }, [phase, still, angle]);

  useEffect(() => {
    if (!hotkey) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault();
        touched.current = true;
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotkey]);

  const run = (prompt: string, m: AiCommandMode, after?: () => void) => {
    const text = prompt.trim();
    if (!text) return;
    clear();
    const next = steps(text, m);
    setQuery(text);
    setList(next);
    setShown(0);
    setValue("");
    setPhase("thinking");
    next.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setShown(i + 1);
          if (i === next.length - 1) {
            setPhase("done");
            after?.();
          }
        }, (i + 1) * STEP_MS),
      );
    });
  };

  const stop = () => {
    clear();
    setPhase("idle");
    setList([]);
    setShown(0);
  };

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    touched.current = true;
    if (phase === "thinking") {
      stop();
      return;
    }
    if (!value.trim()) return;
    play("whoosh");
    onSubmit?.(value.trim(), mode);
    run(value, mode);
  };

  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (phase !== "idle") stop();
      else setValue("");
    }
  };

  // Autoplay: type a suggestion, send it, let the steps run, reset, move on.
  const tips = suggestions.join("\u0000");
  useEffect(() => {
    const list = tips ? tips.split("\u0000") : [];
    if (!autoplay || list.length === 0) return;
    const local: number[] = [];
    let k = 0;
    const later = (f: () => void, ms: number) => local.push(window.setTimeout(() => !touched.current && f(), ms));
    const cycle = () => {
      const text = list[k % list.length];
      const m = MODES[k % MODES.length].id;
      k++;
      setMode(m);
      for (let c = 1; c <= text.length; c++) later(() => setValue(text.slice(0, c)), 500 + c * 38);
      later(() => {
        run(text, m, () => {
          later(() => {
            setPhase("idle");
            setList([]);
            setShown(0);
            later(cycle, 700);
          }, 1800);
        });
      }, 500 + text.length * 38 + 450);
    };
    local.push(window.setTimeout(cycle, 600));
    return () => local.forEach((t) => window.clearTimeout(t));
    // `run` only touches stable setters and refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, tips]);

  const busy = phase === "thinking";
  const open = phase !== "idle";

  return (
    <div
      className={cn(`w-full max-w-[520px]`, className)}
      onPointerDown={() => {
        touched.current = true;
      }}
      onKeyDown={() => {
        touched.current = true;
      }}
    >
      <LayoutGroup id={id}>
        <motion.div layout transition={PANEL} className="relative rounded-[24px] p-[1.5px]" style={{ borderRadius: 24 }}>
          {/* Light that runs round the edge while working. */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[24px]"
            style={{ backgroundImage: ring }}
            initial={false}
            animate={{ opacity: busy ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          <motion.div
            layout
            transition={PANEL}
            className="relative overflow-hidden rounded-[22.5px] bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
            style={{ borderRadius: 22.5 }}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {open && (
                <motion.div
                  key="panel"
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.16 } }}
                  transition={PANEL}
                  className="border-b border-black/[0.06] px-5 pb-4 pt-5 dark:border-white/[0.08]"
                  aria-live="polite"
                >
                  <motion.p layout="position" className="text-[17px] font-semibold leading-snug tracking-[-0.02em]">
                    {query}
                  </motion.p>
                  <ol className="mt-3 flex flex-col gap-2">
                    <AnimatePresence initial={false}>
                      {list.slice(0, Math.min(list.length, shown + 1)).map((s, i) => {
                        const doneStep = i < shown;
                        return (
                          <motion.li
                            key={`${query}-${i}`}
                            layout="position"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={SPRING}
                            className="flex items-center gap-2.5 text-[13px]"
                          >
                            <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center">
                              {doneStep ? (
                                <motion.svg
                                  viewBox="0 0 18 18"
                                  className="h-[18px] w-[18px]"
                                  initial={{ scale: 0.4 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 14 }}
                                  aria-hidden="true"
                                >
                                  <circle cx="9" cy="9" r="9" fill="#30d158" />
                                  <motion.path
                                    d="M5 9.4l2.6 2.5L13 6.4"
                                    fill="none"
                                    stroke="#fff"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: still ? 1 : 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.3, delay: 0.05 }}
                                  />
                                </motion.svg>
                              ) : (
                                <motion.span
                                  className="h-[14px] w-[14px] rounded-full border-2 border-[#0071e3]/25 border-t-[#0071e3] dark:border-[#0a84ff]/30 dark:border-t-[#0a84ff]"
                                  animate={still ? undefined : { rotate: 360 }}
                                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                />
                              )}
                            </span>
                            <span className={doneStep ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}>{s}</span>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.form layout="position" onSubmit={submit} className="flex items-center gap-2 px-3 py-3 sm:px-4">
              <motion.span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f0f0f3] text-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#0a84ff]"
                animate={busy && !still ? { rotate: [0, 18, -12, 0], scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }}
                transition={busy ? { duration: 1.2, repeat: Infinity } : SPRING}
              >
                <Spark className="h-4 w-4" />
              </motion.span>
              <label htmlFor={`${id}-q`} className="sr-only">
                Prompt
              </label>
              <input
                ref={input}
                id={`${id}-q`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={key}
                placeholder={busy ? "Working on it..." : placeholder}
                disabled={busy}
                autoComplete="off"
                className="h-9 min-w-0 flex-1 bg-transparent text-[15px] tracking-[-0.01em] outline-none placeholder:text-[#86868b] disabled:cursor-wait dark:placeholder:text-[#8e8e93]"
              />
              {hotkey && !value && !busy && (
                <kbd className="hidden shrink-0 rounded-md bg-[#f0f0f3] px-1.5 py-0.5 font-sans text-[11px] text-[#6e6e73] sm:inline dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
                  Cmd {hotkey.toUpperCase()}
                </kbd>
              )}
              <motion.button
                type="submit"
                layout
                transition={SPRING}
                aria-label={busy ? "Stop" : "Send"}
                disabled={!busy && !value.trim()}
                whileTap={{ scale: 0.88 }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 disabled:bg-[#e8e8ed] disabled:text-[#86868b] dark:bg-[#0a84ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e] dark:disabled:bg-[#2c2c2e] dark:disabled:text-[#8e8e93]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {busy ? (
                    <motion.span
                      key="stop"
                      className="h-3 w-3 rounded-[3px] bg-current"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={SPRING}
                    />
                  ) : (
                    <motion.svg
                      key="send"
                      viewBox="0 0 16 16"
                      className="h-4 w-4"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -14, opacity: 0 }}
                      transition={SPRING}
                      aria-hidden="true"
                    >
                      <path d="M8 13V3.5M3.5 7.5L8 3l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.form>

            <motion.div layout="position" className="flex flex-wrap items-center gap-2 px-3 pb-3 sm:px-4">
              <div role="radiogroup" aria-label="Mode" className="flex rounded-full bg-[#f0f0f3] p-0.5 dark:bg-[#2c2c2e]">
                {MODES.map((m) => {
                  const on = m.id === mode;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => {
                        touched.current = true;
                        if (m.id !== mode) play("tick", 0.5);
                        setMode(m.id);
                      }}
                      className="relative rounded-full px-3 py-1 text-[12px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
                    >
                      {on && (
                        <motion.span
                          layoutId={`${id}-mode`}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] dark:bg-[#48484a]"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                      <span className={`relative ${on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{m.label}</span>
                    </button>
                  );
                })}
              </div>
              <AnimatePresence initial={false} mode="popLayout">
                {!value &&
                  phase === "idle" &&
                  suggestions.slice(0, 3).map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { ...SPRING, delay: i * 0.04 } }}
                      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        touched.current = true;
                        play("tap");
                        onSubmit?.(s, mode);
                        run(s, mode);
                      }}
                      className="max-w-full truncate rounded-full px-3 py-1 text-[12px] text-[#1d1d1f] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#0a84ff]"
                    >
                      {s}
                    </motion.button>
                  ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </LayoutGroup>
      <p className="mt-3 text-center text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Type a prompt or tap a suggestion. Esc stops it.</p>
    </div>
  );
}

/** Alias that matches the catalog name. */
export const ForgeAiCommandBar = AiCommandBar;
