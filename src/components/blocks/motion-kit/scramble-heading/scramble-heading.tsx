"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ScrambleHeadingFeature {
  /** Short index shown above the title, e.g. "01". */
  k: string;
  title: string;
  body: string;
}

export interface ScrambleHeadingProps {
  /** Mono line above the headline; it decodes too. */
  eyebrow?: string;
  /** First line of the headline. */
  lead?: string;
  /** Phrases the second line cycles through, in the accent colour. */
  words?: string[];
  features?: ScrambleHeadingFeature[];
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Keeps cycling the last phrase while the section is on screen. */
  autoplay?: boolean;
  className?: string;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

/** Text that resolves out of random characters, left to right. Re-runs whenever `run` changes. */
function Scramble({ text, run, speed = 28, enabled }: { text: string; run: number; speed?: number; enabled: boolean }) {
  // The frame belongs to one (run, text) pair, so a stale frame never shows for new text.
  const [frame, setFrame] = useState<{ key: string; value: string } | null>(null);
  const key = `${run}|${text}`;
  useEffect(() => {
    if (!run || !enabled) return;
    // Seeded per run: the noise varies between runs but never touches render.
    let seed = (run * 7919 + text.length * 104729) % 233280;
    const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    let n = 0;
    let raf = 0;
    let last = 0;
    const total = text.length + 12;
    const tick = (now: number) => {
      if (now - last < speed) {
        raf = requestAnimationFrame(tick);
        return;
      }
      last = now;
      n++;
      if (n > total) {
        setFrame({ key, value: text });
        return;
      }
      const value = text
        .split("")
        .map((ch, i) => (ch === " " ? " " : i < n - 8 ? ch : i < n ? GLYPHS[Math.floor(rand() * GLYPHS.length)] : " "))
        .join("");
      setFrame({ key, value });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, text, speed, enabled, key]);
  // Before the first tick of a run, show the empty start of the decode rather than the answer.
  const pending = enabled && run > 0;
  const shown = frame && frame.key === key ? frame.value : pending ? text.replace(/\S/g, "\u00a0") : text;
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{shown}</span>
    </>
  );
}

const WORDS = ["ship faster.", "sleep better.", "break nothing."];

const FEATURES: ScrambleHeadingFeature[] = [
  { k: "01", title: "Preview every branch", body: "A live URL for every pull request, gone when it merges." },
  { k: "02", title: "Roll back in one click", body: "Every deploy is kept. Pick one and it's live in seconds." },
  { k: "03", title: "Watch it in real time", body: "Logs, errors and traces stream in as users hit the page." },
];

/**
 * Text animation section. The headline decodes out of random glyphs when it scrolls into view,
 * the last phrase keeps re-decoding to a new one, a marker stroke draws under it, and each feature
 * line re-scrambles when you point at it (or tap it).
 */
export function ScrambleHeading({
  eyebrow = "Deploys, rethought",
  lead = "Push code.",
  words = WORDS,
  features = FEATURES,
  accent,
  autoplay = true,
  className,
}: ScrambleHeadingProps) {
  const reduce = useReducedMotion() ?? false;
  const enabled = !reduce;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const [ticks, setTicks] = useState(0);
  const [hover, setHover] = useState<Record<string, number>>({});
  const phrases = words.map((w) => w.trim()).filter(Boolean);
  const cycling = autoplay && enabled && seen && phrases.length > 1;

  useEffect(() => {
    if (!cycling) return;
    const t = setInterval(() => setTicks((n) => n + 1), 3200);
    return () => clearInterval(t);
  }, [cycling]);

  const base = seen ? 1 : 0;
  const run = seen ? 1 + ticks : 0;
  const word = phrases.length ? phrases[ticks % phrases.length] : "";

  return (
    <section
      className={cn(
        "w-full bg-white px-5 py-20 sm:py-24 dark:bg-black",
        !accent && "[--sh-accent:#0071e3] dark:[--sh-accent:#2997ff]",
        className,
      )}
      style={accent ? ({ "--sh-accent": accent } as CSSProperties) : undefined}
    >
      <div ref={ref} className="mx-auto w-full max-w-[1040px]">
        <span className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--sh-accent)] sm:text-[13px]">
          <Scramble text={eyebrow} run={base} enabled={enabled} />
        </span>
        <h2 className="m-0 mt-5 text-[clamp(36px,7.5vw,84px)] font-semibold leading-[1.02] tracking-[-0.05em] text-[#1d1d1f] dark:text-[#f5f5f7]">
          <Scramble text={lead} run={base} speed={34} enabled={enabled} />
          <br />
          {word && (
            <span className="relative inline-block max-w-full whitespace-nowrap text-[var(--sh-accent)]">
              <Scramble text={word} run={run} speed={30} enabled={enabled} />
              <svg
                className="absolute -bottom-3 left-0 h-4 w-full overflow-visible"
                viewBox="0 0 300 16"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  key={enabled ? run : 0}
                  d="M4 10 C 60 2, 140 14, 200 7 S 280 6, 296 9"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".35"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: enabled ? 0 : 1 }}
                  animate={{ pathLength: seen || !enabled ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
            </span>
          )}
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[24px] bg-black/[.07] sm:mt-16 md:grid-cols-3 dark:bg-white/10">
          {features.map((l) => (
            <div
              key={l.k}
              className="group flex flex-col gap-3 bg-white p-6 transition-colors hover:bg-[#fbfbfd] sm:p-7 dark:bg-[#1c1c1e] dark:hover:bg-[#2c2c2e]"
              onPointerEnter={() => setHover((h) => ({ ...h, [l.k]: (h[l.k] ?? 0) + 1 }))}
            >
              <span className="font-mono text-[13px] text-[#86868b] dark:text-[#a1a1a6]">{l.k}</span>
              <span className="font-mono text-[18px] font-semibold tracking-[-0.01em] text-[#1d1d1f] sm:text-[19px] dark:text-[#f5f5f7]">
                <Scramble text={l.title} run={(hover[l.k] ?? 0) + base} speed={22} enabled={enabled} />
              </span>
              <p className="m-0 text-[15px] leading-[1.55] text-[#6e6e73] dark:text-[#a1a1a6]">{l.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
