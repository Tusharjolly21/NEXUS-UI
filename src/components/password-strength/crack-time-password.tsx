"use client";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const COMMON = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "iloveyou", "monkey", "dragon", "abc123"];
const GUESSES_PER_SECOND = 1e10; // an offline attack on a fast GPU rig
const CENTURY = 3153600000;
const FOREVER = CENTURY * 1e6;
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

/** Rough brute-force estimate: alphabet size from the character classes used, halved for the average case. */
function crackSeconds(pw: string) {
  if (!pw) return 0;
  const low = pw.toLowerCase();
  if (COMMON.some((c) => low.includes(c))) return 0.001;
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33;
  // repeated characters and simple runs don't add much
  const unique = new Set(pw).size;
  const len = Math.min(pw.length, unique + Math.floor((pw.length - unique) / 3));
  return Math.pow(pool, len) / 2 / GUESSES_PER_SECOND;
}
const UNITS: [number, string][] = [[1, "second"], [60, "minute"], [3600, "hour"], [86400, "day"], [2592000, "month"], [31536000, "year"], [CENTURY, "century"]];
function human(s: number): { big: string; unit: string } {
  if (s < 1) return { big: "Instantly", unit: "" };
  if (s > FOREVER) return { big: "Forever", unit: "" };
  let u = UNITS[0];
  for (const x of UNITS) if (s >= x[0]) u = x;
  const n = s / u[0];
  const word = (k: number) => (k === 1 ? u[1] : u[1] === "century" ? "centuries" : u[1] + "s");
  if (n >= 1e6) return { big: `${Math.round(n / 1e6)} million`, unit: word(2) };
  if (n >= 1e3) return { big: `${Math.round(n / 1e3)} thousand`, unit: word(2) };
  const r = Math.round(n);
  return { big: String(r), unit: word(r) };
}
// position on a log scale from 1 second to a million centuries
const pos = (s: number) => Math.max(0, Math.min(1, Math.log10(Math.max(1, s)) / Math.log10(FOREVER)));
const MARKS = [[1, "1s"], [3600, "1h"], [31536000, "1y"], [CENTURY, "100y"], [CENTURY * 1e4, "1M y"]] as const;

/** Colour tiers. Every colour is a class so it follows the light and dark theme. */
const TIERS = [
  { label: "Weak", fill: "bg-[#ff3b30] dark:bg-[#ff453a]", edge: "border-[#ff3b30] dark:border-[#ff453a]", text: "text-[#ff3b30] dark:text-[#ff453a]" },
  { label: "Fair", fill: "bg-[#ff9f0a]", edge: "border-[#ff9f0a]", text: "text-[#ff9f0a]" },
  { label: "Good", fill: "bg-[#ffcc00] dark:bg-[#ffd60a]", edge: "border-[#ffcc00] dark:border-[#ffd60a]", text: "text-[#b38f00] dark:text-[#ffd60a]" },
  { label: "Strong", fill: "bg-[#34c759] dark:bg-[#30d158]", edge: "border-[#34c759] dark:border-[#30d158]", text: "text-[#248a3d] dark:text-[#30d158]" },
] as const;

export interface CrackTimePasswordProps {
  /** Types a few sample passwords by itself, on a loop, until someone focuses the field. Never runs under reduced motion and pauses off screen or in a hidden tab. */
  autoplay?: boolean;
  /** Called on every keystroke with the password and the estimated seconds a fast guessing rig needs to crack it. */
  onChange?: (value: string, crackSeconds: number) => void;
  /** Extra classes for the card. */
  className?: string;
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
 * A password strength meter that tells you something real: how long a fast
 * guessing rig would take to crack what you've typed. The estimate rolls as
 * you type, and a marker slides along a log scale from instant to forever,
 * shifting from red through amber to green.
 */
export function CrackTimePassword({ autoplay = false, onChange, className = "" }: CrackTimePasswordProps) {
  const id = useId();
  const reduce = useReducedMotion() ?? false;
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const touched = useRef(false);
  const card = useRef<HTMLDivElement>(null);
  const running = useAutoplayGate(card, autoplay);

  useEffect(() => {
    if (!running || touched.current) return;
    const seq = ["password1", "", "nexus", "Nexus2026", "Nexus2026!", "Nexus2026!motion"];
    const ids: number[] = [];
    let t = 0;
    const at = (fn: () => void, ms: number) => {
      ids.push(
        window.setTimeout(() => {
          if (!touched.current) fn();
        }, ms),
      );
    };
    const type = (word: string) => {
      if (!word) {
        at(() => setPw(""), t);
        t += 500;
        return;
      }
      for (let i = 1; i <= word.length; i++) {
        const v = word.slice(0, i);
        at(() => setPw(v), t);
        t += 90;
      }
      t += 1300;
    };
    const loop = () => {
      t = 600;
      seq.forEach(type);
      at(loop, t + 1800);
    };
    loop();
    return () => ids.forEach(clearTimeout);
  }, [running]);

  const s = crackSeconds(pw);
  const h = human(s);
  const p = pw ? pos(s) : 0;
  const tier = TIERS[p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.68 ? 2 : 3];
  const spring = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 160, damping: 22 } as const);

  return (
    <div
      ref={card}
      className={`w-[420px] max-w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] max-[360px]:p-4 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
    >
      <label className="block text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]" htmlFor={`${id}-field`}>
        Choose a password
      </label>
      <div className="mt-2 flex h-12 items-center rounded-[14px] bg-[#f5f5f7] pl-4 pr-1.5 focus-within:ring-2 focus-within:ring-[#0071e3] dark:bg-[#2c2c2e] dark:focus-within:ring-[#0a84ff]">
        <input
          id={`${id}-field`}
          type={show ? "text" : "password"}
          value={pw}
          onChange={(e) => {
            touched.current = true;
            setPw(e.target.value);
            onChange?.(e.target.value, crackSeconds(e.target.value));
          }}
          onFocus={() => {
            if (!touched.current) {
              touched.current = true;
              setPw("");
            }
          }}
          autoComplete="new-password"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent text-[16px] tracking-[0.02em] text-[#1d1d1f] outline-none placeholder:text-[#a1a1a6] dark:text-[#f5f5f7] dark:placeholder:text-[#8e8e93]"
          placeholder="At least 12 characters"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Hide password" : "Show password"}
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-[#6e6e73] hover:bg-black/5 dark:text-[#a1a1a6] dark:hover:bg-white/10 ${FOCUS}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            <motion.path d="M4 4l16 16" initial={false} animate={{ pathLength: show ? 0 : 1 }} transition={{ duration: reduce ? 0 : 0.25 }} />
          </svg>
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
        <div className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{pw ? "A fast guessing rig would crack it in" : "Start typing to see how long it would hold up"}</div>
        <div className="mt-1 flex h-[44px] items-baseline gap-2 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            {pw && (
              <motion.span
                key={h.big}
                className={`text-[36px] font-semibold leading-[44px] tracking-[-0.04em] max-[360px]:text-[30px] ${p < 0.25 ? "text-[#ff3b30] dark:text-[#ff453a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]"}`}
                initial={{ y: reduce ? 0 : 30, opacity: 0, filter: reduce ? "blur(0px)" : "blur(6px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: reduce ? 0 : -30, opacity: 0, filter: reduce ? "blur(0px)" : "blur(6px)" }}
                transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 380, damping: 32, filter: { duration: 0.2 } }}
              >
                {h.big}
              </motion.span>
            )}
          </AnimatePresence>
          <AnimatePresence mode="popLayout" initial={false}>
            {pw && h.unit && (
              <motion.span
                key={h.unit}
                layout={!reduce}
                className="text-[17px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {h.unit}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* log-scale track: instant on the left, forever on the right */}
      <div className="relative mt-5 h-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-[9px] h-[6px] overflow-hidden rounded-full bg-[#ececf0] dark:bg-[#3a3a3c]">
          <motion.div className={`h-full rounded-full transition-colors duration-300 ${tier.fill}`} initial={false} animate={{ width: `${p * 100}%` }} transition={spring} />
        </div>
        <motion.span
          className={`absolute top-[3px] -ml-[9px] h-[18px] w-[18px] rounded-full border-[3px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.18)] transition-colors duration-300 dark:bg-[#1c1c1e] ${pw ? tier.edge : "border-[#d2d2d7] dark:border-[#48484a]"}`}
          initial={false}
          animate={{ left: `${p * 100}%` }}
          transition={spring}
        />
        {MARKS.map(([v, t]) => (
          <span key={t} className="absolute top-[24px] -translate-x-1/2 text-[10.5px] tabular-nums text-[#86868b] dark:text-[#8e8e93]" style={{ left: `${pos(v) * 100}%` }}>
            {t}
          </span>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 text-[13px]">
        <span className={`font-semibold transition-colors duration-300 ${pw ? tier.text : ""}`}>{pw ? tier.label : ""}</span>
        <span className="text-right text-[#86868b] dark:text-[#8e8e93]">10 billion guesses a second</span>
      </div>
    </div>
  );
}
