"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "framer-motion";

export type SplitSignupValues = { email: string; password: string };

export type SplitSignupProps = {
  headline?: string;
  subhead?: string;
  /** Benefits on the value panel. They tick themselves off as the form fills in. */
  benefits?: string[];
  /** Small pill above the headline. Empty string hides it. */
  badge?: string;
  /** Social proof line under the benefits. Empty string hides it. */
  proof?: string;
  submitLabel?: string;
  /** Called with the values after local validation; return a promise to show the pending state, throw to return to the form with an error. Without it the form simulates success. */
  onSubmit?: (values: SplitSignupValues) => Promise<void> | void;
  /** Show the Google / GitHub buttons. */
  showSso?: boolean;
  onSso?: (provider: "google" | "github") => void;
  /** Called by "Sign in" under the form. Hidden when not given. */
  onSignIn?: () => void;
  /** Types a demo signup and plays it through until someone touches the form. */
  autoplay?: boolean;
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

/** 0–4: length, mixed case, a digit, a symbol (or a long passphrase). */
export function passwordStrength(pw: string) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return s;
}

const LEVEL = ["Too short", "Weak", "Fair", "Good", "Strong"];
const LEVEL_COLOR = ["#d2d2d7", "#ff3b30", "#ff9f0a", "#0a84ff", "#30d158"];
const LEVEL_TEXT = ["text-[#6e6e73] dark:text-[#a1a1a6]", "text-[#d70015] dark:text-[#ff6961]", "text-[#b25000] dark:text-[#ffb340]", "text-[#0066cc] dark:text-[#64b5ff]", "text-[#248a3d] dark:text-[#30d158]"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = { email: "mei@northwind.co", password: "Orbit-2026!" };

/** One meter segment. It pops in with an overshoot when it lights, and takes the level's colour. */
function Segment({ on, color, still }: { on: boolean; color: string; still: boolean }) {
  return (
    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
      <motion.span
        className="absolute inset-0 origin-left rounded-full"
        initial={false}
        animate={{ scaleX: on ? 1 : 0, backgroundColor: color }}
        transition={still ? { duration: 0 } : { scaleX: { type: "spring", stiffness: 520, damping: 17 }, backgroundColor: { duration: 0.2 } }}
      />
    </span>
  );
}

/** Benefit row on the value panel; its check draws itself when `done` flips. */
function Benefit({ text, done, still }: { text: string; done: boolean; still: boolean }) {
  return (
    <li className="flex items-start gap-2.5">
      <motion.span
        className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full"
        initial={false}
        animate={{ backgroundColor: done ? "#30d158" : "rgba(255,255,255,.5)", scale: done && !still ? [1, 1.25, 1] : 1 }}
        transition={{ duration: 0.4, ease: [0.3, 1.6, 0.5, 1] }}
      >
        <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke={done ? "#fff" : "#86868b"} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={false} animate={{ pathLength: done ? 1 : 0.001, opacity: done ? 1 : 0.5 }} transition={{ duration: still ? 0 : 0.35 }} />
        </svg>
      </motion.span>
      <span className="text-[13.5px] leading-snug text-[#1d1d1f] dark:text-[#f5f5f7]">
        {text}
        <span className="sr-only">{done ? " (ready)" : ""}</span>
      </span>
    </li>
  );
}

/**
 * A two-panel signup. The value panel makes the pitch; the form is short:
 * SSO, an email, and a password with a four-segment strength meter that pops
 * each segment in. As the form fills, the benefits on the left tick
 * themselves off, so the page shows what you are about to get.
 */
export function SplitSignup({
  headline = "Ship interfaces your team is proud of",
  subhead = "Start free. No card, no sales call. Invite your team when you're ready.",
  benefits = ["Every component, live and editable", "One-line installs with the CLI", "Light and dark out of the box"],
  badge = "Free forever plan",
  proof = "Joined by 12,000 teams this year",
  submitLabel = "Create workspace",
  onSubmit,
  showSso = true,
  onSso,
  onSignIn,
  autoplay = false,
  className = "",
}: SplitSignupProps) {
  const still = useReducedMotion() === true;
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [state, setState] = React.useState<"idle" | "pending" | "done">("idle");
  const [error, setError] = React.useState<string | null>(null);
  const touched = React.useRef(false);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const score = passwordStrength(password);
  const emailOk = EMAIL.test(email.trim());
  // Completeness drives the ticks: a valid email is worth 40%, each strength level 15%.
  const progress = state === "done" ? 1 : (emailOk ? 0.4 : 0) + score * 0.15;
  const ticks = benefits.map((_, i) => progress >= (i + 1) / benefits.length - 0.001);
  const fill = useSpring(progress, { stiffness: 140, damping: 20 });
  React.useEffect(() => {
    fill.set(progress);
  }, [progress, fill]);
  const fillWidth = useTransform(fill, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);

  const touch = () => {
    touched.current = true;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    touch();
    if (state !== "idle") return;
    if (!emailOk) return setError("Enter a valid work email.");
    if (score < 2) return setError("Pick a stronger password: 8+ characters with a mix.");
    setError(null);
    setState("pending");
    try {
      if (onSubmit) await onSubmit({ email: email.trim(), password });
      else await new Promise((r) => setTimeout(r, 1000));
      if (alive.current) setState("done");
    } catch (err) {
      if (!alive.current) return;
      setState("idle");
      setError(err instanceof Error && err.message ? err.message : "Something went wrong. Try again.");
    }
  }

  React.useEffect(() => {
    if (!autoplay) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, f: () => void) =>
      timers.push(
        setTimeout(() => {
          if (!touched.current) f();
        }, ms),
      );
    const play = () => {
      let t = 700;
      for (let i = 1; i <= DEMO.email.length; i++) {
        const s = DEMO.email.slice(0, i);
        at((t += 50), () => setEmail(s));
      }
      t += 300;
      for (let i = 1; i <= DEMO.password.length; i++) {
        const s = DEMO.password.slice(0, i);
        at((t += 110), () => setPassword(s));
      }
      at((t += 500), () => setState("pending"));
      at((t += 1000), () => setState("done"));
      at((t += 2600), () => {
        setState("idle");
        setEmail("");
        setPassword("");
      });
      at((t += 600), play);
    };
    play();
    return () => timers.forEach(clearTimeout);
  }, [autoplay]);

  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";
  const field =
    "flex h-11 w-full items-center rounded-[12px] bg-[#f5f5f7] px-3.5 ring-1 ring-black/[.04] transition-shadow focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0071e3] dark:bg-[#2c2c2e] dark:ring-white/[.06] dark:focus-within:bg-[#2c2c2e] dark:focus-within:ring-[#0a84ff]";
  const input = `min-w-0 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-[#86868b] disabled:opacity-60 dark:placeholder:text-[#8e8e93] ${ink}`;
  const sso = `flex h-10 flex-1 items-center justify-center gap-2 rounded-[12px] bg-white text-[13.5px] font-medium ring-1 ring-black/[.08] transition-colors hover:bg-[#f5f5f7] dark:bg-[#2c2c2e] dark:ring-white/10 dark:hover:bg-[#3a3a3c] ${ink} ${focus}`;
  const busy = state !== "idle";

  return (
    <div
      className={`@container w-full overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={touch}
      onKeyDown={touch}
    >
      <div className="grid @[540px]:grid-cols-[1fr_1.1fr]">
        {/* Value panel */}
        <div className="relative isolate overflow-hidden p-6 @[540px]:p-7">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 [background:var(--l)] dark:[background:var(--d)]"
            style={
              {
                "--l": "radial-gradient(80% 60% at 0% 0%, rgba(90,200,250,.45), transparent 70%), radial-gradient(70% 60% at 100% 100%, rgba(191,90,242,.35), transparent 70%), linear-gradient(180deg,#f5f5f7,#ececf1)",
                "--d": "radial-gradient(80% 60% at 0% 0%, rgba(10,132,255,.35), transparent 70%), radial-gradient(70% 60% at 100% 100%, rgba(191,90,242,.28), transparent 70%), linear-gradient(180deg,#232326,#18181a)",
              } as React.CSSProperties
            }
          />
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[12px] font-medium text-[#1d1d1f] ring-1 ring-black/[.05] backdrop-blur dark:bg-white/10 dark:text-[#f5f5f7] dark:ring-white/10">
              <span className="size-1.5 rounded-full bg-[#30d158]" aria-hidden />
              {badge}
            </span>
          )}
          <h2 className={`mt-4 text-[24px] font-semibold leading-[1.08] tracking-[-0.04em] [text-wrap:balance] @[760px]:text-[30px] ${ink}`}>{headline}</h2>
          {subhead && <p className={`mt-2.5 text-[14px] leading-relaxed @[540px]:hidden @[720px]:block ${soft}`}>{subhead}</p>}
          <ul className="mt-5 space-y-2.5" aria-label="What you get">
            {benefits.map((b, i) => (
              <Benefit key={b} text={b} done={ticks[i]} still={still} />
            ))}
          </ul>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10" aria-hidden>
            <motion.div className="h-full rounded-full bg-[#30d158]" style={{ width: fillWidth }} />
          </div>
          {proof && (
            <div className="mt-5 flex items-center gap-2.5">
              <span className="flex -space-x-2" aria-hidden>
                {["#ffb38a,#ff375f", "#5ac8fa,#0071e3", "#b7f7c5,#0b8f6a", "#d0b3ff,#7d3cff"].map((g) => (
                  <span key={g} className="size-6 rounded-full ring-2 ring-white dark:ring-[#1c1c1e]" style={{ background: `linear-gradient(135deg,${g})` }} />
                ))}
              </span>
              <span className={`text-[12.5px] ${soft}`}>{proof}</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="relative p-6 @[540px]:p-7">
          <AnimatePresence mode="popLayout" initial={false}>
            {state === "done" ? (
              <motion.div
                key="done"
                role="status"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }}
                className="flex min-h-[330px] flex-col items-center justify-center text-center"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-[#30d158] text-white shadow-[0_12px_30px_-10px_rgba(48,209,88,.8)]">
                  <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <motion.path d="M5 12.5 10 17.5 19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.1 }} />
                  </svg>
                </span>
                <p className={`mt-4 text-[20px] font-semibold tracking-[-0.03em] ${ink}`}>Your workspace is ready</p>
                <p className={`mt-1 max-w-[260px] text-[14px] ${soft}`}>
                  We sent a link to <span className={`font-medium ${ink}`}>{email.trim()}</span> to confirm it&apos;s you.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={submit}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={still ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
              >
                <h3 className={`text-[19px] font-semibold tracking-[-0.03em] ${ink}`}>Create your workspace</h3>
                <p className={`mt-1 text-[13.5px] ${soft}`}>Takes about a minute.</p>
                {showSso && (
                  <>
                    <div className="mt-4 flex gap-2">
                      <button type="button" disabled={busy} onClick={() => onSso?.("google")} className={sso}>
                        <GoogleMark className="size-4" /> Google
                      </button>
                      <button type="button" disabled={busy} onClick={() => onSso?.("github")} className={sso}>
                        <GithubMark className="size-4" /> GitHub
                      </button>
                    </div>
                    <div className={`my-3.5 flex items-center gap-3 text-[12px] ${soft}`} aria-hidden>
                      <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
                      or
                      <span className="h-px flex-1 bg-black/[.08] dark:bg-white/10" />
                    </div>
                  </>
                )}
                <div className={showSso ? "space-y-2.5" : "mt-4 space-y-2.5"}>
                  <label className={field}>
                    <span className="sr-only">Work email</span>
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="Work email"
                      value={email}
                      disabled={busy}
                      onChange={(e) => {
                        touch();
                        setEmail(e.target.value);
                        setError(null);
                      }}
                      className={input}
                    />
                    <AnimatePresence>
                      {emailOk && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 600, damping: 16 }}
                          className="flex size-5 items-center justify-center rounded-full bg-[#30d158] text-white"
                          aria-hidden
                        >
                          <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </label>
                  <div>
                    <label className={field}>
                      <span className="sr-only">Password</span>
                      <input
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Password"
                        value={password}
                        disabled={busy}
                        aria-describedby={`${id}-strength`}
                        onChange={(e) => {
                          touch();
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        className={input}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-pressed={show}
                        className={`-mr-1 rounded-md px-1.5 py-0.5 text-[12.5px] font-medium text-[#0066cc] dark:text-[#64b5ff] ${focus}`}
                      >
                        {show ? "Hide" : "Show"}
                      </button>
                    </label>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex flex-1 gap-1" aria-hidden>
                        {[1, 2, 3, 4].map((n) => (
                          <Segment key={n} on={score >= n} color={LEVEL_COLOR[score]} still={still} />
                        ))}
                      </div>
                      <span id={`${id}-strength`} className={`w-[64px] text-right text-[12px] font-medium tabular-nums ${LEVEL_TEXT[password ? score : 0]}`} aria-live="polite">
                        {password ? LEVEL[score] : "Strength"}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={busy}
                  whileTap={still ? undefined : { scale: 0.98 }}
                  className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#0071e3] text-[15px] font-semibold text-white shadow-[0_10px_24px_-12px_rgba(0,113,227,.9)] transition-colors hover:bg-[#0077ed] dark:bg-[#0a84ff] ${focus} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e]`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {state === "pending" ? (
                      <motion.span key="p" className="flex gap-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} aria-label="Creating workspace">
                        {[0, 1, 2].map((i) => (
                          <motion.span key={i} className="size-1.5 rounded-full bg-white" animate={still ? undefined : { y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }} />
                        ))}
                      </motion.span>
                    ) : (
                      <motion.span key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        {submitLabel}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <p className={`mt-2.5 min-h-[18px] text-center text-[12.5px] ${error ? "text-[#d70015] dark:text-[#ff6961]" : soft}`} role={error ? "alert" : undefined}>
                  {error ??
                    (onSignIn ? (
                      <>
                        Already have an account?{" "}
                        <button type="button" onClick={onSignIn} className={`rounded font-medium text-[#0066cc] hover:underline dark:text-[#64b5ff] ${focus}`}>
                          Sign in
                        </button>
                      </>
                    ) : (
                      "By continuing you agree to the Terms and Privacy Policy."
                    ))}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
