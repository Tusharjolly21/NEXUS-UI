"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, animate, motion, motionValue, useInView, useReducedMotion, useSpring, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WordmarkFooterLink {
  label: string;
  href: string;
}

export interface WordmarkFooterColumn {
  title: string;
  links: WordmarkFooterLink[];
}

export interface WordmarkFooterProps {
  /** The wordmark. Each letter becomes one key. Keep it to a single short word (4 to 9 letters). */
  brand?: string;
  /** Heading above the newsletter field. */
  newsletterTitle?: string;
  /** Line under the newsletter heading. */
  newsletterText?: string;
  /** Called with the email on submit. Return a promise to show a pending state; throw to show an error. Without it the form simulates success. */
  onSubscribe?: (email: string) => Promise<void> | void;
  /** Link columns. */
  columns?: WordmarkFooterColumn[];
  /** City shown next to the clock. */
  city?: string;
  /** IANA time zone for the clock, for example `"Europe/Lisbon"`. An unknown zone falls back to the visitor's own. */
  timeZone?: string;
  /** Text in the status pill. Pass `null` to hide the pill. */
  status?: string | null;
  /** Where the status pill links to. */
  statusHref?: string;
  /** Year in the copyright line. When omitted it is read from the clock after the page loads. */
  year?: number;
  /** Highlight colour the keys take as they rise, in light mode. */
  accent?: string;
  /** Highlight colour in dark mode. */
  accentDark?: string;
  /** Plays a slow scale across the keys until the first pointer, key or touch. Off under reduced motion, paused when less than 30% is in view. */
  autoplay?: boolean;
  className?: string;
}

const COLUMNS: WordmarkFooterColumn[] = [
  { title: "Product", links: [{ label: "Overview", href: "#" }, { label: "Pricing", href: "#" }, { label: "Integrations", href: "#" }, { label: "Changelog", href: "#" }] },
  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Customers", href: "#" }, { label: "Careers", href: "#" }, { label: "Contact", href: "#" }] },
  { title: "Resources", links: [{ label: "Docs", href: "#" }, { label: "Guides", href: "#" }, { label: "Community", href: "#" }, { label: "Status", href: "#" }] },
];

/** Framework7 Icons (MIT) via Iconify, 56x56 box. */
const ARROW_UP =
  "M27.988 50.137c1.22 0 2.11-.844 2.11-2.063V17.207l-.188-4.992l7.008 7.687l5.344 5.25c.375.375.937.563 1.476.563c1.172 0 2.04-.89 2.04-2.04c0-.562-.212-1.054-.657-1.523L29.56 6.566c-.446-.468-.985-.703-1.57-.703c-.563 0-1.102.235-1.548.703L10.88 22.152c-.445.47-.656.961-.656 1.524c0 1.148.867 2.039 2.015 2.039c.563 0 1.125-.188 1.5-.563l5.32-5.25l7.032-7.71l-.188 5.015v30.867c0 1.219.867 2.063 2.086 2.063";
const CHECK = "m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0";

function Glyph({ d, size }: { d: string; size: number }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const NONE = -100000;
const REST = 46; // percent of its own height each key sits sunk
const TOP = -4; // percent when fully risen
const EMAIL = /^\S+@\S+\.\S+$/;
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotionPref(cb: () => void) {
  const m = window.matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}

function makeFormat(timeZone: string, opts: Intl.DateTimeFormatOptions) {
  try {
    return new Intl.DateTimeFormat("en-GB", { ...opts, timeZone });
  } catch {
    return new Intl.DateTimeFormat("en-GB", opts);
  }
}

/** One key of the wordmark. Its own spring, tuned a little differently from its neighbours, so a pass of the pointer ripples instead of moving as one. */
function Key({ ch, i, lift }: { ch: string; i: number; lift: MotionValue<number> }) {
  const sp = useSpring(lift, { stiffness: 220 + ((i * 53) % 7) * 20, damping: 12 + (i % 3) * 2, mass: 0.8 });
  const y = useTransform(sp, (v) => `${REST - v * (REST - TOP)}%`);
  const scaleY = useTransform(sp, (v) => 1 + v * 0.035);
  const glow = useTransform(sp, [0, 1], [0, 1]);
  const glyph = ch === " " ? " " : ch;
  return (
    <motion.span className="relative inline-block origin-bottom" style={{ y, scaleY }}>
      {glyph}
      <motion.span aria-hidden="true" className="absolute inset-0 text-[color:var(--wf-a)] dark:text-[color:var(--wf-ad)]" style={{ opacity: glow }}>
        {glyph}
      </motion.span>
    </motion.span>
  );
}

/**
 * Footer whose giant wordmark sits half sunk in the bottom edge. Move across it
 * and the letters rise like piano keys, the nearest highest, each on its own
 * spring so they settle one after another. Drag a finger along it on touch, or
 * focus it and use the arrow keys or type a letter. Above it: a newsletter field,
 * link columns, a status pill and the local time. Under reduced motion the keys
 * stay put.
 */
export function WordmarkFooter({
  brand = "Cadenza",
  newsletterTitle = "Small notes, once a month.",
  newsletterText = "What we shipped and what we learned. Nothing else.",
  onSubscribe,
  columns = COLUMNS,
  city = "Lisbon",
  timeZone = "Europe/Lisbon",
  status = "All systems normal",
  statusHref = "#",
  year,
  accent = "#0071e3",
  accentDark = "#2997ff",
  autoplay = true,
  className,
}: WordmarkFooterProps) {
  const reduce = !!useReducedMotion();
  // Same preference, read in a hydration-safe way, for attributes that must match the server markup.
  const calm = useSyncExternalStore(subscribeMotionPref, () => window.matchMedia(QUERY).matches, () => false);
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLElement>(null);
  const row = useRef<HTMLSpanElement>(null);
  const cursor = useRef(-1);
  const touchedRef = useRef(false);
  const inView = useInView(root, { amount: 0.3 });
  const [touched, setTouched] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [note, setNote] = useState("");

  const chars = Array.from(brand);
  const count = chars.length;
  const lifts = useMemo(() => Array.from({ length: count }, () => motionValue(0)), [count]);
  const playing = autoplay && !reduce && !touched && inView;

  const clock = useMemo(() => makeFormat(timeZone, { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }), [timeZone]);
  const yearFmt = useMemo(() => makeFormat(timeZone, { year: "numeric" }), [timeZone]);

  // The clock is read after mount, never during render, so the server and the first client render agree.
  useEffect(() => {
    if (!inView) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [inView]);

  /** Put the "finger" at x (px from the left of the word) and lift each key by how near it is. */
  const setPointer = useCallback(
    (x: number) => {
      const r = row.current;
      if (!r || reduce) return;
      const sigma = (r.offsetWidth / count) * 0.95 || 1;
      for (let i = 0; i < count; i++) {
        const el = r.children[i] as HTMLElement | undefined;
        if (!el) continue;
        const d = (x - (el.offsetLeft + el.offsetWidth / 2)) / sigma;
        lifts[i].set(x <= NONE / 2 ? 0 : Math.exp(-d * d));
      }
    },
    [count, lifts, reduce],
  );

  // The demo: a slow scale across the keys, there and back, with a rest between.
  useEffect(() => {
    if (!playing) return;
    let ctl: AnimationPlaybackControls | undefined;
    let timer = 0;
    const sweep = (dir: 1 | -1) => {
      const w = row.current?.offsetWidth ?? 0;
      const pad = w / count;
      const from = dir === 1 ? -pad : w + pad;
      const to = dir === 1 ? w + pad : -pad;
      ctl = animate(from, to, {
        duration: 2.8,
        ease: [0.45, 0, 0.55, 1] as const,
        onUpdate: setPointer,
        onComplete: () => {
          setPointer(NONE);
          timer = window.setTimeout(() => sweep(dir === 1 ? -1 : 1), 1400);
        },
      });
    };
    timer = window.setTimeout(() => sweep(1), 700);
    return () => {
      ctl?.stop();
      window.clearTimeout(timer);
      if (!touchedRef.current) setPointer(NONE);
    };
  }, [playing, count, setPointer]);

  const interact = () => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    setTouched(true);
  };

  const aim = (e: ReactPointerEvent<HTMLElement>) => {
    interact();
    const r = row.current;
    if (!r) return;
    const box = r.getBoundingClientRect();
    // preview frames may scale the page; offsets are unscaled, so convert
    setPointer((e.clientX - box.left) / ((box.width / (r.offsetWidth || 1)) || 1));
  };
  const release = () => {
    cursor.current = -1;
    setPointer(NONE);
  };

  const centreOf = (i: number) => {
    const el = row.current?.children[i] as HTMLElement | undefined;
    return el ? el.offsetLeft + el.offsetWidth / 2 : NONE;
  };
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (calm || e.altKey || e.ctrlKey || e.metaKey) return;
    let next = cursor.current;
    if (e.key === "ArrowRight") next = Math.min(count - 1, cursor.current + 1);
    else if (e.key === "ArrowLeft") next = cursor.current < 0 ? 0 : Math.max(0, cursor.current - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    else if (e.key === "Escape") {
      release();
      return;
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const typed = e.key.toLowerCase();
      let hit = -1;
      for (let k = 0; k < count && hit < 0; k++) {
        const idx = (cursor.current + 1 + k) % count;
        if (chars[idx].toLowerCase() === typed) hit = idx;
      }
      if (hit < 0) return;
      next = hit;
    } else return;
    e.preventDefault();
    interact();
    cursor.current = next;
    setPointer(centreOf(next));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (phase === "pending" || phase === "sent") return;
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setPhase("error");
      setNote("Enter a valid email address.");
      return;
    }
    setPhase("pending");
    setNote("");
    try {
      await onSubscribe?.(value);
      setPhase("sent");
    } catch {
      setPhase("error");
      setNote("Something went wrong. Try again in a moment.");
    }
  };

  const toTop = () => {
    let p: HTMLElement | null = root.current?.parentElement ?? null;
    while (p && !(p.scrollHeight > p.clientHeight && /(auto|scroll)/.test(getComputedStyle(p).overflowY))) p = p.parentElement;
    (p ?? window).scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const time = now === null ? "--:--:--" : clock.format(now);
  const shownYear = year ?? (now === null ? null : yearFmt.format(now));
  const vars = { "--wf-a": accent, "--wf-ad": accentDark } as CSSProperties;
  const errId = `wf-err-${uid}`;
  const fontSize = `clamp(64px, ${Math.min(40, 88 / (0.56 * count)).toFixed(2)}cqi, 340px)`;
  const fade = "linear-gradient(180deg,#000 0%,#000 58%,rgba(0,0,0,.3) 100%)";

  return (
    <footer ref={root} className={cn("@container w-full", className)} style={vars}>
      <div className="w-full overflow-hidden bg-[#f5f5f7] px-5 pt-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] @2xl:px-10 @2xl:pt-16">
        <div className="mx-auto max-w-[1100px]">
          <div className="grid gap-12 @3xl:grid-cols-[1.3fr_2fr]">
            <div className="max-w-[340px]">
              <p className="m-0 text-[22px] font-semibold leading-tight tracking-[-0.02em]">{newsletterTitle}</p>
              <p className="m-0 mt-2 text-[14px] leading-[1.5] text-[#6e6e73] dark:text-[#98989d]">{newsletterText}</p>
              <form
                onSubmit={submit}
                noValidate
                className="relative mt-5 flex h-[52px] items-center rounded-full bg-white p-1 pl-5 ring-1 ring-black/[.08] focus-within:ring-2 focus-within:ring-[#0071e3] dark:bg-[#1c1c1e] dark:ring-white/10 dark:focus-within:ring-[#2997ff]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {phase === "sent" ? (
                    <motion.p
                      key="ok"
                      role="status"
                      className="m-0 flex flex-1 items-center gap-2.5 text-[14px]"
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="grid size-6 place-items-center rounded-full bg-[color:var(--wf-a)] text-white dark:bg-[color:var(--wf-ad)] dark:text-black">
                        <Glyph d={CHECK} size={13} />
                      </span>
                      You are on the list.
                    </motion.p>
                  ) : (
                    <motion.input
                      key="in"
                      exit={reduce ? undefined : { opacity: 0, y: -8 }}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (phase === "error") setPhase("idle");
                      }}
                      placeholder="you@company.com"
                      aria-label="Email address"
                      aria-invalid={phase === "error"}
                      aria-describedby={errId}
                      className="min-w-0 flex-1 bg-transparent text-[15px] text-[#1d1d1f] outline-hidden placeholder:text-[#6e6e73] dark:text-[#f5f5f7] dark:placeholder:text-[#98989d]"
                    />
                  )}
                </AnimatePresence>
                {phase !== "sent" && (
                  <motion.button
                    whileTap={reduce ? undefined : { scale: 0.96 }}
                    type="submit"
                    disabled={phase === "pending"}
                    className="h-11 shrink-0 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white outline-hidden focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-[#1c1c1e]"
                  >
                    {phase === "pending" ? "Sending" : "Subscribe"}
                  </motion.button>
                )}
              </form>
              <p id={errId} role="status" className="m-0 mt-2 min-h-5 pl-5 text-[13px] text-[#c4001a] dark:text-[#ff6961]">
                {phase === "error" ? note : ""}
              </p>
            </div>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-8 @md:grid-cols-3">
              {columns.map((c) => (
                <div key={c.title}>
                  <p className="m-0 text-[13px] font-semibold">{c.title}</p>
                  <ul className="m-0 mt-2 flex list-none flex-col p-0">
                    {c.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          className="group relative inline-flex items-center rounded-xs py-1.5 text-[14px] text-[#6e6e73] no-underline outline-hidden transition-colors hover:text-[#1d1d1f] focus-visible:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3] pointer-coarse:min-h-11 dark:text-[#98989d] dark:hover:text-[#f5f5f7] dark:focus-visible:text-[#f5f5f7] dark:focus-visible:ring-[#2997ff]"
                        >
                          {l.label}
                          <span className="absolute bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-current transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-black/[.08] pt-5 text-[13px] text-[#6e6e73] dark:border-white/[.12] dark:text-[#98989d]">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {status !== null && (
                <a
                  href={statusHref}
                  className="inline-flex min-h-11 items-center gap-2.5 rounded-full bg-white px-4 text-[#1d1d1f] no-underline outline-hidden ring-1 ring-black/[.08] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:ring-white/10 dark:focus-visible:ring-[#2997ff]"
                >
                  <span className="relative flex size-2" aria-hidden="true">
                    <span className="absolute inset-0 rounded-full bg-[#30d158] opacity-60 motion-safe:animate-ping" />
                    <span className="relative size-2 rounded-full bg-[#30d158]" />
                  </span>
                  {status}
                </a>
              )}
              <span className="tabular-nums">
                {city} <span aria-hidden="true">·</span> {time}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                &copy;{shownYear ? ` ${shownYear}` : ""} {brand}
              </span>
              <motion.button
                type="button"
                onClick={toTop}
                whileHover={reduce ? undefined : { y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                aria-label="Back to top"
                className="grid size-11 place-items-center rounded-full bg-white text-[#1d1d1f] outline-hidden ring-1 ring-black/[.08] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:ring-white/10 dark:focus-visible:ring-[#2997ff]"
              >
                <Glyph d={ARROW_UP} size={15} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* the wordmark: half sunk into the bottom edge */}
        <div
          role="group"
          aria-label={`${brand} wordmark. Use the left and right arrow keys, or type a letter, to raise a key. Escape lets go.`}
          tabIndex={calm ? undefined : 0}
          onPointerMove={aim}
          onPointerDown={aim}
          onPointerLeave={release}
          onPointerCancel={release}
          onPointerUp={(e) => e.pointerType !== "mouse" && release()}
          onKeyDown={onKey}
          onBlur={release}
          className="relative mx-auto mt-6 max-w-[1180px] touch-pan-y select-none rounded-t-3xl pt-10 outline-hidden focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#2997ff]"
        >
          <div className="relative overflow-hidden" style={{ fontSize, height: "0.92em", maskImage: fade, WebkitMaskImage: fade }} aria-hidden="true">
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <span ref={row} className="relative flex whitespace-nowrap font-semibold leading-[0.8] tracking-[-0.06em]">
                {chars.map((ch, i) => (
                  <Key key={i} ch={ch} i={i} lift={lifts[i]} />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
