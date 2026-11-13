"use client";

/* eslint-disable @next/next/no-img-element -- plain img keeps the block free of next.config image settings */

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FocusRailImage {
  src: string;
  alt: string;
  title: string;
  meta?: string;
}

export interface FocusRailGalleryProps {
  /** Four to eight images work best. */
  images?: FocusRailImage[];
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Moves the focus to the next panel on its own. Holds while the pointer is over the rail. Off under reduced motion. */
  autoplay?: boolean;
  /** Milliseconds each panel stays open during autoplay. */
  interval?: number;
  onChange?: (index: number) => void;
  className?: string;
}

const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=1100&q=72&auto=format&fit=crop`;

export const DEFAULT_FOCUS_RAIL_IMAGES: FocusRailImage[] = [
  { src: u("1600585154340-be6161a56a0c"), alt: "A dark modern house with lit windows beside a large tree", title: "Evening house", meta: "Exterior" },
  { src: u("1600210492486-724fe5c67fb0"), alt: "A bright living room with a grid of framed prints and a leather sofa", title: "Gallery wall", meta: "Living" },
  { src: u("1484154218962-a197022b5858"), alt: "A white kitchen with black pendant lights and bar stools", title: "Open kitchen", meta: "Kitchen" },
  { src: u("1512917774080-9991f1c4c750"), alt: "A white villa beside a narrow pool", title: "White villa", meta: "Exterior" },
  { src: u("1618221195710-dd6b41faaea6"), alt: "A living room under a row of high windows with warm wood floors", title: "Clerestory", meta: "Living" },
  { src: u("1586023492125-27b2c045efd7"), alt: "A yellow armchair under a floor lamp", title: "Reading chair", meta: "Detail" },
];

const FOCUS = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const EASE = [0.3, 0.9, 0.25, 1] as const;

function useOnScreen(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setOn(shown && inView);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(el);
    const vis = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [ref, enabled]);
  return on;
}

/**
 * A row of image panels where the focused one opens wide and the rest fold in. It moves on by itself with
 * a progress line under the caption; hover the rail to hold it, click a panel or use the arrow keys to
 * choose. Panels are tabs, so screen readers announce which image is open.
 */
export function FocusRailGallery({
  images = DEFAULT_FOCUS_RAIL_IMAGES,
  eyebrow = "Frame by frame",
  title = "Step through the work at your own pace",
  description = "Pick a panel, or let the rail move the focus for you.",
  autoplay = true,
  interval = 3600,
  onChange,
  className,
}: FocusRailGalleryProps) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const running = useOnScreen(section, autoplay && !reduce) && !held && autoplay && !reduce;

  const go = (i: number, focus = false) => {
    const next = (i + images.length) % images.length;
    setActive(next);
    onChange?.(next);
    if (focus) tabs.current[next]?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % images.length), interval);
    return () => window.clearTimeout(t);
  }, [running, active, interval, images.length]);

  const onKey = (e: ReactKeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(active + 1, true);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(active - 1, true);
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <MotionConfig reducedMotion="user">
      <section ref={section} aria-label={title} className={cn("w-full bg-white px-4 py-14 sm:px-6 sm:py-20 dark:bg-black", className)}>
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.09em] text-[#6b6b77] dark:text-[#9696a2]">{eyebrow}</p>
              <h2 className="mt-1.5 max-w-[18ch] text-balance text-[clamp(26px,3.6vw,38px)] font-semibold leading-[1.08] tracking-[-0.04em] text-[#15151a] dark:text-[#f1f1f4]">{title}</h2>
            </div>
            <div>
              <p className="max-w-[32ch] text-[14px] text-[#6b6b77] dark:text-[#9696a2]">{description}</p>
              <p className="mt-2 font-mono text-[12px] tabular-nums text-[#6b6b77] dark:text-[#9696a2]" aria-live="polite">
                <b className="font-medium text-[#15151a] dark:text-[#f1f1f4]">{pad(active + 1)}</b> / {pad(images.length)}
              </p>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Gallery panels"
            onKeyDown={onKey}
            onPointerEnter={() => setHeld(true)}
            onPointerLeave={() => setHeld(false)}
            className="flex h-[clamp(300px,40vw,460px)] gap-1.5 sm:gap-2.5"
          >
            {images.map((img, i) => {
              const on = i === active;
              return (
                <motion.button
                  key={img.src}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-label={img.title}
                  tabIndex={on ? 0 : -1}
                  onClick={() => go(i)}
                  initial={false}
                  animate={{ flexGrow: on ? 5.2 : 1 }}
                  transition={{ duration: reduce ? 0 : 0.8, ease: EASE }}
                  className={cn("group/panel relative min-w-0 basis-0 overflow-hidden rounded-[18px] bg-[#ececf1] dark:bg-[#1c1c22]", on ? "cursor-default" : "cursor-pointer", FOCUS)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    draggable={false}
                    className={cn(
                      "absolute inset-0 h-full w-full object-cover transition-[scale,filter] duration-[1200ms] ease-[cubic-bezier(.3,.9,.25,1)]",
                      !on && "brightness-[.96] saturate-[.7] group-hover/panel:scale-[1.06] group-hover/panel:saturate-100",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute left-1/2 top-2.5 hidden -translate-x-1/2 rounded-full bg-white/75 px-1.5 py-0.5 font-mono text-[11px] text-[#15151a] backdrop-blur-md transition-opacity sm:block dark:bg-[#141418]/80 dark:text-[#f1f1f4]",
                      on && "opacity-0",
                    )}
                  >
                    {pad(i + 1)}
                  </span>
                  <motion.span
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, y: on ? 0 : 10 }}
                    transition={{ duration: 0.35, delay: on ? 0.35 : 0 }}
                    className="pointer-events-none absolute inset-x-3.5 bottom-3.5 grid gap-2 rounded-[14px] bg-white/75 px-3.5 py-3 text-left text-[#15151a] backdrop-blur-xl dark:bg-[#141418]/80 dark:text-[#f1f1f4]"
                  >
                    <span className="flex items-baseline justify-between gap-2.5">
                      <b className="truncate text-[14px] font-semibold">{img.title}</b>
                      {img.meta && <span className="shrink-0 font-mono text-[11px] text-[#6b6b77] dark:text-[#9696a2]">{img.meta}</span>}
                    </span>
                    {autoplay && !reduce && (
                      <span className="h-[3px] overflow-hidden rounded-full bg-[#15151a]/15 dark:bg-white/15">
                        {on && (
                          <motion.span
                            key={`${active}-${held}`}
                            className="block h-full rounded-full bg-[#15151a] dark:bg-white"
                            initial={{ width: "0%" }}
                            animate={{ width: running ? "100%" : "0%" }}
                            transition={{ duration: running ? interval / 1000 : 0.2, ease: "linear" }}
                          />
                        )}
                      </span>
                    )}
                  </motion.span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
