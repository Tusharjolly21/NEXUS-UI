"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  type UseInViewOptions,
} from "framer-motion";
import { AVATAR_URLS } from "./avatars";
import { ICONS } from "./icons";
import { DARK, EASE, LIGHT } from "./theme";

type IconProps = { name: string; size?: number; className?: string; style?: CSSProperties };

export function Icon({ name, size = 16, className, style }: IconProps) {
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

export function Avatar({
  name,
  size = 28,
  ring = "rgba(255,255,255,.12)",
}: {
  name: string;
  size?: number;
  ring?: string;
}) {
  return (
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
        boxShadow: `0 0 0 1px ${ring}`,
      }}
    />
  );
}

/** [ref, playing, inView]: `playing` is in view and motion is allowed. */
export function useLiveInView(margin: UseInViewOptions["margin"] = "-10% 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin,
  });
  const reduce = useReducedMotion();
  return [ref, inView && !reduce, inView] as const;
}

type AnimatedNumberProps = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
};

export function AnimatedNumber({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  style,
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [shown, setShown] = useState(value);
  useMotionValueEvent(motionValue, "change", setShown);
  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, {
      duration: 0.7,
      ease: EASE,
    });
    return () => controls.stop();
  }, [value, reduce, motionValue]);
  return (
    <span className={`tabular-nums ${className ?? ""}`} style={style}>
      {prefix}
      {shown.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** The little rover that drives along the ridge lines. */
export function Rover({
  size = 34,
  color = "#141019",
  className = "",
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 40 26" width={size} height={size * 0.65} className={className} style={style} aria-hidden={true}>
      <path d="M27 3 L31 9" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M24.5 4.5 a4 4 0 0 1 5.4 -3.2" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="6" y="9" width="26" height="8" rx="2" fill={color} />
      <rect x="9" y="6.5" width="11" height="3.5" rx="1" fill={color} />
      <path d="M4 17 h31" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {[9, 19.5, 30].map((x) => (
        <circle key={x} cx={x} cy="21" r="3.6" fill={color} />
      ))}
      {[9, 19.5, 30].map((x) => (
        <circle key={`h${x}`} cx={x} cy="21" r="1.2" fill="#F6B24B" />
      ))}
    </svg>
  );
}

export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden={true} className="shrink-0">
      <path d="M2.5 21 C 6 15.5, 18 15.5, 21.5 21 Z" fill="currentColor" />
      <path d="M12 17 V3.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12.6 3.4 L19.5 6.4 L12.6 9.4 Z" fill={DARK.amber} />
    </svg>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        color: dark ? LIGHT.ink : DARK.ink,
      }}
    >
      <LogoMark size={20} />
      <span className="text-[17px] font-[600] tracking-[-0.03em]">Outpost</span>
    </span>
  );
}

const BUTTON_STYLES: Record<"light" | "dark" | "ghost", CSSProperties> = {
  light: {
    background: "linear-gradient(180deg,#FFFFFF 0%,#E7E4DD 100%)",
    color: "#18181B",
    boxShadow:
      "inset 0 1px 0 #fff, inset 0 0 0 1px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.5), 0 10px 24px -12px rgba(255,255,255,.35)",
  },
  dark: {
    background: "linear-gradient(180deg,#2C2C31 0%,#1C1C20 100%)",
    color: DARK.ink,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.09), 0 1px 2px rgba(0,0,0,.5)",
  },
  ghost: {
    background: "transparent",
    color: DARK.ink,
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)",
  },
};

type ButtonProps = {
  kind?: keyof typeof BUTTON_STYLES;
  children: ReactNode;
  icon?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md";
  style?: CSSProperties;
};

export function Button({
  kind = "dark",
  children,
  icon,
  href,
  onClick,
  className = "",
  size = "md",
  style,
}: ButtonProps) {
  const classes = `group/b relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-[500] tracking-[-0.01em] transition-[transform,filter] duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-px active:brightness-95 ${size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-10 px-[18px] text-[14px]"} ${className}`;
  const content = (
    <>
      {children}
      {icon && (
        <Icon name={icon} size={13} className="transition-transform duration-300 group-hover/b:translate-x-0.5" />
      )}
    </>
  );
  return href ? (
    <a
      href={href}
      onClick={onClick}
      className={classes}
      style={{
        ...BUTTON_STYLES[kind],
        ...style,
      }}
    >
      {content}
    </a>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={classes}
      style={{
        ...BUTTON_STYLES[kind],
        ...style,
      }}
    >
      {content}
    </button>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y,
        filter: "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        margin: "-8%",
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({
  children,
  className = "",
  center = false,
}: {
  children: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <h2
      className={`text-[clamp(32px,4.4vw,48px)] font-[500] leading-[1.06] tracking-[-0.035em] ${center ? "text-center" : ""} ${className}`}
      style={{
        color: DARK.ink,
      }}
    >
      {children}
    </h2>
  );
}

export function SectionLabel({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <p
      className="mb-4 inline-flex items-center gap-2 text-[13px] font-[500]"
      style={{
        color: DARK.teal,
      }}
    >
      <span
        className="grid size-5 place-items-center rounded-md"
        style={{
          background: "rgba(63,224,197,.12)",
          boxShadow: "inset 0 0 0 1px rgba(63,224,197,.25)",
        }}
      >
        <Icon name={icon} size={12} />
      </span>
      {children}
    </p>
  );
}
