"use client";

import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type MarkerKind = "highlight" | "underline" | "circle" | "strike";

export type MarkerSegment =
  | string
  | {
      /** The words to mark up. */
      text: string;
      /** Which hand-drawn mark to play over them. */
      kind: MarkerKind;
      /** Mark colour in light mode. Any CSS colour. Defaults to the kind's colour. */
      color?: string;
      /** Mark colour in dark mode. Defaults to the kind's dark colour. */
      darkColor?: string;
      /** Seconds to wait after the paragraph scrolls into view before this mark plays. */
      delay?: number;
    };

export interface MarkerAnnotationsProps {
  /** The paragraph, as plain strings with marked-up objects between them. Defaults to the demo sentence. */
  segments?: MarkerSegment[];
  /** Shows the "Draw again" button under the paragraph. */
  showReplay?: boolean;
  /** Label of the replay button. */
  replayLabel?: string;
  /** Plays the marks again every few seconds while the paragraph is on screen, until someone presses a button or touches the text. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the paragraph (size, weight, colour). */
  className?: string;
}

/** The demo sentence: a strike-through, a highlighter pass, a scribbled underline and a loose circle, in reading order. */
export const MARKER_SEGMENTS: MarkerSegment[] = [
  "Stop ",
  { text: "hand-tuning", kind: "strike", delay: 0.1 },
  " every animation. This kit gives you ",
  { text: "springs that already feel right", kind: "highlight", delay: 0.5 },
  ", components you can ",
  { text: "copy in one click", kind: "underline", delay: 1.3 },
  ", and a design that respects ",
  { text: "everyone", kind: "circle", delay: 1.9 },
  ".",
];

const KIND_COLORS: Record<MarkerKind, { light: string; dark: string }> = {
  strike: { light: "#ff3b30", dark: "#ff453a" },
  highlight: { light: "#ffd60a", dark: "rgba(255,214,10,.42)" },
  underline: { light: "#0071e3", dark: "#0a84ff" },
  circle: { light: "#34c759", dark: "#30d158" },
};

/** Wobbly hand-drawn shapes, sized in a 100x20 box and stretched to the word. */
const PATHS: Record<Exclude<MarkerKind, "highlight">, string> = {
  underline: "M 2 15 C 20 18, 40 12, 60 15 S 90 17, 98 13",
  circle: "M 50 2 C 80 1, 99 6, 98 11 C 97 17, 70 20, 46 19 C 18 18, 1 15, 2 9 C 3 4, 24 1, 56 2",
  strike: "M 0 11 C 25 9, 60 12, 100 9",
};

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const REPLAY_MS = 7000;

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

function Mark({ kind, delay, color, darkColor, children, go, reduce }: { kind: MarkerKind; delay: number; color: string; darkColor: string; children: ReactNode; go: boolean; reduce: boolean }) {
  const vars = { "--mk": color, "--mk-dark": darkColor } as CSSProperties;
  const tone = "[--c:var(--mk)] dark:[--c:var(--mk-dark)]";
  // Reduced motion: the mark simply fades in, with no drawing.
  const fade = { duration: 0.25, delay: 0 };

  if (kind === "highlight") {
    // background grows across each wrapped line, like a highlighter pass
    return (
      <motion.mark
        className={cn("rounded-[3px] bg-no-repeat px-[2px] text-inherit [box-decoration-break:clone] [-webkit-box-decoration-break:clone]", tone)}
        style={{
          ...vars,
          backgroundImage: "linear-gradient(104deg, transparent 0.6%, var(--c) 2.4%, color-mix(in srgb, var(--c) 80%, transparent) 95%, transparent 98%)",
          backgroundColor: "transparent",
          backgroundPosition: "0 60%",
          backgroundSize: reduce ? "100% 72%" : undefined,
        }}
        initial={reduce ? { opacity: 0 } : { backgroundSize: "0% 72%" }}
        animate={reduce ? { opacity: go ? 1 : 0 } : { backgroundSize: go ? "100% 72%" : "0% 72%" }}
        transition={reduce ? fade : { duration: 0.7, delay, ease: [0.5, 0, 0.2, 1] }}
      >
        {children}
      </motion.mark>
    );
  }

  const box = kind === "circle" ? "-left-[10%] -top-[30%] h-[160%]" : kind === "strike" ? "inset-x-0 top-[25%] h-[50%]" : "inset-x-0 -bottom-[38%] h-[60%]";
  const drawing = (
    <svg className={cn("pointer-events-none absolute overflow-visible", box)} style={{ width: kind === "circle" ? "120%" : "100%" }} viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
      <motion.path
        d={PATHS[kind]}
        fill="none"
        style={{ stroke: "var(--c)" }}
        strokeWidth={kind === "circle" ? 1.6 : 2.4}
        strokeLinecap="round"
        initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
        animate={reduce ? { opacity: go ? 1 : 0 } : { pathLength: go ? 1 : 0, opacity: go ? 1 : 0 }}
        transition={reduce ? fade : { duration: kind === "circle" ? 0.8 : 0.5, delay, ease: [0.6, 0, 0.3, 1] }}
      />
    </svg>
  );
  const Tag = kind === "strike" ? "del" : "span";
  return (
    <Tag className={cn("relative inline-block whitespace-nowrap no-underline", tone)} style={vars}>
      {children}
      {drawing}
    </Tag>
  );
}

/**
 * Hand-drawn annotations that mark up your copy as it scrolls into view: a
 * highlighter pass that follows the text across line breaks, a scribbled
 * underline, a loose circle round a word, and a strike-through for the old
 * way. They play in reading order, one after another. "Draw again" replays
 * them. Under reduced motion the marks fade in instead of being drawn.
 */
export function MarkerAnnotations({ segments = MARKER_SEGMENTS, showReplay = true, replayLabel = "Draw again", autoplay = false, className }: MarkerAnnotationsProps) {
  const reduce = useReducedMotion() ?? false;
  const [play, setPlay] = useState(0);
  const touched = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  // the whole paragraph decides when to start, so marks that poke outside their words still play
  const para = useRef<HTMLParagraphElement>(null);
  const go = useInView(para, { once: true, amount: 0.6 });
  const active = useDemoActive(root, autoplay && !reduce);

  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    const id = window.setInterval(() => {
      if (!touched.current) setPlay((p) => p + 1);
    }, REPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active]);

  return (
    <div
      ref={root}
      className="flex w-full max-w-[640px] flex-col items-start gap-6 px-2"
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <p ref={para} key={play} className={cn("m-0 text-[clamp(22px,3.4vw,30px)] font-semibold leading-[1.45] tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]", className)}>
        {segments.map((s, i) =>
          typeof s === "string" ? (
            <Fragment key={i}>{s}</Fragment>
          ) : (
            <Mark key={i} kind={s.kind} delay={s.delay ?? i * 0.4} color={s.color ?? KIND_COLORS[s.kind].light} darkColor={s.darkColor ?? KIND_COLORS[s.kind].dark} go={go} reduce={reduce}>
              {s.text}
            </Mark>
          ),
        )}
      </p>
      {showReplay && (
        <button
          type="button"
          onClick={() => {
            touched.current = true;
            setPlay((p) => p + 1);
          }}
          className={cn("flex h-9 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]", FOCUS)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />
          </svg>
          {replayLabel}
        </button>
      )}
    </div>
  );
}
