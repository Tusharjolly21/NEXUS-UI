"use client";

import { useState, useEffect, useRef } from "react";
import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BRAND_ICONS, SF_ICONS } from "./icons";
import type { BrandIconName, IconName } from "./icons";
import type { Currency } from "./data";

export type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 16, className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 56 56"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: SF_ICONS[name],
      }}
    />
  );
}

export type BrandIconProps = {
  name: BrandIconName;
  size?: number;
  className?: string;
};

export function BrandIcon({ name, size = 16, className = "" }: BrandIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: BRAND_ICONS[name],
      }}
    />
  );
}

export const ROLL_SPRING = {
  type: "spring",
  stiffness: 260,
  damping: 24,
} as const;

export type RollingDigitProps = {
  d: number;
  delay: number;
};

export function RollingDigit({ d: digit, delay }: RollingDigitProps) {
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{
        height: "1.15em",
        lineHeight: "1.15em",
      }}
    >
      <span className="invisible">0</span>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={false}
        animate={{
          y: `${-digit * 1.15}em`,
        }}
        transition={{
          ...ROLL_SPRING,
          delay,
        }}
      >
        {Array.from(
          {
            length: 10,
          },
          (_, index) => (
            <span
              key={index}
              style={{
                height: "1.15em",
              }}
            >
              {index}
            </span>
          ),
        )}
      </motion.span>
    </span>
  );
}

export type RollingNumberProps = {
  text: string;
  className?: string;
  label?: string;
};

export function RollingNumber({ text, className = "", label }: RollingNumberProps) {
  const reduceMotion = useReducedMotion(),
    chars = text.split("");
  return reduceMotion ? (
    <span className={`ferry-tnum ${className}`} aria-label={label}>
      {text}
    </span>
  ) : (
    <span className={`ferry-tnum inline-flex ${className}`} aria-label={label ?? text} role="text">
      <span aria-hidden="true" className="inline-flex items-start">
        <AnimatePresence initial={false} mode="popLayout">
          {chars.map((char, index) => {
            const fromEnd = chars.length - index;
            return /\d/.test(char) ? (
              <motion.span
                key={`d${fromEnd}`}
                layout="position"
                initial={{
                  opacity: 0,
                  y: "0.4em",
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: "-0.4em",
                }}
                transition={ROLL_SPRING}
                className="inline-flex"
              >
                <RollingDigit d={+char} delay={Math.min(fromEnd, 8) * 0.018} />
              </motion.span>
            ) : (
              <motion.span
                key={`s${fromEnd}${char}`}
                layout="position"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={ROLL_SPRING}
                className="inline-block whitespace-pre"
                style={{
                  height: "1.15em",
                  lineHeight: "1.15em",
                }}
              >
                {char}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </span>
    </span>
  );
}

export type CurrencyDotProps = {
  c: Currency;
  size?: number;
};

export function CurrencyDot({ c: currency, size = 22 }: CurrencyDotProps) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        background: currency.tint,
        fontSize: size * 0.34,
        letterSpacing: "-0.02em",
      }}
      aria-hidden="true"
    >
      {currency.code}
    </span>
  );
}

export const MENU_SPRING = {
  type: "spring",
  stiffness: 480,
  damping: 34,
} as const;

export type SwapTextProps = {
  text: string;
  className?: string;
};

export function SwapText({ text, className = "" }: SwapTextProps) {
  return (
    <span className={`relative inline-grid ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{
            y: "0.6em",
            opacity: 0,
            filter: "blur(6px)",
          }}
          animate={{
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
          }}
          exit={{
            y: "-0.6em",
            opacity: 0,
            filter: "blur(6px)",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            filter: {
              duration: 0.25,
            },
          }}
          className="whitespace-nowrap"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export type FrameProps = {
  children?: ReactNode;
  className?: string;
  glow?: boolean;
};

export function Frame({ children, className = "", glow = false }: FrameProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-frame))] p-2 ${className}`}
    >
      {glow && <span aria-hidden="true" className="ferry-glow" />}
      {children}
    </div>
  );
}

export type PanelProps = {
  children?: ReactNode;
  className?: string;
  glow?: boolean;
  edge?: boolean;
  as?: "div" | "article";
};

export function Panel({ children, className = "", glow = false, edge = false, as: Tag = "div" }: PanelProps) {
  return (
    <Tag
      className={`relative overflow-hidden rounded-[22px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface)/.82)] ferry-shadow-panel transition-colors duration-300 hover:border-[rgb(var(--ferry-line)/.16)] ${className}`}
    >
      {glow && <span aria-hidden="true" className="ferry-glow" />}
      {edge && <span aria-hidden="true" className="ferry-edge" />}
      {children}
    </Tag>
  );
}

export const BADGE_TONES = {
  gain: "border-[rgb(var(--ferry-gain)/.25)] bg-[rgb(var(--ferry-gain)/.1)] text-[rgb(var(--ferry-gain))]",
  loss: "border-[rgb(var(--ferry-loss)/.25)] bg-[rgb(var(--ferry-loss)/.1)] text-[rgb(var(--ferry-loss))]",
  amber:
    "border-[rgb(var(--ferry-amber)/.25)] bg-[rgb(var(--ferry-amber)/.1)] text-[rgb(var(--ferry-amber))]",
  accent:
    "border-[rgb(var(--ferry-accent)/.25)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]",
  neutral: "border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-raised))] text-[rgb(var(--ferry-mute))]",
};

export type BadgeProps = {
  tone?: keyof typeof BADGE_TONES;
  dot?: boolean;
  children?: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", dot = false, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-solid px-2 py-[3px] text-[11px] font-medium leading-none ${BADGE_TONES[tone]} ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export type SectionHeadingProps = {
  label: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
  align?: "center" | "left";
};

export function SectionHeading({ label, title, sub, align = "center" }: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-[760px] text-center" : "max-w-[640px]"}>
      <p className="m-0 text-[12px] font-medium uppercase tracking-[0.22em] text-[rgb(var(--ferry-accent-ink))]">
        {label}
      </p>
      <h2 className="m-0 mt-4 text-balance text-[clamp(34px,4.3vw,58px)] font-medium leading-[0.98] tracking-[-0.025em] text-[rgb(var(--ferry-ink))]">
        {title}
      </h2>
      {sub && (
        <p
          className={`m-0 mt-5 text-[16px] leading-[1.6] text-[rgb(var(--ferry-mute))] ${centered ? "mx-auto max-w-[540px]" : "max-w-[520px]"}`}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

export const BUTTON_STYLES = {
  primary:
    "bg-[rgb(var(--ferry-accent))] text-white shadow-[inset_0_1px_0_rgb(255_255_255/.18),0_1px_2px_rgb(0_0_0/.2)] hover:brightness-110",
  ghost:
    "border border-solid border-[rgb(var(--ferry-line)/.12)] bg-[rgb(var(--ferry-surface))] text-[rgb(var(--ferry-ink))] hover:border-[rgb(var(--ferry-line)/.24)]",
};

export type ButtonLinkProps = {
  href: string;
  children?: ReactNode;
  kind?: keyof typeof BUTTON_STYLES;
  arrow?: boolean;
  className?: string;
};

export function ButtonLink({ href, children, kind = "primary", arrow, className = "" }: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[14px] font-medium no-underline transition-[filter,border-color] ${BUTTON_STYLES[kind]} ${className}`}
    >
      {children}
      {(arrow ?? kind === "primary") && <Icon name="arrow_up_right" size={11} />}
    </a>
  );
}

export const buttonClass = (kind: keyof typeof BUTTON_STYLES = "primary"): string =>
  `inline-flex h-10 items-center justify-center gap-2 rounded-[10px] px-4 text-[14px] font-medium transition-[filter,border-color] ${BUTTON_STYLES[kind]}`;

export type PulseGridProps = {
  className?: string;
};

export function PulseGrid({ className = "" }: PulseGridProps) {
  return (
    <span aria-hidden="true" className={`inline-grid grid-cols-3 gap-[2px] ${className}`}>
      {Array.from(
        {
          length: 9,
        },
        (_, index) => (
          <motion.span
            key={index}
            className="h-[3px] w-[3px] rounded-[1px] bg-current"
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: ((index % 3) + Math.floor(index / 3)) * 0.12,
              ease: "easeInOut",
            }}
          />
        ),
      )}
    </span>
  );
}

export function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return () => {
    hash += 1831565813;
    let mixed = hash;
    return (
      (mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1)),
      (mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)),
      ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296
    );
  };
}

export type Point = readonly [number, number];

export function smoothPath(points: readonly Point[]): string {
  if (points.length < 2) return "";
  let path = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for (let index = 0; index < points.length - 1; index++) {
    const before = points[index - 1] ?? points[index],
      start = points[index],
      end = points[index + 1],
      after = points[index + 2] ?? end,
      control1X = start[0] + (end[0] - before[0]) / 6,
      control1Y = start[1] + (end[1] - before[1]) / 6,
      control2X = end[0] - (after[0] - start[0]) / 6,
      control2Y = end[1] - (after[1] - start[1]) / 6;
    path += `C${control1X.toFixed(1)},${control1Y.toFixed(1)} ${control2X.toFixed(1)},${control2Y.toFixed(1)} ${end[0].toFixed(1)},${end[1].toFixed(1)}`;
  }
  return path;
}

export function useElementWidth<T extends HTMLElement = HTMLDivElement>(
  initialWidth = 600,
): [RefObject<T | null>, number] {
  const ref = useRef<T>(null),
    [width, setWidth] = useState(initialWidth);
  return (
    useEffect(() => {
      const element = ref.current;
      if (!element) return;
      const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
      return (observer.observe(element), () => observer.disconnect());
    }, []),
    [ref, width]
  );
}
