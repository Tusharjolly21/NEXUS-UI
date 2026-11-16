"use client";

import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { AVATAR_URLS } from "./avatars";
import { ICONS } from "./icons";
import { COLORS, EASE, FONT_SANS, SPRING, formatNumber } from "./theme";

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

export function Avatar({ name, size = 28, ring }: { name: string; size?: number; ring?: string }) {
  return (
    // An inline SVG data URL: next/image would add nothing here.
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
        boxShadow: `0 0 0 ${ring ? 2 : 1}px ${ring ?? "var(--line2)"}`,
      }}
    />
  );
}

export function AvatarStack({
  names,
  size = 22,
  ring = "var(--card)",
}: {
  names: string[];
  size?: number;
  ring?: string;
}) {
  return (
    <span className="inline-flex">
      {names.map((name, i) => (
        <span
          key={name}
          style={{
            marginLeft: i ? -size * 0.28 : 0,
          }}
        >
          <Avatar name={name} size={size} ring={ring} />
        </span>
      ))}
    </span>
  );
}

/** A rounded square with a company's initials, tinted by `hue` (an index into the chart colours). */
export function InitialsAvatar({ name, size = 28, hue = 0 }: { name: string; size?: number; hue?: number }) {
  const initials = name
    .replace(/&/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  const tones = ["var(--s1)", "var(--s2)", "var(--s3)", "var(--s4)", "var(--vneutral)"];
  return (
    <span
      aria-hidden={true}
      className="relative grid shrink-0 place-items-center overflow-hidden font-[600]"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        background: COLORS.well,
        color: COLORS.ink,
        fontSize: size * 0.38,
        boxShadow: "inset 0 0 0 1px var(--line)",
      }}
    >
      <span
        className="absolute inset-x-0 bottom-0"
        style={{
          height: size * 0.16,
          background: tones[hue % tones.length],
          opacity: 0.85,
        }}
      />
      <span className="relative -mt-[2px] tracking-[-0.02em]">{initials}</span>
    </span>
  );
}

function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <span
      aria-hidden={true}
      className="relative inline-block overflow-hidden"
      style={{
        height: "1.12em",
        WebkitMaskImage: "linear-gradient(transparent 0,#000 18%,#000 82%,transparent 100%)",
        maskImage: "linear-gradient(transparent 0,#000 18%,#000 82%,transparent 100%)",
      }}
    >
      <span
        className="invisible block"
        style={{
          lineHeight: "1.12em",
        }}
      >
        0
      </span>
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={false}
        animate={{
          y: `${-digit * 1.12}em`,
        }}
        transition={
          reduce
            ? {
                duration: 0,
              }
            : {
                type: "spring",
                stiffness: 210,
                damping: 25,
                mass: 0.8,
                delay,
              }
        }
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
          <span
            key={value}
            className="block"
            style={{
              lineHeight: "1.12em",
              height: "1.12em",
            }}
          >
            {value}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** Text whose digits roll into place like an odometer whenever it changes. */
export function RollingText({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const chars = text.replace(/ /g, " ").split("");
  return (
    <span
      className={`inline-flex items-start tabular-nums ${className}`}
      style={{
        lineHeight: "1.12em",
        ...style,
      }}
    >
      <span className="sr-only">{text}</span>
      {chars.map((char, i) => {
        const fromEnd = chars.length - i;
        return /\d/.test(char) ? (
          <RollingDigit key={`d${fromEnd}`} digit={+char} delay={fromEnd * 0.012} />
        ) : (
          <span
            key={`c${fromEnd}${char}`}
            aria-hidden={true}
            className="block"
            style={{
              lineHeight: "1.12em",
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}

type CountUpProps = { value: number; format?: (value: number) => string; className?: string; style?: CSSProperties };

/** A number that counts to its new value whenever it changes. */
export function CountUp({ value, format = formatNumber, className, style }: CountUpProps) {
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(value);
  const [shown, setShown] = useState(value);
  useMotionValueEvent(motionValue, "change", setShown);
  useEffect(() => {
    if (reduce) {
      motionValue.set(value);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(value);
      return;
    }
    const controls = animate(motionValue, value, {
      type: "spring",
      stiffness: 180,
      damping: 28,
    });
    return () => controls.stop();
  }, [value, reduce, motionValue]);
  return (
    <span className={`tabular-nums ${className ?? ""}`} style={style}>
      {format(shown)}
    </span>
  );
}

/** A labelled figure whose label and value roll when either changes (hovering a chart swaps them). */
export function Metric({
  label,
  text,
  size = 30,
  after,
}: {
  label: string;
  text: string;
  size?: number;
  after?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div
        className="relative h-[18px] overflow-hidden text-[12.5px]"
        style={{
          color: COLORS.text,
        }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={label}
            className="block truncate"
            initial={{
              y: 12,
              opacity: 0,
              filter: "blur(3px)",
            }}
            animate={{
              y: 0,
              opacity: 1,
              filter: "blur(0px)",
            }}
            exit={{
              y: -12,
              opacity: 0,
              filter: "blur(3px)",
            }}
            transition={{
              duration: 0.24,
              ease: EASE,
            }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <RollingText
          text={text}
          className="font-[580] tracking-[-0.035em]"
          style={{
            fontSize: size,
            color: COLORS.ink,
          }}
        />
        {after}
      </div>
    </div>
  );
}

/** A percentage change, green when it is good news (or red, for costs, when `invert`). */
export function DeltaBadge({ value, invert, size = "sm" }: { value: number; invert?: boolean; size?: "sm" | "xs" }) {
  const good = invert ? value <= 0 : value >= 0;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full font-[560] tabular-nums ${size === "xs" ? "h-[18px] px-1.5 text-[11px]" : "h-[22px] px-2 text-[12px]"}`}
      style={{
        background: good ? "var(--good-bg)" : "var(--bad-bg)",
        color: good ? "var(--good-ink)" : "var(--bad-ink)",
      }}
    >
      <Icon name={value >= 0 ? "ph:arrow-up-right" : "ph:arrow-down-right"} size={size === "xs" ? 10 : 11} />
      <CountUp value={Math.abs(value)} format={(pct) => `${pct.toFixed(1)}%`} />
    </span>
  );
}

export function Card({
  children,
  className = "",
  style,
  label,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  label?: string;
}) {
  return (
    <section
      aria-label={label}
      className={`relative min-w-0 rounded-[18px] ${className}`}
      style={{
        background: COLORS.card,
        boxShadow: "var(--card-shadow)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  icon,
  right,
  sub,
}: {
  title: ReactNode;
  icon?: string;
  right?: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon && (
          <span
            className="grid size-7 shrink-0 place-items-center rounded-[9px]"
            style={{
              background: COLORS.well,
              color: COLORS.text,
            }}
          >
            <Icon name={icon} size={15} />
          </span>
        )}
        <div className="min-w-0">
          <h3
            className="truncate text-[14px] font-[580] tracking-[-0.01em]"
            style={{
              color: COLORS.ink,
            }}
          >
            {title}
          </h3>
          {sub && (
            <p
              className="truncate text-[12px]"
              style={{
                color: COLORS.soft,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
      {right}
    </div>
  );
}

type SegmentedProps<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  id: string;
  label: string;
};

export function Segmented<T extends string>({ options, value, onChange, id, label }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="relative inline-flex shrink-0 rounded-[10px] p-[3px]"
      style={{
        background: COLORS.well,
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === value}
          onClick={() => onChange(option)}
          className="relative h-[26px] rounded-[8px] px-2.5 text-[12.5px] font-[530] transition-colors"
          style={{
            color: option === value ? COLORS.ink : COLORS.soft,
          }}
        >
          {option === value && (
            <motion.span
              layoutId={id}
              className="absolute inset-0 rounded-[8px]"
              style={{
                background: "var(--seg)",
                boxShadow: "var(--seg-shadow)",
              }}
              transition={SPRING}
            />
          )}
          <span className="relative">{option}</span>
        </button>
      ))}
    </div>
  );
}

export function Button({
  kind = "secondary",
  children,
  icon,
  onClick,
  className = "",
  size = "md",
  label,
  type = "button",
  disabled,
}: {
  kind?: "primary" | "secondary" | "ghost";
  children?: ReactNode;
  icon?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: "sm" | "md";
  label?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-[13px] gap-1.5" : "h-9 px-3.5 text-[13.5px] gap-2";
  const kindClass =
    kind === "primary"
      ? {
          background: "linear-gradient(180deg, color-mix(in srgb, var(--btn) 88%, white) 0%, var(--btn) 100%)",
          color: "#fff",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.22), 0 0 0 1px color-mix(in srgb, var(--btn) 70%, black), 0 1px 2px rgba(0,0,0,.25), 0 6px 16px -8px var(--btn)",
        }
      : kind === "secondary"
        ? {
            background: COLORS.card2,
            color: COLORS.ink,
            boxShadow: "var(--seg-shadow), 0 0 0 1px var(--line)",
          }
        : {
            background: "transparent",
            color: COLORS.text,
          };
  return (
    <motion.button
      type={type}
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      whileTap={{
        scale: 0.97,
      }}
      transition={SPRING}
      className={`inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-[10px] font-[540] tracking-[-0.01em] transition-[filter,background-color] hover:brightness-110 disabled:opacity-50 ${kind === "ghost" ? "md-hov" : ""} ${sizeClass} ${className}`}
      style={kindClass}
    >
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 15} />}
      {children}
    </motion.button>
  );
}

type IconButtonProps = {
  icon: string;
  label: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  active?: boolean;
  size?: number;
  children?: ReactNode;
};

export function IconButton({ icon, label, onClick, active, size = 34, children }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="md-hov relative grid shrink-0 place-items-center rounded-[10px]"
      style={{
        width: size,
        height: size,
        color: active ? COLORS.ink : COLORS.text,
        background: active ? COLORS.well : "transparent",
      }}
    >
      <Icon name={icon} size={17} />
      {children}
    </button>
  );
}

export function Checkbox({
  on,
  mixed,
  onChange,
  label,
}: {
  on: boolean;
  mixed?: boolean;
  onChange: () => void;
  label: string;
}) {
  const filled = on || mixed;
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : on}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onChange();
      }}
      className="grid size-[18px] shrink-0 place-items-center rounded-[6px] transition-[background-color,box-shadow] duration-150"
      style={{
        background: filled ? COLORS.accent : "transparent",
        boxShadow: filled ? "none" : "inset 0 0 0 1.5px var(--faint)",
      }}
    >
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" aria-hidden={true}>
        {mixed && !on ? (
          <motion.path
            d="M4 8h8"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 0.16,
            }}
          />
        ) : (
          <motion.path
            d="M3.5 8.4l3 3 6-6.6"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{
              pathLength: on ? 1 : 0,
              opacity: on ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
              ease: EASE,
            }}
          />
        )}
      </svg>
    </button>
  );
}

type DropdownProps = {
  open: boolean;
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  style?: CSSProperties;
  origin?: string;
};

export function Dropdown({ open, children, align = "left", className = "", style, origin }: DropdownProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.96,
            y: -4,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            y: -4,
            transition: {
              duration: 0.12,
            },
          }}
          transition={SPRING}
          className={`absolute top-[calc(100%+6px)] z-40 rounded-[14px] p-1.5 ${align === "right" ? "right-0" : "left-0"} ${className}`}
          style={{
            background: COLORS.pop,
            boxShadow: "var(--pop-shadow)",
            transformOrigin: origin ?? (align === "right" ? "top right" : "top left"),
            ...style,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type MenuItemProps = {
  children: ReactNode;
  icon?: string;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  right?: ReactNode;
};

export function MenuItem({ children, icon, onClick, active, danger, right }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="md-hov flex h-8 w-full items-center gap-2.5 rounded-[9px] px-2.5 text-left text-[13px]"
      style={{
        color: danger ? "var(--bad-ink)" : COLORS.ink,
        background: active ? COLORS.well : undefined,
      }}
    >
      {icon && (
        <Icon
          name={icon}
          size={15}
          style={{
            color: danger ? "var(--bad-ink)" : COLORS.soft,
          }}
        />
      )}
      <span className="flex-1 truncate">{children}</span>
      {right}
    </button>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-grid h-[20px] min-w-[20px] place-items-center rounded-[6px] px-1 text-[11px] font-[500]"
      style={{
        fontFamily: FONT_SANS,
        color: COLORS.soft,
        background: COLORS.card,
        boxShadow: "inset 0 -1px 0 var(--line2), 0 0 0 1px var(--line)",
      }}
    >
      {children}
    </kbd>
  );
}

export function Dot({ color, size = 7 }: { color: string; size?: number }) {
  return (
    <span
      aria-hidden={true}
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
      }}
    />
  );
}

export function PageHeader({ title, sub, right }: { title: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1
          className="text-[24px] font-[600] leading-tight tracking-[-0.03em] sm:text-[28px]"
          style={{
            color: COLORS.ink,
          }}
        >
          {title}
        </h1>
        {sub && (
          <p
            className="mt-1.5 text-[14px]"
            style={{
              color: COLORS.text,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}
