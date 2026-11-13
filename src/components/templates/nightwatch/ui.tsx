"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, useReducedMotion, type UseInViewOptions } from "framer-motion";
import { AVATAR_URLS } from "./avatars";
import { ICONS } from "./icons";
import { COLORS, DAWN, DAWN_GRADIENT, EASE } from "./theme";

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

export function Avatar({ name, size = 32, ring }: { name: string; size?: number; ring?: string }) {
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
        boxShadow: `0 0 0 ${ring ? 2 : 1}px ${ring ?? "rgba(255,255,255,.12)"}`,
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

export function LogoMark({ size = 24 }: { size?: number }) {
  const uid = "nw" + useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden={true} className="shrink-0">
      <defs>
        <linearGradient id={uid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={DAWN[0]} />
          <stop offset="1" stopColor={DAWN[2]} />
        </linearGradient>
        <mask id={uid + "m"}>
          <rect width="32" height="32" fill="#fff" />
          <circle cx="21" cy="11" r="10" fill="#000" />
        </mask>
      </defs>
      <circle cx="15" cy="16" r="12" fill={COLORS.ink} mask={`url(#${uid}m)`} />
      <circle cx="26" cy="5.5" r="2.6" fill={`url(#${uid})`} />
    </svg>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark size={size} />
      <span
        className="text-[16.5px] font-[600] tracking-[-0.02em]"
        style={{
          color: COLORS.ink,
        }}
      >
        Nightwatch
      </span>
    </span>
  );
}

type ButtonProps = {
  kind?: "dawn" | "glass" | "ghost";
  children: ReactNode;
  icon?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
};

export function Button({
  kind = "dawn",
  children,
  icon,
  onClick,
  href,
  className = "",
  size = "md",
  type,
}: ButtonProps) {
  const sizeClasses =
    size === "sm" ? "h-9 px-4 text-[13.5px]" : size === "lg" ? "h-12 px-6 text-[15px]" : "h-11 px-5 text-[14.5px]";
  const kindClasses = {
    dawn: "text-[#1C0F09] shadow-[0_0_0_1px_rgba(255,184,107,.35)_inset,0_10px_30px_-12px_rgba(255,107,90,.7)] hover:shadow-[0_0_0_1px_rgba(255,220,180,.6)_inset,0_14px_40px_-10px_rgba(255,120,90,.9)]",
    glass: "bg-white/[.06] text-[#ECEFF8] shadow-[0_0_0_1px_rgba(150,170,255,.16)_inset] hover:bg-white/[.1]",
    ghost: "text-[#ECEFF8] hover:bg-white/[.06]",
  }[kind];
  const classes = `nw-ring group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-[560] tracking-[-0.01em] transition-[transform,box-shadow,background-color] duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:-translate-y-px active:translate-y-0 active:scale-[.98] ${sizeClasses} ${kindClasses} ${className}`;
  const content = (
    <>
      {kind === "dawn" && (
        <>
          <span
            aria-hidden={true}
            className="absolute inset-0"
            style={{
              background: DAWN_GRADIENT,
            }}
          />
          <span
            aria-hidden={true}
            className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/35 opacity-0 transition-[transform,opacity] duration-700 group-hover/btn:translate-x-[320%] group-hover/btn:opacity-100"
          />
        </>
      )}
      <span className="relative">{children}</span>
      {icon && (
        <Icon
          name={icon}
          size={size === "sm" ? 14 : 16}
          className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5"
        />
      )}
    </>
  );
  return href ? (
    <a href={href} onClick={onClick} className={classes}>
      {content}
    </a>
  ) : (
    <button type={type ?? "button"} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

/** A card with a soft glow that follows the pointer. */
export function GlowCard({
  children,
  className = "",
  style,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "article";
}) {
  const Tag = as;
  return (
    <Tag
      className={`group/spot relative overflow-hidden rounded-[22px] ${className}`}
      style={{
        background: COLORS.card,
        ...style,
      }}
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
      }}
    >
      <span
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
        }}
      />
      <span
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          padding: 1,
          background:
            "radial-gradient(260px circle at var(--mx,50%) var(--my,50%), rgba(255,160,110,.55), transparent 70%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <span
        aria-hidden={true}
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(360px circle at var(--mx,50%) var(--my,50%), rgba(255,140,100,.06), transparent 70%)",
        }}
      />
      {children}
    </Tag>
  );
}

type SplitHeadingProps = {
  /** line breaks in the text become line breaks in the heading */
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  delay?: number;
};

/** A heading whose words rise in one by one once it scrolls into view. */
export function SplitHeading({ text, as = "h2", className = "", style, delay = 0 }: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "0px 0px -10% 0px",
  });
  const lines = text.split("\n");
  const Tag = as;
  let wordIndex = 0;
  return (
    <Tag ref={ref} className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      {lines.map((line, i) => (
        <span key={i} className="block" aria-hidden={true}>
          {line.split(" ").map((word, i) => {
            const index = wordIndex++;
            return (
              <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                <motion.span
                  className="inline-block"
                  initial={{
                    y: "105%",
                    opacity: 0,
                    filter: "blur(6px)",
                  }}
                  animate={
                    inView
                      ? {
                          y: "0%",
                          opacity: 1,
                          filter: "blur(0px)",
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.9,
                    delay: delay + index * 0.055,
                    ease: EASE,
                  }}
                >
                  {word}
                </motion.span>
                {i < line.split(" ").length - 1 ? " " : ""}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  y = 16,
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
      }}
      whileInView={{
        opacity: 1,
        y: 0,
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

export function SectionHeading({
  title,
  sub,
  center = false,
  className = "",
}: {
  title: string;
  sub?: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-[640px] ${className}`}>
      <SplitHeading
        text={title}
        className="text-[clamp(32px,4.2vw,52px)] font-[560] leading-[1.04] tracking-[-0.035em]"
        style={{
          color: COLORS.ink,
        }}
      />
      {sub && (
        <Reveal delay={0.25}>
          <p
            className={`mt-4 text-[16.5px] leading-[1.6] ${center ? "mx-auto" : ""} max-w-[520px]`}
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
