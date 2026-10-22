"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/ui-sounds";

export type AuthMorphMode = "signin" | "signup";

export interface AuthMorphProps {
  /** One letter (or short mark) in the badge at the top of the card. */
  mark?: string;
  /** Heading while signing in. */
  signInTitle?: string;
  /** Heading while signing up. */
  signUpTitle?: string;
  /** Seconds before "Resend link" unlocks on the check-your-inbox screen. */
  resendSeconds?: number;
  /** Mode the card opens in. */
  defaultMode?: AuthMorphMode;
  /**
   * Switches modes, picks Magic link, sends it and shows the inbox screen by itself, then resets and
   * repeats, until the visitor touches the card. Pauses off screen and in a hidden tab. Never runs under
   * reduced motion.
   */
  autoplay?: boolean;
  /** Swipes when the mode swaps, taps on submit and resend, chimes on the inbox screen. Follows the site-wide sound switch. */
  enableSound?: boolean;
  /** Called with the address when a magic link is "sent". Nothing is sent by the block, and passwords are never read or kept. */
  onMagicLink?: (email: string) => void;
  /** Called when "Use a passkey" is pressed. */
  onPasskey?: () => void;
  className?: string;
}

type Step = "form" | "sending" | "sent";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const LINK = "text-[#0071e3] dark:text-[#2997ff]";

/** True while the element is on screen and the tab is visible, so timers can stand down otherwise. */
function useOnScreen(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(true);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ref]);
  return inView && visible;
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  autoComplete,
  right,
  reduce,
}: {
  id: string;
  label: string;
  type?: string;
  /** Omit for an uncontrolled field whose value the block never reads. */
  value?: string;
  onChange?: (v: string) => void;
  autoComplete?: string;
  right?: ReactNode;
  reduce: boolean;
}) {
  return (
    <motion.div
      layout={!reduce}
      className="relative block"
      initial={{ opacity: 0, height: 0, marginTop: 0 }}
      animate={{ opacity: 1, height: 56, marginTop: 10 }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
    >
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        {...(value === undefined ? {} : { value, onChange: (e) => onChange?.(e.target.value) })}
        placeholder=" "
        aria-label={label}
        className="peer h-14 w-full rounded-[14px] bg-[#f5f5f7] px-4 pt-4 text-[15px] text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:focus:ring-[#0a84ff]"
      />
      {/* Floating label. */}
      <span
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] text-[#6e6e73] transition-all duration-200 peer-focus:top-[15px] peer-focus:text-[11.5px] peer-[:not(:placeholder-shown)]:top-[15px] peer-[:not(:placeholder-shown)]:text-[11.5px] dark:text-[#a1a1a6]"
        aria-hidden="true"
      >
        {label}
      </span>
      {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
    </motion.div>
  );
}

function Spinner() {
  return (
    <motion.span
      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
      aria-hidden="true"
    />
  );
}

/**
 * One auth card for both sign in and sign up. Switching modes slides the pill, the name field grows in or
 * folds away, and the heading and button swap their words. Choose "Magic link" and the password folds away,
 * the button sends, and the card becomes a check-your-inbox screen with a resend timer. The password and name
 * fields are uncontrolled and never read, nothing is stored, and nothing goes over the network. Under reduced
 * motion fields and screens swap instantly and the spinner becomes a word.
 */
export function AuthMorph({
  mark = "N",
  signInTitle = "Welcome back",
  signUpTitle = "Create your account",
  resendSeconds = 30,
  defaultMode = "signin",
  autoplay = false,
  enableSound = true,
  onMagicLink,
  onPasskey,
  className,
}: AuthMorphProps) {
  const reduce = !!useReducedMotion();
  const play = useSound(enableSound);
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const [mode, setMode] = useState<AuthMorphMode>(defaultMode);
  const [magic, setMagic] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState("");
  const [left, setLeft] = useState(resendSeconds);
  const [touched, setTouched] = useState(false);
  const timers = useRef(new Set<number>());

  const later = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);
  useEffect(() => {
    const set = timers.current;
    return () => {
      set.forEach((id) => window.clearTimeout(id));
      set.clear();
    };
  }, []);

  // Resend countdown while the inbox screen is up.
  useEffect(() => {
    if (step !== "sent") return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [step]);

  const send = useCallback(
    (address: string, auto: boolean) => {
      const say = auto ? play.auto : play;
      say("tap", 0.5);
      setStep("sending");
      later(
        () => {
          setLeft(resendSeconds);
          setStep("sent");
          say("success", 0.6);
          onMagicLink?.(address);
        },
        reduce ? 300 : 900,
      );
    },
    [play, later, resendSeconds, onMagicLink, reduce],
  );

  const resend = () => {
    play("tap", 0.5);
    setResending(true);
    later(() => {
      setLeft(resendSeconds);
      setResending(false);
    }, reduce ? 300 : 900);
  };

  const changeMode = (m: AuthMorphMode, auto = false) => {
    if (m === mode) return;
    (auto ? play.auto : play)("swipe", 0.4);
    setMode(m);
  };

  const running = autoplay && !reduce && !touched && onScreen;
  useEffect(() => {
    if (!running) return;
    const ids: number[] = [];
    const go = (fn: () => void, ms: number) => ids.push(window.setTimeout(fn, ms));
    const loop = () => {
      go(() => {
        setMode("signin");
        setMagic(false);
        setStep("form");
        setEmail("");
      }, 0);
      go(() => {
        play.auto("swipe", 0.4);
        setMode("signup");
      }, 1200);
      go(() => {
        play.auto("swipe", 0.4);
        setMode("signin");
      }, 2800);
      go(() => setMagic(true), 3800);
      go(() => setEmail("maya@orbitly.com"), 4400);
      go(() => send("maya@orbitly.com", true), 5200);
      go(() => {
        setStep("form");
        setMagic(false);
        setEmail("");
      }, 9800);
    };
    loop();
    const every = window.setInterval(loop, 10200);
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      window.clearInterval(every);
    };
  }, [running, play, send]);

  const act = (fn: () => void) => () => {
    setTouched(true);
    fn();
  };

  const title = mode === "signin" ? signInTitle : signUpTitle;
  const fade = { duration: reduce ? 0 : 0.2 };

  return (
    <section
      ref={root}
      aria-label="Sign in or create an account"
      className={cn("flex w-full justify-center bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}
    >
      <motion.div
        layout={!reduce}
        className="w-[400px] max-w-full overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]"
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 32 }}
        onPointerDownCapture={() => setTouched(true)}
        onKeyDownCapture={() => setTouched(true)}
      >
        <AnimatePresence mode="wait" initial={false}>
          {step !== "sent" ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.97, transition: { duration: reduce ? 0 : 0.15 } }}>
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[#1d1d1f] text-[17px] font-bold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]" aria-hidden="true">
                {mark}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h3
                  key={mode}
                  className="m-0 mt-4 text-[24px] font-semibold tracking-[-0.03em] text-[#1d1d1f] dark:text-[#f5f5f7]"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
                  transition={fade}
                >
                  {title}
                </motion.h3>
              </AnimatePresence>
              <LayoutGroup id={`${uid}-mode`}>
                <div className="mt-4 grid grid-cols-2 rounded-full bg-[#f5f5f7] p-1 dark:bg-[#2c2c2e]" role="group" aria-label="Sign in or sign up">
                  {(["signin", "signup"] as AuthMorphMode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={mode === m}
                      onClick={act(() => changeMode(m))}
                      className={cn("relative h-9 rounded-full text-[13.5px] font-medium", FOCUS)}
                    >
                      {mode === m && (
                        <motion.span
                          layoutId={`${uid}-thumb`}
                          className="absolute inset-0 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#48484a] dark:shadow-none"
                          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className={cn("relative", mode === m ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>{m === "signin" ? "Sign in" : "Sign up"}</span>
                    </button>
                  ))}
                </div>
              </LayoutGroup>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setTouched(true);
                  if (magic) send(email, false);
                  else play("tap", 0.5);
                }}
                className="mt-2"
              >
                <AnimatePresence initial={false}>
                  {mode === "signup" && <Field key="name" id={`${uid}-name`} label="Full name" autoComplete="name" reduce={reduce} />}
                  <Field key="email" id={`${uid}-email`} label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" reduce={reduce} />
                  {!magic && (
                    <Field
                      key="pw"
                      id={`${uid}-pw`}
                      label="Password"
                      type="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      reduce={reduce}
                      right={
                        mode === "signin" ? (
                          <button type="button" className={cn("rounded text-[12.5px] font-medium hover:underline", LINK, FOCUS)}>
                            Forgot?
                          </button>
                        ) : undefined
                      }
                    />
                  )}
                </AnimatePresence>
                <motion.button
                  layout={!reduce}
                  type="submit"
                  disabled={step === "sending"}
                  className={cn("mt-4 flex h-12 w-full items-center justify-center rounded-full bg-[#0071e3] text-[15px] font-medium text-white", FOCUS)}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={step + String(magic) + mode}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, y: reduce ? 0 : 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                      transition={{ duration: reduce ? 0 : 0.15 }}
                    >
                      {step === "sending" ? (
                        reduce ? (
                          "Sending"
                        ) : (
                          <>
                            <Spinner />
                            <span className="sr-only">Sending</span>
                          </>
                        )
                      ) : magic ? (
                        "Email me a link"
                      ) : mode === "signin" ? (
                        "Sign in"
                      ) : (
                        "Create account"
                      )}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </form>
              <motion.div layout={!reduce} className="mt-4 flex items-center gap-3 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                <span className="h-px flex-1 bg-[#ececf0] dark:bg-[#3a3a3c]" aria-hidden="true" />
                or
                <span className="h-px flex-1 bg-[#ececf0] dark:bg-[#3a3a3c]" aria-hidden="true" />
              </motion.div>
              <motion.div layout={!reduce} className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={magic}
                  onClick={act(() => setMagic((m) => !m))}
                  className={cn("h-11 rounded-full bg-[#f5f5f7] text-[13.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
                >
                  {magic ? "Use a password" : "Magic link"}
                </button>
                <button
                  type="button"
                  onClick={act(() => onPasskey?.())}
                  className={cn("h-11 rounded-full bg-[#f5f5f7] text-[13.5px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
                >
                  Use a passkey
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="sent" className="py-4 text-center" role="status" initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
              <motion.span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef5ff] dark:bg-[#0a84ff]/15"
                initial={reduce ? false : { scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 16 }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="stroke-[#0071e3] dark:stroke-[#0a84ff]" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <motion.path d="M4 7l8 6 8-6" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={reduce ? { duration: 0 } : { delay: 0.25, duration: 0.4 }} />
                </svg>
              </motion.span>
              <h3 className="m-0 mt-4 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">Check your inbox</h3>
              <p className="m-0 mt-1.5 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">
                We sent a sign-in link to <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{email || "your email"}</span>.
              </p>
              <button
                type="button"
                disabled={left > 0 || resending}
                onClick={() => {
                  setTouched(true);
                  resend();
                }}
                className={cn(
                  "mt-6 h-10 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium tabular-nums text-[#1d1d1f] disabled:text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:disabled:text-[#a1a1a6]",
                  FOCUS,
                )}
              >
                {resending ? "Sending" : left > 0 ? `Resend in ${left}s` : "Resend link"}
              </button>
              <div>
                <button
                  type="button"
                  onClick={act(() => {
                    setStep("form");
                    setMagic(false);
                    setResending(false);
                  })}
                  className={cn("mt-3 rounded text-[13px] font-medium hover:underline", LINK, FOCUS)}
                >
                  Use a different email
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
