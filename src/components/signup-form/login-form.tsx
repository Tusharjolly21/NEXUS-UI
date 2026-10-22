"use client";

import * as React from "react";
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
  /** Plays interface sounds on interaction. They follow the site-wide sound switch and stay silent in autoplay. */
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
  const [errors, setErrors] = React.useState<Partial<Record<keyof LoginFormValues, string>>>({});
  const [shakes, setShakes] = React.useState<Partial<Record<keyof LoginFormValues, number>>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<SubmitState>("idle");
  const touched = React.useRef(false);
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
        [450, () => setState("loading")],
        [1100, () => setState("success")],
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
