"use client";

/* eslint-disable react-hooks/set-state-in-effect -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { AVATAR_SVGS, ICONS } from "./icons";
import { COLOR, EASE, FONT_MONO } from "./theme";
export type IconName = keyof typeof ICONS;

/** Phosphor icons (MIT), inlined from Iconify so the template needs no icon package. */
export function Icon({
  name,
  size = 16,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="currentColor"
      aria-hidden={true}
      dangerouslySetInnerHTML={{
        __html: ICONS[name] ?? "",
      }}
    />
  );
}
export const AVATAR_URLS = Object.fromEntries(
  Object.entries(AVATAR_SVGS).map(([name, svg]) => [name, `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`]),
) as Record<string, string>;
export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    // a tiny inline SVG data URL: next/image adds nothing here
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={AVATAR_URLS[name]}
      alt=""
      aria-hidden={true}
      width={size}
      height={size}
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1px ${COLOR.line2}`,
      }}
    />
  );
}
type PillButtonProps = {
  children: ReactNode;
  dark?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
};
export function PillButton({ children, dark = false, href = "#", className = "", onClick }: PillButtonProps) {
  return (
    <motion.a
      href={href}
      whileTap={{
        scale: 0.97,
      }}
      onClick={(event) => {
        // in-page links scroll smoothly; "#" alone is a placeholder and goes nowhere
        if (href.startsWith("#")) {
          event.preventDefault();
          const id = href.slice(1);
          if (id)
            document.getElementById(id)?.scrollIntoView({
              behavior: "smooth",
            });
        }
        onClick?.();
      }}
      className={`wf-ring inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[14.5px] font-medium no-underline outline-none transition-[background,box-shadow] ${className}`}
      style={
        dark
          ? {
              background: COLOR.ink,
              color: "#fff",
            }
          : {
              background: "#fff",
              color: COLOR.ink,
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}`,
            }
      }
    >
      {children}
    </motion.a>
  );
}
export function TextLink({ children, href = "#" }: { children: ReactNode; href?: string }) {
  return (
    <a
      href={href}
      onClick={(event) => {
        if (href.startsWith("#")) {
          event.preventDefault();
          document.getElementById(href.slice(1))?.scrollIntoView({
            behavior: "smooth",
          });
        }
      }}
      className="wf-ring group inline-flex items-center gap-1.5 rounded text-[15px] font-medium no-underline outline-none"
      style={{
        color: COLOR.blue,
      }}
    >
      {children}
      <span className="transition-transform group-hover:translate-x-1">
        <Icon name="ph:arrow-right" size={14} />
      </span>
    </a>
  );
}
type SectionTitleProps = {
  /** the dark half of the headline */
  title: string;
  /** an optional grey continuation, set in the same line */
  rest?: string;
  size?: "xl" | "lg" | "md";
  className?: string;
  as?: "h1" | "h2" | "h3";
  center?: boolean;
};

/** A headline whose words rise in one by one; `rest` continues it in grey. */
export function SectionTitle({
  title,
  rest,
  size = "lg",
  className = "",
  as = "h2",
  center = false,
}: SectionTitleProps) {
  const Tag = as;
  const fontSize =
    size === "xl"
      ? "clamp(46px, 6.2vw, 82px)"
      : size === "lg"
        ? "clamp(34px, 4.4vw, 58px)"
        : "clamp(26px, 2.8vw, 36px)";
  const words = [
    ...title.split(" ").map((item) => [item, true]),
    ...(rest ? rest.split(" ").map((item) => [item, false]) : []),
  ];
  return (
    <Tag
      className={`m-0 font-medium ${center ? "text-center" : ""} ${className}`}
      style={{
        fontSize: fontSize,
        lineHeight: 1.04,
        letterSpacing: "-0.04em",
        color: COLOR.ink,
        textWrap: "balance",
      }}
    >
      {words.map(([word, dark], index) => (
        <motion.span
          className="inline-block whitespace-pre"
          style={{
            color: dark ? COLOR.ink : "#74777E",
          }}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
            y: 6,
          }}
          whileInView={{
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.6,
          }}
          transition={{
            duration: 0.7,
            ease: EASE,
            delay: Math.min(index * 0.04, 0.8),
          }}
          key={index}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 16,
        filter: "blur(6px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.25,
      }}
      transition={{
        duration: 0.8,
        ease: EASE,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
}
/** Counts from 0 up to `target` once `start` turns true, and returns it formatted with `decimals` places. */
export function useCountUp(target: number, start: boolean, decimals = 0, seconds = 1.6) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) {
      return;
    }
    if (reduce) {
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: seconds,
      ease: [0.2, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [start, target, reduce, seconds]);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
export const Mono = ({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) => (
  <span
    className={className}
    style={{
      fontFamily: FONT_MONO,
      ...style,
    }}
  >
    {children}
  </span>
);
export function Logo({ size = 22, light = false }: { size?: number; light?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2 font-medium"
      style={{
        fontSize: size * 0.9,
        letterSpacing: "-0.03em",
        color: light ? "#fff" : COLOR.ink,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={true}>
        <rect width="24" height="24" rx="6" fill={light ? "#fff" : COLOR.ink} />
        <path
          d="M5 15 q3.5 -4 7 0 t7 0"
          fill="none"
          stroke={light ? COLOR.ink : "#fff"}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="6" y="7" width="12" height="3" rx="1.5" fill={COLOR.blue} />
      </svg>
      Wharf
    </span>
  );
}
export function SvgDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden={true}>
      <defs>
        <filter id="wf-soft" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#1A1C22" floodOpacity=".16" />
        </filter>
        <filter id="wf-tight" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#1A1C22" floodOpacity=".22" />
        </filter>
        <linearGradient id="wf-clay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E3E5EA" />
        </linearGradient>
        <linearGradient id="wf-clay2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F4F5F8" />
          <stop offset="1" stopColor="#D5D8DE" />
        </linearGradient>
        <radialGradient id="wf-coin-g" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#F2F3F5" />
          <stop offset="1" stopColor="#A6AAB2" />
        </radialGradient>
        <radialGradient id="wf-coin-d" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#6A6D74" />
          <stop offset="1" stopColor="#24262B" />
        </radialGradient>
        <radialGradient id="wf-coin-b" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#7FA6FF" />
          <stop offset="1" stopColor="#1E4FD8" />
        </radialGradient>
        <filter id="wf-blur1">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <radialGradient id="wf-dial" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".8" stopColor="#E9EBEF" />
          <stop offset="1" stopColor="#CDD1D8" />
        </radialGradient>
      </defs>
    </svg>
  );
}
