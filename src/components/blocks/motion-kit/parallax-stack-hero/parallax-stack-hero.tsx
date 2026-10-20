"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ParallaxStackHeroProps {
  accent?: string;
  /** Accent used in dark mode. Defaults to a lighter indigo when `accent` is left at its default. */
  accentDark?: string;
  /** Lets the cards float and the "live" dot pulse. */
  autoplay?: boolean;
  /**
   * Receives the trimmed, validated email. Nothing is sent anywhere by the block itself.
   * Throw or reject to show the error state instead of the confirmation.
   */
  onSubmit?: (email: string) => void | Promise<void>;
  className?: string;
}

const DEFAULT_ACCENT = "#5e5ce6";
const ease = [0.16, 1, 0.3, 1] as const;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEADLINE = ["Run", "the", "whole", "week", "from", "one", "calm", "inbox."];

const card =
  "rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_30px_60px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c,0_30px_60px_-30px_rgba(0,0,0,.9)]";
const title = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#86868b] dark:text-[#a1a1a6]";
const accentBg = "bg-[var(--mk-accent)] dark:bg-[var(--mk-accent-dark)]";
const accentText = "text-[var(--mk-accent)] dark:text-[var(--mk-accent-dark)]";

function Layer({
  children,
  depth,
  px,
  py,
  className,
  delay,
  float = 8,
  still,
  parallax,
}: {
  children: ReactNode;
  depth: number;
  px: MotionValue<number>;
  py: MotionValue<number>;
  className: string;
  delay: number;
  float?: number;
  still: boolean;
  parallax: boolean;
}) {
  const x = useTransform(px, (v) => v * depth);
  const y = useTransform(py, (v) => v * depth);
  return (
    <motion.div className={`absolute ${className}`} style={parallax ? { x, y } : undefined}>
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1, ease, delay }}>
        <motion.div
          animate={still ? { y: 0 } : { y: [0, -float, 0] }}
          transition={still ? { duration: 0 } : { duration: 5 + depth, repeat: Infinity, ease: "easeInOut", delay: delay + 1 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Split hero: copy and an email capture on the left, a stack of product UI
 * cards on the right that drift with the pointer at different depths. The
 * email field validates with a shake and turns into a confirmation in place.
 * The form never sends data; pass `onSubmit` to handle the address yourself.
 */
export function ParallaxStackHero({ accent = DEFAULT_ACCENT, accentDark, autoplay = true, onSubmit, className }: ParallaxStackHeroProps) {
  const reduce = useReducedMotion();
  const still = !autoplay || !!reduce;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const inputId = `mk-psh-email-${uid}`;
  const hintId = `mk-psh-hint-${uid}`;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const px = useSpring(rx, { stiffness: 80, damping: 18 });
  const py = useSpring(ry, { stiffness: 80, damping: 18 });

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState("");
  const [state, setState] = useState<"idle" | "bad" | "busy" | "done">("idle");
  const shakeTimer = useRef<number | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      window.clearTimeout(shakeTimer.current);
    };
  }, []);

  const fail = () => {
    setState("bad");
    window.clearTimeout(shakeTimer.current);
    shakeTimer.current = window.setTimeout(() => {
      if (mounted.current) setState((s) => (s === "bad" ? "idle" : s));
    }, 600);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "busy" || state === "done") return;
    const value = email.trim().slice(0, 254);
    if (!EMAIL.test(value)) {
      fail();
      return;
    }
    setState("busy");
    try {
      await onSubmit?.(value);
      if (!mounted.current) return;
      setSent(value);
      setState("done");
    } catch {
      if (mounted.current) fail();
    }
  };

  const dark = accentDark ?? (accent === DEFAULT_ACCENT ? "#7d7aff" : accent);
  const vars = { "--mk-accent": accent, "--mk-accent-dark": dark } as CSSProperties;
  const bad = state === "bad";

  return (
    <section
      style={vars}
      className={cn("@container relative w-full overflow-hidden bg-[#fbfbfd] px-5 py-16 dark:bg-black @2xl:py-20", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        rx.set(((e.clientX - r.left) / r.width - 0.5) * 30);
        ry.set(((e.clientY - r.top) / r.height - 0.5) * 30);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      <div
        className="pointer-events-none absolute -right-40 top-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-accent)_18%,transparent),transparent)] blur-3xl dark:bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-accent-dark)_24%,transparent),transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid w-full max-w-[1120px] grid-cols-1 items-center gap-12 @4xl:grid-cols-[1fr_1.05fr] @4xl:gap-14">
        <div className="flex min-w-0 flex-col items-start gap-5 @2xl:gap-6">
          <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className={cn("flex items-center gap-2 text-[14px] font-semibold", accentText)}>
            <span className="relative flex h-2 w-2">
              {!still && (
                <motion.span className={cn("absolute inset-0 rounded-full", accentBg)} animate={{ scale: [1, 2.4], opacity: [0.6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
              )}
              <span className={cn("h-2 w-2 rounded-full", accentBg)} />
            </span>
            2,400 teams joined this month
          </motion.span>
          <h1 className={cn("m-0 text-[clamp(38px,7cqi,76px)] font-semibold leading-[1] tracking-[-0.05em] @4xl:text-[clamp(42px,6cqi,76px)]", title)}>
            {HEADLINE.map((w, k) => (
              <motion.span
                key={k}
                className={cn("mr-[0.22em] inline-block last:mr-0", w === "calm" && accentText)}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.9, ease, delay: 0.1 + k * 0.06 }}
              >
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.45 }}
            className="m-0 max-w-[480px] text-[clamp(16px,2.4cqi,19px)] leading-[1.45] tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            Messages, meetings and payments land in one place, sorted by what needs you first.
          </motion.p>
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, x: bad ? [0, -10, 9, -6, 4, 0] : 0 }}
            transition={{ duration: bad ? 0.45 : 0.9, ease, delay: bad ? 0 : 0.6 }}
            className="w-full max-w-[460px]"
            noValidate
          >
            <motion.div
              layout
              className={cn(
                "flex items-center gap-2 rounded-full bg-white p-1.5 shadow-[0_0_0_1px_rgba(0,0,0,.08)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c]",
                bad && "ring-2 ring-[#ff3b30] dark:ring-[#ff453a]",
              )}
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {state !== "done" ? (
                  <motion.div key="f" className="flex min-w-0 flex-1 items-center gap-2" exit={{ opacity: 0, filter: "blur(6px)" }}>
                    <label htmlFor={inputId} className="sr-only">
                      Work email
                    </label>
                    <input
                      id={inputId}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={254}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      aria-invalid={bad || undefined}
                      aria-describedby={hintId}
                      className={cn("h-11 min-w-0 flex-1 rounded-full bg-transparent px-4 text-[16px] outline-none placeholder:text-[#a1a1a6] dark:placeholder:text-[#6e6e73] @sm:text-[15px]", title)}
                    />
                    <motion.button
                      type="submit"
                      disabled={state === "busy"}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "h-11 flex-none rounded-full px-5 text-[15px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 disabled:opacity-70 dark:focus-visible:ring-[var(--mk-accent-dark)] dark:focus-visible:ring-offset-[#1c1c1e]",
                        accentBg,
                      )}
                    >
                      {state === "busy" ? "Joining…" : "Join free"}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="d"
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 px-3"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  >
                    <motion.span
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#30d158] text-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 14, delay: 0.1 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.4 }} />
                      </svg>
                    </motion.span>
                    <span className={cn("min-w-0 break-words text-[15px]", title)}>
                      Check <b className="break-all">{sent}</b> for your invite.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <p id={hintId} className={cn("m-0 mt-3 px-4 text-[13px]", bad ? "text-[#d70015] dark:text-[#ff6961]" : muted)} aria-live="polite">
              {bad ? "That email doesn't look right." : state === "done" ? "You're on the list." : "Free for 14 days. No card needed."}
            </p>
          </motion.form>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-[520px] @lg:h-[460px]" aria-hidden="true">
          <Layer depth={0.6} px={px} py={py} delay={0.3} still={still} parallax={!reduce} className="left-0 top-[2%] w-[88%] @lg:left-[6%] @lg:top-[4%] @lg:w-[78%]">
            <div className={cn(card, "p-4 @lg:p-5")}>
              <div className="mb-4 flex items-center justify-between">
                <span className={cn("text-[13px] font-semibold", title)}>Inbox</span>
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold text-white", accentBg)}>12 new</span>
              </div>
              {[
                ["Maya Chen", "Q3 board deck, final", "#ff9f0a"],
                ["Leo Park", "Can we move standup?", "#30d158"],
                ["Billing", "Invoice #2041 paid", "#0a84ff"],
              ].map(([n, s, c], k) => (
                <motion.div
                  key={n}
                  className="flex items-center gap-3 border-t border-black/[.05] py-2.5 dark:border-[#3a3a3c]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + k * 0.12 }}
                >
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ background: c }}>
                    {n
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className={cn("truncate text-[13px] font-semibold", title)}>{n}</span>
                    <span className="truncate text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">{s}</span>
                  </span>
                </motion.div>
              ))}
            </div>
          </Layer>
          <Layer depth={1.2} px={px} py={py} delay={0.5} still={still} parallax={!reduce} className="right-0 top-[46%] w-[64%] @lg:top-[44%] @lg:w-[58%]" float={10}>
            <div className={cn(card, "p-4 @lg:p-5")}>
              <div className={cn("text-[12px]", muted)}>Today, 2:30 PM</div>
              <div className={cn("mt-1 text-[16px] font-semibold tracking-[-0.02em]", title)}>Design review</div>
              <div className="mt-3 flex -space-x-2">
                {["#ff375f", "#5e5ce6", "#30d158", "#ff9f0a"].map((c, k) => (
                  <motion.span
                    key={c}
                    className="h-7 w-7 rounded-full border-2 border-white dark:border-[#1c1c1e]"
                    style={{ background: c }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.3 + k * 0.08, type: "spring", stiffness: 500, damping: 15 }}
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <span className={cn("flex-1 rounded-full py-2 text-center text-[12px] font-semibold text-white", accentBg)}>Join</span>
                <span className={cn("flex-1 rounded-full bg-[#f5f5f7] py-2 text-center text-[12px] font-semibold dark:bg-[#2c2c2e]", title)}>Later</span>
              </div>
            </div>
          </Layer>
          <Layer depth={1.8} px={px} py={py} delay={0.7} still={still} parallax={!reduce} className="left-0 top-[72%] w-[64%] @lg:top-[66%] @lg:w-[50%]" float={6}>
            <div className={cn(card, "flex items-center gap-3 p-4")}>
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#30d158]/15 text-[#248a3d] dark:bg-[#30d158]/20 dark:text-[#30d158]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={cn("truncate text-[12px]", muted)}>Payment received</span>
                <span className={cn("text-[18px] font-semibold tabular-nums tracking-[-0.02em]", title)}>$4,200.00</span>
              </span>
            </div>
          </Layer>
        </div>
      </div>
    </section>
  );
}
