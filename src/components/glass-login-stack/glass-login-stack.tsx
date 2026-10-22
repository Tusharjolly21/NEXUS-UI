"use client";

import * as React from "react";
import { useTypedText } from "@/lib/typing-sound";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

export type GlassLoginValues = { email: string; password: string; remember: boolean };

export type GlassLoginProps = {
  brand?: string;
  title?: string;
  subtitle?: string;
  /** Called with the values; return a promise to show the pending state, throw to show the error state. Without it the form simulates a successful sign-in locally. */
  onSubmit?: (values: GlassLoginValues) => Promise<void> | void;
  /** Called by the passkey button. Return a promise to keep the scan running until it settles. */
  onPasskey?: () => Promise<void> | void;
  /** Called by "Forgot password?". */
  onForgotPassword?: () => void;
  /** Called by "Create one". Hidden when not given. */
  onSignUp?: () => void;
  /** Draw the aurora backdrop behind the card. Turn off to place the card on your own background. */
  backdrop?: boolean;
  /** Types a demo sign-in and plays it through until someone touches the form. */
  autoplay?: boolean;
  className?: string;
};

type Phase = "idle" | "pending" | "error" | "done";

const DEMO = { email: "ada@halo.app", password: "orbit-2026" };

function useTilt(px: MotionValue<number>, py: MotionValue<number>, k: number, stiffness: number, damping: number) {
  const rx = useSpring(useTransform(py, (v) => -v * 7 * k), { stiffness, damping });
  const ry = useSpring(useTransform(px, (v) => v * 9 * k), { stiffness, damping });
  const x = useSpring(useTransform(px, (v) => v * 10 * (1 - k)), { stiffness, damping });
  const y = useSpring(useTransform(py, (v) => v * 8 * (1 - k)), { stiffness, damping });
  return { rotateX: rx, rotateY: ry, x, y };
}

function Mail() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
      <path d="m3.5 6 6.5 5 6.5-5" />
    </svg>
  );
}

function Lock() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
      <rect x="4" y="8.5" width="12" height="8.5" rx="2.2" />
      <path d="M6.8 8.5V6.3a3.2 3.2 0 0 1 6.4 0v2.2" />
    </svg>
  );
}

function Eye({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-[18px]" aria-hidden>
      <path d="M2.5 10s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z" />
      <circle cx="10" cy="10" r="2.2" />
      <motion.path d="M4 16 16 4" initial={false} animate={{ pathLength: open ? 0 : 1, opacity: open ? 0 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />
    </svg>
  );
}

/** Fingerprint whose ridges draw in while a passkey scan runs. */
function Print({ scanning, still }: { scanning: boolean; still: boolean }) {
  const ridges = [
    "M6.2 15.4c.6-1.6.9-3.3.9-5.2a2.9 2.9 0 0 1 5.8 0c0 1.2-.1 2.4-.3 3.5",
    "M4.4 13.2c.3-.9.4-1.9.4-3a5.2 5.2 0 0 1 10.4 0c0 2.2-.2 4-.8 5.6",
    "M10 10.2c0 2.6-.5 4.9-1.6 6.9",
    "M3.3 7.4A7.3 7.3 0 0 1 16.7 7.4",
  ];
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className="size-[18px]" aria-hidden>
      {ridges.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          initial={false}
          animate={scanning && !still ? { pathLength: [0.15, 1, 0.15] } : { pathLength: 1 }}
          transition={scanning && !still ? { duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" } : { duration: 0.2 }}
        />
      ))}
    </svg>
  );
}

/**
 * A frosted login card stacked on two ghost cards over a slow aurora. The
 * stack tilts toward the pointer and the ghosts follow a beat late, so the
 * layers peel apart in depth. Passkey first, then email and password, a
 * remember switch, and a button that walks from pending to a welcome.
 */
export function GlassLogin({
  brand = "Halo",
  title = "Welcome back",
  subtitle = "Sign in to pick up where you left off.",
  onSubmit,
  onPasskey,
  onForgotPassword,
  onSignUp,
  backdrop = true,
  autoplay = false,
  className = "",
}: GlassLoginProps) {
  const still = useReducedMotion() === true;
  const id = React.useId();
  const [values, setValues] = React.useState<GlassLoginValues>({ email: "", password: "", remember: true });
  useTypedText(values.email);
  useTypedText(values.password);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [message, setMessage] = React.useState<string | null>(null);
  const [reveal, setReveal] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [shakes, setShakes] = React.useState(0);
  const touched = React.useRef(false);
  const alive = React.useRef(true);
  const stage = React.useRef<HTMLDivElement>(null);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const front = useTilt(px, py, 1, 220, 22);
  const mid = useTilt(px, py, 0.7, 120, 16);
  const back = useTilt(px, py, 0.45, 70, 13);
  const glare = useTransform([px, py], ([x, y]: number[]) => `radial-gradient(60% 50% at ${50 + x * 30}% ${30 + y * 25}%, rgba(255,255,255,.55), transparent 70%)`);

  const shakeX = useMotionValue(0);
  React.useEffect(() => {
    if (shakes === 0 || still) return;
    const run = animate(shakeX, [0, -10, 9, -6, 4, 0], { duration: 0.45 });
    return () => run.stop();
  }, [shakes, still, shakeX]);

  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const touch = () => {
    touched.current = true;
  };

  async function signIn(v: GlassLoginValues) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) {
      setPhase("error");
      setMessage("Enter the email you signed up with.");
      setShakes((s) => s + 1);
      return;
    }
    if (v.password.length < 1) {
      setPhase("error");
      setMessage("Enter your password.");
      setShakes((s) => s + 1);
      return;
    }
    setPhase("pending");
    setMessage(null);
    try {
      if (onSubmit) await onSubmit({ ...v, email: v.email.trim() });
      else await new Promise((r) => setTimeout(r, 1000));
      if (!alive.current) return;
      setPhase("done");
    } catch (err) {
      if (!alive.current) return;
      setPhase("error");
      setMessage(err instanceof Error && err.message ? err.message : "Those details didn't match. Try again.");
      setShakes((s) => s + 1);
    }
  }

  async function passkey() {
    touch();
    if (scanning) return;
    setScanning(true);
    try {
      if (onPasskey) await onPasskey();
      else await new Promise((r) => setTimeout(r, 1400));
      if (!alive.current) return;
      setScanning(false);
      setPhase("done");
    } catch {
      if (!alive.current) return;
      setScanning(false);
      setPhase("error");
      setMessage("Passkey sign-in was cancelled.");
    }
  }

  // Autoplay: type the demo details, sign in, show the welcome, reset; drift the stack meanwhile.
  React.useEffect(() => {
    if (!autoplay) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let raf = 0;
    const t0 = performance.now();
    const drift = (now: number) => {
      if (touched.current) return;
      const s = (now - t0) / 1000;
      if (!still) {
        px.set(Math.sin(s * 0.9) * 0.6);
        py.set(Math.sin(s * 0.7 + 1) * 0.45);
      }
      raf = requestAnimationFrame(drift);
    };
    raf = requestAnimationFrame(drift);
    const at = (ms: number, f: () => void) =>
      timers.push(
        setTimeout(() => {
          if (!touched.current) f();
        }, ms),
      );
    const play = () => {
      let t = 600;
      for (let i = 1; i <= DEMO.email.length; i++) {
        const s = DEMO.email.slice(0, i);
        at((t += 55), () => setValues((v) => ({ ...v, email: s })));
      }
      t += 250;
      for (let i = 1; i <= DEMO.password.length; i++) {
        const s = DEMO.password.slice(0, i);
        at((t += 60), () => setValues((v) => ({ ...v, password: s })));
      }
      at((t += 400), () => {
        setPhase("pending");
        setMessage(null);
      });
      at((t += 1000), () => setPhase("done"));
      at((t += 2600), () => {
        setPhase("idle");
        setValues({ email: "", password: "", remember: true });
      });
      at((t += 700), play);
    };
    play();
    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf);
    };
  }, [autoplay, still, px, py]);

  const onMove = (e: React.PointerEvent) => {
    touch();
    if (still || e.pointerType !== "mouse") return;
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    px.set(Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)));
    py.set(Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)));
  };

  const name = values.email.split("@")[0] || "there";
  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";
  const field =
    "flex h-10 items-center gap-2.5 rounded-[12px] bg-white/70 px-3 ring-1 ring-black/[.06] transition-shadow focus-within:ring-2 focus-within:ring-[#0071e3] dark:bg-white/[.07] dark:ring-white/10 dark:focus-within:ring-[#0a84ff]";
  const input = `min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-[#86868b] disabled:opacity-60 dark:placeholder:text-[#8e8e93] ${ink}`;
  const busy = phase === "pending" || phase === "done" || scanning;
  const ghost = "absolute inset-0 rounded-[26px] bg-white/45 ring-1 ring-white/70 backdrop-blur-md dark:bg-white/[.05] dark:ring-white/10";

  const card = (
    <div ref={stage} className="relative w-full max-w-[380px]" style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={() => {
      px.set(0);
      py.set(0);
    }}>
      <motion.div aria-hidden className={`${ghost} origin-top scale-x-[.88]`} style={{ ...back, top: -22 }} />
      <motion.div aria-hidden className={`${ghost} origin-top scale-x-[.94]`} style={{ ...mid, top: -11 }} />
      <motion.div style={{ x: shakeX }} className="relative">
      <motion.div
        style={front}
        className="relative overflow-hidden rounded-[26px] bg-white/75 p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(0,0,0,.45)] ring-1 ring-white/80 backdrop-blur-2xl backdrop-saturate-150 dark:bg-[#1c1c1e]/75 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_30px_60px_-30px_rgba(0,0,0,.95)] dark:ring-white/[.06]"
        onPointerDown={touch}
        onKeyDown={touch}
      >
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-15" style={{ background: glare }} />
        <AnimatePresence mode="popLayout" initial={false}>
          {phase === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.92, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }}
              className="relative flex min-h-[368px] flex-col items-center justify-center text-center"
              role="status"
            >
              <span className="flex size-16 items-center justify-center rounded-full bg-[#30d158] text-white shadow-[0_12px_30px_-10px_rgba(48,209,88,.8)]">
                <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }} />
                </svg>
              </span>
              <p className={`mt-5 text-[22px] font-semibold tracking-[-0.03em] ${ink}`}>Hi, {name}.</p>
              <p className={`mt-1 text-[14px] ${soft}`}>You&apos;re signed in to {brand}.</p>
              <button
                type="button"
                onClick={() => {
                  touch();
                  setPhase("idle");
                  setValues((v) => ({ ...v, password: "" }));
                }}
                className={`mt-6 rounded-full px-4 py-2 text-[13px] font-medium text-[#0066cc] hover:bg-[#0071e3]/10 dark:text-[#64b5ff] dark:hover:bg-[#0a84ff]/15 ${focus}`}
              >
                Sign out
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                touch();
                if (phase !== "pending") void signIn(values);
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
              className="relative"
              aria-describedby={message ? `${id}-msg` : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex size-8 items-center justify-center rounded-[10px] text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
                  style={{ background: "linear-gradient(135deg,#5ac8fa,#0071e3 55%,#5e5ce6)" }}
                  aria-hidden
                >
                  {brand[0]?.toUpperCase()}
                </span>
                <span className={`text-[15px] font-semibold tracking-[-0.02em] ${ink}`}>{brand}</span>
              </div>
              <h2 className={`mt-3 text-[22px] font-semibold leading-tight tracking-[-0.035em] ${ink}`}>{title}</h2>
              {subtitle && <p className={`mt-1 text-[14px] ${soft}`}>{subtitle}</p>}

              <motion.button
                type="button"
                onClick={passkey}
                disabled={busy}
                whileTap={still ? undefined : { scale: 0.98 }}
                className={`mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d1d1f] text-[14px] font-semibold text-white transition-colors hover:bg-black disabled:opacity-80 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:hover:bg-white ${focus} focus-visible:ring-offset-2`}
              >
                <Print scanning={scanning} still={still} />
                {scanning ? "Waiting for passkey…" : "Sign in with a passkey"}
              </motion.button>

              <div className={`my-3 flex items-center gap-3 text-[12px] ${soft}`} aria-hidden>
                <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
                or use email
                <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
              </div>

              <div className="space-y-2">
                <label className={field}>
                  <span className={soft}>
                    <Mail />
                  </span>
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    placeholder="Email"
                    value={values.email}
                    disabled={busy}
                    aria-invalid={phase === "error" && message?.includes("email") ? true : undefined}
                    onChange={(e) => {
                      touch();
                      setValues((v) => ({ ...v, email: e.target.value }));
                      if (phase === "error") setPhase("idle");
                    }}
                    className={input}
                  />
                </label>
                <label className={field}>
                  <span className={soft}>
                    <Lock />
                  </span>
                  <span className="sr-only">Password</span>
                  <input
                    type={reveal ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={values.password}
                    disabled={busy}
                    onChange={(e) => {
                      touch();
                      setValues((v) => ({ ...v, password: e.target.value }));
                      if (phase === "error") setPhase("idle");
                    }}
                    className={input}
                  />
                  <button
                    type="button"
                    onClick={() => setReveal((r) => !r)}
                    aria-label={reveal ? "Hide password" : "Show password"}
                    aria-pressed={reveal}
                    className={`-mr-1 rounded-md p-1 ${soft} hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] ${focus}`}
                  >
                    <Eye open={!reveal} />
                  </button>
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.remember}
                  onClick={() => {
                    touch();
                    setValues((v) => ({ ...v, remember: !v.remember }));
                  }}
                  className={`flex items-center gap-2 rounded-full text-[13px] ${soft} ${focus}`}
                >
                  <span className={`flex h-[22px] w-[38px] items-center rounded-full p-[2px] transition-colors ${values.remember ? "justify-end bg-[#30d158]" : "justify-start bg-[#e3e3e8] dark:bg-[#39393d]"}`}>
                    <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 30 }} className="size-[18px] rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,.2)]" />
                  </span>
                  Remember me
                </button>
                <button type="button" onClick={onForgotPassword} className={`rounded text-[13px] font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focus}`}>
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={still ? undefined : { scale: 0.98 }}
                className={`mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#0071e3] text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,113,227,.9)] transition-colors hover:bg-[#0077ed] disabled:opacity-90 dark:bg-[#0a84ff] ${focus} focus-visible:ring-offset-2`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {phase === "pending" ? (
                    <motion.span key="p" className="flex gap-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} aria-label="Signing in">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="size-1.5 rounded-full bg-white"
                          animate={still ? undefined : { y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                        />
                      ))}
                    </motion.span>
                  ) : (
                    <motion.span key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                      Sign in
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <div className="min-h-[18px] pt-2 text-center text-[13px]" aria-live="polite">
                {message ? (
                  <p id={`${id}-msg`} className="text-[#d70015] dark:text-[#ff6961]">
                    {message}
                  </p>
                ) : onSignUp ? (
                  <p className={soft}>
                    New here?{" "}
                    <button type="button" onClick={onSignUp} className={`rounded font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focus}`}>
                      Create an account
                    </button>
                  </p>
                ) : null}
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      </motion.div>
    </div>
  );

  if (!backdrop) return <div className={`flex w-full justify-center pt-6 ${className}`}>{card}</div>;

  return (
    <div className={`relative isolate flex w-full items-center justify-center overflow-hidden rounded-[28px] bg-[#f5f5f7] px-4 pb-6 pt-10 dark:bg-black ${className}`}>
      <div aria-hidden className="absolute inset-0 -z-10">
        {[
          { c: "rgba(90,200,250,.55)", d: "rgba(10,132,255,.45)", x: "12%", y: "18%", s: 300, dx: 40, dy: 30, t: 14 },
          { c: "rgba(255,159,10,.4)", d: "rgba(255,69,58,.35)", x: "72%", y: "12%", s: 260, dx: -30, dy: 40, t: 17 },
          { c: "rgba(191,90,242,.42)", d: "rgba(94,92,230,.45)", x: "55%", y: "70%", s: 320, dx: 30, dy: -30, t: 19 },
        ].map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full blur-3xl [background:var(--l)] dark:[background:var(--d)]"
            style={{ left: b.x, top: b.y, width: b.s, height: b.s, x: "-50%", y: "-50%", ["--l" as string]: b.c, ["--d" as string]: b.d }}
            animate={still ? undefined : { x: ["-50%", `calc(-50% + ${b.dx}px)`, "-50%"], y: ["-50%", `calc(-50% + ${b.dy}px)`, "-50%"] }}
            transition={{ duration: b.t, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      {card}
    </div>
  );
}
