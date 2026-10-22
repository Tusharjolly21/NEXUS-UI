"use client";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export interface SelectCopyField {
  /** Small heading above the field. */
  label: string;
  /** The text that is shown, selected and copied. */
  value: string;
  /** Shows the value in a monospace face. Defaults to true. */
  mono?: boolean;
  /** A muted prefix in front of the value, such as "$". Never copied. */
  prefix?: string;
}

export interface SelectCopyProps {
  /** The fields to render, one row each. Defaults to a share link and an install command. */
  fields?: SelectCopyField[];
  /** Called with the copied value after a real press. The autoplay demo never calls it. */
  onCopy?: (value: string) => void;
  /** Runs a visual-only copy on each field in turn until someone presses or types in the card. Never touches the clipboard. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
  enableSound?: boolean;
  /** Extra classes for the card. */
  className?: string;
}

const DEFAULT_FIELDS: SelectCopyField[] = [
  { label: "Share link", value: "nexus-ui.com/s/8fK2-motion-kit", mono: false },
  { label: "Install", value: "npm i @nexus/motion", prefix: "$" },
];
/** First demo copy per field, in ms. The second row starts later so the two alternate. */
const AUTO_DELAYS = [900, 3500];
const AUTO_EVERY = 5200;
const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* clipboard unavailable, nothing else to do */
    }
    ta.remove();
  }
}

/** True while an autoplay demo may run: enabled, on screen, tab visible, motion allowed. */
function useAutoplayGate(ref: RefObject<HTMLElement | null>, enabled: boolean, reduce: boolean) {
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ref, enabled]);
  return enabled && !reduce && inView && tabVisible;
}

type CopyState = "idle" | "selecting" | "copied";

function CopyField({
  field,
  reduce,
  playing,
  autoDelay,
  onReal,
  enableSound,
}: {
  field: SelectCopyField;
  reduce: boolean;
  playing: boolean;
  autoDelay: number;
  onReal: (value: string) => void;
  enableSound: boolean;
}) {
  const sfx = useSound(enableSound);
  const { label, value, mono = true, prefix } = field;
  const [state, setState] = useState<CopyState>("idle");
  // Only real presses are announced to screen readers, never the demo loop.
  const [announce, setAnnounce] = useState(false);
  const timers = useRef<number[]>([]);
  const clear = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);
  useEffect(() => clear, [clear]);

  // Plays the sweep, the lift-off and the check. The clipboard is handled by the caller.
  const play = useCallback(() => {
    clear();
    setState("selecting");
    timers.current.push(window.setTimeout(() => setState("copied"), reduce ? 0 : 380));
    timers.current.push(window.setTimeout(() => setState("idle"), 2200));
  }, [clear, reduce]);

  const press = () => {
    void writeClipboard(value);
    sfx("success", 0.6);
    onReal(value);
    setAnnounce(true);
    play();
  };

  // The demo loop only plays the animation; it never touches the clipboard.
  useEffect(() => {
    if (!playing) return;
    const demo = () => {
      setAnnounce(false);
      play();
    };
    const first = window.setTimeout(demo, autoDelay);
    const id = window.setInterval(demo, AUTO_EVERY);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [playing, autoDelay, play]);

  const sel = state !== "idle";
  const copied = state === "copied";
  const monoCls = mono ? "font-mono" : "";
  return (
    <div>
      <div className="mb-1.5 text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">{label}</div>
      <div className="flex h-12 items-center gap-2 rounded-[14px] bg-[#f5f5f7] pl-4 pr-1.5 dark:bg-[#2c2c2e]">
        {prefix && (
          <span className="flex-none font-mono text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
            {prefix}
          </span>
        )}
        <span className="relative min-w-0 flex-1 overflow-hidden">
          <span className={cn("relative inline-block max-w-full truncate align-middle text-[14.5px] text-[#1d1d1f] dark:text-[#f5f5f7]", monoCls)}>
            {/* the selection, swept left to right like a real drag-select */}
            <motion.span
              className="absolute inset-y-[-2px] left-[-2px] right-[-2px] origin-left rounded-[4px] bg-[#b3d7ff] dark:bg-[#0a84ff]/45"
              initial={false}
              animate={{ scaleX: sel ? 1 : 0, opacity: copied ? [1, 1, 0] : sel ? 1 : 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { scaleX: { duration: 0.34, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: copied ? 1.6 : 0.2, times: [0, 0.6, 1] } }
              }
              aria-hidden="true"
            />
            <span className="relative">{value}</span>
          </span>
          {/* a faint copy lifts off as it goes to the clipboard */}
          <AnimatePresence>
            {copied && !reduce && (
              <motion.span
                className={cn("pointer-events-none absolute inset-0 truncate text-[14.5px] text-[#0071e3] dark:text-[#0a84ff]", monoCls)}
                initial={{ y: 0, opacity: 0.7, scale: 1 }}
                animate={{ y: -18, opacity: 0, scale: 0.94 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                aria-hidden="true"
              >
                {value}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
        <motion.button
          type="button"
          onClick={press}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          aria-label={`Copy ${label.toLowerCase()}`}
          className={cn(
            "relative flex h-9 flex-none items-center gap-1.5 overflow-hidden rounded-[10px] px-3 text-[13px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none transition-colors duration-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
            copied
              ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              : "bg-white text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]",
            FOCUS,
          )}
        >
          <span className="relative h-4 w-4" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              {copied ? (
                <motion.svg key="ok" width="16" height="16" viewBox="0 0 24 24" className="absolute inset-0" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={reduce ? { duration: 0 } : undefined}>
                  <motion.path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduce ? 0 : 0.25 }} />
                </motion.svg>
              ) : (
                <motion.svg key="cp" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute inset-0" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={reduce ? { duration: 0 } : undefined}>
                  <rect x="8" y="8" width="12" height="12" rx="3" />
                  <path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
          <span className="relative block h-[18px] w-[46px] overflow-hidden text-left" aria-hidden="true">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={copied ? "c" : "n"}
                className="block leading-[18px]"
                initial={{ y: reduce ? 0 : 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: reduce ? 0 : -14, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
              >
                {copied ? "Copied" : "Copy"}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>
        <span className="sr-only" role="status" aria-live="polite">
          {copied && announce ? `${label} copied` : ""}
        </span>
      </div>
    </div>
  );
}

/**
 * Copy that shows you what was copied. Press the button and the text gets
 * selected with a sweep, exactly like dragging across it, a faint copy lifts
 * away toward the clipboard, and the button flips to a drawn check. Works for
 * share links, install commands, anything in a field.
 */
export function SelectCopy({ fields = DEFAULT_FIELDS, onCopy, autoplay = false, enableSound = true, className }: SelectCopyProps) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [touched, setTouched] = useState(false);
  const gate = useAutoplayGate(ref, autoplay, reduce);
  const playing = gate && !touched;
  return (
    <div
      ref={ref}
      onPointerDown={() => setTouched(true)}
      onKeyDown={() => setTouched(true)}
      className={cn(
        "flex w-[440px] max-w-full flex-col gap-5 rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] sm:p-6 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.8)]",
        className,
      )}
    >
      {fields.map((f, i) => (
        <CopyField
          key={`${f.label}-${i}`}
          field={f}
          reduce={reduce}
          playing={playing}
          autoDelay={AUTO_DELAYS[i] ?? AUTO_DELAYS[AUTO_DELAYS.length - 1] + (i - AUTO_DELAYS.length + 1) * 2600}
          onReal={(v) => onCopy?.(v)}
          enableSound={enableSound}
        />
      ))}
    </div>
  );
}
