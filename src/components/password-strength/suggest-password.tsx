"use client";
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";

// no look-alike characters (0 O o 1 l I i)
const ALPHA = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

/** Three groups of five, drawn with the browser's secure random source. Values that would skew the draw are thrown away. */
function generate() {
  const limit = 256 - (256 % ALPHA.length);
  const chars: string[] = [];
  while (chars.length < 15) {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < limit && chars.length < 15) chars.push(ALPHA[b % ALPHA.length]);
    }
  }
  return [chars.slice(0, 5), chars.slice(5, 10), chars.slice(10, 15)].map((g) => g.join("")).join("-");
}

/** What the person should do next, in plain words. */
function hint(pw: string) {
  if (!pw) return { text: "Use 12 or more characters", score: 0, key: "empty" };
  const need: string[] = [];
  if (pw.length < 12) need.push(`${12 - pw.length} more character${12 - pw.length === 1 ? "" : "s"}`);
  if (!/\d/.test(pw)) need.push("a number");
  if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw)) need.push("upper and lower case");
  const score = Math.max(0, 4 - need.length - (pw.length < 8 ? 1 : 0));
  if (!need.length) return { text: "Strong password", score: 4, key: "strong" };
  // the key ignores the running count, so only a change of advice animates
  const key = need.map((n) => (n.includes("character") ? "len" : n)).join("|");
  return { text: "Add " + (need.length > 1 ? need.slice(0, -1).join(", ") + " and " + need[need.length - 1] : need[0]), score, key };
}

const BAR = [
  "bg-[#ff3b30] dark:bg-[#ff453a]",
  "bg-[#ff3b30] dark:bg-[#ff453a]",
  "bg-[#ff9f0a]",
  "bg-[#ffcc00] dark:bg-[#ffd60a]",
  "bg-[#34c759] dark:bg-[#30d158]",
];

export interface SuggestPasswordProps {
  /** Email shown in the read-only field above the password. */
  email?: string;
  /** Plays the whole story by itself (offer, take it, choose your own, type) until someone focuses the field. Never runs under reduced motion and pauses off screen or in a hidden tab. */
  autoplay?: boolean;
  /** Called with the new password each time the person types or takes the suggestion. */
  onChange?: (password: string) => void;
  /** Called when the suggested password is taken. */
  onUse?: (password: string) => void;
  /** Called with the current password when "Create account" is pressed. Nothing is sent anywhere by the component. */
  onSubmit?: (password: string) => void;
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
 * A sign-up password field that offers to do the work. Focus it and a
 * suggested password slides up underneath; take it and the characters decode
 * into place one by one, the field turns green and labels itself. Type your
 * own instead and a single line of advice rewrites itself as you go, with a
 * bar that fills underneath.
 */
export function SuggestPassword({ email = "maya@orbitly.com", autoplay = false, onChange, onUse, onSubmit, className = "", enableSound = true }: SuggestPasswordProps) {
  const id = useId();
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const [pw, setPw] = useState("");
  const [shown, setShown] = useState("");
  const [suggested, setSuggested] = useState("");
  const [using, setUsing] = useState(false);
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const card = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const raf = useRef(0);
  const touched = useRef(false);
  const reachedTop = useRef(false);
  const suggestedRef = useRef("");
  const running = useAutoplayGate(card, autoplay);
  const callbacks = useRef({ onChange, onUse });
  const playRef = useRef(play);
  useEffect(() => {
    playRef.current = play;
  });

  useEffect(() => {
    callbacks.current = { onChange, onUse };
  }, [onChange, onUse]);
  useEffect(() => {
    const frame = raf;
    return () => cancelAnimationFrame(frame.current);
  }, []);

  /** A fresh suggestion, made on demand so the server render and the first client render match. */
  const freshSuggestion = useCallback(() => {
    const next = generate();
    suggestedRef.current = next;
    setSuggested(next);
    return next;
  }, []);
  const openOffer = useCallback(() => {
    if (!suggestedRef.current) freshSuggestion();
    setOpen(true);
  }, [freshSuggestion]);

  // scramble each character for a moment before it settles, left to right
  const decode = useCallback(
    (target: string) => {
      cancelAnimationFrame(raf.current);
      if (reduce) {
        setShown(target);
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = now - t0;
        const out = [...target].map((c, i) => (c === "-" ? "-" : t > 120 + i * 38 ? c : ALPHA[Math.floor(Math.random() * ALPHA.length)])).join("");
        setShown(out);
        if (t < 120 + target.length * 38) raf.current = requestAnimationFrame(tick);
        else setShown(target);
      };
      raf.current = requestAnimationFrame(tick);
    },
    [reduce],
  );

  const use = useCallback(() => {
    const next = suggestedRef.current || freshSuggestion();
    setUsing(true);
    setOpen(false);
    setPw(next);
    setReveal(true);
    decode(next);
    callbacks.current.onUse?.(next);
    callbacks.current.onChange?.(next);
  }, [decode, freshSuggestion]);

  const clearField = useCallback(() => {
    cancelAnimationFrame(raf.current);
    setUsing(false);
    setPw("");
    setShown("");
    setReveal(false);
    freshSuggestion();
  }, [freshSuggestion]);

  // demo: take the suggestion, then choose your own and type one
  useEffect(() => {
    if (!running || touched.current) return;
    const ids: number[] = [];
    const at = (fn: () => void, ms: number) => {
      ids.push(
        window.setTimeout(() => {
          if (!touched.current) fn();
        }, ms),
      );
    };
    const loop = () => {
      at(() => {
        setOpen(false);
        clearField();
      }, 0);
      at(openOffer, 700);
      at(() => {
        playRef.current.auto("success", 0.5);
        use();
      }, 2000);
      at(clearField, 5200);
      "Sunny7".split("").forEach((_, i) => at(() => setPw("Sunny7".slice(0, i + 1)), 5800 + i * 130));
      at(() => setPw(""), 8600);
      at(loop, 9000);
    };
    loop();
    return () => ids.forEach(clearTimeout);
  }, [running, clearField, openOffer, use]);

  const h = hint(pw);
  const spring = reduce ? { duration: 0 } : ({ type: "spring", stiffness: 420, damping: 32 } as const);

  return (
    <div
      ref={card}
      className={`w-[420px] max-w-full rounded-[28px] bg-white p-6 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] max-[360px]:p-4 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)] ${className}`}
    >
      <h3 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Create your account</h3>
      <div className="mt-4 flex h-12 items-center rounded-[14px] bg-[#f5f5f7] px-4 text-[15px] text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">
        <span className="min-w-0 truncate">{email}</span>
      </div>

      <div
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
        }}
      >
        <div
          className={`relative mt-2 flex h-12 items-center overflow-hidden rounded-[14px] pl-4 pr-1.5 transition-[background-color,box-shadow] duration-[350ms] focus-within:ring-2 focus-within:ring-[#0071e3] dark:focus-within:ring-[#0a84ff] ${
            using
              ? "bg-[#e9f9ee] shadow-[inset_0_0_0_1.5px_rgba(52,199,89,.5)] dark:bg-[#30d158]/15 dark:shadow-[inset_0_0_0_1.5px_rgba(48,209,88,.5)]"
              : "bg-[#f5f5f7] shadow-[inset_0_0_0_0px_rgba(0,0,0,0)] dark:bg-[#2c2c2e]"
          }`}
        >
          <input
            ref={input}
            type={reveal ? "text" : "password"}
            value={using ? shown : pw}
            onChange={(e) => {
              touched.current = true;
              cancelAnimationFrame(raf.current);
              // one soft chime the first time typing reaches "Strong password"; clearing the field re-arms it
              if (!e.target.value) reachedTop.current = false;
              else if (hint(e.target.value).score === 4 && !reachedTop.current) {
                reachedTop.current = true;
                play("success", 0.5);
              }
              setUsing(false);
              setPw(e.target.value);
              callbacks.current.onChange?.(e.target.value);
            }}
            onFocus={() => {
              if (!touched.current) {
                touched.current = true;
                cancelAnimationFrame(raf.current);
                setPw("");
                setShown("");
                setReveal(false);
                setUsing(false);
              }
              if (!using) openOffer();
            }}
            autoComplete="new-password"
            aria-label="Password"
            aria-describedby={`${id}-hint`}
            placeholder="Password"
            spellCheck={false}
            className={`min-w-0 flex-1 bg-transparent text-[16px] text-[#1d1d1f] outline-none placeholder:text-[#8e8e93] dark:text-[#f5f5f7] ${using ? "font-mono tracking-[0.04em]" : ""}`}
          />
          <AnimatePresence>
            {using && (
              <motion.span
                className="mr-1 flex flex-none items-center gap-1 rounded-full bg-[#34c759]/15 px-2 py-1 text-[11px] font-semibold text-[#1a7f37] dark:bg-[#30d158]/20 dark:text-[#30d158]"
                initial={{ opacity: 0, x: reduce ? 0 : 10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: reduce ? 0 : 0.5 } }}
                exit={{ opacity: 0, x: reduce ? 0 : 10 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3" /></svg>
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setReveal((r) => !r);
            }}
            aria-label={reveal ? "Hide password" : "Show password"}
            className={`flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-[#6e6e73] hover:bg-black/5 dark:text-[#a1a1a6] dark:hover:bg-white/10 ${FOCUS}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
              <motion.path d="M4 4l16 16" initial={false} animate={{ pathLength: reveal ? 0 : 1 }} transition={reduce ? { duration: 0 } : undefined} />
            </svg>
          </button>
        </div>

        {/* the offer */}
        <AnimatePresence initial={false}>
          {open && !using && (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 380, damping: 34 }}
            >
              <motion.button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  touched.current = true;
                  reachedTop.current = true;
                  play("success", 0.5);
                  use();
                  // a keyboard press leaves focus on a button that is about to unmount, so hand it back to the field
                  if (e.detail === 0) input.current?.focus();
                }}
                className={`mt-2 flex w-full items-center gap-3 rounded-[14px] bg-white p-3 text-left shadow-[0_8px_24px_-12px_rgba(0,0,0,.3),0_0_0_1px_rgba(0,0,0,.06)] hover:bg-[#fafafa] dark:bg-[#2c2c2e] dark:shadow-[0_8px_24px_-12px_rgba(0,0,0,.8),0_0_0_1px_rgba(255,255,255,.1)] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
                initial={{ y: reduce ? 0 : -8 }}
                animate={{ y: 0 }}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M17 6l3 3" /></svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Use suggested password</span>
                  <span className="block truncate font-mono text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{suggested}</span>
                </span>
                <span className="text-[13px] font-semibold text-[#0071e3] dark:text-[#0a84ff]">Use</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <span className="sr-only" aria-live="polite">
        {using ? "Suggested password filled in. Strong password." : h.text}
      </span>

      {/* live advice or the generated-password actions */}
      <div className="mt-3 min-h-[44px]">
        <AnimatePresence mode="wait" initial={false}>
          {using ? (
            <motion.div key="using" className="flex items-center justify-between gap-3 text-[13px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <span className="text-[#1a7f37] dark:text-[#30d158]">Strong password, saved for this site</span>
              <button
                type="button"
                onClick={() => {
                  touched.current = true;
                  reachedTop.current = false;
                  clearField();
                  input.current?.focus();
                }}
                className={`flex-none rounded font-medium text-[#0071e3] hover:underline dark:text-[#0a84ff] ${FOCUS}`}
              >
                Choose my own
              </button>
            </motion.div>
          ) : (
            <motion.div key="advice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="h-1 overflow-hidden rounded-full bg-[#ececf0] dark:bg-[#3a3a3c]">
                <motion.div
                  className={`h-full rounded-full transition-colors duration-300 ${BAR[h.score]}`}
                  animate={{ width: `${(pw ? Math.max(0.08, h.score / 4) : 0) * 100}%` }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 24 }}
                />
              </div>
              <div id={`${id}-hint`} className="relative mt-2 h-5 overflow-hidden text-[13px] max-[420px]:h-[34px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={h.key}
                    className={`absolute inset-x-0 top-0 ${h.score === 4 ? "font-medium text-[#1a7f37] dark:text-[#30d158]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}
                    initial={{ y: reduce ? 0 : 14, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: reduce ? 0 : -12, opacity: 0, transition: { duration: 0.12 } }}
                    transition={spring}
                  >
                    {h.text}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={() => onSubmit?.(pw)}
        className={`mt-2 h-11 w-full rounded-full bg-[#0071e3] text-[15px] font-medium text-white dark:bg-[#0a84ff] ${FOCUS}`}
      >
        Create account
      </button>
    </div>
  );
}
