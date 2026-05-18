"use client";

import * as React from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ScrollRevealTextProps {
  text: string;
  mode?: "word" | "character" | "line";
  className?: string;
  mutedColor?: string;
  activeColor?: string;
  startOffset?: number;
  endOffset?: number;
  blurAmount?: number;
  stagger?: number;
  fontSize?: string;
  align?: "left" | "center" | "right";
}

// ── Range computation ─────────────────────────────────────────────────────────

function buildRanges(
  count: number,
  start: number,
  end: number,
  stagger: number,
): Array<[number, number]> {
  if (count === 0) return [];
  if (count === 1) return [[start, end]];
  const total = end - start;
  // windowSize: how much of the total range each unit uses for its reveal
  // stagger=0 → all units share the full range; stagger=1 → perfectly sequential
  const windowSize = total * (1 - (stagger * (count - 1)) / count);
  const step = (total - windowSize) / (count - 1);
  return Array.from({ length: count }, (_, i) => [
    start + i * step,
    start + i * step + windowSize,
  ]);
}

// ── Single animated unit ───────────────────────────────────────────────────────

function RevealUnit({
  scrollYProgress,
  rangeStart,
  rangeEnd,
  children,
  blurAmount,
  mutedColor,
  activeColor,
  reduceMotion,
}: {
  scrollYProgress: MotionValue<number>;
  rangeStart: number;
  rangeEnd: number;
  children: React.ReactNode;
  blurAmount: number;
  mutedColor: string;
  activeColor: string;
  reduceMotion: boolean;
}) {
  const domain: [number, number] = [rangeStart, rangeEnd];
  const opacity = useTransform(scrollYProgress, domain, [0.12, 1]);
  const blurPx = useTransform(scrollYProgress, domain, [blurAmount, 0]);
  const y = useTransform(scrollYProgress, domain, [12, 0]);
  const color = useTransform(scrollYProgress, domain, [mutedColor, activeColor]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  // All hooks called above — safe to branch here
  if (reduceMotion) {
    return <span style={{ color: activeColor }}>{children}</span>;
  }

  return (
    <motion.span
      style={{
        display: "inline-block",
        opacity,
        y,
        color,
        filter,
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </motion.span>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ScrollRevealText({
  text,
  mode = "word",
  className,
  mutedColor = "#52525b",    // zinc-600 — muted start
  activeColor = "#fafafa",   // zinc-50  — bright finish
  startOffset = 0.05,
  endOffset = 0.75,
  blurAmount = 6,
  stagger = 0.65,
  fontSize = "clamp(1.75rem, 4.5vw, 3.75rem)",
  align = "left",
}: ScrollRevealTextProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // ── Split text into units based on mode ────────────────────────────────────

  interface CharMeta {
    char: string;
    isSpace: boolean;
    revealIdx: number; // -1 for non-animated chars (spaces, newlines)
  }

  const parsed = React.useMemo(() => {
    if (mode === "word") {
      return { words: text.split(/\s+/).filter(Boolean), charMetas: null };
    }
    if (mode === "line") {
      return { words: text.split("\n").filter(Boolean), charMetas: null };
    }
    // character mode — unicode-aware split, spaces are structural not animated
    let ri = 0;
    const metas: CharMeta[] = [...text].map((c) => {
      const isSpace = c === " " || c === "\n";
      return { char: c, isSpace, revealIdx: isSpace ? -1 : ri++ };
    });
    return { words: [], charMetas: metas };
  }, [text, mode]);

  const revealCount =
    mode === "character"
      ? (parsed.charMetas?.filter((m) => !m.isSpace).length ?? 0)
      : parsed.words.length;

  const ranges = React.useMemo(
    () => buildRanges(revealCount, startOffset, endOffset, stagger),
    [revealCount, startOffset, endOffset, stagger],
  );

  // ── Shared props for RevealUnit ────────────────────────────────────────────

  const unitProps = {
    scrollYProgress,
    blurAmount,
    mutedColor,
    activeColor,
    reduceMotion,
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (mode === "word") {
      return parsed.words.map((word, i) => (
        <React.Fragment key={i}>
          <RevealUnit
            {...unitProps}
            rangeStart={ranges[i]?.[0] ?? startOffset}
            rangeEnd={ranges[i]?.[1] ?? endOffset}
          >
            {word}
          </RevealUnit>
          {i < parsed.words.length - 1 && " "}
        </React.Fragment>
      ));
    }

    if (mode === "character") {
      return parsed.charMetas!.map((m, i) => {
        if (m.char === "\n") return <br key={i} />;
        if (m.isSpace) return <span key={i}> </span>;
        const [rs, re] = ranges[m.revealIdx];
        return (
          <RevealUnit key={i} {...unitProps} rangeStart={rs} rangeEnd={re}>
            {m.char}
          </RevealUnit>
        );
      });
    }

    // line mode — each line in its own block row
    return parsed.words.map((line, i) => (
      <div key={i} style={{ overflow: "visible" }}>
        <RevealUnit
          {...unitProps}
          rangeStart={ranges[i]?.[0] ?? startOffset}
          rangeEnd={ranges[i]?.[1] ?? endOffset}
        >
          {line}
        </RevealUnit>
      </div>
    ));
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
      style={{
        fontSize,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.025em",
        textAlign: align,
      }}
    >
      {renderContent()}
    </div>
  );
}
