"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Fingerprint, Lock, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlassLoginValues = { email: string; password: string; remember: boolean };

export type GlassLoginProps = {
  brand?: string;
  title?: string;
  subtitle?: string;
  /** Called with the values; return a promise to show the pending state, throw to show an error. */
  onSubmit?: (values: GlassLoginValues) => Promise<void> | void;
  onPasskey?: () => void;
  /** Draw the aurora backdrop behind the card. Turn off to place the card on your own background. */
  backdrop?: boolean;
  className?: string;
};

/**
 * A frosted login card on a slow aurora, with a ghost card stacked behind it for depth. Passkey
 * first, then email and password; the button walks from pending to a welcome state.
 */
export function GlassLogin({
  brand = "Halo",
  title = "Welcome back",
  subtitle = "Sign in to pick up where you left off.",
  onSubmit,
  onPasskey,
  backdrop = true,
  className,
}: GlassLoginProps) {
  const reduce = useReducedMotion();
  const id = React.useId();
  const [values, setValues] = React.useState<GlassLoginValues>({ email: "", password: "", remember: true });
  const [state, setState] = React.useState<"idle" | "pending" | "error" | "done">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "pending") return;
    setState("pending");
    try {
      if (onSubmit) await onSubmit(values);
      else await new Promise((r) => setTimeout(r, 900));
      setState("done");
    } catch {
      setState("error");
    }
  }

  const input =
    "h-11 w-full rounded-xl border border-white/10 bg-white/[0.06] pl-10 pr-3.5 text-[14px] text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-white/35 focus:border-white/30 focus:bg-white/[0.09] focus:shadow-[0_0_0_4px_rgba(255,255,255,0.06)]";

  const card = (
    <div className="relative w-full max-w-[380px]">
      {/* ghost card behind for depth */}
      <div aria-hidden className="absolute inset-x-6 -top-3 bottom-6 rounded-[26px] border border-white/10 bg-white/[0.04] backdrop-blur-xl" />
      <div aria-hidden className="absolute inset-x-3 -top-1.5 bottom-3 rounded-[26px] border border-white/10 bg-white/[0.05] backdrop-blur-xl" />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.07] p-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-2xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          {state === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-8 text-center" role="status">
              <span className="grid size-14 place-items-center rounded-full bg-white text-zinc-950 shadow-[0_0_40px_rgba(255,255,255,0.35)]">
                <Check className="size-7" strokeWidth={3} />
              </span>
              <p className="mt-5 text-[19px] font-semibold tracking-[-0.02em] text-white">You&apos;re in</p>
              <p className="mt-1.5 text-[13.5px] text-white/55">Loading your workspace…</p>
              <button type="button" onClick={() => setState("idle")} className="mt-6 text-[12.5px] font-medium text-white/50 underline-offset-4 hover:text-white hover:underline">
                Sign out
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -6 }} className="space-y-4">
              <div>
                <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-white to-white/60 text-[15px] font-bold text-zinc-950 shadow-[0_6px_20px_-6px_rgba(255,255,255,0.5)]">
                  {brand[0]}
                </span>
                <h2 className="mt-4 text-[22px] font-semibold tracking-[-0.03em] text-white">{title}</h2>
                <p className="mt-1 text-[13.5px] text-white/55">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={onPasskey}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] text-[13.5px] font-medium text-white transition-colors hover:bg-white/[0.1]"
              >
                <Fingerprint className="size-4" /> Continue with a passkey
              </button>

              <div className="flex items-center gap-3 text-[11.5px] text-white/35">
                <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
              </div>

              <div className="relative">
                <label htmlFor={`${id}-email`} className="sr-only">Email</label>
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input id={`${id}-email`} type="email" required autoComplete="email" placeholder="you@company.com" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className={input} />
              </div>
              <div className="relative">
                <label htmlFor={`${id}-pw`} className="sr-only">Password</label>
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input id={`${id}-pw`} type="password" required autoComplete="current-password" placeholder="Password" value={values.password} onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))} className={input} />
              </div>

              <div className="flex items-center justify-between text-[12.5px]">
                <label className="flex cursor-pointer items-center gap-2 text-white/60">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values.remember}
                    onClick={() => setValues((v) => ({ ...v, remember: !v.remember }))}
                    className={cn("relative h-5 w-8 rounded-full transition-colors", values.remember ? "bg-white" : "bg-white/15")}
                  >
                    <motion.span
                      className={cn("absolute top-0.5 size-4 rounded-full", values.remember ? "bg-zinc-950" : "bg-white")}
                      animate={{ left: values.remember ? 14 : 2 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 600, damping: 32 }}
                    />
                  </button>
                  Remember me
                </label>
                <a href="#" className="font-medium text-white/70 hover:text-white">Forgot password?</a>
              </div>

              {state === "error" ? (
                <p role="alert" className="rounded-lg bg-rose-500/15 px-3 py-2 text-[12.5px] text-rose-200">That email and password don&apos;t match. Try again.</p>
              ) : null}

              <button
                type="submit"
                disabled={state === "pending"}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-white text-[14px] font-semibold text-zinc-950 transition-[background-color,transform] hover:bg-white/90 active:scale-[0.99] disabled:opacity-80"
              >
                {state === "pending" ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                ) : (
                  <>
                    Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
              <p className="text-center text-[12.5px] text-white/50">
                New to {brand}? <a href="#" className="font-medium text-white hover:underline">Create an account</a>
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );

  if (!backdrop) return <div className={cn("flex justify-center", className)}>{card}</div>;

  return (
    <div className={cn("relative isolate flex min-h-[560px] w-full items-center justify-center overflow-hidden rounded-[28px] bg-[#07070b] px-6 py-12", className)}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <motion.div
          className="absolute left-[10%] top-[8%] size-[26rem] rounded-full bg-indigo-600/45 blur-[90px]"
          animate={reduce ? undefined : { x: [0, 60, 0], y: [0, 30, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[-10%] right-[5%] size-[24rem] rounded-full bg-fuchsia-500/35 blur-[90px]"
          animate={reduce ? undefined : { x: [0, -50, 0], y: [0, -30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[20%] left-[35%] size-64 rounded-full bg-cyan-400/25 blur-[80px]"
          animate={reduce ? undefined : { scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      </div>
      {card}
    </div>
  );
}
