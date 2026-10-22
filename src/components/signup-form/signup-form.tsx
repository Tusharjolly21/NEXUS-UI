"use client";

import * as React from "react";
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
