"use client";

import * as React from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import { AppleIcon, GithubIcon, GoogleIcon } from "./brand-icons";

export type SubmitState = "idle" | "loading" | "success";
export type SocialProvider = "github" | "apple" | "google";

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";
export const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

/** Card shell shared by the signup and login forms. */
export const cardClass =
  "w-full max-w-md rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]";

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-[18px]" aria-hidden>
      <path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z" />
      <circle cx="10" cy="10" r="2.2" />
      <motion.path d="M4 16 16 4" initial={false} animate={{ pathLength: open ? 0 : 1, opacity: open ? 0 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
    </svg>
  );
}

export type FloatFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  disabled?: boolean;
  /** Error text under the field. */
  error?: string | null;
  /** Increment to shake the field. */
  shake?: number;
  /** Small text under the field when there is no error. */
  hint?: React.ReactNode;
  /** Shows a check at the end of the field. */
  valid?: boolean;
};

/**
 * Text field whose label sits inside it and springs up into a caption when
 * the field is focused or filled. Errors slide in under it, with a shake.
 */
export function FloatField({ id, label, value, onChange, type = "text", autoComplete, disabled, error, shake = 0, hint, valid }: FloatFieldProps) {
  const still = useReducedMotion() === true;
  const [focused, setFocused] = React.useState(false);
  const [reveal, setReveal] = React.useState(false);
  const x = useMotionValue(0);
  const up = focused || value.length > 0;
  const isPassword = type === "password";

  React.useEffect(() => {
    if (shake === 0 || still) return;
    const run = animate(x, [0, -8, 7, -5, 3, 0], { duration: 0.42 });
    return () => run.stop();
  }, [shake, still, x]);

  return (
    <div>
      <motion.div
        style={{ x }}
        className={`relative flex h-[52px] items-center rounded-[14px] bg-[#f5f5f7] ring-1 transition-[box-shadow,background-color] dark:bg-[#2c2c2e] ${
          error
            ? "ring-2 ring-[#ff3b30]"
            : "ring-black/[.04] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071e3] dark:ring-white/[.06] dark:focus-within:bg-[#2c2c2e] dark:focus-within:ring-[#0a84ff]"
        }`}
      >
        <motion.label
          htmlFor={id}
          className={`pointer-events-none absolute left-3.5 top-1/2 origin-left whitespace-nowrap text-[15px] ${error ? "text-[#d70015] dark:text-[#ff6961]" : soft}`}
          initial={false}
          animate={{ y: up ? -19 : -10.5, scale: up ? 0.76 : 1 }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 30 }}
        >
          {label}
        </motion.label>
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          value={value}
          autoComplete={autoComplete}
          inputMode={type === "email" ? "email" : undefined}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-note` : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className={`h-full min-w-0 flex-1 rounded-[14px] bg-transparent px-3.5 pb-1.5 pt-5 text-[15px] outline-none disabled:opacity-60 ${ink}`}
        />
        <AnimatePresence>
          {valid && !isPassword && (
            <motion.span
              key="ok"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 16 }}
              className="mr-3.5 flex size-5 items-center justify-center rounded-full bg-[#30d158] text-white"
              aria-hidden
            >
              <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={reveal}
            className={`mr-2 rounded-lg p-1.5 ${soft} hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] ${focusRing}`}
          >
            <EyeIcon open={!reveal} />
          </button>
        )}
      </motion.div>
      <AnimatePresence initial={false} mode="popLayout">
        {error ? (
          <motion.p
            key="err"
            id={`${id}-note`}
            role="alert"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="px-1 pt-1.5 text-[12.5px] text-[#d70015] dark:text-[#ff6961]"
          >
            {error}
          </motion.p>
        ) : hint ? (
          <motion.div key="hint" id={`${id}-note`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`px-1 pt-1.5 text-[12.5px] ${soft}`}>
            {hint}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** A requirement that lights green with a pop once it's met. */
export function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  const still = useReducedMotion() === true;
  return (
    <span className={`inline-flex items-center gap-1.5 ${ok ? "text-[#248a3d] dark:text-[#30d158]" : ""}`}>
      <motion.span
        className="flex size-3.5 items-center justify-center rounded-full"
        initial={false}
        animate={{ backgroundColor: ok ? "#30d158" : "rgba(134,134,139,.25)", scale: ok && !still ? [1, 1.3, 1] : 1 }}
        transition={{ duration: 0.35 }}
        aria-hidden
      >
        <svg viewBox="0 0 16 16" className="size-2.5" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={false} animate={{ pathLength: ok ? 1 : 0 }} transition={{ duration: 0.25 }} />
        </svg>
      </motion.span>
      {children}
      <span className="sr-only">{ok ? " (met)" : " (not met)"}</span>
    </span>
  );
}

/**
 * The submit button. Loading squeezes the pill into a spinning circle, success
 * swells it back out in green with a drawn check: one layout spring each way.
 */
export function SubmitMorph({ state, label, loadingLabel, successLabel }: { state: SubmitState; label: string; loadingLabel: string; successLabel: string }) {
  const still = useReducedMotion() === true;
  const spring = still ? { duration: 0 } : ({ type: "spring", stiffness: 420, damping: 26 } as const);
  return (
    <div className="flex justify-center">
      <motion.button
        type="submit"
        layout
        transition={spring}
        disabled={state !== "idle"}
        aria-label={state === "loading" ? loadingLabel : state === "success" ? successLabel : undefined}
        whileTap={still || state !== "idle" ? undefined : { scale: 0.97 }}
        className={`relative flex h-12 items-center justify-center gap-2 overflow-hidden text-[15px] font-semibold text-white ${focusRing} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e] ${
          state === "loading" ? "w-12" : "w-full"
        } ${state === "success" ? "bg-[#30d158] shadow-[0_10px_24px_-12px_rgba(48,209,88,.9)]" : "bg-[#0071e3] shadow-[0_10px_24px_-12px_rgba(0,113,227,.9)] hover:bg-[#0077ed] dark:bg-[#0a84ff]"}`}
        style={{ borderRadius: 999 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "loading" ? (
            <motion.svg
              key="spin"
              layout="position"
              viewBox="0 0 24 24"
              className="size-5"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1, rotate: still ? 0 : 360 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ rotate: { duration: 0.8, repeat: Infinity, ease: "linear" }, default: spring }}
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="2.6" />
              <path d="M12 3a9 9 0 0 1 9 9" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
            </motion.svg>
          ) : state === "success" ? (
            <motion.span key="ok" layout="position" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring}>
              <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
              </svg>
              {successLabel}
            </motion.span>
          ) : (
            <motion.span key="idle" layout="position" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

/** GitHub, Apple and Google buttons in a row. */
export function SocialRow({ disabled, onSocialLogin, verb = "Continue" }: { disabled?: boolean; onSocialLogin?: (p: SocialProvider) => void; verb?: string }) {
  const btn = `flex h-11 flex-1 items-center justify-center gap-2 rounded-[12px] bg-white text-[13.5px] font-medium ring-1 ring-black/[.08] transition-colors hover:bg-[#f5f5f7] disabled:opacity-60 dark:bg-[#2c2c2e] dark:ring-white/10 dark:hover:bg-[#3a3a3c] ${ink} ${focusRing}`;
  const items: { p: SocialProvider; name: string; icon: React.ReactNode }[] = [
    { p: "github", name: "GitHub", icon: <GithubIcon className="size-[18px]" /> },
    { p: "apple", name: "Apple", icon: <AppleIcon className="size-[18px]" /> },
    { p: "google", name: "Google", icon: <GoogleIcon className="size-[18px]" /> },
  ];
  return (
    <div className="flex gap-2">
      {items.map((it) => (
        <motion.button
          key={it.p}
          type="button"
          disabled={disabled}
          onClick={() => onSocialLogin?.(it.p)}
          whileTap={{ scale: 0.96 }}
          aria-label={`${verb} with ${it.name}`}
          className={btn}
        >
          {it.icon}
          <span className="hidden min-[400px]:inline">{it.name}</span>
        </motion.button>
      ))}
    </div>
  );
}

export function Divider({ children = "or" }: { children?: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-3 text-[12px] ${soft}`} aria-hidden>
      <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
      {children}
      <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
    </div>
  );
}

/** Runs `steps` (delay in ms, action) on a loop until `stopped()` is true. Returns a cleanup. */
export function playScript(steps: [number, () => void][], stopped: () => boolean) {
  const timers: ReturnType<typeof setTimeout>[] = [];
  const run = () => {
    let t = 0;
    for (const [ms, f] of steps) {
      t += ms;
      timers.push(
        setTimeout(() => {
          if (!stopped()) f();
        }, t),
      );
    }
    timers.push(
      setTimeout(() => {
        if (!stopped()) run();
      }, t + 600),
    );
  };
  run();
  return () => timers.forEach(clearTimeout);
}

/** Steps that type `text` into a field one character at a time. */
export function typeSteps(text: string, set: (v: string) => void, every = 55): [number, () => void][] {
  return Array.from(text, (_, i) => [every, () => set(text.slice(0, i + 1))] as [number, () => void]);
}
