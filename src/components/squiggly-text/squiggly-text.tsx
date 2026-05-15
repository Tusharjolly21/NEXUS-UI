"use client";

/**
 * Stepped SVG displacement (feTurbulence + feDisplacementMap), cycling `filter: url(#…)`.
 * Independent implementation using feTurbulence + feDisplacementMap cycling.
 */

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function safeFilterId(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "");
}

function scaleForFilterIndex(
  i: number,
  scale: number | readonly [number, number],
): number {
  if (typeof scale === "number") return scale;
  return scale[i % scale.length]!;
}

export type SquigglyWordProps = {
  children: React.ReactNode;
  className?: string;
  steps?: number;
  stepDuration?: number;
  scale?: number | readonly [number, number];
  baseFrequency?: number;
  numOctaves?: number;
};

/**
 * One squiggly fragment (inline). Own SVG `<defs>` + timer; use inside a heading for “per word” wobble.
 */
export function SquigglyWord({
  children,
  className,
  steps = 5,
  stepDuration = 80,
  scale = [6, 8],
  baseFrequency = 0.02,
  numOctaves = 3,
}: SquigglyWordProps) {
  const reduceMotion = useReducedMotion() === true;
  const rid = safeFilterId(React.useId());
  const [frame, setFrame] = React.useState(0);

  const stepCount = Math.max(1, Math.round(steps));
  const bf = Math.max(0.001, baseFrequency);
  const oct = Math.max(1, Math.round(numOctaves));
  const bfAttr = String(bf);

  React.useEffect(() => {
    if (reduceMotion) return;
    const ms = Math.max(16, Math.round(stepDuration));
    const t = window.setInterval(() => {
      setFrame((f) => (f + 1) % stepCount);
    }, ms);
    return () => window.clearInterval(t);
  }, [reduceMotion, stepCount, stepDuration]);

  const activeFrame = reduceMotion ? 0 : frame % stepCount;
  const filterIds = React.useMemo(
    () => Array.from({ length: stepCount }, (_, i) => `sqw-${rid}-${i}`),
    [rid, stepCount],
  );
  const activeFilterUrl = `url(#${filterIds[activeFrame]})`;

  return (
    <span
      className={cn("relative inline-block", className)}
      style={{
        filter: activeFilterUrl,
        WebkitFilter: activeFilterUrl,
      }}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {filterIds.map((fid, i) => (
            <filter
              key={fid}
              id={fid}
              x="-40%"
              y="-40%"
              width="180%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={bfAttr}
                numOctaves={oct}
                result="noise"
                seed={i}
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={String(scaleForFilterIndex(i, scale))}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
      {children}
    </span>
  );
}

export type SquigglyTextProps = {
  children?: React.ReactNode;
  text?: string;
  steps?: number;
  stepDuration?: number;
  scale?: number | readonly [number, number];
  baseFrequency?: number;
  numOctaves?: number;
  as?: "span" | "div";
  className?: string;
  textClassName?: string;
};

export function SquigglyText({
  children,
  text,
  steps = 5,
  stepDuration = 80,
  scale = [6, 8],
  baseFrequency = 0.02,
  numOctaves = 3,
  as = "span",
  className,
  textClassName,
}: SquigglyTextProps) {
  const content = children ?? (text ? <>{text}</> : null);
  const Tag = as === "div" ? "div" : "span";

  return (
    <Tag className={cn("relative inline-block max-w-full overflow-visible", className)}>
      <SquigglyWord
        steps={steps}
        stepDuration={stepDuration}
        scale={scale}
        baseFrequency={baseFrequency}
        numOctaves={numOctaves}
        className={cn("inline-block", textClassName)}
      >
        {content}
      </SquigglyWord>
    </Tag>
  );
}

export type SquigglyDrinksHeadlineProps = {
  className?: string;
  headingClassName?: string;
  steps?: number;
  stepDuration?: number;
  baseFrequency?: number;
  numOctaves?: number;
};

/** “How many drinks / are too many drinks?” — per-word squiggle like the public demo layout. */
export function SquigglyDrinksHeadline({
  className,
  headingClassName,
  stepDuration = 80,
  baseFrequency = 0.02,
  numOctaves = 3,
  steps = 5,
}: SquigglyDrinksHeadlineProps) {
  const common = { steps, stepDuration, baseFrequency, numOctaves };
  return (
    <h1
      className={cn(
        "text-balance text-center text-5xl leading-tight font-bold tracking-tight text-neutral-900 md:text-7xl lg:text-8xl dark:text-neutral-100",
        headingClassName,
        className,
      )}
    >
      Hey There!{" "}
      <SquigglyWord {...common} scale={[6, 9]} className="text-amber-500">
        I am NEXUS-UI
      </SquigglyWord>{" "}
      <br />
      Your{" "}
      <SquigglyWord {...common} scale={5}>
        UI/UX
      </SquigglyWord>{" "}
      Partner...
    </h1>
  );
}
