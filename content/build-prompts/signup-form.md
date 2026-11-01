Add the "Signup Form" component from Nexus UI to my project.

A signup card with floating labels that spring up as you type, password rules that tick green as they are met, and inline errors that shake the field that needs fixing. Submitting squeezes the button into a spinner and swells it back out in green; a matching LoginForm ships alongside it.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` and `@/lib/typing-sound` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create them at lib/ from the files below.
5. Use it like this: `import { SignupForm, LoginForm } from "@/components/signup-form";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/signup-form/brand-icons.tsx ---

```tsx
import type { SVGProps } from "react";

/**
 * Brand marks drawn inline. lucide-react 1.x dropped its brand icons (Github, Linkedin…), so
 * the forms ship their own instead of depending on a lucide version.
 */
export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

export function AppleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.37 1.43c.1 1.2-.34 2.4-1.08 3.25-.78.87-2.03 1.52-3.19 1.44-.14-1.15.35-2.34 1.1-3.15.8-.88 2.13-1.52 3.17-1.54Zm4.24 16.39c-.56 1.28-.84 1.84-1.56 2.98-1.01 1.58-2.43 3.56-4.19 3.57-1.57.02-1.98-1.03-4.1-1.02-2.12.01-2.57 1.04-4.14 1-1.76-.02-3.1-1.8-4.11-3.38-2.82-4.38-3.11-9.53-1.38-12.16 1.23-1.86 3.16-2.96 4.97-2.96 1.85 0 3.01 1.02 4.53 1.02 1.48 0 2.38-1.02 4.52-1.02 1.61 0 3.31.88 4.54 2.4-3.98 2.18-3.34 8.1.92 9.57Z" />
    </svg>
  );
}
```

--- components/signup-form/form-parts.tsx ---

```tsx
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
```

--- components/signup-form/index.ts ---

```ts
export type { SignupFormProps, SignupFormValues } from "./signup-form";
export { SignupForm } from "./signup-form";
export type { LoginFormProps, LoginFormValues } from "./login-form";
export { LoginForm } from "./login-form";
```

--- components/signup-form/login-form.tsx ---

```tsx
"use client";

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import { motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { Divider, FloatField, SocialRow, SubmitMorph, cardClass, focusRing, playScript, typeSteps, type SubmitState } from "./form-parts";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormProps = {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  className?: string;
  defaultValues?: Partial<LoginFormValues>;
  /** Called after validation passes. Return a promise to show the loading state; throw (an Error's message is shown) to return to the form. Without it the form simulates success. */
  onSubmit?: (values: LoginFormValues) => Promise<void> | void;
  onForgotPassword?: () => void;
  showSocialLogins?: boolean;
  onSocialLogin?: (provider: "github" | "apple" | "google") => void;
  /** Shows "New here? Create an account" when set. */
  onSignUp?: () => void;
  /** Types a demo sign-in and plays it through until someone touches the form. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The login sibling of SignupForm: floating labels, an inline error that
 * shakes the field, and the same squeeze-to-spinner, swell-to-green submit.
 */
export function LoginForm({
  title = "Welcome back",
  subtitle = "Sign in to your account to continue.",
  submitLabel = "Sign in",
  loadingLabel = "Signing in...",
  successLabel = "Signed in",
  className = "",
  defaultValues,
  onSubmit,
  onForgotPassword,
  showSocialLogins = true,
  onSocialLogin,
  onSignUp,
  autoplay = false,
  enableSound = true,
}: LoginFormProps) {
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);
  const id = React.useId().replace(/:/g, "");
  const [values, setValues] = React.useState<LoginFormValues>({ email: defaultValues?.email ?? "", password: defaultValues?.password ?? "" });
  useTypedText(values.email, enableSound);
  useTypedText(values.password, enableSound);
  const [errors, setErrors] = React.useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [shakes, setShakes] = React.useState<Partial<Record<keyof LoginFormValues, number>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<SubmitState>("idle");
  const touched = React.useRef(false);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const set = (key: keyof LoginFormValues) => (next: string) => {
    touched.current = true;
    setValues((prev) => ({ ...prev, [key]: next }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    setFormError(null);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    touched.current = true;
    if (state !== "idle") return;
    play("tap");
    const found: Partial<Record<keyof LoginFormValues, string>> = {};
    if (!EMAIL.test(values.email.trim())) found.email = "Enter a valid email address.";
    if (values.password.length < 6) found.password = "Password must be at least 6 characters.";
    setErrors(found);
    const bad = Object.keys(found) as (keyof LoginFormValues)[];
    if (bad.length) {
      setTimeout(() => play("error"), 110);
      setShakes((s) => Object.fromEntries([...Object.entries(s), ...bad.map((k) => [k, (s[k] ?? 0) + 1])]));
      document.getElementById(`${id}-${bad[0]}`)?.focus();
      return;
    }
    try {
      setState("loading");
      if (onSubmit) await onSubmit({ email: values.email.trim(), password: values.password });
      else await new Promise<void>((r) => setTimeout(r, 1000));
      if (alive.current) {
        play("success");
        setState("success");
      }
    } catch (err) {
      if (!alive.current) return;
      play("error");
      setState("idle");
      setFormError(err instanceof Error && err.message ? err.message : "Unable to sign in. Please check your details.");
      setShakes((s) => ({ ...s, password: (s.password ?? 0) + 1 }));
    }
  }

  React.useEffect(() => {
    if (!autoplay) return;
    const put = (k: keyof LoginFormValues) => (v: string) => setValues((p) => ({ ...p, [k]: v }));
    return playScript(
      [
        [600, () => {}],
        ...typeSteps("ada@northwind.co", put("email"), 50),
        [250, () => {}],
        ...typeSteps("orbit-2026", put("password"), 70),
        [450, () => {
          playRef.current.auto("tap");
          setState("loading");
        }],
        [1100, () => {
          playRef.current.auto("success");
          setState("success");
        }],
        [2200, () => {
          setState("idle");
          setValues({ email: "", password: "" });
        }],
      ],
      () => touched.current,
    );
  }, [autoplay]);

  const busy = state !== "idle";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      onPointerDown={() => {
        touched.current = true;
      }}
      initial={still ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`${cardClass} ${className}`}
    >
      {(title || subtitle) && (
        <div>
          {title && <h3 className={`text-[22px] font-semibold leading-tight tracking-[-0.035em] ${ink}`}>{title}</h3>}
          {subtitle && <p className={`mt-1 text-[14px] leading-relaxed ${soft}`}>{subtitle}</p>}
        </div>
      )}

      <div className={`${title || subtitle ? "mt-5" : ""} space-y-2.5`}>
        <FloatField id={`${id}-email`} label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} disabled={busy} error={errors.email} shake={shakes.email} valid={EMAIL.test(values.email.trim())} />
        <FloatField id={`${id}-password`} label="Password" type="password" autoComplete="current-password" value={values.password} onChange={set("password")} disabled={busy} error={errors.password} shake={shakes.password} />
      </div>
      {onForgotPassword && (
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={onForgotPassword} className={`rounded text-[13px] font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focusRing}`}>
            Forgot password?
          </button>
        </div>
      )}

      <div className="mt-4">
        <SubmitMorph state={state} label={submitLabel} loadingLabel={loadingLabel} successLabel={successLabel} />
      </div>

      {showSocialLogins && (
        <div className="mt-4 space-y-4">
          <Divider />
          <SocialRow disabled={busy} onSocialLogin={onSocialLogin} />
        </div>
      )}

      <p className={`mt-3 min-h-[18px] text-center text-[13px] ${formError ? "text-[#d70015] dark:text-[#ff6961]" : soft}`} role={formError ? "alert" : "status"} aria-live="polite">
        {formError ??
          (onSignUp ? (
            <>
              New here?{" "}
              <button type="button" onClick={onSignUp} className={`rounded font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focusRing}`}>
                Create an account
              </button>
            </>
          ) : null)}
      </p>
    </motion.form>
  );
}
```

--- components/signup-form/signup-form.tsx ---

```tsx
"use client";

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import { motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { Divider, FloatField, Rule, SocialRow, SubmitMorph, cardClass, focusRing, playScript, typeSteps, type SubmitState } from "./form-parts";

export type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupFormProps = {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  className?: string;
  showNameField?: boolean;
  showConfirmPasswordField?: boolean;
  minPasswordLength?: number;
  defaultValues?: Partial<SignupFormValues>;
  /** Called after validation passes. Return a promise to show the loading state; throw (an Error's message is shown) to return to the form. Without it the form simulates success. */
  onSubmit?: (values: SignupFormValues) => Promise<void> | void;
  showSocialLogins?: boolean;
  onSocialLogin?: (provider: "github" | "apple" | "google") => void;
  /** Shows "Already have an account? Sign in" when set. */
  onSignIn?: () => void;
  /** Types a demo signup and plays it through until someone touches the form. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

type Errors = Partial<Record<keyof SignupFormValues, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = { firstName: "Mei", lastName: "Tanaka", email: "mei@studio.dev", password: "Kite-flying-42", confirmPassword: "Kite-flying-42" };

/**
 * A signup card with floating labels that spring up as you type, rules that
 * tick green as the password meets them, and inline errors that shake the
 * field that needs fixing. Submitting squeezes the button into a spinner and
 * swells it back out, green, when the account is made.
 */
export function SignupForm({
  title = "Create your account",
  subtitle = "Start building polished interfaces with motion-first components.",
  submitLabel = "Create account",
  loadingLabel = "Creating account...",
  successLabel = "Account created",
  className = "",
  showNameField = true,
  showConfirmPasswordField = true,
  minPasswordLength = 8,
  defaultValues,
  onSubmit,
  showSocialLogins = true,
  onSocialLogin,
  onSignIn,
  autoplay = false,
  enableSound = true,
}: SignupFormProps) {
  const still = useReducedMotion() === true;
  const play = useSound(enableSound);
  const id = React.useId().replace(/:/g, "");
  const empty: SignupFormValues = {
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    email: defaultValues?.email ?? "",
    password: defaultValues?.password ?? "",
    confirmPassword: defaultValues?.confirmPassword ?? "",
  };
  const [values, setValues] = React.useState<SignupFormValues>(empty);
  useTypedText(values.firstName, enableSound);
  useTypedText(values.lastName, enableSound);
  useTypedText(values.email, enableSound);
  useTypedText(values.password, enableSound);
  useTypedText(values.confirmPassword, enableSound);
  const [errors, setErrors] = React.useState<Errors>({});
  const [shakes, setShakes] = React.useState<Partial<Record<keyof SignupFormValues, number>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<SubmitState>("idle");
  const touched = React.useRef(false);
  const playRef = React.useRef(play);
  React.useEffect(() => {
    playRef.current = play;
  });
  const alive = React.useRef(true);
  const min = Math.max(6, minPasswordLength);

  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const set = (key: keyof SignupFormValues) => (next: string) => {
    touched.current = true;
    if (key === "password") {
      // a very quiet tick when typing turns another password rule green
      const met = (p: string) => Number(p.length >= min) + Number(/[A-Za-z]/.test(p) && /\d/.test(p));
      if (met(next) > met(values.password)) play("tick", 0.25);
    }
    setValues((prev) => ({ ...prev, [key]: next }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
    setFormError(null);
  };

  function validate(v: SignupFormValues): Errors {
    const e: Errors = {};
    if (showNameField && v.firstName.trim().length < 2) e.firstName = "Enter your first name.";
    if (showNameField && v.lastName.trim().length < 2) e.lastName = "Enter your last name.";
    if (!EMAIL.test(v.email.trim())) e.email = "Enter a valid email address.";
    if (v.password.length < min) e.password = `Use at least ${min} characters.`;
    if (showConfirmPasswordField && v.confirmPassword !== v.password) e.confirmPassword = "Passwords don't match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    touched.current = true;
    if (state !== "idle") return;
    play("tap");
    const next: SignupFormValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
    };
    const found = validate(next);
    setErrors(found);
    const bad = Object.keys(found) as (keyof SignupFormValues)[];
    if (bad.length) {
      setTimeout(() => play("error"), 110);
      setShakes((s) => Object.fromEntries([...Object.entries(s), ...bad.map((k) => [k, (s[k] ?? 0) + 1])]));
      document.getElementById(`${id}-${bad[0]}`)?.focus();
      return;
    }
    try {
      setState("loading");
      if (onSubmit) await onSubmit(next);
      else await new Promise<void>((r) => setTimeout(r, 1100));
      if (alive.current) {
        play("success");
        setState("success");
      }
    } catch (err) {
      if (!alive.current) return;
      play("error");
      setState("idle");
      setFormError(err instanceof Error && err.message ? err.message : "Unable to create account. Please try again.");
    }
  }

  React.useEffect(() => {
    if (!autoplay) return;
    const put = (k: keyof SignupFormValues) => (v: string) => setValues((p) => ({ ...p, [k]: v }));
    // the same very quiet tick as typing it: when a password rule turns green
    const met = (p: string) => Number(p.length >= min) + Number(/[A-Za-z]/.test(p) && /\d/.test(p));
    let typedPw = "";
    const putPassword = (v: string) => {
      if (met(v) > met(typedPw)) playRef.current.auto("tick", 0.25);
      typedPw = v;
      put("password")(v);
    };
    const steps: [number, () => void][] = [
      [600, () => {}],
      ...(showNameField ? [...typeSteps(DEMO.firstName, put("firstName"), 70), [200, () => {}] as [number, () => void], ...typeSteps(DEMO.lastName, put("lastName"), 60)] : []),
      [250, () => {}],
      ...typeSteps(DEMO.email, put("email"), 45),
      [250, () => {}],
      ...typeSteps(DEMO.password, putPassword, 65),
      ...(showConfirmPasswordField ? [[250, () => {}] as [number, () => void], ...typeSteps(DEMO.confirmPassword, put("confirmPassword"), 30)] : []),
      [450, () => {
        playRef.current.auto("tap");
        setState("loading");
      }],
      [1200, () => {
        playRef.current.auto("success");
        setState("success");
      }],
      [2400, () => {
        typedPw = "";
        setState("idle");
        setValues({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
      }],
    ];
    return playScript(steps, () => touched.current);
  }, [autoplay, showNameField, showConfirmPasswordField, min]);

  const busy = state !== "idle";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";

  return (
    <motion.form
      noValidate
      onSubmit={handleSubmit}
      onPointerDown={() => {
        touched.current = true;
      }}
      initial={still ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={`${cardClass} ${className}`}
    >
      <div>
        <h3 className={`text-[22px] font-semibold leading-tight tracking-[-0.035em] ${ink}`}>{title}</h3>
        {subtitle && <p className={`mt-1 text-[14px] leading-relaxed ${soft}`}>{subtitle}</p>}
      </div>

      {showSocialLogins && (
        <div className="mt-5 space-y-4">
          <SocialRow disabled={busy} onSocialLogin={onSocialLogin} verb="Sign up" />
          <Divider>or with email</Divider>
        </div>
      )}

      <div className={`${showSocialLogins ? "mt-4" : "mt-5"} space-y-2.5`}>
        {showNameField && (
          <div className="grid grid-cols-2 gap-2.5">
            <FloatField id={`${id}-firstName`} label="First name" autoComplete="given-name" value={values.firstName} onChange={set("firstName")} disabled={busy} error={errors.firstName} shake={shakes.firstName} />
            <FloatField id={`${id}-lastName`} label="Last name" autoComplete="family-name" value={values.lastName} onChange={set("lastName")} disabled={busy} error={errors.lastName} shake={shakes.lastName} />
          </div>
        )}
        <FloatField
          id={`${id}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set("email")}
          disabled={busy}
          error={errors.email}
          shake={shakes.email}
          valid={EMAIL.test(values.email.trim())}
        />
        <FloatField
          id={`${id}-password`}
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          disabled={busy}
          error={errors.password}
          shake={shakes.password}
          hint={
            <span className="flex flex-wrap gap-x-3 gap-y-1">
              <Rule ok={values.password.length >= min}>{min}+ characters</Rule>
              <Rule ok={/[A-Za-z]/.test(values.password) && /\d/.test(values.password)}>A letter and a number</Rule>
            </span>
          }
        />
        {showConfirmPasswordField && (
          <FloatField
            id={`${id}-confirmPassword`}
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={set("confirmPassword")}
            disabled={busy}
            error={errors.confirmPassword}
            shake={shakes.confirmPassword}
          />
        )}
      </div>

      <div className="mt-5">
        <SubmitMorph state={state} label={submitLabel} loadingLabel={loadingLabel} successLabel={successLabel} />
      </div>

      <p className={`mt-3 min-h-[18px] text-center text-[13px] ${formError ? "text-[#d70015] dark:text-[#ff6961]" : soft}`} role={formError ? "alert" : "status"} aria-live="polite">
        {formError ??
          (state === "success" ? (
            "Check your inbox to confirm your email."
          ) : onSignIn ? (
            <>
              Already have an account?{" "}
              <button type="button" onClick={onSignIn} className={`rounded font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focusRing}`}>
                Sign in
              </button>
            </>
          ) : null)}
      </p>
    </motion.form>
  );
}
```

--- components/signup-form.tsx ---

```tsx
/** Re-export shim: some bundlers resolve `@/components/signup-form` to this file before the directory. */
export type { SignupFormProps, SignupFormValues } from "./signup-form/signup-form";
export { SignupForm } from "./signup-form/signup-form";
export type { LoginFormProps, LoginFormValues } from "./signup-form/login-form";
export { LoginForm } from "./signup-form/login-form";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```

--- lib/typing-sound.ts ---

```ts
import * as React from "react";
import { getSoundsEnabled, setSoundsEnabled, useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

/**
 * Typing sound. One recorded key click per character, played in the same frame the character
 * appears, for every component that types by itself (typewriters, terminals, chat answers). The
 * clicks come from one OGG sprite (public/sounds/sound.ogg) and its timing map
 * (public/sounds/sprite-config.json); without them a short synthesised click plays instead.
 *
 *   const typing = useTypingSound();
 *   typing.type(char);       // a character landed
 *   typing.backspace();      // a character was removed
 *
 * It follows the site-wide sound switch and has a switch of its own (useTypingSoundEnabled), both
 * remembered in this browser. Self-playing demos stay silent until the visitor has used the page once,
 * and inside <AutoplaySound allow={false}>.
 */

const STORE_KEY = "ui-typing-sound";
let chosen: boolean | null = null; // the visitor's saved or runtime choice; typing is on until they say otherwise
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** The typing switch on its own (true until the visitor turns it off). The site-wide sound switch is separate. */
export function getTypingSoundChoice(): boolean {
  load();
  return chosen ?? true;
}

/** Whether typing is audible right now: the typing switch and the site-wide sound switch are both on. */
export function getTypingSoundEnabled(): boolean {
  return getSoundsEnabled() && getTypingSoundChoice();
}

/** Turn the typing sound on or off. The choice is remembered in this browser unless `persist` is false. */
export function setTypingSoundChoice(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The typing switch as React state: `[on, setOn]`. `on` is what the visitor hears (typing choice and
 * the site-wide switch both on). Turning it on also turns the site-wide sound on, because a typing
 * switch that stays silent is no switch; turning it off only silences typing.
 */
export function useTypingSoundEnabled(): [boolean, (on: boolean) => void] {
  const choice = React.useSyncExternalStore(subscribe, getTypingSoundChoice, () => false);
  const [master] = useSoundsEnabled();
  const set = React.useCallback((on: boolean) => {
    if (on) setSoundsEnabled(true);
    setTypingSoundChoice(on);
  }, []);
  return [choice && master, set];
}

// ── The recording ───────────────────────────────────────────────────

/** The key-click sprite and its timing map ({ defines: { keyCode: [offset ms, length ms] } }). */
export const TYPING_SPRITE_URL = "/sounds/sound.ogg";
export const TYPING_SPRITE_CONFIG_URL = "/sounds/sprite-config.json";

type AudioCtor = typeof AudioContext;
let context: AudioContext | null = null;
let sprite: { buffer: AudioBuffer; defines: Record<string, [number, number]> } | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function audioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext ?? null;
}

function liveContext(): AudioContext | null {
  const Ctor = audioCtor();
  if (!Ctor) return null;
  try {
    if (!context || context.state === "closed") context = new Ctor({ latencyHint: "interactive" });
    if (context.state === "suspended") void context.resume().catch(() => {});
    return context;
  } catch {
    return null;
  }
}

/**
 * Downloads and decodes the clicks so the first character is in time. It needs no user gesture
 * (it decodes offline) and does nothing twice. The hooks call it once typing is audible.
 */
export function primeTypingSound(): Promise<void> {
  if (typeof window === "undefined" || sprite || failed) return Promise.resolve();
  if (!loading) {
    loading = (async () => {
      try {
        const [audio, cfg] = await Promise.all([fetch(TYPING_SPRITE_URL), fetch(TYPING_SPRITE_CONFIG_URL)]);
        if (!audio.ok || !cfg.ok) throw new Error("typing sprite missing");
        const defines = ((await cfg.json()) as { defines?: Record<string, [number, number]> }).defines;
        if (!defines) throw new Error("typing sprite config has no defines");
        const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
        if (!Offline) throw new Error("no offline audio");
        const buffer = await new Offline(2, 1, 44100).decodeAudioData(await audio.arrayBuffer());
        sprite = { buffer, defines };
      } catch {
        failed = true; // the synthesised click covers it
      }
    })();
  }
  return loading;
}

/** The slice for a character: its own key, else the letter in capitals, else the space bar. */
function sliceFor(defines: Record<string, [number, number]>, char: string, kind: "key" | "enter" | "backspace"): [number, number] | null {
  if (kind === "enter") return defines["13"] ?? defines["10"] ?? null;
  if (kind === "backspace") return defines["8"] ?? defines["32"] ?? null;
  const code = char.charCodeAt(0);
  return defines[String(code)] ?? (code >= 97 && code <= 122 ? defines[String(code - 32)] : undefined) ?? defines["32"] ?? defines["65"] ?? null;
}

function synthClick(ctx: AudioContext, volume: number, heavy: boolean) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(volume * 0.3, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.08 : 0.04));
  g.connect(ctx.destination);
  const o = ctx.createOscillator();
  o.type = "triangle";
  o.frequency.setValueAtTime(heavy ? 165 : 245 + Math.random() * 60, t);
  o.connect(g);
  o.start(t);
  o.stop(t + (heavy ? 0.08 : 0.04));
}

function playClick(char: string, kind: "key" | "enter" | "backspace", volume: number) {
  const ctx = liveContext();
  if (!ctx || ctx.state !== "running") return false; // never queue clicks that would burst out later
  try {
    const slice = sprite ? sliceFor(sprite.defines, char, kind) : null;
    if (sprite && slice && slice[0] / 1000 < sprite.buffer.duration) {
      const node = ctx.createBufferSource();
      node.buffer = sprite.buffer;
      // A hair of pitch variation so fast typing does not sound like a loop.
      node.playbackRate.value = 0.98 + Math.random() * 0.04;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      node.connect(gain);
      gain.connect(ctx.destination);
      node.start(0, slice[0] / 1000, Math.min(slice[1] / 1000, sprite.buffer.duration - slice[0] / 1000));
    } else {
      synthClick(ctx, volume, kind !== "key");
    }
    return true;
  } catch {
    return false;
  }
}

// ── Playing ─────────────────────────────────────────────────────────

let lastAt = -1e9;

function userHasActed() {
  if (typeof navigator === "undefined") return false;
  const a = (navigator as unknown as { userActivation?: { hasBeenActive: boolean } }).userActivation;
  // Browsers without the API only let audio start after a gesture anyway.
  return a ? a.hasBeenActive : true;
}

/**
 * Plays the key click for a typed character (a "\n" is the Enter key). Set `auto: false` for a key
 * the visitor pressed; a component typing on its own (the default) stays silent until the visitor has
 * used the page once. Returns whether a click was started.
 */
export function playTypingSound(char: string, opts: { auto?: boolean; volume?: number; backspace?: boolean } = {}): boolean {
  if (typeof window === "undefined" || !getTypingSoundEnabled()) return false;
  if (document.hidden) return false;
  if (opts.auto !== false && !userHasActed()) return false;
  // A run of characters landing in one frame (streamed text) is one click, not a buzz.
  const now = performance.now();
  if (now - lastAt < 24) return false;
  lastAt = now;
  void primeTypingSound();
  const kind = opts.backspace ? "backspace" : char === "\n" ? "enter" : "key";
  return playClick(char, kind, opts.volume ?? 0.45);
}

export type TypingSound = {
  /** A character landed. */
  type: (char: string) => void;
  /** A character was removed. */
  backspace: () => void;
};

/**
 * For a component that types by itself. `enabled` is the component's own `sound` option. The sound
 * follows the typing switch and the site-wide sound switch, and stays silent where autoplay sound
 * is not allowed (a grid of previews).
 */
export function useTypingSound(enabled = true): TypingSound {
  const allowed = useAutoplaySoundAllowed();
  const [on] = useTypingSoundEnabled();
  const live = React.useRef(false);
  React.useEffect(() => {
    live.current = enabled && allowed && on;
    // Download and decode the clicks once typing is audible, so the first character is in time.
    if (live.current) {
      void primeTypingSound();
      // Build the audio context now (a page that has been used allows it), so the first character is heard.
      if (userHasActed()) liveContext();
    }
  }, [enabled, allowed, on]);
  return React.useMemo<TypingSound>(
    () => ({
      type: (char) => {
        if (live.current) playTypingSound(char);
      },
      backspace: () => {
        if (live.current) playTypingSound("", { backspace: true });
      },
    }),
    [],
  );
}

/**
 * The simplest way to give a typing animation its sound: pass the text that is on screen right now.
 * A click plays each time it grows by a character, a Backspace each time it shrinks, and nothing when
 * the whole line is swapped or first appears.
 *
 *   useTypedText(visibleText, enableSound);
 */
export function useTypedText(text: string, enabled = true) {
  const typing = useTypingSound(enabled);
  const prev = React.useRef(text);
  React.useEffect(() => {
    const before = prev.current;
    prev.current = text;
    if (text === before) return;
    if (text.length > before.length && text.startsWith(before)) typing.type(text[text.length - 1] ?? "");
    else if (text.length < before.length && before.startsWith(text)) typing.backspace();
  }, [text, typing]);
}
```
