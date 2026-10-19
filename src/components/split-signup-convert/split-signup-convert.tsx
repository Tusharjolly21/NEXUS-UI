"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type SplitSignupValues = { email: string; password: string };

export type SplitSignupProps = {
  headline?: string;
  subhead?: string;
  benefits?: string[];
  submitLabel?: string;
  /** Called with the form values; return a promise to show the pending state. */
  onSubmit?: (values: SplitSignupValues) => Promise<void> | void;
  /** Show the Google / GitHub buttons. */
  showSso?: boolean;
  onSso?: (provider: "google" | "github") => void;
  className?: string;
};

function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...props}>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.29 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.61 4.59 1.8l3.43-3.43A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77Z" />
    </svg>
  );
}

function GithubMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return s;
}

const STRENGTH = ["Too short", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["bg-zinc-300", "bg-rose-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

/**
 * A two-panel signup: the value of the product on a lit panel, and a short form with a live
 * password-strength meter, SSO and a button that walks through pending to done.
 */
export function SplitSignup({
  headline = "Ship interfaces your team is proud of",
  subhead = "Start free. No card, no sales call — invite your team when you're ready.",
  benefits = ["Every component, live and editable", "One-line installs with the CLI", "Light and dark out of the box"],
  submitLabel = "Create workspace",
  onSubmit,
  showSso = true,
  onSso,
  className,
}: SplitSignupProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "pending" | "done">("idle");
  const score = strength(password);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    setState("pending");
    try {
      if (onSubmit) await onSubmit({ email, password });
      else await new Promise((r) => setTimeout(r, 900));
      setState("done");
    } catch {
      setState("idle");
    }
  }

  const field =
    "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[14px] text-zinc-950 outline-none transition-[border-color,box-shadow] placeholder:text-zinc-400 focus:border-zinc-950 focus:shadow-[0_0_0_4px_rgba(23,23,28,0.06)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-zinc-500 dark:focus:border-white/40 dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]";

  return (
    <div
      className={cn(
        "grid w-full overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white md:grid-cols-[1fr_1.05fr]",
        "dark:border-white/10 dark:bg-zinc-950",
        className,
      )}
    >
      {/* value panel */}
      <div className="relative isolate flex flex-col justify-between overflow-hidden bg-[#0d0d14] p-8 text-white">
        <div aria-hidden className="absolute inset-0 -z-10">
          <motion.div
            className="absolute -left-24 -top-24 size-80 rounded-full bg-indigo-500/40 blur-3xl"
            animate={reduce ? undefined : { x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-28 right-[-20%] size-80 rounded-full bg-fuchsia-500/30 blur-3xl"
            animate={reduce ? undefined : { x: [0, -24, 0], y: [0, -16, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[12px] font-medium text-white/80 backdrop-blur">
            <Sparkles className="size-3.5 text-amber-300" /> Free forever plan
          </span>
          <h2 className="mt-5 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] [text-wrap:balance]">{headline}</h2>
          <p className="mt-3 max-w-sm text-[14.5px] leading-relaxed text-white/60">{subhead}</p>
        </div>

        <ul className="mt-8 space-y-3">
          {benefits.map((b, i) => (
            <motion.li
              key={b}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              className="flex items-center gap-3 text-[14px] text-white/85"
            >
              <span className="grid size-5 place-items-center rounded-full bg-white/10 ring-1 ring-inset ring-white/15">
                <Check className="size-3 text-emerald-300" strokeWidth={3} />
              </span>
              {b}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* form panel */}
      <div className="flex flex-col justify-center p-8">
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-10 text-center"
              role="status"
            >
              <span className="grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-[0_10px_30px_-8px_rgba(16,185,129,0.6)]">
                <Check className="size-7" strokeWidth={3} />
              </span>
              <p className="mt-5 text-[19px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">Your workspace is ready</p>
              <p className="mt-1.5 text-[14px] text-zinc-500 dark:text-zinc-400">We sent a sign-in link to {email || "your inbox"}.</p>
              <button
                type="button"
                onClick={() => setState("idle")}
                className="mt-6 text-[13px] font-medium text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-white"
              >
                Start over
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={false} exit={{ opacity: 0, y: -6 }} className="space-y-4">
              <div>
                <p className="text-[19px] font-semibold tracking-[-0.02em] text-zinc-950 dark:text-white">Create your account</p>
                <p className="mt-1 text-[13.5px] text-zinc-500 dark:text-zinc-400">
                  Already have one? <a href="#" className="font-medium text-zinc-950 underline-offset-4 hover:underline dark:text-white">Sign in</a>
                </p>
              </div>

              {showSso ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {(["google", "github"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => onSso?.(p)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 text-[13.5px] font-medium text-zinc-950 transition-colors hover:bg-zinc-50 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
                      >
                        {p === "google" ? <GoogleMark className="size-4" /> : <GithubMark className="size-4" />}
                        {p === "google" ? "Google" : "GitHub"}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-zinc-400">
                    <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" /> or with email <span className="h-px flex-1 bg-zinc-200 dark:bg-white/10" />
                  </div>
                </>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor={`${id}-email`} className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Work email</label>
                <input id={`${id}-email`} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ada@studio.com" className={field} />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${id}-pw`} className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300">Password</label>
                <div className="relative">
                  <input
                    id={`${id}-pw`}
                    type={show ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={cn(field, "pr-11")}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 pt-1" aria-live="polite">
                  <div className="flex flex-1 gap-1">
                    {[1, 2, 3, 4].map((n) => (
                      <span key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                        <motion.span
                          className={cn("block h-full rounded-full", STRENGTH_COLOR[score])}
                          initial={false}
                          animate={{ width: password && score >= n ? "100%" : "0%" }}
                          transition={{ duration: reduce ? 0 : 0.3 }}
                        />
                      </span>
                    ))}
                  </div>
                  <span className="w-16 text-right text-[11.5px] text-zinc-500 dark:text-zinc-400">{password ? STRENGTH[score] : ""}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={state === "pending"}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-[14px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-80 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {state === "pending" ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    {submitLabel}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              <p className="text-center text-[11.5px] text-zinc-400">
                By continuing you agree to the <a href="#" className="underline underline-offset-2">Terms</a> and <a href="#" className="underline underline-offset-2">Privacy Policy</a>.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
