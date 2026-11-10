"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { AVATAR_SVGS, ICONS } from "./icons";
import { BOUNCY, COLOR, FONT_DISPLAY, FONT_SANS, INK } from "./theme";
export type Person = keyof typeof AVATAR_SVGS;
export type IconName = keyof typeof ICONS;

/** The crew's faces as data URLs (Notionists by Zoish, CC0). */
export const AVATAR_URLS = Object.fromEntries(
  Object.entries(AVATAR_SVGS).map(([person, svg]) => [
    person,
    `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
  ]),
) as Record<Person, string>;

export function Avatar({
  name,
  size = 48,
  ring,
  className = "",
}: {
  name: Person;
  size?: number;
  ring?: string;
  className?: string;
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
      className={`inline-block shrink-0 select-none rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring ? `0 0 0 2.5px ${ring}` : undefined,
      }}
    />
  );
}
/** A Phosphor icon, inlined from icons.ts. */
export function Icon({
  name,
  size = 18,
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
/** A word on a rotated sticker with a white die-cut edge. */
export function Sticker({
  children,
  bg = "#fff",
  color = INK,
  rotate = 0,
  size = 28,
  font = FONT_DISPLAY,
  className = "",
  style,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  rotate?: number;
  size?: number;
  font?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      aria-hidden={true}
      className={`inline-block select-none whitespace-nowrap rounded-[10px] px-[0.45em] pb-[0.08em] pt-[0.12em] leading-none ${className}`}
      style={{
        background: bg,
        color: color,
        fontFamily: font,
        fontSize: size,
        rotate: `${rotate}deg`,
        boxShadow: `0 0 0 ${Math.max(3, size / 9)}px #fff, 0 10px 18px -6px rgba(11,18,51,.32)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
/** A pair of cartoon eyes whose pupils follow the pointer around the page. */
export function Eyes({ size = 70 }: { size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const eyeX = useSpring(lookX, {
    stiffness: 300,
    damping: 18,
  });
  const eyeY = useSpring(lookY, {
    stiffness: 300,
    damping: 18,
  });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) {
        return;
      }
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const angle = Math.atan2(event.clientY - cy, event.clientX - cx);
      const reach = Math.min(
        1,
        Math.hypot(event.clientX - cx, event.clientY - cy) / 160,
      );
      lookX.set(Math.cos(angle) * 7 * reach);
      lookY.set(Math.sin(angle) * 9 * reach);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [lookX, lookY]);
  return (
    <svg
      ref={ref}
      viewBox="-8 -8 116 76"
      width={size}
      height={size * 0.655}
      aria-hidden={true}
      style={{
        filter: "drop-shadow(0 7px 10px rgba(11,18,51,.22))",
        overflow: "visible",
      }}
    >
      <g fill="#fff" stroke="#fff" strokeWidth="13">
        <ellipse cx="30" cy="30" rx="26" ry="29" />
        <ellipse cx="72" cy="30" rx="26" ry="29" />
      </g>
      {[30, 72].map((item) => (
        <g key={item}>
          <ellipse
            cx={item}
            cy="30"
            rx="26"
            ry="29"
            fill="#fff"
            stroke={INK}
            strokeWidth="3.5"
          />
          <motion.g
            style={{
              x: eyeX,
              y: eyeY,
            }}
          >
            <circle
              cx={item}
              cy="32"
              r="14"
              fill="#2BB5C4"
              stroke={INK}
              strokeWidth="2"
            />
            <circle cx={item} cy="32" r="8" fill={INK} />
            <circle cx={item - 4} cy="27" r="3.2" fill="#fff" />
          </motion.g>
        </g>
      ))}
    </svg>
  );
}
/** A small flat white cloud. */
export function Cloud({
  w = 90,
  className = "",
  style,
}: {
  w?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 50"
      width={w}
      height={w / 2}
      aria-hidden={true}
      className={className}
      style={style}
    >
      <g fill="#fff">
        <circle cx="30" cy="30" r="17" />
        <circle cx="52" cy="22" r="21" />
        <circle cx="74" cy="31" r="15" />
        <rect x="14" y="28" width="74" height="19" rx="9.5" />
      </g>
    </svg>
  );
}
/** A chunky pill button with an ink outline and a drop edge; "#id" hrefs scroll smoothly to that section. */
export function Button({
  children,
  href = "#",
  tone = "sky",
  className = "",
  onClick,
}: {
  children: ReactNode;
  href?: string;
  tone?: "sky" | "white" | "ink" | "orange";
  className?: string;
  onClick?: () => void;
}) {
  const colors = {
    sky: {
      background: COLOR.sky,
      color: INK,
    },
    white: {
      background: "#fff",
      color: INK,
    },
    ink: {
      background: INK,
      color: "#fff",
    },
    orange: {
      background: COLOR.orange,
      color: INK,
    },
  }[tone];
  return (
    <motion.a
      href={href}
      onClick={(event) => {
        if (href.startsWith("#")) {
          event.preventDefault();
          const id = href.slice(1);
          if (id)
            document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }
        onClick?.();
      }}
      whileHover={{
        y: -3,
        rotate: -2,
      }}
      whileTap={{
        scale: 0.95,
      }}
      transition={BOUNCY}
      className={`hp-ring inline-flex items-center gap-2 rounded-full px-6 py-3 text-[16px] font-semibold no-underline outline-none ${className}`}
      style={{
        ...colors,
        boxShadow: `0 0 0 2px ${INK}, 0 4px 0 ${INK}`,
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </motion.a>
  );
}
/** A big uppercase Anton title. */
export function Title({
  children,
  className = "",
  style,
  as = "h2",
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3";
}) {
  const Tag: ElementType = as;
  return (
    <Tag
      className={`m-0 font-normal uppercase ${className}`}
      style={{
        fontFamily: FONT_DISPLAY,
        color: INK,
        lineHeight: 0.9,
        letterSpacing: "-0.005em",
        fontSize: "clamp(56px, 9vw, 132px)",
        ...style,
      }}
    >
      {children}
    </Tag>
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
      duration: 1.8,
      ease: [0.2, 1, 0.3, 1],
      onUpdate: setValue,
    });
    return () => controls.stop();
  }, [start, target, reduce, decimals]);
  return value.toFixed(decimals);
}
/** [width, height] of each scallop along the 1440-wide edge */
export const SCALLOPS: [width: number, height: number][] = [
  [182, 88],
  [236, 140],
  [182, 88],
  [240, 140],
  [182, 88],
  [236, 140],
  [182, 88],
];
/** The scalloped edge as an SVG path; `closed` closes it below so it can be filled. */
export function scallopPath(closed: boolean) {
  let x = 0;
  let d = "M0 150";
  for (const [width, height] of SCALLOPS) {
    d += ` A${width / 2} ${height} 0 0 1 ${x + width} 150`;
    x += width;
  }
  if (closed) {
    return d + " L1440 170 L0 170 Z";
  } else {
    return d;
  }
}
/** A full-width scalloped edge, like a cloud bank, between sections. */
export function ScallopEdge({
  fill = "#fff",
  flip = false,
  className = "",
  style,
}: {
  fill?: string;
  flip?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 1440 152"
      preserveAspectRatio="none"
      aria-hidden={true}
      className={`block w-full ${className}`}
      style={{
        height: "clamp(52px, 10.4vw, 152px)",
        transform: flip ? "scaleY(-1)" : undefined,
        ...style,
      }}
    >
      <path d={scallopPath(true)} fill={fill} />
      <path
        d={scallopPath(false)}
        fill="none"
        stroke={INK}
        strokeWidth="2.4"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
/** [left %, top %, width, seconds per drift] of the small clouds */
export const PUFFS: [
  left: number,
  top: number,
  width: number,
  seconds: number,
][] = [
  [9, 24, 96, 26],
  [80, 26, 110, 32],
  [52, 9, 70, 22],
  [26, 56, 60, 30],
  [92, 50, 64, 24],
];
/** The sky: a blue gradient with warm glows drifting low and small clouds drifting across. */
export function SkyBackdrop({ puffs = true }: { puffs?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden={true}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${COLOR.sky} 0%, #5AA4FF 45%, #7DB8FF 70%)`,
      }}
    >
      {(
        [
          ["#FFD98A", "-6%", "64%", "60vmax", "34vmax", 0.95],
          ["#FFC6EC", "34%", "58%", "56vmax", "30vmax", 0.9],
          ["#FFFFFF", "70%", "66%", "62vmax", "34vmax", 0.95],
          ["#FFF4E2", "10%", "82%", "80vmax", "30vmax", 1],
          ["#FFFFFF", "50%", "86%", "90vmax", "30vmax", 1],
        ] as const
      ).map(([color, left, top, width, height, opacity], index) => (
        <motion.div
          className="absolute rounded-full"
          style={{
            left,
            top,
            width,
            height,
            background: color,
            opacity,
            filter: "blur(48px)",
          }}
          animate={
            reduce
              ? undefined
              : {
                  x: [0, index % 2 ? 30 : -30, 0],
                  y: [0, -14, 0],
                }
          }
          transition={{
            duration: 14 + index * 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          key={index}
        />
      ))}
      {puffs &&
        PUFFS.map(([left, top, width, seconds], index) => (
          <motion.div
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={
              reduce
                ? undefined
                : {
                    x: [0, 26, 0],
                  }
            }
            transition={{
              duration: seconds,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            key={index}
          >
            <Cloud
              w={width}
              style={{
                opacity: index > 2 ? 0.85 : 1,
              }}
            />
          </motion.div>
        ))}
    </div>
  );
}
export function Logo({
  size = 26,
  light = false,
}: {
  size?: number;
  light?: boolean;
}) {
  return (
    <span
      className="inline-flex items-baseline font-black leading-none"
      style={{
        fontFamily: FONT_SANS,
        fontSize: size,
        letterSpacing: "-0.07em",
        color: light ? "#fff" : INK,
        fontWeight: 900,
      }}
    >
      hoopla
      <span
        className="ml-[0.06em] inline-block h-[0.24em] w-[0.24em] rounded-full"
        style={{
          background: COLOR.orange,
          boxShadow: `0 0 0 0.04em ${light ? "#fff" : INK}`,
        }}
      />
    </span>
  );
}
/** Clip paths used by the cards: a cloud-bottomed card and a blob. */
export function ClipDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden={true}>
      <defs>
        <clipPath id="hp-cloudcard" clipPathUnits="objectBoundingBox">
          <path d="M0.06 0 H0.94 Q1 0 1 0.06 V0.8 A0.2 0.2 0 0 1 0.66 0.92 A0.2 0.17 0 0 1 0.34 0.92 A0.2 0.2 0 0 1 0 0.8 V0.06 Q0 0 0.06 0 Z" />
        </clipPath>
        <clipPath id="hp-blob" clipPathUnits="objectBoundingBox">
          <path d="M0.5 0.02 C0.62 0.02 0.68 0.12 0.76 0.14 C0.9 0.16 1 0.3 0.99 0.48 C0.99 0.66 0.9 0.76 0.78 0.8 C0.7 0.9 0.6 0.99 0.48 0.98 C0.36 0.98 0.3 0.88 0.2 0.84 C0.06 0.78 0 0.64 0.01 0.48 C0.02 0.3 0.12 0.2 0.24 0.16 C0.32 0.08 0.4 0.02 0.5 0.02 Z" />
        </clipPath>
      </defs>
    </svg>
  );
}
/** Steps an index through 0..count-1 every `ms` while `on`. */
export function useCycle(count: number, ms: number, on: boolean) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!on || reduce) {
      return;
    }
    const timer = window.setInterval(
      () => setIndex((prev) => (prev + 1) % count),
      ms,
    );
    return () => window.clearInterval(timer);
  }, [on, count, ms, reduce]);
  return index;
}
/** Counts up from 0 to count-1 once, one step every `ms`, from mount. */
export function useSteps(count: number, ms: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = Array.from(
      {
        length: count - 1,
      },
      (_, index) =>
        window.setTimeout(() => setStep(index + 1), ms * (index + 1)),
    );
    return () => timers.forEach(clearTimeout);
  }, [count, ms]);
  return step;
}
