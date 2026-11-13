"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { AVATAR_SVGS, ICONS } from "./icons";
import { COLOR, CONTAINER, EASE, FONT_DISPLAY } from "./theme";
export type IconName = keyof typeof ICONS;

/** A Phosphor icon, inlined from icons.ts. */
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
export type Person = keyof typeof AVATAR_SVGS;

/** The team's faces as data URLs (Notionists by Zoish, CC0). */
export const AVATAR_URLS = Object.fromEntries(
  Object.entries(AVATAR_SVGS).map(([person, svg]) => [
    person,
    `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
  ]),
) as Record<Person, string>;

export function Avatar({
  name,
  size = 22,
  ring = "#fff",
}: {
  name: Person;
  size?: number;
  ring?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={AVATAR_URLS[name]}
      alt=""
      aria-hidden={true}
      width={size}
      height={size}
      draggable={false}
      className="inline-block shrink-0 select-none rounded-full"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1.5px ${ring}`,
      }}
    />
  );
}
/** A link styled as a button; "#id" hrefs scroll smoothly to that section. */
export function Button({
  children,
  dark = false,
  href = "#",
  className = "",
  onClick,
}: {
  children: ReactNode;
  dark?: boolean;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.a
      href={href}
      whileTap={{
        scale: 0.97,
      }}
      onClick={(event) => {
        if (href.startsWith("#")) {
          event.preventDefault();
          const id = href.slice(1);
          if (id)
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
        onClick?.();
      }}
      className={`pl-ring group relative inline-flex items-center gap-1.5 overflow-hidden rounded-[10px] px-4 py-2.5 text-[14.5px] font-medium no-underline outline-none transition-colors ${className}`}
      style={
        dark
          ? {
              background: COLOR.ink,
              color: "#fff",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,.12), 0 1px 2px rgba(0,0,0,.2)",
            }
          : {
              background: "#fff",
              color: COLOR.ink,
              boxShadow: `inset 0 0 0 1px ${COLOR.line2}, 0 1px 2px rgba(14,17,22,.06)`,
            }
      }
    >
      {dark && (
        <span
          aria-hidden={true}
          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 opacity-0 transition-all duration-700 group-hover:left-[130%] group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.22), transparent)",
          }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.a>
  );
}
export function Eyebrow({
  children,
  center = false,
}: {
  children: ReactNode;
  center?: boolean;
}) {
  return (
    <p
      className={`m-0 text-[14px] font-medium ${center ? "text-center" : ""}`}
      style={{
        color: COLOR.accent,
      }}
    >
      {children}
    </p>
  );
}
/** A headline that un-blurs word by word: `lead` in ink, then `rest` in grey. */
export function Headline({
  lead,
  rest,
  size = "lg",
  center = false,
  as = "h2",
  className = "",
}: {
  lead: string;
  rest?: string;
  size?: "xl" | "lg" | "md";
  center?: boolean;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const Tag: ElementType = as;
  const fontSize =
    size === "xl"
      ? "clamp(44px, 6.4vw, 84px)"
      : size === "lg"
        ? "clamp(32px, 4.2vw, 56px)"
        : "clamp(24px, 2.6vw, 34px)";
  const words: [word: string, isLead: boolean][] = [
    ...lead.split(" ").map((word): [string, boolean] => [word, true]),
    ...(rest
      ? rest.split(" ").map((word): [string, boolean] => [word, false])
      : []),
  ];
  return (
    <Tag
      className={`m-0 font-medium ${center ? "text-center" : ""} ${className}`}
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: fontSize,
        lineHeight: 1.06,
        letterSpacing: "-0.035em",
        color: COLOR.ink,
        textWrap: "balance",
      }}
    >
      {words.map(([word, isLead], index) => (
        <motion.span
          className="inline-block whitespace-pre"
          style={{
            color: isLead ? COLOR.ink : "#6E7682",
          }}
          initial={{
            opacity: 0,
            filter: "blur(10px)",
            y: 8,
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
            delay: Math.min(index * 0.035, 0.9),
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
  y = 18,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: y,
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
/** A full-width section with hairlines on top and down both sides of the container. */
export function Section({
  id,
  children,
  className = "",
  inner = "",
  noTop = false,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  inner?: string;
  noTop?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-16 ${className}`}
      style={{
        borderTop: noTop ? undefined : `1px solid ${COLOR.line}`,
      }}
    >
      <div
        className={`${CONTAINER} ${inner}`}
        style={{
          borderLeft: `1px solid ${COLOR.line}`,
          borderRight: `1px solid ${COLOR.line}`,
        }}
      >
        {children}
      </div>
    </section>
  );
}
/** Counts from 0 to `target` once `start` is true, formatted with `decimals` places. */
export function useCountUp(target: number, start: boolean, decimals = 0) {
  const [value, setValue] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) {
      return;
    }
    if (reduce) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.6,
      ease: [0.2, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [start, target, reduce]);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
/** Scales a fixed-width mock down to fit its container: returns a ref for the container and the scale. */
export function useFitScale(
  designWidth: number,
): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(1, entry!.contentRect.width / designWidth)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [designWidth]);
  return [ref, scale];
}
export type Tone = "dusk" | "day" | "aurora";
/** [colour, left, top, width, height] of one soft blob */
type Blob = [
  color: string,
  left: string,
  top: string,
  width: string,
  height: string,
];

/** A painted sky of drifting blurred blobs with film grain, used behind the mocks. */
export function Sky({
  tone = "dusk",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const sky = (
    {
      dusk: {
        bg: "linear-gradient(170deg, #E9A6B4 0%, #C9B4D6 34%, #9DB4DA 62%, #B7C8E6 100%)",
        blobs: [
          ["#F7C1C8", "4%", "6%", "46%", "34%"],
          ["#FFFFFF", "28%", "26%", "40%", "22%"],
          ["#E8B9D2", "60%", "8%", "44%", "30%"],
          ["#A9BEE4", "70%", "54%", "50%", "40%"],
          ["#F3D3DC", "-6%", "60%", "50%", "36%"],
          ["#FFFFFF", "48%", "70%", "36%", "18%"],
        ],
      },
      day: {
        bg: "linear-gradient(180deg, #8DB8EC 0%, #B6D0F0 50%, #DCE7F6 100%)",
        blobs: [
          ["#FFFFFF", "6%", "14%", "40%", "26%"],
          ["#FFFFFF", "50%", "6%", "46%", "30%"],
          ["#EAF2FC", "24%", "52%", "60%", "30%"],
          ["#FFFFFF", "64%", "58%", "38%", "26%"],
          ["#F6FAFF", "-4%", "70%", "40%", "26%"],
        ],
      },
      aurora: {
        bg: "linear-gradient(135deg, #FDE6DA 0%, #E4F6EC 40%, #DDEBFB 70%, #EBE2FA 100%)",
        blobs: [
          ["#FFB8A0", "-8%", "10%", "50%", "50%"],
          ["#9EE6C2", "30%", "-10%", "50%", "50%"],
          ["#9CC6FF", "56%", "30%", "52%", "56%"],
          ["#D3B6FF", "70%", "-6%", "40%", "40%"],
          ["#FFFFFF", "20%", "50%", "50%", "40%"],
        ],
      },
    } satisfies Record<Tone, { bg: string; blobs: Blob[] }>
  )[tone];
  return (
    <div
      aria-hidden={true}
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{
        background: sky.bg,
      }}
    >
      {sky.blobs.map(([color, left, top, width, height], index) => (
        <motion.div
          className="absolute rounded-full"
          style={{
            left,
            top,
            width,
            height,
            background: color,
            filter: `blur(${tone === "aurora" ? 60 : 38}px)`,
            opacity: tone === "aurora" ? 0.85 : 0.9,
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, index % 2 ? 40 : -40, 0],
                  y: [0, index % 2 ? -16 : 16, 0],
                }
          }
          transition={{
            duration: 18 + index * 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          key={index}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.5'/></svg>")`,
          opacity: 0.16,
          mixBlendMode: "overlay",
        }}
      />
    </div>
  );
}
export function Sand() {
  return (
    <div
      aria-hidden={true}
      className="absolute inset-0"
      style={{
        background: "linear-gradient(160deg,#E9E4DA,#D9D2C4)",
      }}
    >
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {Array.from(
          {
            length: 14,
          },
          (_, index) => (
            <path
              d={`M-20 ${index * 26 - 40} C 80 ${index * 26 - 70}, 160 ${index * 26 + 10}, 260 ${index * 26 - 20} S 380 ${index * 26 - 40}, 440 ${index * 26 - 10}`}
              fill="none"
              stroke={
                index % 2 ? "rgba(255,255,255,.55)" : "rgba(120,104,80,.18)"
              }
              strokeWidth={index % 2 ? 7 : 10}
              style={{
                filter: "blur(2px)",
              }}
              key={index}
            />
          ),
        )}
      </svg>
    </div>
  );
}
/** The rounded stage a mock sits on: plain grey, sand, or one of the skies. */
export function Stage({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: Tone | "sand";
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] p-4 sm:p-10"
      style={{
        background: tone ? undefined : COLOR.panel,
      }}
    >
      {tone === "sand" ? <Sand /> : tone ? <Sky tone={tone} /> : null}
      <div className="relative">{children}</div>
    </div>
  );
}
export const MockCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`overflow-hidden rounded-[14px] bg-white ${className}`}
    style={{
      boxShadow:
        "0 0 0 1px rgba(14,17,22,.06), 0 18px 40px -24px rgba(14,17,22,.35)",
    }}
  >
    {children}
  </div>
);
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center gap-2 font-semibold"
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: size * 0.92,
        letterSpacing: "-0.035em",
        color: COLOR.ink,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden={true}>
        <rect width="24" height="24" rx="6.5" fill={COLOR.ink} />
        <path
          d="M6 15.5 C9 15.5 9.5 8.5 13 8.5 S17 12 18.5 12"
          fill="none"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <circle cx="18.2" cy="12" r="2" fill={COLOR.accent} />
      </svg>
      Plotline
    </span>
  );
}
