"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { useTypedText } from "@/lib/typing-sound";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface TypoCatchingSignupProps {
  /** Accent colour. Defaults to Apple blue (#0071e3 light, #0a84ff dark). */
  accent?: string;
  /** Reader count before the visitor joins. */
  start?: number;
  title?: string;
  description?: string;
  /** Mail domains to check typos against. */
  domains?: string[];
  /**
   * Runs with the trimmed, validated address. The block never sends anything itself: it shows
   * the subscribed state locally, so wire your own request in here.
   */
  onSubmit?: (email: string) => void;
  /** Types a typo'd address, accepts the fix and subscribes by itself until the visitor touches it. */
  autoplay?: boolean;
  className?: string;
}

const DOMAINS = ["gmail.com", "outlook.com", "icloud.com", "yahoo.com", "hotmail.com", "proton.me"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DEMO_EMAIL = "maya@gmial.com";
const FACES = ["#ff9f0a", "#30d158", "#5e5ce6", "#ff375f"];

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";

function dist(a: string, b: string) {
  const m: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array<number>(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return m[a.length][b.length];
}

function suggest(raw: string, domains: string[]) {
  const email = raw.trim();
  const at = email.lastIndexOf("@");
  if (at < 1) return null;
  const dom = email.slice(at + 1).toLowerCase();
  if (dom.length < 4 || dom.length > 64 || domains.includes(dom)) return null;
  let best: string | null = null;
  let bd = 3;
  for (const d of domains) {
    const x = dist(dom, d);
    if (x < bd) {
      bd = x;
      best = d;
    }
  }
  return best ? email.slice(0, at + 1) + best : null;
}

function Digits({ n }: { n: number }) {
  const s = n.toLocaleString("en-US");
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      {s.split("").map((c, i) => (
        <span key={s.length - i} className="relative inline-flex">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span key={c} initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 400, damping: 28 }}>
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * Newsletter section that catches typos. Type "name@gmial.com" and a suggestion slides out of the
 * field; tap it to fix. Subscribing morphs the button into a tick, adds you to the avatar stack
 * and rolls the count. Nothing is sent: the address goes to `onSubmit`.
 */
export function TypoCatchingSignup({
  accent,
  start = 12408,
  title = "One good email, every Sunday.",
  description = "Five links worth your time and one thing we learned building the product. Nothing else.",
  domains = DOMAINS,
  onSubmit,
  autoplay = false,
  className,
}: TypoCatchingSignupProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  useTypedText(email);
  const [state, setState] = useState<"idle" | "bad" | "done">("idle");
  const [touched, setTouched] = useState(false);
  const badTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fix = useMemo(() => suggest(email, domains), [email, domains]);

  useEffect(() => () => {
    if (badTimer.current) clearTimeout(badTimer.current);
  }, []);

  // Autoplay: type a typo, take the suggestion, subscribe, then reset and go again.
  const demo = autoplay && !touched && !reduce;
  useEffect(() => {
    if (!demo) return;
    let cancelled = false;
    let t: ReturnType<typeof setTimeout>;
    const wait = (ms: number) => new Promise<void>((r) => { t = setTimeout(r, ms); });
    (async () => {
      while (!cancelled) {
        await wait(900);
        for (let i = 1; i <= DEMO_EMAIL.length && !cancelled; i++) {
          setEmail(DEMO_EMAIL.slice(0, i));
          await wait(75);
        }
        await wait(1500);
        if (cancelled) return;
        const fixed = suggest(DEMO_EMAIL, domains);
        if (fixed) setEmail(fixed);
        await wait(1100);
        if (cancelled) return;
        setState("done");
        await wait(2800);
        if (cancelled) return;
        setState("idle");
        setEmail("");
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [demo, domains]);

  const stopDemo = () => {
    if (touched) return;
    setTouched(true);
    if (autoplay) {
      setEmail("");
      setState("idle");
    }
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (state === "done") return;
    const clean = email.trim().slice(0, 254);
    if (!EMAIL_RE.test(clean)) {
      setState("bad");
      if (badTimer.current) clearTimeout(badTimer.current);
      badTimer.current = setTimeout(() => setState("idle"), 700);
      return;
    }
    setEmail(clean);
    setState("done");
    onSubmit?.(clean);
  };

  const done = state === "done";
  const envelope = done
    ? reduce
      ? { opacity: 0 }
      : { y: [0, -10, -160], x: [0, 4, 80], rotate: [0, -8, 20], opacity: [1, 1, 0] }
    : reduce
      ? { y: 0, x: 0, rotate: 0, opacity: 1 }
      : { y: [0, -4, 0], x: 0, rotate: 0, opacity: 1 };
  const envelopeTransition = done
    ? { duration: reduce ? 0.3 : 1.1, ease: [0.5, 0, 0.75, 0] as const }
    : reduce
      ? { duration: 0.3 }
      : { y: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }, default: { duration: 0.4 } };

  return (
    <section
      className={`w-full bg-[#f5f5f7] px-4 py-[clamp(48px,8vw,80px)] [--mk-a:#0071e3] sm:px-5 dark:bg-black dark:[--mk-a:#0a84ff] ${className ?? ""}`}
      style={accent ? ({ "--mk-a": accent } as CSSProperties) : undefined}
      onPointerDown={stopDemo}
      onKeyDown={stopDemo}
      onFocus={stopDemo}
    >
      <div className="relative mx-auto max-w-[760px] overflow-hidden rounded-[clamp(28px,4vw,36px)] bg-white px-5 py-12 text-center shadow-[0_0_0_1px_rgba(0,0,0,.05),0_40px_80px_-50px_rgba(0,0,0,.4)] sm:px-14 sm:py-14 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-60 w-[520px] max-w-none -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-a)_15%,transparent),transparent)] blur-3xl dark:bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--mk-a)_28%,transparent),transparent)]"
          aria-hidden="true"
        />
        <motion.svg className="relative mx-auto text-[var(--mk-a)]" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true" animate={envelope} transition={envelopeTransition}>
          <rect x="6" y="14" width="44" height="30" rx="6" fill="currentColor" />
          <path d="M8 18l20 14 20-14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
        </motion.svg>
        <h2 className={`relative m-0 mt-5 text-[clamp(28px,4.4vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] ${ink}`}>{title}</h2>
        <p className={`relative m-0 mx-auto mt-3 max-w-[440px] text-[clamp(16px,1.6vw,17px)] leading-[1.5] ${muted}`}>{description}</p>
        <motion.form onSubmit={submit} noValidate className="relative mx-auto mt-8 max-w-[460px]" animate={{ x: state === "bad" ? [0, -9, 8, -5, 3, 0] : 0 }} transition={{ duration: 0.4 }}>
          <motion.div
            layout
            className={`flex items-center gap-2 rounded-full bg-[#f5f5f7] p-1.5 dark:bg-[#2c2c2e] ${state === "bad" ? "ring-2 ring-[#ff3b30] dark:ring-[#ff453a]" : "focus-within:ring-2 focus-within:ring-[var(--mk-a)]"}`}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
          >
            <label htmlFor={`${uid}-email`} className="sr-only">
              Email
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              value={email}
              disabled={done}
              aria-invalid={state === "bad"}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className={`h-11 min-w-0 flex-1 bg-transparent px-3 text-left text-[16px] outline-none placeholder:text-[#a1a1a6] disabled:opacity-100 sm:px-4 dark:placeholder:text-[#8e8e93] ${ink}`}
            />
            <motion.button
              layout
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={done}
              className={`flex h-11 flex-none items-center justify-center overflow-hidden rounded-full text-[15px] font-medium text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--mk-a)] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#2c2c2e] ${
                done ? "bg-[#248a3d] dark:bg-[#30d158] dark:text-black" : "bg-[var(--mk-a)]"
              }`}
              initial={false}
              animate={{ width: done ? 44 : 116 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              aria-label={done ? "Subscribed" : "Subscribe"}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {done ? (
                  <motion.svg key="ok" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ scale: 0 }} animate={{ scale: 1 }} aria-hidden="true">
                    <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15 }} />
                  </motion.svg>
                ) : (
                  <motion.span key="t" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }}>
                    Subscribe
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
          <AnimatePresence>
            {fix && !done && (
              <motion.button
                key="fix"
                type="button"
                onClick={() => setEmail(fix)}
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`mx-auto mt-2 block min-h-10 max-w-full overflow-hidden truncate rounded-full px-3 py-2 text-[14px] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[var(--mk-a)] dark:hover:bg-[#2c2c2e] ${muted}`}
              >
                Did you mean <b className="font-semibold text-[var(--mk-a)]">{fix.split("@")[1]}</b>?
              </motion.button>
            )}
          </AnimatePresence>
          <span className="sr-only" role="status">
            {done ? "Subscribed. Welcome aboard." : state === "bad" ? "That email doesn't look right." : ""}
          </span>
        </motion.form>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex -space-x-2" aria-hidden="true">
            <AnimatePresence initial={false}>
              {done && (
                <motion.span
                  key="you"
                  initial={{ scale: 0, x: 10 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 10 }}
                  transition={{ type: "spring", stiffness: 500, damping: 16 }}
                  className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[var(--mk-a)] text-[10px] font-semibold text-white dark:border-[#1c1c1e]"
                >
                  You
                </motion.span>
              )}
            </AnimatePresence>
            {FACES.map((c, i) => (
              <motion.span
                layout
                key={c}
                className="relative h-8 w-8 rounded-full border-2 border-white dark:border-[#1c1c1e]"
                style={{ background: `linear-gradient(140deg, ${c}, ${c}99)`, zIndex: FACES.length - i }}
              />
            ))}
          </div>
          <span className={`text-[14px] ${muted}`}>
            Join{" "}
            <b className={`font-semibold ${ink}`}>
              <Digits n={start + (done ? 1 : 0)} />
            </b>{" "}
            readers
          </span>
        </div>
      </div>
    </section>
  );
}
