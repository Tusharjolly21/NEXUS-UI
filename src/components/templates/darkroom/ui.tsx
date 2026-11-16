"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { AVATAR_URLS } from "./avatars";
import { ICONS } from "./icons";
import { COLORS, EASE, FONT_MONO, SPRING } from "./theme";

type IconProps = { name: string; size?: number; className?: string; style?: CSSProperties };

/** A Phosphor icon from the bundled set, drawn inline so it takes the current text colour. */
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

type AvatarProps = { name: string; size?: number };

export function Avatar({ name, size = 28 }: AvatarProps) {
  return (
    // An inline SVG data URL: next/image would add nothing here.
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
        boxShadow: `0 0 0 1px ${COLORS.line2}`,
      }}
    />
  );
}

const noSubscribe = () => () => {};

/** False in the server render and during hydration, true after. For text only the browser knows: the clock and time zone. */
export function useHydrated() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

/** True below the breakpoint. Reads false on the server and during hydration, so the first render always matches. */
export function useIsMobile(breakpoint = 1024) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [breakpoint],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(`(max-width:${breakpoint - 1}px)`).matches,
    () => false,
  );
}

type CountUpProps = { value: number; decimals?: number; suffix?: string; className?: string; style?: CSSProperties };

/** A number that counts to its new value instead of jumping. */
export function CountUp({ value, decimals = 0, suffix = "", className, style }: CountUpProps) {
  const reduce = useReducedMotion();
  const count = useMotionValue(value);
  const [shown, setShown] = useState(value);
  useMotionValueEvent(count, "change", setShown);
  useEffect(() => {
    if (reduce) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 0.8,
      ease: EASE,
    });
    return () => controls.stop();
  }, [value, reduce, count]);
  return (
    <span className={`tabular-nums ${className ?? ""}`} style={style}>
      {shown.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Close a popover on Escape or on a pointer press outside every given element. */
export function useDismiss(open: boolean, onDismiss: () => void, ...refs: RefObject<HTMLElement | null>[]) {
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (event: PointerEvent) => {
      if (refs.every((ref) => !ref.current || !ref.current.contains(event.target as Node))) {
        latest.current();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        latest.current();
      }
    };
    const timer = setTimeout(() => document.addEventListener("pointerdown", onDown), 0);
    document.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
    // The refs are stable objects from useRef; listing them would re-subscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

export function IconButton({
  icon,
  label,
  onClick,
  active,
  size = 32,
  iconSize = 16,
  tipSide,
  className = "",
  style,
  disabled,
  pressed,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  size?: number;
  iconSize?: number;
  tipSide?: "top" | "bottom" | "left" | "right";
  className?: string;
  style?: CSSProperties;
  disabled?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      data-tip={active ? undefined : label}
      data-tip-side={tipSide}
      onClick={onClick}
      disabled={disabled}
      className={`relative grid shrink-0 place-items-center rounded-[9px] transition-[background,color,transform] duration-150 hover:bg-[var(--raise)] active:scale-[.94] disabled:opacity-40 ${className}`}
      style={{
        width: size,
        height: size,
        color: active ? COLORS.ink : COLORS.soft,
        background: active ? COLORS.raise : undefined,
        ...style,
      }}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
}

type PopoverProps = { children: ReactNode; className?: string; style?: CSSProperties; origin?: string };

export function Popover({ children, className = "", style, origin = "bottom left" }: PopoverProps) {
  return (
    <motion.div
      role="menu"
      initial={{
        opacity: 0,
        scale: 0.96,
        y: 6,
      }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      exit={{
        opacity: 0,
        scale: 0.97,
        y: 4,
        transition: {
          duration: 0.12,
        },
      }}
      transition={SPRING}
      className={`absolute z-50 rounded-[14px] p-1.5 ${className}`}
      style={{
        background: COLORS.panel,
        boxShadow: `0 0 0 1px ${COLORS.line2}, 0 18px 48px -12px rgba(0,0,0,.45)`,
        transformOrigin: origin,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

type MenuItemProps = {
  icon?: string;
  label: string;
  hint?: string;
  onClick: () => void;
  checked?: boolean;
  desc?: string;
};

export function MenuItem({ icon, label, hint, onClick, checked, desc }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={!!checked}
      onClick={onClick}
      className="hov flex w-full items-start gap-2.5 rounded-[9px] px-2.5 py-2 text-left"
    >
      {icon && (
        <span
          className="mt-[1px]"
          style={{
            color: checked ? COLORS.acc : COLORS.soft,
          }}
        >
          <Icon name={icon} size={16} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className="block text-[13px] font-[500]"
          style={{
            color: COLORS.ink,
          }}
        >
          {label}
        </span>
        {desc && (
          <span
            className="mt-0.5 block text-[12px] leading-snug"
            style={{
              color: COLORS.soft,
            }}
          >
            {desc}
          </span>
        )}
      </span>
      {hint && (
        <span
          className="mt-[1px] text-[11.5px]"
          style={{
            color: COLORS.soft,
            fontFamily: FONT_MONO,
          }}
        >
          {hint}
        </span>
      )}
      {checked && (
        <span
          className="mt-[1px]"
          style={{
            color: COLORS.acc,
          }}
        >
          <Icon name="ph:check" size={14} />
        </span>
      )}
    </button>
  );
}

export type SegmentOption<T> = { v: T; label: ReactNode; aria?: string };

type SegmentedProps<T> = {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  id: string;
  label: string;
};

/** A segmented control whose highlight slides between options. */
export function Segmented<T extends string | number>({ value, options, onChange, id, label }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative flex rounded-[10px] p-[3px]"
      style={{
        background: COLORS.raise,
      }}
    >
      {options.map((option) => (
        <button
          key={option.v}
          type="button"
          role="radio"
          aria-checked={value === option.v}
          aria-label={option.aria}
          onClick={() => onChange(option.v)}
          className="relative z-[1] flex h-7 flex-1 items-center justify-center gap-1 rounded-[8px] px-2 text-[12.5px] font-[500] transition-colors"
          style={{
            color: value === option.v ? COLORS.ink : COLORS.soft,
          }}
        >
          {value === option.v && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 -z-[1] rounded-[8px]"
              style={{
                background: COLORS.panel,
                boxShadow: `0 0 0 1px ${COLORS.line2}, 0 1px 2px rgba(0,0,0,.2)`,
              }}
              transition={SPRING}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <kbd
      className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[5px] px-1 text-[10.5px]"
      style={{
        fontFamily: FONT_MONO,
        color: COLORS.soft,
        boxShadow: `inset 0 0 0 1px ${COLORS.line2}`,
      }}
    >
      {children}
    </kbd>
  );
}

export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden={true} className="shrink-0">
      <rect x="1.5" y="1.5" width="21" height="21" rx="6.5" fill="var(--acc)" />
      <circle cx="12" cy="10" r="4.6" fill="none" stroke="var(--acc-ink)" strokeWidth="1.8" />
      <circle cx="12" cy="10" r="1.6" fill="var(--acc-ink)" />
      <path d="M6.5 18.2h11" stroke="var(--acc-ink)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

type ChipProps = { children: ReactNode; onRemove: () => void; label: string; accent?: boolean };

export function Chip({ children, onRemove, label, accent }: ChipProps) {
  return (
    <motion.span
      layout={true}
      initial={{
        opacity: 0,
        scale: 0.85,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.85,
      }}
      transition={SPRING}
      className="inline-flex h-7 items-center gap-1.5 rounded-[9px] pl-2 pr-1 text-[12.5px] font-[500]"
      style={{
        background: accent ? COLORS.accSoft : COLORS.raise,
        color: COLORS.ink,
        boxShadow: `inset 0 0 0 1px ${accent ? "transparent" : COLORS.line}`,
      }}
    >
      {children}
      <button
        type="button"
        aria-label={label}
        onClick={onRemove}
        className="grid size-5 place-items-center rounded-[6px] transition-colors hover:bg-[var(--raise2)]"
        style={{
          color: COLORS.soft,
        }}
      >
        <Icon name="ph:x" size={11} />
      </button>
    </motion.span>
  );
}
