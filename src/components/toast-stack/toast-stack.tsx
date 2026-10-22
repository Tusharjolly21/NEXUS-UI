"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
  type PanInfo,
} from "framer-motion";
import { useSound, type SoundName } from "@/lib/ui-sounds";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  /** Optional action button, e.g. "Retry" or "Undo". */
  action?: { label: string };
};

export type ToastStackProps = {
  /** Toasts in the order they arrived; the last one sits at the front. */
  toasts: ToastItem[];
  /** Called when a toast is swiped away, closed, times out, or is dismissed with Escape. */
  onDismiss: (id: string) => void;
  /** Called when a toast's action button is pressed. */
  onAction?: (toast: ToastItem) => void;
  /** Which edge the stack grows from. */
  position?: "top" | "bottom";
  /** Fan the stack out on hover/focus, or keep it fanned out. */
  expand?: "hover" | "always";
  /** How many toasts are drawn at once. */
  max?: number;
  /** Width of each toast, in px. It shrinks to fit narrow containers. */
  width?: number;
  /** Dismiss the front toast after this many ms (paused while the stack is open). 0 keeps toasts until closed. */
  duration?: number;
  /** Fans the stack open and swipes the front toast away every few seconds until someone touches it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
  className?: string;
};

const H = 64;
const GAP = 8;
const PEEK = 12;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 600;
const LAND = { type: "spring" as const, stiffness: 420, damping: 22, mass: 0.9 };
const FAN = { type: "spring" as const, stiffness: 360, damping: 30 };

const TONE: Record<ToastType, string> = {
  success: "#30d158",
  error: "#ff3b30",
  info: "#0a84ff",
  warning: "#ff9f0a",
};

function Icon({ type }: { type: ToastType }) {
  const glyph: Record<ToastType, ReactNode> = {
    success: <path d="M6.2 10.3 8.8 12.8 13.8 7.4" />,
    error: <path d="M7.5 7.5 12.5 12.5M12.5 7.5 7.5 12.5" />,
    info: <path d="M10 9.2V13.6M10 6.6V6.7" />,
    warning: <path d="M10 6.2V10.8M10 13.5V13.6" />,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 20 20" aria-hidden="true" className="shrink-0">
      <circle cx="10" cy="10" r="9" fill={TONE[type]} />
      <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        {glyph[type]}
      </g>
    </svg>
  );
}

const ARRIVAL: Record<ToastType, SoundName> = { success: "success", error: "error", info: "ping", warning: "ping" };

/**
 * Small state helper: `push` adds a toast at the front and returns its id. Pass `{ sound: true }` as the
 * second argument when the toast answers something the user did; it then plays a ping (a rising tone for
 * success, a bump for error). Toasts pushed without it stay silent.
 */
export function useToastStack(initial: ToastItem[] = [], options: { enableSound?: boolean } = {}) {
  const [toasts, setToasts] = useState<ToastItem[]>(initial);
  const counter = useRef(0);
  const play = useSound(options.enableSound ?? true);
  const push = useCallback(
    (toast: Omit<ToastItem, "id"> & { id?: string }, opts?: { sound?: boolean }) => {
      counter.current += 1;
      const id = toast.id ?? `toast-${counter.current}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list.filter((t) => t.id !== id), { ...toast, id }]);
      if (opts?.sound) play(ARRIVAL[toast.type ?? "info"]);
      return id;
    },
    [play],
  );
  const dismiss = useCallback((id: string) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const clear = useCallback(() => setToasts([]), []);
  return { toasts, push, dismiss, clear };
}

function Toast({
  toast,
  i,
  expanded,
  sign,
  width,
  max,
  reduce,
  bottom,
  duration,
  autoSwipe,
  enableSound,
  onDismiss,
  onAction,
}: {
  toast: ToastItem;
  i: number;
  expanded: boolean;
  sign: number;
  width: number;
  max: number;
  reduce: boolean;
  bottom: boolean;
  duration: number;
  autoSwipe: number;
  enableSound: boolean;
  onDismiss: (dir: number) => void;
  onAction?: (toast: ToastItem) => void;
}) {
  const type = toast.type ?? "info";
  const play = useSound(enableSound);
  const front = i === 0;
  const x = useMotionValue(0);
  const tilt = useTransform(x, [-220, 0, 220], [-7, 0, 7]);
  const fade = useTransform(x, [-260, -80, 0, 80, 260], [0.2, 1, 1, 1, 0.2]);
  const life = useMotionValue(1);
  const lifeRun = useRef<AnimationPlaybackControls | undefined>(undefined);
  const y = sign * i * (expanded ? H + GAP : PEEK);
  const scale = expanded ? 1 : 1 - i * 0.05;
  const draggable = !reduce && (expanded || front);
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  // Auto-dismiss: only the front toast counts down, and it waits while the stack is open.
  useEffect(() => {
    if (!duration || !front || expanded) return;
    const left = life.get() * duration;
    lifeRun.current = animate(life, 0, {
      duration: left / 1000,
      ease: "linear",
      onComplete: () => dismissRef.current(0),
    });
    return () => lifeRun.current?.stop();
  }, [duration, front, expanded, life]);

  // Autoplay swipe: fling the front toast off to the right.
  const seen = useRef(autoSwipe);
  useEffect(() => {
    if (autoSwipe === seen.current) return;
    seen.current = autoSwipe;
    if (!front) return;
    animate(x, [0, 26, 0], { duration: 0.35 });
    const t = window.setTimeout(() => {
      play.auto("swipe");
      dismissRef.current(1);
    }, 380);
    return () => window.clearTimeout(t);
  }, [autoSwipe, front, x, play]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
      play("swipe");
      onDismiss(Math.sign(info.offset.x || info.velocity.x) || 1);
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  return (
    <motion.li
      layout={false}
      role={type === "error" ? "alert" : "status"}
      tabIndex={0}
      aria-label={`${toast.title}${toast.description ? `. ${toast.description}` : ""}`}
      onKeyDown={(e) => {
        if (e.key === "Escape" || e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          play("swipe", 0.6);
          onDismiss(0);
        }
      }}
      variants={{
        exit: (dirs: Record<string, number>) => {
          const dir = dirs?.[toast.id] ?? 0;
          return reduce
            ? { opacity: 0, transition: { duration: 0.15 } }
            : dir
              ? { x: dir * (width + 80), opacity: 0, rotate: dir * 9, transition: { type: "spring", stiffness: 260, damping: 30 } }
              : { opacity: 0, scale: 0.9, y: y - sign * 10, transition: { duration: 0.18 } };
        },
      }}
      // Arrives squashed, as if it dropped onto the stack, then springs into shape.
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: -sign * 34, scaleX: 1.05, scaleY: 0.86 }}
      animate={{ opacity: !expanded && i > 2 ? 0 : 1, y, scaleX: scale, scaleY: scale }}
      exit="exit"
      transition={reduce ? { duration: 0 } : front ? LAND : FAN}
      className={`absolute inset-x-0 outline-none ${bottom ? "bottom-0 origin-bottom" : "top-0 origin-top"} rounded-[18px] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black`}
      style={{ height: H, zIndex: max - i }}
    >
      <motion.div
        drag={draggable ? "x" : false}
        dragMomentum={false}
        onDragEnd={onDragEnd}
        style={{ x, rotate: tilt, opacity: fade, touchAction: "pan-y" }}
        className={`relative flex h-full select-none items-center gap-3 overflow-hidden rounded-[18px] bg-white px-3.5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_14px_32px_-20px_rgba(0,0,0,.4)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_32px_-20px_rgba(0,0,0,.9)] ${
          draggable ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <motion.div
          className="flex min-w-0 flex-1 items-center gap-3"
          animate={{ opacity: expanded || front ? 1 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <Icon type={type} />
          <div className="min-w-0 flex-1">
            <p className="m-0 truncate text-[14px] font-semibold leading-tight tracking-[-0.01em]">{toast.title}</p>
            {toast.description ? <p className="m-0 mt-0.5 truncate text-[13px] leading-tight text-[#6e6e73] dark:text-[#a1a1a6]">{toast.description}</p> : null}
          </div>
          {toast.action ? (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => {
                play("tap");
                onAction?.(toast);
              }}
              className="h-7 shrink-0 rounded-full bg-[#f0f0f3] px-3 text-[13px] font-medium text-[#1d1d1f] outline-none transition-colors hover:bg-[#e6e6ea] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:bg-[#3a3a3c] dark:text-[#f5f5f7] dark:hover:bg-[#48484a] dark:focus-visible:ring-[#0a84ff]"
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`Dismiss ${toast.title}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => {
              play("swipe", 0.6);
              onDismiss(0);
            }}
            className="grid size-6 shrink-0 place-items-center rounded-full text-[#86868b] outline-none transition-colors hover:bg-[#f0f0f3] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#a1a1a6] dark:hover:bg-[#3a3a3c] dark:hover:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" />
            </svg>
          </button>
        </motion.div>
        {duration > 0 && front ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left"
            style={{ scaleX: life, background: TONE[type], opacity: 0.7 }}
          />
        ) : null}
      </motion.div>
    </motion.li>
  );
}

/**
 * Notifications that rest in a tidy stack. A new toast drops onto the pile
 * squashed and springs into shape; hover or focus fans the stack into a list;
 * fling a toast sideways and it tilts and skids off. Escape dismisses the
 * focused toast.
 */
export function ToastStack({
  toasts,
  onDismiss,
  onAction,
  position = "bottom",
  expand = "hover",
  max = 3,
  width = 340,
  duration = 0,
  autoplay = false,
  enableSound = true,
  className = "",
}: ToastStackProps) {
  const reduce = useReducedMotion() === true;
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [swipe, setSwipe] = useState(0);
  const [exitDirs, setExitDirs] = useState<Record<string, number>>({});
  const touched = useRef(false);
  const expanded = expand === "always" || hovered || focused || demoOpen;
  const sign = position === "bottom" ? -1 : 1;

  const visible = [...toasts].reverse().slice(0, Math.max(1, max));
  const n = visible.length;
  const height = n === 0 ? 0 : expanded ? n * H + (n - 1) * GAP : H + (n - 1) * PEEK;

  const dismiss = (id: string, dir = 0) => {
    setExitDirs((d) => ({ ...d, [id]: dir }));
    onDismiss(id);
  };

  useEffect(() => {
    if (!autoplay) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        setDemoOpen(false);
        return;
      }
      const beat = k++ % 3;
      if (beat === 0) setDemoOpen(true);
      if (beat === 1) setDemoOpen(false);
      if (beat === 2) setSwipe((s) => s + 1);
    }, 1500);
    return () => window.clearInterval(t);
  }, [autoplay]);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    setDemoOpen(false);
  };

  return (
    <section
      aria-label="Notifications"
      className={`relative max-w-full ${className}`}
      style={{ width }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={touch}
      onFocus={() => {
        touch();
        setFocused(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <motion.ol
        aria-live="polite"
        className="relative m-0 list-none p-0"
        initial={false}
        animate={{ height }}
        transition={reduce ? { duration: 0 } : FAN}
      >
        <AnimatePresence initial={false} custom={exitDirs}>
          {visible.map((toast, i) => (
            <Toast
              key={toast.id}
              toast={toast}
              i={i}
              expanded={expanded}
              sign={sign}
              width={width}
              max={max}
              reduce={reduce}
              bottom={position === "bottom"}
              duration={duration}
              autoSwipe={swipe}
              enableSound={enableSound}
              onDismiss={(dir) => dismiss(toast.id, dir)}
              onAction={onAction}
            />
          ))}
        </AnimatePresence>
      </motion.ol>
    </section>
  );
}
