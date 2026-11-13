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
import { COLORS, EASE } from "./theme";

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

export function Avatar({ name, size = 28 }: { name: string; size?: number }) {
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
        boxShadow: "0 0 0 1px rgba(255,255,255,.12)",
      }}
    />
  );
}

/** Counts 0, 1, ... length - 1 and round again every `interval` ms while `running`. */
export function useCycle(length: number, interval: number, running: boolean) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!running) {
      return;
    }
    const timer = window.setInterval(() => setStep((prev) => (prev + 1) % length), interval);
    return () => window.clearInterval(timer);
  }, [length, interval, running]);
  return step;
}

/** [ref, playing]: `playing` is in view and motion is allowed. */
export function useLiveInView(margin: UseInViewOptions["margin"] = "-12% 0px") {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin,
  });
  const reduce = useReducedMotion();
  return [ref, inView && !reduce] as const;
}

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}

type CountUpProps = {
  to: number;
  from?: number;
  dur?: number;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
  /** start counting; defaults to when it scrolls into view */
  run?: boolean;
};

export function CountUp({ to, from = 0, dur = 1.2, suffix = "", className, style, run }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, {
    margin: "-10% 0px",
  });
  const reduce = useReducedMotion();
  const running = run ?? inView;
  const motionValue = useMotionValue(reduce ? to : from);
  const [shown, setShown] = useState(reduce ? to : from);
  useMotionValueEvent(motionValue, "change", (v) => setShown(Math.round(v)));
  useEffect(() => {
    if (reduce) {
      motionValue.set(to);
      return;
    }
    if (running) {
      const controls = animate(motionValue, to, {
        duration: dur,
        ease: EASE,
      });
      return () => controls.stop();
    }
    motionValue.set(from);
  }, [running, to, from, dur, reduce, motionValue]);
  return (
    <span ref={ref} className={className} style={style}>
      {shown.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

export function LogoMark({ size = 20, dot = COLORS.blue }: { size?: number; dot?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden={true} className="shrink-0">
      <path d="M12 3a9 9 0 1 0 9 9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="19.2" cy="5" r="2.6" fill={dot} />
    </svg>
  );
}

export function Logo() {
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        color: COLORS.ink,
      }}
    >
      <LogoMark />
      <span className="text-[17px] font-[650] tracking-[-0.03em]">surfaced</span>
    </span>
  );
}

const BUTTON_STYLES: Record<"primary" | "dark" | "ghost", CSSProperties> = {
  primary: {
    background: "linear-gradient(180deg,#5D7BFF 0%,#3552E8 100%)",
    color: "#fff",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.28), inset 0 0 0 1px rgba(255,255,255,.12), 0 1px 2px rgba(0,0,0,.4), 0 10px 22px -10px rgba(75,107,251,.75)",
  },
  dark: {
    background: "linear-gradient(180deg,#2E2E33 0%,#1E1E22 100%)",
    color: "#EDEDEF",
    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.16), inset 0 0 0 1px rgba(255,255,255,.1), 0 1px 2px rgba(0,0,0,.4), 0 10px 20px -12px rgba(0,0,0,.7)",
  },
  ghost: {
    background: "transparent",
    color: "#EDEDEF",
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
};

export function Button({ kind = "dark", children, icon, href, onClick, className = "", size = "md" }: ButtonProps) {
  const classes = `group/b relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-[550] tracking-[-0.01em] transition-[transform,filter] duration-200 hover:-translate-y-px hover:brightness-110 active:translate-y-px active:brightness-95 ${size === "sm" ? "h-8 px-3.5 text-[13px]" : "h-10 px-4 text-[14px]"} ${className}`;
  const content = (
    <>
      {children}
      {icon && (
        <Icon name={icon} size={13} className="transition-transform duration-300 group-hover/b:translate-x-0.5" />
      )}
    </>
  );
  return href ? (
    <a href={href} onClick={onClick} className={classes} style={BUTTON_STYLES[kind]}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={classes} style={BUTTON_STYLES[kind]}>
      {content}
    </button>
  );
}

type RevealProps = { children: ReactNode; delay?: number; className?: string; y?: number; once?: boolean };

export function Reveal({ children, delay = 0, className = "", y = 12, once = true }: RevealProps) {
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
        once,
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

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-[600] uppercase tracking-[0.12em]"
      style={{
        background: "rgba(255,255,255,.05)",
        color: COLORS.text,
        boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
      }}
    >
      {children}
    </span>
  );
}

type SectionHeadingProps = { tag?: ReactNode; title: ReactNode; sub?: ReactNode; className?: string };

export function SectionHeading({ tag, title, sub, className = "" }: SectionHeadingProps) {
  return (
    <div className={`mx-auto max-w-[640px] text-center ${className}`}>
      {tag && (
        <Reveal>
          <Tag>{tag}</Tag>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2
          className={`${tag ? "mt-5" : ""} text-[clamp(30px,4vw,46px)] font-[600] leading-[1.08] tracking-[-0.04em]`}
          style={{
            color: COLORS.ink,
          }}
        >
          {title}
        </h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.12}>
          <p
            className="mx-auto mt-4 max-w-[440px] text-[15.5px] leading-[1.6]"
            style={{
              color: COLORS.text,
            }}
          >
            {sub}
          </p>
        </Reveal>
      )}
    </div>
  );
}

export function Panel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[24px] ${className}`}
      style={{
        background: COLORS.card,
        boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
