"use client";

import * as React from "react";
import {
  animate,
  motion,
  motionValue,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type AnimationPlaybackControls,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface ScrollRevealTextProps {
  /** The text to reveal. In line mode, \n separates lines. */
  text: string;
  /** Granularity of each reveal step. */
  mode?: "word" | "character" | "line";
  /** Element used as the root. */
  as?: "p" | "h2" | "h3" | "div";
  className?: string;
  /** Colour of text that has not been read yet. Defaults to a light grey (dark grey in dark mode). */
  mutedColor?: string;
  /** Colour text passes through while it is being revealed. Defaults to the accent blue. */
  accentColor?: string;
  /** Colour of fully revealed text. Defaults to the ink colour. */
  activeColor?: string;
  /** Scroll progress (0 to 1, element entering to leaving) where the reveal begins. */
  startOffset?: number;
  /** Scroll progress where the reveal is complete. */
  endOffset?: number;
  /** Starting blur in px. 0 turns the blur off. */
  blurAmount?: number;
  /** 0 reveals every unit together, 1 reveals them strictly one after another. */
  stagger?: number;
  /** CSS font-size (clamp() works). */
  fontSize?: string;
  align?: "left" | "center" | "right";
  /** Scrollable ancestor to track instead of the page. */
  container?: React.RefObject<HTMLElement | null>;
  /** Plays the reveal on a loop until someone scrolls, then hands over to the real scroll position. */
  autoplay?: boolean;
}

function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}
/** Follows the site's class-based dark mode; false on the server and during hydration. */
function useIsDark() {
  return React.useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains("dark"), () => false);
}

/** A plain motion value (0..1 of the reveal range) that scrolls `box` as it changes. */
function scrollDriver(box: HTMLElement | null, at: (p: number) => number) {
  const mv = motionValue(0);
  const off = mv.on("change", (p) => {
    if (box) box.scrollTop = at(p);
  });
  return { mv, stop: off };
}

function ranges(count: number, start: number, end: number, stagger: number): [number, number][] {
  if (count <= 0) return [];
  if (count === 1) return [[start, end]];
  const total = end - start;
  const s = Math.max(0, Math.min(1, stagger));
  const win = total * (1 - (s * (count - 1)) / count);
  const step = (total - win) / (count - 1);
  return Array.from({ length: count }, (_, i) => [start + i * step, start + i * step + win]);
}

type Palette = { muted: string; accent: string; active: string };

function Unit({
  progress,
  range,
  palette,
  blurAmount,
  block,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  palette: Palette;
  blurAmount: number;
  block: boolean;
  children: React.ReactNode;
}) {
  const [a, b] = range;
  const t = useTransform(progress, (p) => Math.max(0, Math.min(1, (p - a) / Math.max(1e-6, b - a))));
  const color = useTransform(t, [0, 0.55, 1], [palette.muted, palette.accent, palette.active]);
  const y = useTransform(t, (v) => `${((1 - v) * 0.32).toFixed(3)}em`);
  const blur = useTransform(t, (v) => ((1 - v) * blurAmount).toFixed(2));
  const filter = useMotionTemplate`blur(${blur}px)`;
  return (
    <motion.span className={block ? "block" : "inline-block"} style={{ color, y, filter: blurAmount > 0 ? filter : undefined }}>
      {children}
    </motion.span>
  );
}

/**
 * A paragraph that reads itself as you scroll. Each word (or character, or line) rises out of a
 * blur and passes through the accent colour on its way from grey to ink, so a bright reading wave
 * travels through the text. Scroll progress is smoothed by a spring, so quick flicks follow
 * through instead of snapping.
 */
export function ScrollRevealText({
  text,
  mode = "word",
  as = "p",
  className,
  mutedColor,
  accentColor,
  activeColor,
  startOffset = 0.05,
  endOffset = 0.75,
  blurAmount = 6,
  stagger = 0.65,
  fontSize = "clamp(1.75rem, 4.5vw, 3.75rem)",
  align = "left",
  container,
  autoplay = false,
}: ScrollRevealTextProps) {
  const still = useReducedMotion() === true;
  const dark = useIsDark();
  const ref = React.useRef<HTMLElement>(null);
  const touched = React.useRef(false);
  const { scrollYProgress } = useScroll({ target: ref, container, offset: ["start end", "end start"] });
  const source = useMotionValue(autoplay ? startOffset : 0);
  const progress = useSpring(source, { stiffness: 110, damping: 22, mass: 0.7 });

  const palette: Palette = {
    muted: mutedColor ?? (dark ? "#3a3a3c" : "#d2d2d7"),
    accent: accentColor ?? (dark ? "#0a84ff" : "#0071e3"),
    active: activeColor ?? (dark ? "#f5f5f7" : "#1d1d1f"),
  };

  React.useEffect(() => {
    if (still) return;
    const box = container?.current ?? null;
    // With a scroll box, autoplay scrolls the box itself, so the text stays in view and handing over is seamless.
    const virtual = autoplay && !box;
    const follow = () => {
      if (!virtual || touched.current) source.set(scrollYProgress.get());
    };
    const off = scrollYProgress.on("change", follow);
    source.set(scrollYProgress.get());
    if (!autoplay) return off;
    const lo = startOffset - 0.04;
    const hi = endOffset + 0.04;
    const el = ref.current;
    const at = (p: number) => {
      if (!box || !el) return 0;
      const s0 = el.offsetTop - box.clientHeight;
      const s1 = el.offsetTop + el.offsetHeight;
      return s0 + p * (s1 - s0);
    };
    const drive = scrollDriver(box, at);
    const run: AnimationPlaybackControls = animate(box ? drive.mv : source, [lo, hi, hi, lo], {
      duration: 6,
      times: [0, 0.55, 0.85, 1],
      ease: "easeInOut",
      repeat: Infinity,
      delay: 0.4,
    });
    const take = () => {
      if (touched.current) return;
      touched.current = true;
      run.stop();
      source.set(scrollYProgress.get());
    };
    const target = box ?? window;
    const keys = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(e.key)) take();
    };
    target.addEventListener("wheel", take, { passive: true });
    target.addEventListener("touchstart", take, { passive: true });
    box?.addEventListener("pointerdown", take);
    window.addEventListener("keydown", keys);
    return () => {
      off();
      run.stop();
      drive.stop();
      target.removeEventListener("wheel", take);
      target.removeEventListener("touchstart", take);
      box?.removeEventListener("pointerdown", take);
      window.removeEventListener("keydown", keys);
    };
  }, [still, autoplay, startOffset, endOffset, scrollYProgress, source, container]);

  const units = React.useMemo(() => {
    if (mode === "line") return text.split("\n").map((l) => [l]);
    if (mode === "word") return text.split(/\s+/).filter(Boolean).map((w) => [w]);
    return text.split(/\s+/).filter(Boolean).map((w) => Array.from(w));
  }, [text, mode]);
  const count = units.reduce((n, u) => n + (mode === "character" ? u.length : 1), 0);
  const rs = ranges(count, startOffset, endOffset, stagger);
  const starts = units.map((_, k) => units.slice(0, k).reduce((n, u) => n + (mode === "character" ? u.length : 1), 0));

  const Tag = as;
  const alignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn("m-0 font-semibold leading-[1.15] tracking-[-0.03em]", alignClass, className)}
      style={{ fontSize }}
    >
      {still ? (
        <span style={{ color: palette.active }} className={mode === "line" ? "whitespace-pre-line" : undefined}>
          {text}
        </span>
      ) : (
        <>
          <span className="sr-only">{text}</span>
          {/* Re-keyed on theme so the colour ramps pick up the new palette immediately. */}
          <span key={dark ? "d" : "l"} aria-hidden="true">
            {units.map((u, k) => {
              const at = starts[k] ?? 0;
              if (mode === "line") {
                return (
                  <Unit key={k} progress={progress} range={rs[at] ?? [0, 1]} palette={palette} blurAmount={blurAmount} block>
                    {u[0] || " "}
                  </Unit>
                );
              }
              if (mode === "word") {
                return (
                  <React.Fragment key={k}>
                    <Unit progress={progress} range={rs[at] ?? [0, 1]} palette={palette} blurAmount={blurAmount} block={false}>
                      {u[0]}
                    </Unit>{" "}
                  </React.Fragment>
                );
              }
              return (
                <React.Fragment key={k}>
                  <span className="inline-block whitespace-nowrap">
                    {u.map((ch, c) => (
                      <Unit key={c} progress={progress} range={rs[at + c] ?? [0, 1]} palette={palette} blurAmount={blurAmount} block={false}>
                        {ch}
                      </Unit>
                    ))}
                  </span>{" "}
                </React.Fragment>
              );
            })}
          </span>
        </>
      )}
    </Tag>
  );
}

export default ScrollRevealText;
