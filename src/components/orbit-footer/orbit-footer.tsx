"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";

export type OrbitFooterLink = { label: string; href: string; badge?: string };
export type OrbitFooterColumn = { title: string; links: OrbitFooterLink[] };
export type OrbitFooterSocial = { label: string; href: string; icon: React.ReactNode };

export type OrbitFooterProps = {
  /** Wordmark shown top-left and as the large ghost word at the bottom. */
  brand?: string;
  tagline?: string;
  columns?: OrbitFooterColumn[];
  /** Status line next to the green dot. Pass `null` to hide it. */
  status?: string | null;
  statusHref?: string;
  /** Newsletter signup. Called with the email; return a promise to show a pending state, throw to show an error. Without it the form simulates success locally. */
  onSubscribe?: (email: string) => Promise<void> | void;
  showNewsletter?: boolean;
  /** Draw the giant ghost wordmark under the links. */
  showWordmark?: boolean;
  /** Social links shown next to the status pill. */
  socials?: OrbitFooterSocial[];
  /** Year in the copyright line. Omitted when not given, so server and client always agree. */
  year?: number;
  /** Text after the © and year. Defaults to the brand. */
  legal?: string;
  /** Sweeps a wave through the wordmark until someone points at the footer. */
  autoplay?: boolean;
  className?: string;
};

const DEFAULT_COLUMNS: OrbitFooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Components", href: "#" },
      { label: "Templates", href: "#" },
      { label: "Blocks", href: "#", badge: "New" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "#" },
      { label: "CLI", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#", badge: "3" },
      { label: "Contact", href: "#" },
    ],
  },
];

function XMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.36 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
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

const DEFAULT_SOCIALS: OrbitFooterSocial[] = [
  { label: "X", href: "#", icon: <XMark className="size-4" /> },
  { label: "GitHub", href: "#", icon: <GithubMark className="size-4" /> },
];

function OrbitMark() {
  return (
    <span aria-hidden className="relative flex size-8 shrink-0 items-center justify-center">
      <span className="absolute inset-0 rounded-full border-[1.5px] border-[#1d1d1f]/15 dark:border-white/20" />
      <span className="size-3 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" />
      <motion.span
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 6, ease: "linear", repeat: Infinity }}
      >
        <span className="absolute -top-[3px] left-1/2 size-[6px] -translate-x-1/2 rounded-full bg-[#0071e3] shadow-[0_0_8px_rgba(0,113,227,.7)] dark:bg-[#0a84ff]" />
      </motion.span>
    </span>
  );
}

/** One letter of the ghost wordmark: it lifts and inks in as the wave passes. */
function Letter({ ch, wave, still }: { ch: string; wave: MotionValue<number>; still: boolean }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const near = useTransform(wave, (x) => {
    const el = ref.current;
    if (still || !el || !Number.isFinite(x)) return 0;
    const d = (x - (el.offsetLeft + el.offsetWidth / 2)) / Math.max(40, el.offsetWidth * 1.1);
    return Math.exp(-d * d);
  });
  const lift = useSpring(near, { stiffness: 260, damping: 14, mass: 0.6 });
  const y = useTransform(lift, (v) => `${-v * 18}%`);
  const ink = useTransform(lift, (v) => Math.max(0, Math.min(1, v)));
  const scaleY = useTransform(lift, (v) => 1 + v * 0.06);
  return (
    <motion.span ref={ref} className="relative inline-block origin-bottom" style={{ y, scaleY }}>
      <span className="bg-gradient-to-b from-[#1d1d1f]/[.12] to-[#1d1d1f]/0 bg-clip-text text-transparent dark:from-[#f5f5f7]/[.16] dark:to-[#f5f5f7]/0">{ch === " " ? "\u00a0" : ch}</span>
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-[#1d1d1f] via-[#1d1d1f]/60 to-[#1d1d1f]/0 bg-clip-text text-transparent dark:from-[#f5f5f7] dark:via-[#f5f5f7]/60 dark:to-[#f5f5f7]/0"
        style={{ opacity: ink }}
      >
        {ch === " " ? " " : ch}
      </motion.span>
    </motion.span>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A complete site footer: brand, newsletter signup, link columns with
 * badges, a live status pill and socials. Under it sits a giant ghost
 * wordmark; move along it and the letters lift and ink in like a wave
 * following your pointer.
 */
export function OrbitFooter({
  brand = "Orbit",
  tagline = "Interfaces that move, shipped as code you own.",
  columns = DEFAULT_COLUMNS,
  status = "All systems normal",
  statusHref = "#",
  onSubscribe,
  showNewsletter = true,
  showWordmark = true,
  socials = DEFAULT_SOCIALS,
  year,
  legal,
  autoplay = false,
  className = "",
}: OrbitFooterProps) {
  const still = useReducedMotion() === true;
  const id = React.useId();
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<"idle" | "pending" | "done" | "error">("idle");
  const [hint, setHint] = React.useState<string | null>(null);
  const wave = useMotionValue(Number.NEGATIVE_INFINITY);
  const word = React.useRef<HTMLDivElement>(null);
  const touched = React.useRef(false);
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (!autoplay || still || !showWordmark) return;
    let run: AnimationPlaybackControls | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    let dir = 1;
    const sweep = () => {
      const el = word.current;
      if (touched.current || !el) return;
      const w = el.scrollWidth;
      run = animate(dir > 0 ? -w * 0.1 : w * 1.1, dir > 0 ? w * 1.1 : -w * 0.1, {
        duration: 2.6,
        ease: [0.42, 0, 0.58, 1],
        onUpdate: (x) => {
          if (!touched.current) wave.set(x);
        },
        onComplete: () => {
          dir *= -1;
          wait = setTimeout(sweep, 900);
        },
      });
    };
    wait = setTimeout(sweep, 500);
    return () => {
      run?.stop();
      clearTimeout(wait);
    };
  }, [autoplay, still, showWordmark, wave]);

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    touched.current = true;
    if (state === "pending") return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setState("error");
      setHint("Enter a valid email address.");
      return;
    }
    setState("pending");
    setHint(null);
    try {
      if (onSubscribe) await onSubscribe(value);
      else await new Promise((r) => setTimeout(r, 900));
      if (!alive.current) return;
      setState("done");
      setHint("You're on the list. Check your inbox.");
    } catch {
      if (!alive.current) return;
      setState("error");
      setHint("That didn't go through. Try again.");
    }
  }

  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";
  const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
  const soft = "text-[#6e6e73] dark:text-[#a1a1a6]";
  const letters = Array.from(brand);

  return (
    <footer
      className={`@container relative w-full overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="px-6 pt-6 @[720px]:px-10 @[720px]:pt-9">
        <div className="flex flex-col gap-5 @[560px]:flex-row @[560px]:items-start @[560px]:justify-between @[560px]:gap-8">
          <div className="max-w-[280px]">
            <div className="flex items-center gap-2.5">
              <OrbitMark />
              <span className={`text-[19px] font-semibold tracking-[-0.03em] ${ink}`}>{brand}</span>
            </div>
            {tagline && <p className={`mt-3 text-[14px] leading-relaxed ${soft}`}>{tagline}</p>}
          </div>

          {showNewsletter && (
            <form onSubmit={subscribe} noValidate className="w-full @[560px]:max-w-[320px]">
              <label htmlFor={`${id}-email`} className={`text-[13px] font-semibold tracking-[-0.01em] ${ink}`}>
                Get the monthly changelog
              </label>
              <motion.div
                className={`mt-2 flex h-11 items-center gap-1 rounded-full bg-[#f0f0f3] p-1 pl-4 ring-1 transition-[box-shadow] focus-within:ring-2 dark:bg-[#2c2c2e] ${
                  state === "error" ? "ring-[#ff3b30]" : "ring-transparent focus-within:ring-[#0071e3] dark:focus-within:ring-[#0a84ff]"
                }`}
                animate={state === "error" && !still ? { x: [0, -7, 6, -4, 3, 0] } : { x: 0 }}
                transition={{ duration: 0.42 }}
              >
                <input
                  id={`${id}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  value={email}
                  disabled={state === "pending" || state === "done"}
                  onChange={(e) => {
                    touched.current = true;
                    setEmail(e.target.value);
                    if (state === "error") {
                      setState("idle");
                      setHint(null);
                    }
                  }}
                  aria-invalid={state === "error"}
                  aria-describedby={`${id}-hint`}
                  className={`min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#86868b] disabled:opacity-60 dark:placeholder:text-[#8e8e93] ${ink}`}
                />
                <motion.button
                  type="submit"
                  layout={!still}
                  disabled={state === "pending" || state === "done"}
                  whileTap={still ? undefined : { scale: 0.94 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  aria-label={state === "done" ? "Subscribed" : state === "pending" ? "Subscribing" : "Subscribe"}
                  className={`relative flex h-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-[13px] font-semibold text-white ${focus} ${
                    state === "done" ? "w-9 bg-[#30d158]" : "bg-[#0071e3] px-4 hover:bg-[#0077ed] dark:bg-[#0a84ff]"
                  }`}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {state === "done" ? (
                      <motion.svg key="ok" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <motion.path d="M3.5 8.5 6.5 11.5 12.5 4.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: "easeOut" }} />
                      </motion.svg>
                    ) : state === "pending" ? (
                      <motion.span key="wait" className="flex gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
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
                      <motion.span key="go" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                        Subscribe
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
              <p id={`${id}-hint`} role="status" aria-live="polite" className={`mt-2 min-h-[18px] text-[12.5px] ${state === "error" ? "text-[#d70015] dark:text-[#ff6961]" : soft}`}>
                {hint ?? "One email a month. No spam."}
              </p>
            </form>
          )}
        </div>

        <nav aria-label="Footer" className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 @[480px]:grid-cols-3 @[720px]:mt-8">
          {columns.map((col) => (
            <div key={col.title}>
              <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${soft}`}>{col.title}</p>
              <ul className="mt-2.5 space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={`group inline-flex items-center gap-1.5 rounded-md text-[14px] tracking-[-0.01em] ${ink} ${focus}`}>
                      <span className="relative">
                        {l.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" aria-hidden />
                      </span>
                      {l.badge && (
                        <span className="rounded-full bg-[#0071e3]/10 px-1.5 py-px text-[11px] font-semibold tabular-nums text-[#0066cc] dark:bg-[#0a84ff]/20 dark:text-[#64b5ff]">
                          {l.badge}
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {status !== null ? (
            <a href={statusHref} className={`inline-flex items-center gap-2 rounded-full bg-[#f0f0f3] py-1.5 pl-2.5 pr-3 text-[12.5px] font-medium dark:bg-[#2c2c2e] ${ink} ${focus}`}>
              <span className="relative flex size-2" aria-hidden>
                {!still && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-[#30d158]"
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span className="relative size-2 rounded-full bg-[#30d158]" />
              </span>
              {status}
            </a>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-1">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className={`flex size-9 items-center justify-center rounded-full ${soft} transition-colors hover:bg-black/[.05] hover:text-[#1d1d1f] dark:hover:bg-white/[.08] dark:hover:text-[#f5f5f7] ${focus}`}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {showWordmark && (
        <div
          ref={word}
          aria-hidden
          className="relative mt-4 select-none whitespace-nowrap px-4 text-center text-[clamp(72px,27cqw,260px)] font-semibold leading-[0.8] tracking-[-0.06em]"
          onPointerMove={(e) => {
            touched.current = true;
            const r = e.currentTarget.getBoundingClientRect();
            wave.set(e.clientX - r.left);
          }}
          onPointerLeave={() => wave.set(Number.NEGATIVE_INFINITY)}
          style={{ marginBottom: "-0.2em" }}
        >
          {letters.map((ch, i) => (
            <Letter key={`${ch}${i}`} ch={ch} wave={wave} still={still} />
          ))}
        </div>
      )}

      <div className={`relative flex flex-wrap items-center justify-between gap-2 border-t border-black/[.06] bg-white px-6 py-4 text-[12.5px] dark:border-white/10 dark:bg-[#1c1c1e] @[720px]:px-10 ${soft}`}>
        <span>
          © {year ? `${year} ` : ""}
          {legal ?? brand}
        </span>
        <span className="flex gap-4">
          <a href="#" className={`rounded hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] ${focus}`}>
            Privacy
          </a>
          <a href="#" className={`rounded hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] ${focus}`}>
            Terms
          </a>
        </span>
      </div>
    </footer>
  );
}
