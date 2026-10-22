"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface ParallaxSlide {
  /** Large title that rises in letter by letter. */
  title: string;
  /** Small caps line above the title. */
  kicker: string;
  /** Sky gradient, top then bottom. */
  sky: [string, string];
  /** Colour of the sun disc. */
  sun: string;
  /** Far and near hill colours. */
  land: [string, string];
}

export interface ParallaxSliderProps {
  slides?: ParallaxSlide[];
  /** Accessible name for the slider. */
  label?: string;
  /** How long each slide waits before moving on when `autoplay` is on, in milliseconds. */
  intervalMs?: number;
  /**
   * Moves to the next slide by itself until the visitor drags, presses a key, uses a button or focuses
   * the slider. Pauses off screen and in a hidden tab, and never runs under reduced motion.
   */
  autoplay?: boolean;
  /** Plays a soft swipe when the slide changes. It follows the site-wide sound switch. Autoplay makes the same sound once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
}

/* Landscapes drawn from gradients, so the demo needs no image files. Swap in your own scenes. */
export const DEFAULT_PARALLAX_SLIDES: ParallaxSlide[] = [
  { title: "Lofoten", kicker: "Norway · Winter light", sky: ["#2c3e66", "#9db4d6"], sun: "#f8f4e8", land: ["#3d4f74", "#1b2640"] },
  { title: "Big Sur", kicker: "California · Coast road", sky: ["#ff9a8b", "#ffd3a5"], sun: "#fff3d6", land: ["#b45c74", "#5c2840"] },
  { title: "Atacama", kicker: "Chile · High desert", sky: ["#fbc2eb", "#a6c1ee"], sun: "#ffffff", land: ["#c28f6b", "#6e4329"] },
  { title: "Kyoto", kicker: "Japan · Spring", sky: ["#e0f2e9", "#9ed8b5"], sun: "#fffbe6", land: ["#3f8f5c", "#1a4d31"] },
  { title: "Sahara", kicker: "Morocco · Dunes", sky: ["#fddb92", "#f6a96b"], sun: "#fff8e1", land: ["#d98a47", "#9a5520"] },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { type: "spring", stiffness: 220, damping: 32 } as const;

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

function Scene({ s, i, x, w }: { s: ParallaxSlide; i: number; x: MotionValue<number>; w: number }) {
  // The picture inside each slide moves slower than the slide itself: depth.
  const px = useTransform(x, (v) => (v + i * w) * -0.35);
  const fx = useTransform(x, (v) => (v + i * w) * -0.15);
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-y-0 -left-[20%] -right-[20%]"
        style={{ x: px, background: `linear-gradient(180deg, ${s.sky[0]}, ${s.sky[1]})` }}
      >
        <span
          className="absolute left-[58%] top-[24%] h-[14%] w-auto rounded-full"
          style={{ aspectRatio: "1", background: s.sun, boxShadow: `0 0 60px ${s.sun}` }}
        />
      </motion.div>
      <motion.svg
        className="absolute inset-x-[-20%] bottom-0 h-[55%] w-[140%]"
        style={{ x: fx }}
        viewBox="0 0 140 55"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 22 C 20 10, 40 30, 60 18 S 100 8, 140 20 V55 H0Z" fill={s.land[0]} />
        <path d="M0 38 C 30 26, 55 44, 85 32 S 125 36, 140 34 V55 H0Z" fill={s.land[1]} />
      </motion.svg>
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    </div>
  );
}

/**
 * A full-width photo slider with depth. Drag or flick it and the picture inside each slide trails behind
 * the frame; the title rises in letter by letter; the counter rolls; the segment for the current slide
 * fills while it waits to move on. Arrow keys, Home and End work, the segments and buttons jump around,
 * and any interaction stops `autoplay`. Under reduced motion slides change instantly and titles fade.
 */
export function ParallaxSlider({
  slides = DEFAULT_PARALLAX_SLIDES,
  label = "Destinations",
  intervalMs = 4500,
  autoplay = false,
  enableSound = true,
  className,
}: ParallaxSliderProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(800);
  const [i, setI] = useState(0);
  const [touched, setTouched] = useState(false);
  const x = useMotionValue(0);
  const iRef = useRef(0);
  const move = useRef<ReturnType<typeof animate> | null>(null);
  const n = slides.length;
  const auto = autoplay && !touched && !reduce && n > 1;
  const active = useDemoActive(section, auto);
  const running = auto && active;

  useEffect(() => {
    iRef.current = i;
  }, [i]);

  // Slides are as wide as the frame; keep the track on the current slide when the frame resizes.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const nw = el.offsetWidth;
      if (!nw) return;
      setW(nw);
      move.current?.stop();
      x.set(-iRef.current * nw);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      move.current?.stop();
    };
  }, [x]);

  const go = (target: number, by: "user" | "auto") => {
    if (n < 1) return;
    const k = ((target % n) + n) % n;
    setI(k);
    move.current?.stop();
    move.current = animate(x, -k * w, reduce ? { duration: 0 } : SPRING);
    if (k !== i) {
      if (by === "auto") play.auto("swipe", 0.4);
      else play("swipe", 0.4);
    }
  };

  // The auto timer reads the latest handler through a ref so it never restarts on re-render.
  const latest = useRef(go);
  useEffect(() => {
    latest.current = go;
  });

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => latest.current(iRef.current + 1, "auto"), intervalMs);
    return () => window.clearTimeout(id);
  }, [running, i, intervalMs]);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    if (key !== "ArrowRight" && key !== "ArrowLeft" && key !== "Home" && key !== "End") return;
    e.preventDefault();
    setTouched(true);
    go(key === "ArrowRight" ? i + 1 : key === "ArrowLeft" ? i - 1 : key === "Home" ? 0 : n - 1, "user");
  };

  const slide = slides[i] ?? slides[0];
  if (!slide) return null;
  const pad = String(i + 1).padStart(2, "0");
  const rise = reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 } } : { initial: { y: "100%", opacity: 0 }, animate: { y: 0, opacity: 1 } };

  return (
    <section
      ref={section}
      aria-label={label}
      className={cn("w-full bg-white px-4 py-12 sm:px-6 sm:py-16 dark:bg-black", className)}
      onPointerDownCapture={() => setTouched(true)}
      onFocusCapture={() => setTouched(true)}
    >
      <div className="mx-auto w-full max-w-[1200px]" onKeyDown={onKeyDown}>
        <div
          ref={box}
          className={cn("relative aspect-[4/5] w-full overflow-hidden rounded-[28px] bg-[#1d1d1f] sm:aspect-[16/8] dark:bg-[#1c1c1e]", FOCUS)}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label={`${slide.title}, slide ${i + 1} of ${n}`}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 flex cursor-grab touch-pan-y active:cursor-grabbing"
            style={{ x, width: w * n }}
            drag="x"
            dragConstraints={{ left: -(n - 1) * w, right: 0 }}
            dragElastic={0.12}
            onDragStart={() => setTouched(true)}
            onDragEnd={(_, info) => {
              const shift = info.offset.x + info.velocity.x * 0.2;
              const next = shift < -w * 0.18 ? i + 1 : shift > w * 0.18 ? i - 1 : i;
              go(Math.max(0, Math.min(n - 1, next)), "user");
            }}
          >
            {slides.map((s, k) => (
              <div key={`${k}-${s.title}`} className="relative h-full flex-none" style={{ width: w }}>
                <Scene s={s} i={k} x={x} w={w} />
              </div>
            ))}
          </motion.div>

          {/* caption */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div key={i} exit={{ opacity: 0, y: reduce ? 0 : -10, transition: { duration: reduce ? 0.1 : 0.2 } }}>
                <motion.p
                  className="m-0 text-[13px] font-medium uppercase tracking-[0.14em] text-white/90"
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.15 }}
                >
                  {slide.kicker}
                </motion.p>
                <h3 className="m-0 mt-2 flex flex-wrap gap-x-[0.25em] overflow-hidden pb-[0.1em] text-[clamp(44px,9vw,96px)] font-semibold leading-[0.95] tracking-[-0.045em] text-white">
                  <span className="sr-only">{slide.title}</span>
                  {slide.title.split(" ").map((word, wi, words) => {
                    const before = words.slice(0, wi).join(" ").length + (wi > 0 ? 1 : 0);
                    return (
                      <span key={wi} aria-hidden="true" className="inline-flex whitespace-nowrap">
                        {[...word].map((c, ci) => (
                          <motion.span
                            key={ci}
                            className="inline-block"
                            initial={rise.initial}
                            animate={rise.animate}
                            transition={
                              reduce ? { duration: 0.2 } : { delay: 0.2 + (before + ci) * 0.035, type: "spring", stiffness: 300, damping: 26 }
                            }
                          >
                            {c}
                          </motion.span>
                        ))}
                      </span>
                    );
                  })}
                </h3>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* counter */}
          <div
            aria-hidden="true"
            className="absolute right-5 top-5 flex items-center gap-1 rounded-full bg-black/45 px-3 py-1 text-[13px] font-semibold tabular-nums text-white backdrop-blur sm:right-8 sm:top-8"
          >
            <span className="relative inline-flex h-[1.2em] overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={i}
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "-100%" }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 30 }}
                >
                  {pad}
                </motion.span>
              </AnimatePresence>
            </span>
            <span className="text-white/80">/ {String(n).padStart(2, "0")}</span>
          </div>
        </div>

        <p className="sr-only" aria-live={running ? "off" : "polite"}>
          {`${slide.title}, slide ${i + 1} of ${n}`}
        </p>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex flex-1 gap-1.5">
            {slides.map((s, k) => (
              <button
                key={`${k}-${s.title}`}
                type="button"
                onClick={() => {
                  setTouched(true);
                  go(k, "user");
                }}
                aria-label={`Go to ${s.title}`}
                aria-current={k === i ? "true" : undefined}
                className={cn("relative h-1.5 flex-1 overflow-hidden rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]", FOCUS)}
              >
                <motion.span
                  aria-hidden="true"
                  key={k === i ? `${i}-${running}` : k}
                  className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                  initial={{ scaleX: k < i ? 1 : 0 }}
                  animate={{ scaleX: k <= i ? 1 : 0 }}
                  transition={{ duration: reduce ? 0 : k === i && running ? intervalMs / 1000 : 0.3, ease: "linear" }}
                />
              </button>
            ))}
          </div>
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setTouched(true);
                go(i + d, "user");
              }}
              aria-label={d < 0 ? "Previous slide" : "Next slide"}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
                FOCUS,
              )}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
                <path d={d < 0 ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
