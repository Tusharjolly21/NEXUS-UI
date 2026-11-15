"use client";

import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AgentFace } from "./agent-face";
import { AVATAR_URLS } from "./avatars";
import { ICONS } from "./icons";
import { COLORS, SPRING, clamp } from "./theme";
import type { Agent } from "./types";

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};

export function Icon({ name, size = 16, className, style }: IconProps) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      style={{
        flexShrink: 0,
        ...style,
      }}
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
        boxShadow: `0 0 0 1px ${ring}`,
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

/** True while the media query matches. Reads false on the server and during hydration, so the first render always matches. */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function Field({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span
        className="text-[12.5px] font-[550]"
        style={{
          color: COLORS.text,
        }}
      >
        {children}
      </span>
      {aside}
    </div>
  );
}

export const INPUT_CLASS =
  "w-full rounded-[11px] px-3 text-[14px] outline-none transition-shadow focus-visible:outline-none";

export const inputStyle = (focused: boolean): CSSProperties => ({
  background: COLORS.raise,
  color: COLORS.ink,
  boxShadow: `inset 0 0 0 1px ${focused ? "rgba(212,242,106,.55)" : COLORS.line2}`,
});

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  id: string;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function TextField({ label, value, onChange, multiline, placeholder, id, inputRef }: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <label htmlFor={id} className="block">
      <span
        className="mb-1.5 block text-[12.5px] font-[550]"
        style={{
          color: COLORS.text,
        }}
      >
        {label}
      </span>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={3}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLASS} resize-none py-2.5 leading-[1.45]`}
          style={inputStyle(focused)}
        />
      ) : (
        <input
          ref={inputRef}
          id={id}
          value={value}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(event) => onChange(event.target.value)}
          className={`${INPUT_CLASS} h-[38px]`}
          style={inputStyle(focused)}
        />
      )}
    </label>
  );
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative h-[24px] w-[42px] shrink-0 rounded-full transition-colors duration-300"
      style={{
        background: on ? COLORS.acc : "#2B2B31",
        boxShadow: on ? "inset 0 1px 1px rgba(0,0,0,.15)" : `inset 0 0 0 1px ${COLORS.line2}`,
      }}
    >
      <motion.span
        layout={true}
        transition={SPRING}
        className="absolute top-[3px] block size-[18px] rounded-full"
        style={{
          left: on ? 21 : 3,
          background: on ? "#10140A" : "#D7D7DC",
          boxShadow: "0 1px 3px rgba(0,0,0,.4)",
        }}
      />
    </button>
  );
}

type SegmentedProps<T> = {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  id: string;
  label: string;
  render?: (value: T) => ReactNode;
};

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  id,
  label,
  render,
}: SegmentedProps<T>) {
  const onKey = (event: ReactKeyboardEvent) => {
    const index = options.indexOf(value);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      onChange(options[(index + 1) % options.length]);
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      onChange(options[(index - 1 + options.length) % options.length]);
    }
  };
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className="flex rounded-[10px] p-[3px]"
      style={{
        background: "#0D0D10",
        boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
      }}
    >
      {options.map((option) => {
        const on = option === value;
        return (
          <button
            key={String(option)}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(option)}
            className="relative h-7 flex-1 rounded-[8px] px-2 text-[12.5px] font-[550] tabular-nums transition-colors"
            style={{
              color: on ? COLORS.ink : COLORS.soft,
            }}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={SPRING}
                className="absolute inset-0 rounded-[8px]"
                style={{
                  background: COLORS.raise2,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 1px 2px rgba(0,0,0,.5)",
                }}
              />
            )}
            <span className="relative">{render ? render(option) : String(option)}</span>
          </button>
        );
      })}
    </div>
  );
}

type Placement = "top-start" | "top-end" | "bottom-start" | "bottom-end";

type PopoverProps = {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement | null>;
  placement: Placement;
  width: number;
  label: string;
  children: ReactNode;
  role?: string;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  panelRef?: RefObject<HTMLDivElement | null>;
  offset?: number;
};

/** Where a popover sits: pinned to the anchor's top or bottom edge, and how tall it may grow. */
type PopoverPos = {
  left: number;
  top?: number;
  bottom?: number;
  maxH: number;
  up: boolean;
};

export function Popover({
  open,
  onClose,
  anchor,
  placement,
  width,
  label,
  children,
  role = "menu",
  onKeyDown,
  panelRef,
  offset = 8,
}: PopoverProps) {
  const ownRef = useRef<HTMLDivElement>(null);
  const panel = panelRef ?? ownRef;
  const [pos, setPos] = useState<PopoverPos | null>(null);
  // the anchor is a ref, read when placing (its element, not the ref object, is what moves)
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const place = useCallback(() => {
    const el = anchor.current;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(width, vw - 16);
    let above = placement.startsWith("top");
    if (above && rect.top < 240 && vh - rect.bottom > rect.top) {
      above = false;
    }
    if (!above && vh - rect.bottom < 240 && rect.top > vh - rect.bottom) {
      above = true;
    }
    let left = placement.endsWith("end") ? rect.right - w : rect.left;
    left = clamp(left, 8, vw - w - 8);
    setPos(
      above
        ? {
            left,
            bottom: vh - rect.top + offset,
            maxH: rect.top - offset - 12,
            up: above,
          }
        : {
            left,
            top: rect.bottom + offset,
            maxH: vh - rect.bottom - offset - 12,
            up: above,
          },
    );
  }, [anchor, placement, width, offset]);
  // placing needs the anchor's measured position, so it happens after layout and before paint
  useLayoutEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      place();
    }
  }, [open, place]);
  useEffect(() => {
    if (!open) {
      return;
    }
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!(panel.current?.contains(target) || anchor.current?.contains(target))) {
        onClose();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        anchor.current?.focus();
      }
    };
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("resize", place);
    };
  }, [open, onClose, anchor, place, panel]);
  return (
    <AnimatePresence>
      {open && pos && (
        <motion.div
          ref={panel}
          role={role}
          aria-label={label}
          onKeyDown={onKeyDown}
          initial={{
            opacity: 0,
            scale: 0.94,
            y: pos.up ? 8 : -8,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.97,
            y: pos.up ? 4 : -4,
            transition: {
              duration: 0.12,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 560,
            damping: 34,
          }}
          className="hd-scroll fixed z-[80] overflow-y-auto rounded-[16px] p-1.5"
          style={{
            left: pos.left,
            top: pos.top,
            bottom: pos.bottom,
            width: Math.min(width, window.innerWidth - 16),
            maxHeight: Math.max(160, pos.maxH),
            transformOrigin: `${placement.endsWith("end") ? "right" : "left"} ${pos.up ? "bottom" : "top"}`,
            background: "rgba(27,27,32,.94)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            boxShadow: `0 0 0 1px ${COLORS.line2}, inset 0 1px 0 rgba(255,255,255,.06), 0 18px 50px -8px rgba(0,0,0,.7), 0 4px 14px rgba(0,0,0,.35)`,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** One row of a menu. A row with `checked` set shows a tick when on, or a checkbox when `check` is "toggle". */
export type MenuItem = {
  id: string;
  label: ReactNode;
  icon?: string;
  iconNode?: ReactNode;
  desc?: ReactNode;
  right?: ReactNode;
  section?: string;
  checked?: boolean;
  check?: "toggle";
  danger?: boolean;
  keepOpen?: boolean;
  onSelect?: () => void;
};

type MenuProps = {
  open: boolean;
  onClose: () => void;
  anchor: RefObject<HTMLElement | null>;
  placement: Placement;
  width?: number;
  items: MenuItem[];
  label: string;
  header?: ReactNode;
  footer?: ReactNode;
};

export function Menu({ open, onClose, anchor, placement, width = 260, items, label, header, footer }: MenuProps) {
  const list = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!open) {
      return;
    }
    const top = Math.max(
      0,
      items.findIndex((item) => item.checked && item.check !== "toggle"),
    );
    // opening puts the highlight on the checked row (or the first one)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActive(top);
    const timer = setTimeout(() => list.current?.querySelectorAll<HTMLElement>("[data-mi]")[top]?.focus(), 30);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const focusAt = (index: number) => {
    const rows = list.current?.querySelectorAll<HTMLElement>("[data-mi]");
    if (!rows?.length) {
      return;
    }
    const next = (index + rows.length) % rows.length;
    setActive(next);
    rows[next].focus();
  };
  const onKey = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!(event.target as HTMLElement).closest("[data-nonav]")) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        focusAt(active + 1);
      } else {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          focusAt(active - 1);
        } else {
          if (event.key === "Home") {
            event.preventDefault();
            focusAt(0);
          } else {
            if (event.key === "End") {
              event.preventDefault();
              focusAt(items.length - 1);
            } else {
              if (event.key === "Tab") {
                onClose();
              }
            }
          }
        }
      }
    }
  };
  return (
    <Popover
      open={open}
      onClose={onClose}
      anchor={anchor}
      placement={placement}
      width={width}
      label={label}
      onKeyDown={onKey}
      panelRef={list}
    >
      {header}
      {items.map((item, i) => {
        // a section heading goes above the first item of each section
        const next = item.section !== items[i - 1]?.section ? item.section : undefined;
        return (
          <Fragment key={item.id}>
            {next && (
              <div
                className={`px-2.5 pb-1 text-[11.5px] font-[550] ${i ? "mt-1.5 border-t pt-2.5" : "pt-1"}`}
                style={{
                  color: COLORS.soft,
                  borderColor: COLORS.line,
                }}
              >
                {next}
              </div>
            )}
            <button
              type="button"
              data-mi={true}
              role={item.check === "toggle" ? "menuitemcheckbox" : item.checked != null ? "menuitemradio" : "menuitem"}
              aria-checked={item.checked}
              tabIndex={i === active ? 0 : -1}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => {
                item.onSelect?.call(item);
                if (!item.keepOpen) {
                  onClose();
                  anchor.current?.focus();
                }
              }}
              className="relative flex w-full items-center gap-3 rounded-[11px] px-2.5 py-2 text-left outline-none focus-visible:outline-none"
              style={{
                color: item.danger ? COLORS.danger : COLORS.ink,
              }}
            >
              {i === active && (
                <motion.span
                  layoutId={`mh-${label}`}
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 45,
                  }}
                  className="absolute inset-0 rounded-[11px]"
                  style={{
                    background: "rgba(255,255,255,.07)",
                  }}
                />
              )}
              {(item.icon || item.iconNode) && (
                <span
                  className="relative grid size-8 shrink-0 place-items-center rounded-[9px]"
                  style={{
                    background: "rgba(255,255,255,.05)",
                    boxShadow: `inset 0 0 0 1px ${COLORS.line}`,
                    color: item.danger ? COLORS.danger : COLORS.ink,
                  }}
                >
                  {item.iconNode ?? <Icon name={item.icon ?? ""} size={16} />}
                </span>
              )}
              <span className="relative min-w-0 flex-1">
                <span className="block text-[13.5px] font-[550] leading-tight">{item.label}</span>
                {item.desc && (
                  <span
                    className="mt-0.5 block text-[12px] leading-snug"
                    style={{
                      color: COLORS.soft,
                    }}
                  >
                    {item.desc}
                  </span>
                )}
              </span>
              {item.right && <span className="relative shrink-0">{item.right}</span>}
              {item.check === "toggle" ? (
                <span
                  className="relative grid size-[18px] shrink-0 place-items-center rounded-[6px] transition-colors"
                  style={{
                    background: item.checked ? COLORS.acc : "transparent",
                    boxShadow: item.checked ? "none" : `inset 0 0 0 1.5px ${COLORS.faint}`,
                    color: COLORS.accInk,
                  }}
                >
                  {item.checked && <Icon name="ph:check-bold" size={11} />}
                </span>
              ) : (
                item.checked && (
                  <Icon
                    name="ph:check-bold"
                    size={14}
                    className="relative"
                    style={{
                      color: COLORS.acc,
                    }}
                  />
                )
              )}
            </button>
          </Fragment>
        );
      })}
      {footer}
    </Popover>
  );
}

type PillButtonProps = {
  open?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

export const PillButton = forwardRef<HTMLButtonElement, PillButtonProps>(function PillButton(
  { open, onClick, label, children, className = "", style, title },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-label={label}
      title={title}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-[10px] transition-[background,color,transform] duration-150 hover:bg-white/[.06] active:scale-[.97] ${className}`}
      style={{
        color: open ? COLORS.ink : COLORS.text,
        background: open ? "rgba(255,255,255,.07)" : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  );
});

export function Chip({
  icon,
  children,
  onRemove,
  tone,
}: {
  icon: string;
  children: ReactNode;
  onRemove: () => void;
  tone?: string;
}) {
  return (
    <motion.span
      layout={true}
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        scale: 0.8,
      }}
      transition={SPRING}
      className="inline-flex h-[30px] max-w-full items-center gap-1.5 rounded-[10px] pl-2 pr-1 text-[12.5px] font-[500]"
      style={{
        background: tone ? `${tone}18` : "rgba(255,255,255,.06)",
        boxShadow: `inset 0 0 0 1px ${tone ? `${tone}40` : COLORS.line2}`,
        color: COLORS.ink,
      }}
    >
      <Icon
        name={icon}
        size={14}
        style={{
          color: tone ?? COLORS.text,
        }}
      />
      <span className="flex min-w-0 items-center gap-1.5 truncate">{children}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="grid size-[22px] place-items-center rounded-[7px] transition-colors hover:bg-white/[.08]"
        style={{
          color: COLORS.soft,
        }}
      >
        <Icon name="ph:x" size={11} />
      </button>
    </motion.span>
  );
}

export function Logo({ size = 26 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden={true} className="shrink-0">
      <rect x="1" y="5" width="19" height="19" rx="8" fill="#3A3A42" />
      <circle cx="8" cy="13.5" r="1.5" fill="#0C0C0E" />
      <circle cx="13" cy="13.5" r="1.5" fill="#0C0C0E" />
      <rect x="11" y="9" width="20" height="20" rx="8.5" fill={COLORS.acc} />
      <circle cx="18.5" cy="18" r="1.7" fill={COLORS.accInk} />
      <circle cx="24" cy="18" r="1.7" fill={COLORS.accInk} />
    </svg>
  );
}

export function AvatarStack({ agents, size = 22, max = 3 }: { agents: Agent[]; size?: number; max?: number }) {
  return (
    <span className="flex shrink-0 items-center">
      {agents.slice(0, max).map((agent, index) => (
        <span
          key={agent.id}
          className="relative"
          style={{
            marginLeft: index ? -size * 0.5 : 0,
            zIndex: max - index,
          }}
        >
          <AgentFace
            shape={agent.shape}
            color={agent.color}
            eyes={agent.eyes}
            size={size}
            shadow={false}
            seed={agent.id}
            look={[index === 0 ? 0.6 : -0.6, 0]}
          />
        </span>
      ))}
    </span>
  );
}

type SheetProps = {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  width?: number;
  full?: boolean;
};

export function Sheet({ open, onClose, label, children, width = 560, full }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const timer = setTimeout(
      () => panel.current?.querySelector<HTMLElement>("[data-autofocus], button, input")?.focus(),
      60,
    );
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        onClose();
      }
      if (event.key === "Tab" && panel.current) {
        const focusable = Array.from(
          panel.current.querySelectorAll<HTMLElement>("button:not([disabled]),input,textarea,[tabindex='0']"),
        ).filter((el) => el.offsetParent);
        if (!focusable.length) {
          return;
        }
        if (event.shiftKey && document.activeElement === focusable[0]) {
          event.preventDefault();
          focusable[focusable.length - 1].focus();
        } else {
          if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
            event.preventDefault();
            focusable[0].focus();
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6"
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(6,6,8,.62)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
            onClick={onClose}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{
              opacity: 0,
              y: 40,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 24,
              scale: 0.98,
              transition: {
                duration: 0.16,
              },
            }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
            }}
            className={`relative flex w-full flex-col overflow-hidden rounded-t-[24px] sm:rounded-[24px] ${full ? "h-[92dvh] sm:h-[min(640px,88vh)]" : "max-h-[92dvh]"}`}
            style={{
              maxWidth: width,
              background: "#141417",
              boxShadow: `0 0 0 1px ${COLORS.line2}, inset 0 1px 0 rgba(255,255,255,.05), 0 40px 100px -20px rgba(0,0,0,.85)`,
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SheetHeader({ title, sub, onClose }: { title: ReactNode; sub?: ReactNode; onClose: () => void }) {
  return (
    <div className="flex shrink-0 items-start gap-3 px-5 pb-3 pt-5">
      <div className="min-w-0 flex-1">
        <h2 className="text-[18px] font-[650] tracking-[-0.02em]">{title}</h2>
        {sub && (
          <p
            className="mt-1 text-[13.5px] leading-[1.45]"
            style={{
              color: COLORS.text,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-mr-1.5 -mt-1 grid size-9 place-items-center rounded-[11px] transition-colors hover:bg-white/[.06]"
        style={{
          color: COLORS.text,
        }}
      >
        <Icon name="ph:x" size={18} />
      </button>
    </div>
  );
}
