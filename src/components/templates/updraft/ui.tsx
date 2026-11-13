"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ICONS } from "./icons";
import { COLORS, SPECTRUM, SPECTRUM_GRADIENT, SPECTRUM_VERTICAL, clamp } from "./theme";

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

/** Opens the download dialog from anywhere on the page. */
export const DownloadContext = createContext<() => void>(() => {});

export const useOpenDownload = () => useContext(DownloadContext);

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

export function LogoMark({ size = 24, mono }: { size?: number; mono?: string }) {
  const uid = "ud" + useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden={true} className="shrink-0">
      <defs>
        <linearGradient id={uid} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={SPECTRUM[0]} />
          <stop offset=".45" stopColor={SPECTRUM[1]} />
          <stop offset=".75" stopColor={SPECTRUM[2]} />
          <stop offset="1" stopColor={SPECTRUM[3]} />
        </linearGradient>
      </defs>
      <path
        d="M6 26.5 16 17l10 9.5"
        fill="none"
        stroke={mono ?? `url(#${uid})`}
        strokeOpacity={0.42}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 16.5 16 7l10 9.5"
        fill="none"
        stroke={mono ?? `url(#${uid})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ dark = false, size = 22 }: { dark?: boolean; size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-2"
      style={{
        color: dark ? "#fff" : COLORS.ink,
      }}
    >
      <LogoMark size={size} />
      <span className="text-[17px] font-[560] tracking-[-0.02em]">Updraft</span>
    </span>
  );
}

type ButtonProps = {
  kind?: "dark" | "light" | "white" | "ghost";
  children: ReactNode;
  icon?: string;
  onClick?: () => void;
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit";
};

export function Button({
  kind = "dark",
  children,
  icon,
  onClick,
  href,
  className = "",
  size = "md",
  type,
}: ButtonProps) {
  const sizeClasses =
    size === "sm"
      ? "h-9 px-4 text-[13.5px]"
      : size === "lg"
        ? "h-[52px] px-6 text-[15.5px]"
        : "h-11 px-5 text-[14.5px]";
  const kindClasses = {
    dark: "bg-[#121317] text-white hover:shadow-[0_10px_28px_-10px_rgba(166,60,242,.7),0_0_0_1px_rgba(255,255,255,.06)_inset] ud-ring",
    light: "bg-[#F2F3F5] text-[#121317] hover:bg-[#E9EAEE] ud-ring",
    white: "bg-white text-[#121317] hover:shadow-[0_10px_30px_-10px_rgba(255,154,43,.6)] ud-ring-w",
    ghost: "bg-white/[.08] text-white ring-1 ring-inset ring-white/15 hover:bg-white/[.14] ud-ring-w",
  }[kind];
  const classes = `group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-[500] tracking-[-0.01em] transition-[transform,box-shadow,background-color] duration-300 [transition-timing-function:cubic-bezier(.22,1,.36,1)] hover:-translate-y-[1px] active:translate-y-0 active:scale-[.98] ${sizeClasses} ${kindClasses} ${className}`;
  const content = (
    <>
      {kind === "dark" && (
        <span
          aria-hidden={true}
          className="pointer-events-none absolute inset-x-3 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover/btn:opacity-100"
          style={{
            background: SPECTRUM_GRADIENT,
          }}
        />
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

export function Caret({ blink = false, dark = false }: { blink?: boolean; dark?: boolean }) {
  return (
    <span aria-hidden={true} className="relative inline-block w-0 align-baseline">
      <span
        className={`absolute left-[0.07em] top-[-0.8em] block h-[0.95em] w-[0.075em] min-w-[3px] rounded-full ${blink ? "ud-blink" : ""}`}
        style={{
          background: SPECTRUM_VERTICAL,
          boxShadow: dark ? "0 0 12px rgba(166,60,242,.55)" : undefined,
        }}
      />
    </span>
  );
}

type TypedTextProps = {
  /** line breaks in the text become line breaks */
  text: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  style?: CSSProperties;
  delay?: number;
  /** characters per second */
  cps?: number;
  start?: boolean;
  onDone?: () => void;
  keepCaret?: boolean;
  dark?: boolean;
};

/** Text that types itself in once it scrolls into view, with a caret. */
export function TypedText({
  text,
  as = "h2",
  className = "",
  style,
  delay = 0,
  cps = 32,
  start = true,
  onDone,
  keepCaret = false,
  dark = false,
}: TypedTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, {
    once: true,
    margin: "0px 0px -12% 0px",
  });
  const reduce = useReducedMotion();
  const chars = useMemo(() => Array.from(text), [text]);
  const [typed, setTyped] = useState(reduce ? chars.length : 0);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);
  useEffect(() => {
    if (reduce) {
      onDoneRef.current?.();
      return;
    }
    if (!start || !inView) {
      return;
    }
    let index = 0;
    let timer = 0;
    const tick = () => {
      index++;
      setTyped(index);
      if (index < chars.length) {
        const prev = chars[index - 1];
        timer = window.setTimeout(
          tick,
          (1e3 / cps) * (0.55 + Math.random() * 0.9) +
            (prev === " " ? 18 : 0) +
            (prev === "." || prev === "\n" ? 140 : 0),
        );
      } else {
        onDoneRef.current?.();
      }
    };
    timer = window.setTimeout(tick, delay * 1e3);
    return () => window.clearTimeout(timer);
  }, [start, inView, reduce, chars, cps, delay]);
  const Tag = as;
  const done = typed >= chars.length;
  const showCaret = !done || keepCaret;
  return (
    <Tag ref={ref} className={className} style={style} aria-label={text.replace(/\n/g, " ")}>
      {typed === 0 && showCaret && <Caret blink={true} dark={dark} />}
      {chars.map((char, i) =>
        char === "\n" ? (
          <br key={i} />
        ) : (
          <span
            key={i}
            aria-hidden={true}
            style={{
              opacity: i < typed ? 1 : 0,
            }}
          >
            {char}
            {i === typed - 1 && showCaret && <Caret blink={done} dark={dark} />}
          </span>
        ),
      )}
    </Tag>
  );
}

function ScrubWord({
  w: word,
  i: index,
  p: progress,
  last,
}: {
  w: string;
  i: number;
  p: MotionValue<number>;
  last: boolean;
}) {
  const opacity = useTransform(progress, (v) => clamp((v - index) / 3));
  const lit = useTransform(progress, (v) => ((v >= index && v < index + 1) || (last && v >= index) ? 1 : 0));
  return (
    <motion.span
      style={{
        opacity,
      }}
    >
      {word}
      <motion.span
        style={{
          opacity: lit,
        }}
        className="inline"
      >
        <Caret blink={false} />
      </motion.span>
      {last ? "" : " "}
    </motion.span>
  );
}

type ScrubTextProps = {
  text: string;
  as?: "p" | "h2" | "h3";
  className?: string;
  style?: CSSProperties;
  /** words per second */
  wps?: number;
  delay?: number;
};

/** A paragraph whose words light up in turn once it scrolls into view. */
export function ScrubText({ text, as = "p", className = "", style, wps = 13, delay = 0 }: ScrubTextProps) {
  const ref = useRef(null);
  const inView = useInView(ref, {
    once: true,
    margin: "0px 0px -18% 0px",
  });
  const reduce = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const progress = useMotionValue(reduce ? words.length + 4 : 0);
  useEffect(() => {
    if (!inView || reduce) {
      return;
    }
    const controls = animate(progress, words.length + 3.5, {
      duration: (words.length + 3) / wps,
      delay,
      ease: "linear",
    });
    return () => controls.stop();
  }, [inView, reduce, words.length, wps, delay, progress]);
  const Tag = as;
  return (
    <Tag ref={ref} className={className} style={style}>
      <span className="sr-only">{text}</span>
      <span aria-hidden={true}>
        {words.map((word, i) => (
          <ScrubWord key={i} w={word} i={i} p={progress} last={i === words.length - 1} />
        ))}
      </span>
    </Tag>
  );
}

export function TwoToneHeading({
  a: first,
  b: second,
  className = "",
  center = false,
}: {
  a: ReactNode;
  b?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <h2
      className={`text-[clamp(32px,4.4vw,58px)] font-[460] leading-[1.04] tracking-[-0.035em] ${center ? "text-center" : ""} ${className}`}
    >
      <span className="block">{first}</span>
      {second && (
        <span
          className="block"
          style={{
            color: COLORS.faint,
          }}
        >
          {second}
        </span>
      )}
    </h2>
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
export function useLiveInView() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    margin: "-15% 0px",
  });
  const reduce = useReducedMotion();
  return [ref, inView && !reduce] as const;
}
