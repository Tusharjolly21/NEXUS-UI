"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

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
  /** Called when a toast is swiped away, closed, or dismissed with Escape. */
  onDismiss: (id: string) => void;
  /** Called when a toast's action button is pressed. */
  onAction?: (toast: ToastItem) => void;
  /** Which edge the stack grows from. */
  position?: "top" | "bottom";
  /** Fan the stack out on hover/focus, or keep it fanned out. */
  expand?: "hover" | "always";
  /** How many toasts are drawn at once. */
  max?: number;
  /** Width of each toast, in px. */
  width?: number;
  className?: string;
};

const H = 64;
const GAP = 8;
const PEEK = 11;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 600;

const ICONS: Record<ToastType, { Icon: typeof Info; className: string }> = {
  success: { Icon: CheckCircle2, className: "text-emerald-500" },
  error: { Icon: XCircle, className: "text-[#ef4444]" },
  info: { Icon: Info, className: "text-[#5b8def]" },
};

/** Small state helper: `push` adds a toast at the front and returns its id. */
export function useToastStack(initial: ToastItem[] = []) {
  const [toasts, setToasts] = React.useState<ToastItem[]>(initial);
  const counter = React.useRef(0);
  const push = React.useCallback((toast: Omit<ToastItem, "id"> & { id?: string }) => {
    counter.current += 1;
    const id = toast.id ?? `toast-${Date.now().toString(36)}-${counter.current}`;
    setToasts((list) => [...list.filter((t) => t.id !== id), { ...toast, id }]);
    return id;
  }, []);
  const dismiss = React.useCallback((id: string) => setToasts((list) => list.filter((t) => t.id !== id)), []);
  const clear = React.useCallback(() => setToasts([]), []);
  return { toasts, push, dismiss, clear };
}

export function ToastStack({
  toasts,
  onDismiss,
  onAction,
  position = "bottom",
  expand = "hover",
  max = 3,
  width = 340,
  className,
}: ToastStackProps) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = React.useState(false);
  const [focused, setFocused] = React.useState(false);
  // swipe direction per dismissed toast, read by the exit animation
  const [exitDirs, setExitDirs] = React.useState<Record<string, number>>({});
  const expanded = expand === "always" || hovered || focused;
  const sign = position === "bottom" ? -1 : 1;

  const visible = [...toasts].reverse().slice(0, max);
  const n = visible.length;
  const height = n === 0 ? 0 : expanded ? n * H + (n - 1) * GAP : H + (n - 1) * PEEK;

  const dismiss = (id: string, dir = 0) => {
    setExitDirs((d) => ({ ...d, [id]: dir }));
    onDismiss(id);
  };

  return (
    <section
      aria-label="Notifications"
      className={cn("relative", className)}
      style={{ width }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <motion.ol
        aria-live="polite"
        className="relative m-0 list-none p-0"
        initial={false}
        animate={{ height }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 36 }}
      >
        <AnimatePresence initial={false} custom={exitDirs}>
          {visible.map((toast, i) => {
            const type = toast.type ?? "info";
            const { Icon, className: iconClass } = ICONS[type];
            const front = i === 0;
            const y = sign * i * (expanded ? H + GAP : PEEK);
            const scale = expanded ? 1 : 1 - i * 0.05;
            const draggable = !reduce && (expanded || front);
            return (
              <motion.li
                key={toast.id}
                role={type === "error" ? "alert" : "status"}
                tabIndex={0}
                aria-label={`${toast.title}${toast.description ? `. ${toast.description}` : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Escape" || e.key === "Delete") {
                    e.preventDefault();
                    dismiss(toast.id);
                  }
                }}
                custom={exitDirs}
                variants={{
                  exit: (dirs: Record<string, number>) => {
                    const dir = dirs[toast.id] ?? 0;
                    return reduce
                      ? { opacity: 0, transition: { duration: 0.15 } }
                      : dir
                        ? { x: dir * (width + 60), opacity: 0, transition: { type: "spring", stiffness: 300, damping: 34 } }
                        : { opacity: 0, scale: 0.92, y: y - sign * 8, transition: { duration: 0.2 } };
                  },
                }}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -sign * 28, scale: 0.94 }}
                animate={{ opacity: !expanded && i > 2 ? 0 : 1, y, scale, x: 0 }}
                exit="exit"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                drag={draggable ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.85}
                dragSnapToOrigin
                onDragEnd={(_, info: PanInfo) => {
                  if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) {
                    dismiss(toast.id, Math.sign(info.offset.x || info.velocity.x) || 1);
                  }
                }}
                className={cn(
                  "absolute inset-x-0 flex select-none items-center gap-3 rounded-[18px] border px-3.5 outline-none",
                  "border-black/[0.07] bg-white text-[#17181a] shadow-[0_1px_2px_rgba(16,17,20,0.05),0_10px_30px_-12px_rgba(16,17,20,0.22)]",
                  "dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-50 dark:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.6)]",
                  "focus-visible:ring-2 focus-visible:ring-[#5b8def] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-950",
                  draggable && "cursor-grab active:cursor-grabbing",
                  position === "bottom" ? "bottom-0 origin-bottom" : "top-0 origin-top",
                )}
                style={{ height: H, zIndex: max - i, touchAction: "pan-y" }}
              >
                <motion.div
                  className="flex min-w-0 flex-1 items-center gap-3"
                  animate={{ opacity: expanded || front ? 1 : 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Icon className={cn("size-[19px] shrink-0", iconClass)} strokeWidth={2} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-medium leading-tight">{toast.title}</p>
                    {toast.description ? (
                      <p className="mt-0.5 truncate text-[13px] leading-tight text-[#73726d] dark:text-zinc-400">{toast.description}</p>
                    ) : null}
                  </div>
                  {toast.action ? (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => onAction?.(toast)}
                      className="h-7 shrink-0 rounded-full bg-black/[0.05] px-3 text-[13px] font-medium text-[#17181a] outline-none transition-colors hover:bg-black/[0.09] focus-visible:ring-2 focus-visible:ring-[#5b8def] dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15"
                    >
                      {toast.action.label}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    aria-label={`Dismiss ${toast.title}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => dismiss(toast.id)}
                    className="grid size-6 shrink-0 place-items-center rounded-full text-[#9a9993] outline-none transition-colors hover:bg-black/[0.05] hover:text-[#17181a] focus-visible:ring-2 focus-visible:ring-[#5b8def] dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                  >
                    <X className="size-3.5" strokeWidth={2.2} />
                  </button>
                </motion.div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ol>
    </section>
  );
}
