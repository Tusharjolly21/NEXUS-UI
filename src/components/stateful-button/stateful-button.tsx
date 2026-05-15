"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Phase = "idle" | "loading" | "success" | "error";

const variantClasses: Record<NonNullable<StatefulButtonProps["variant"]>, string> = {
  default:
    "border-transparent bg-primary text-primary-foreground shadow-[0_14px_30px_-18px_rgba(14,165,233,0.6)] hover:bg-primary/90",
  outline:
    "border-border bg-background/90 text-foreground hover:bg-muted/70 dark:border-white/10 dark:bg-zinc-900/70",
  ghost: "border-transparent bg-transparent text-foreground hover:bg-muted/70 dark:hover:bg-zinc-900/70",
  destructive:
    "border-transparent bg-destructive text-white shadow-[0_14px_30px_-18px_rgba(220,38,38,0.7)] hover:bg-destructive/90",
};

const sizeClasses: Record<NonNullable<StatefulButtonProps["size"]>, string> = {
  sm: "h-9 min-w-28 px-3.5 text-sm",
  md: "h-11 min-w-32 px-5 text-sm",
  lg: "h-12 min-w-36 px-6 text-base",
};

export type StatefulButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  children: React.ReactNode;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  onClick?: () => Promise<void> | void;
  resetDelay?: number;
  showSuccess?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  successIcon?: React.ReactNode;
  errorIcon?: React.ReactNode;
};

export function StatefulButton({
  children,
  loadingText = "Loading...",
  successText = "Success",
  errorText = "Something went wrong",
  onClick,
  disabled,
  resetDelay = 1800,
  showSuccess = true,
  className,
  variant = "default",
  size = "md",
  icon,
  successIcon,
  errorIcon,
  type = "button",
  ...buttonProps
}: StatefulButtonProps) {
  const reduceMotion = useReducedMotion() === true;
  const [phase, setPhase] = React.useState<Phase>("idle");
  const resetRef = React.useRef<number | null>(null);

  const isLoading = phase === "loading";
  const isDisabled = disabled || isLoading || buttonProps.disabled;

  const clearResetTimer = React.useCallback(() => {
    if (resetRef.current !== null) {
      window.clearTimeout(resetRef.current);
      resetRef.current = null;
    }
  }, []);

  const scheduleReset = React.useCallback(
    (delay = resetDelay) => {
      clearResetTimer();
      resetRef.current = window.setTimeout(() => {
        setPhase("idle");
      }, Math.max(300, delay));
    },
    [clearResetTimer, resetDelay],
  );

  React.useEffect(() => clearResetTimer, [clearResetTimer]);

  async function handleClick() {
    if (isDisabled) return;
    clearResetTimer();
    setPhase("loading");
    try {
      await onClick?.();
      if (showSuccess) {
        setPhase("success");
        scheduleReset();
      } else {
        setPhase("idle");
      }
    } catch {
      setPhase("error");
      scheduleReset(Math.max(1400, resetDelay));
    }
  }

  const content =
    phase === "loading"
      ? {
          key: "loading",
          label: loadingText,
          icon: <Loader2 className="size-4 animate-spin" aria-hidden />,
        }
      : phase === "success"
        ? {
            key: "success",
            label: successText,
            icon: successIcon ?? <Check className="size-4" aria-hidden />,
          }
        : phase === "error"
          ? {
              key: "error",
              label: errorText,
              icon: errorIcon ?? <AlertTriangle className="size-4" aria-hidden />,
            }
          : { key: "idle", label: children, icon };

  return (
    <motion.button
      type={type}
      layout
      aria-busy={isLoading}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border font-medium whitespace-nowrap outline-none ring-offset-2 ring-offset-background transition-[background-color,color,border-color,box-shadow,transform] focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.985] disabled:pointer-events-none disabled:opacity-65",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      transition={
        reduceMotion ? { duration: 0.1 } : { type: "spring", stiffness: 360, damping: 30, mass: 0.2 }
      }
      {...buttonProps}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={content.key}
          className="inline-flex items-center gap-2"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6, scale: 0.98 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0.9 } : { opacity: 0, y: -4, scale: 0.98 }}
          transition={reduceMotion ? { duration: 0.08 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          {content.icon}
          <span>{content.label}</span>
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
