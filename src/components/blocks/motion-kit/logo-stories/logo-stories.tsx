"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LogoStory {
  /** Wordmark text next to the mark. Also the key, so keep it unique. */
  name: string;
  /** Inline SVG shapes drawn in a 20 x 20 box. Use `currentColor` so the mark follows the theme. */
  mark: ReactNode;
  /** The headline number, for example "3.2x". */
  metric: string;
  /** What the number measures. */
  what: string;
  quote: string;
  /** Who said it, for example "Sara Kim, Head of Growth". The company name is appended. */
  who: string;
}

export interface LogoStoriesProps {
  /** Small caps line above the logos. */
  heading?: string;
  /** Customer stories, one per logo. Eight fills two rows on a phone and two on a desktop. Use a stable array. */
  stories?: LogoStory[];
  /**
   * Glides the highlight from logo to logo on a timer until the visitor hovers, focuses or clicks a logo.
   * Pauses while the card is hovered, off screen or in a hidden tab. Never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Milliseconds each story stays up while autoplaying. */
  dwell?: number;
  /** Label of the link under each quote. */
  readLabel?: string;
  /** Called when the visitor presses the read-the-story link. Nothing navigates. */
  onReadStory?: (story: LogoStory) => void;
  className?: string;
}

const ink = "currentColor";

/* Invented companies, people and numbers for the demo. Replace with real, approved case studies. */
export const DEFAULT_LOGO_STORIES: LogoStory[] = [
  {
    name: "Orbitly",
    mark: <circle cx="10" cy="10" r="7" fill="none" stroke={ink} strokeWidth="2.4" />,
    metric: "3.2×",
    what: "faster landing pages",
    quote: "We stopped hand-tuning animations. New pages go out the same week they're designed.",
    who: "Sara Kim, Head of Growth",
  },
  {
    name: "Northgale",
    mark: (
      <path
        d="M3 8c2.5-2 4.5-2 7 0s4.5 2 7 0M3 13c2.5-2 4.5-2 7 0s4.5 2 7 0"
        fill="none"
        stroke={ink}
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
    metric: "−41%",
    what: "onboarding drop-off",
    quote: "The new checklist moves people along instead of lecturing them. Completion went straight up.",
    who: "Lena Ortiz, Product Lead",
  },
  {
    name: "Hexel",
    mark: <path d="M10 2l7 4v8l-7 4-7-4V6z" fill={ink} />,
    metric: "12 kB",
    what: "added to the bundle",
    quote: "We expected a heavy library. It's one file per component and we own every line.",
    who: "Tom Becker, Staff Engineer",
  },
  {
    name: "Quadrel",
    mark: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1.5" fill={ink} />
        <rect x="11" y="11" width="6" height="6" rx="1.5" fill={ink} />
        <rect x="11" y="3" width="6" height="6" rx="1.5" fill={ink} opacity=".35" />
        <rect x="3" y="11" width="6" height="6" rx="1.5" fill={ink} opacity=".35" />
      </>
    ),
    metric: "AA",
    what: "accessibility, out of the box",
    quote: "Reduced motion and focus states were already handled. Our audit came back clean.",
    who: "Noor Haddad, Accessibility",
  },
  {
    name: "Velara",
    mark: <path d="M10 3l8 14H2z" fill="none" stroke={ink} strokeWidth="2.2" strokeLinejoin="round" />,
    metric: "+28%",
    what: "pricing page conversion",
    quote: "Same plans, same copy. The page just feels considered now, and people trust it.",
    who: "Ana Lima, Brand Director",
  },
  {
    name: "Pulsely",
    mark: (
      <path d="M2 11h4l2-6 4 10 2-4h4" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    ),
    metric: "2 days",
    what: "from Figma to production",
    quote: "Design hands over a frame, we paste a component and tune two springs. Done.",
    who: "Dev Patel, Founder",
  },
  {
    name: "Meridane",
    mark: (
      <>
        <circle cx="10" cy="10" r="7.5" fill="none" stroke={ink} strokeWidth="2" />
        <path d="M2.5 10h15" stroke={ink} strokeWidth="2" />
      </>
    ),
    metric: "60 fps",
    what: "on a five-year-old phone",
    quote: "Everything animates transforms and opacity only. It never stutters, even on cheap Androids.",
    who: "Eli Novak, CTO",
  },
  {
    name: "Lumora",
    mark: (
      <>
        <circle cx="10" cy="10" r="4" fill={ink} />
        <path d="M10 1v3M10 16v3M1 10h3M16 10h3" stroke={ink} strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    metric: "1 week",
    what: "to rebuild the marketing site",
    quote: "Two engineers, no designer on loan, and it looks like an agency did it.",
    who: "Kai Ito, Engineering Manager",
  },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

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

/**
 * A logo cloud where every logo has a story behind it. A highlight glides from logo to logo on a timer,
 * and the panel underneath swaps to that customer's headline result and quote. Hover or tab to a logo to
 * jump to it; the timer stops for good once you do, and waits while you hover the card.
 */
export function LogoStories({
  heading = "Teams shipping with Nexus",
  stories = DEFAULT_LOGO_STORIES,
  autoplay = false,
  dwell = 4500,
  readLabel = "Read the story →",
  onReadStory,
  className,
}: LogoStoriesProps) {
  const reduce = useReducedMotion();
  const uid = useId();
  const panelId = `${uid}-panel`;
  const root = useRef<HTMLElement>(null);
  const onScreen = useOnScreen(root);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [touched, setTouched] = useState(false);

  const count = stories.length;
  const index = Math.min(active, Math.max(0, count - 1));
  const s = stories[index];
  const playing = autoplay && !reduce && !touched && count > 1;
  const running = playing && !hovered && onScreen;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a + 1) % count), dwell);
    return () => window.clearTimeout(id);
  }, [running, active, count, dwell]);

  const pick = (i: number) => {
    setTouched(true);
    setActive(i);
  };

  const metricVariants: Variants = reduce
    ? { in: { opacity: 0 }, show: { opacity: 1 }, out: { opacity: 0, transition: { duration: 0.1 } } }
    : {
        in: { opacity: 0, y: 14, filter: "blur(6px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)" },
        out: { opacity: 0, y: -8, filter: "blur(4px)", transition: { duration: 0.15 } },
      };
  const quoteVariants: Variants = reduce
    ? { in: { opacity: 0 }, show: { opacity: 1 }, out: { opacity: 0, transition: { duration: 0.1 } } }
    : {
        in: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0 },
        out: { opacity: 0, transition: { duration: 0.15 } },
      };

  if (!s) return null;

  return (
    <section
      ref={root}
      aria-label="Customer stories"
      className={cn("flex w-full justify-center bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}
    >
      <div
        className="w-full max-w-[760px] rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] sm:p-7 dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_#3a3a3c,0_20px_40px_-26px_rgba(0,0,0,.9)]"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <p className="m-0 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-[#6e6e73] dark:text-[#a1a1a6]">
          {heading}
        </p>
        <LayoutGroup id={`${uid}-hl`}>
          <div className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="tablist" aria-label="Customer stories">
            {stories.map((l, i) => {
              const on = i === index;
              return (
                <button
                  key={l.name}
                  type="button"
                  role="tab"
                  id={`${uid}-tab-${i}`}
                  aria-selected={on}
                  aria-controls={panelId}
                  onPointerEnter={() => pick(i)}
                  onFocus={() => pick(i)}
                  onClick={() => pick(i)}
                  className={cn("relative flex h-[64px] items-center justify-center gap-2 rounded-[16px]", FOCUS)}
                >
                  {on && (
                    <motion.span
                      layoutId="ls-hl"
                      className="absolute inset-0 overflow-hidden rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 34 }}
                    >
                      {running && (
                        <motion.span
                          key={index}
                          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: dwell / 1000, ease: "linear" }}
                        />
                      )}
                    </motion.span>
                  )}
                  <span
                    className={cn(
                      "relative flex items-center gap-2 transition-colors duration-[250ms]",
                      on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#a1a1a6] dark:text-[#8e8e93]",
                    )}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                      {l.mark}
                    </svg>
                    <span className="text-[16px] font-semibold tracking-[-0.02em]">{l.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${index}`}
          aria-live={playing ? "off" : "polite"}
          className="relative mt-5 min-h-[150px] rounded-[20px] bg-[#f5f5f7] p-5 sm:p-6 dark:bg-[#2c2c2e]"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.name}
              className="grid gap-4 sm:grid-cols-[180px_1fr] sm:gap-6"
              initial="in"
              animate="show"
              exit="out"
              variants={{ in: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06 } }, out: {} }}
            >
              <motion.div variants={metricVariants}>
                <div className="text-[44px] font-semibold leading-none tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {s.metric}
                </div>
                <div className="mt-2 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{s.what}</div>
              </motion.div>
              <motion.figure className="m-0 flex flex-col justify-between gap-3" variants={quoteVariants}>
                <blockquote className="m-0 text-[17px] leading-[1.45] tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <figcaption className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  <span>
                    {s.who}, {s.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => onReadStory?.(s)}
                    className={cn(
                      "rounded-sm font-medium text-[#0071e3] hover:underline focus-visible:underline dark:text-[#0a84ff]",
                      FOCUS,
                    )}
                  >
                    {readLabel}
                  </button>
                </figcaption>
              </motion.figure>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
