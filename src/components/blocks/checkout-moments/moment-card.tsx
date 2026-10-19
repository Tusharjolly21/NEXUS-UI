"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Ink, muted and hairline colours shared by every Checkout Moments card (light + dark). */
export const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
export const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
export const hairline = "border-black/[0.08] dark:border-white/[0.1]";

/** Action blue, its hover, and the shared keyboard focus ring. */
export const ACCENT = "#0071e3";
export const SUCCESS = "#34c759";
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

/** The card every moment sits on: 28px corners, a hairline ring and a soft drop shadow. */
export function MomentCard({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  /** Accessible name for the card region. */
  label: string;
}) {
  return (
    <section
      aria-label={label}
      className={cn(
        "relative w-full max-w-[400px] overflow-hidden rounded-[28px] bg-white p-6",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_20px_40px_-24px_rgba(0,0,0,0.25)]",
        "dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_20px_40px_-24px_rgba(0,0,0,0.7)]",
        ink,
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Cross-fades between the steps of a card (form → success) while the card springs to the new height. */
export function StepSwap({ step, children }: { step: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div layout={!reduce} transition={{ type: "spring", stiffness: 260, damping: 32 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98, filter: "blur(6px)" }}
          transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 380, damping: 34 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/** A green check that draws itself inside a soft disc. */
export function SuccessMark({ size = 56, color = SUCCESS }: { size?: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, backgroundColor: `${color}26` }}
      initial={reduce ? false : { scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 18 }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 12.5l4.5 4.5L19 7.5"
          stroke={color}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.12 }}
        />
      </svg>
    </motion.span>
  );
}

/** The primary pill button: action blue in both modes. */
export function InkButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#0071e3] text-[17px] font-medium text-white transition-[background-color,transform,opacity] duration-200",
        "hover:bg-[#0077ed] active:scale-[0.97] disabled:pointer-events-none disabled:bg-[#e8e8ed] disabled:text-[#86868b]",
        "dark:disabled:bg-[#2c2c2e] dark:disabled:text-[#98989d]",
        focusRing,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** A quiet text button in link blue. */
export function GhostButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[14px] font-medium transition-[background-color,color,transform] duration-200 active:scale-[0.97]",
        "text-[#0066cc] hover:bg-[#0071e3]/[0.08] dark:text-[#2997ff] dark:hover:bg-[#2997ff]/[0.12]",
        focusRing,
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** "$128.40" with each digit rolling (and unblurring) when the amount changes. */
export function Money({
  cents,
  currency = "$",
  className,
}: {
  cents: number;
  currency?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const whole = Math.floor(Math.abs(cents) / 100);
  const frac = String(Math.abs(cents) % 100).padStart(2, "0");
  const text = `${currency}${whole.toLocaleString("en-US")}.${frac}`;
  return (
    <span className={cn("inline-flex tabular-nums", className)} aria-label={text}>
      <span aria-hidden className="inline-flex">
        <span className="relative inline-block leading-[1.15]">{currency}</span>
        {text
          .slice(currency.length)
          .split("")
          .map((ch, i, all) => (
            <span key={`${all.length - i}`} className="relative inline-block overflow-hidden leading-[1.15]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={ch}
                  className="inline-block"
                  initial={reduce ? { opacity: 0 } : { y: "100%", opacity: 0, filter: "blur(4px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { y: "-100%", opacity: 0, filter: "blur(4px)" }}
                  transition={
                    reduce
                      ? { duration: 0.12 }
                      : { type: "spring", stiffness: 460, damping: 34, delay: (all.length - 1 - i) * 0.02 }
                  }
                >
                  {ch}
                </motion.span>
              </AnimatePresence>
            </span>
          ))}
      </span>
    </span>
  );
}

export function formatMoney(cents: number, currency = "$") {
  return `${currency}${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Width of an element, kept current with a ResizeObserver (for children that need a px width). */
export function useElementWidth<T extends HTMLElement>(fallback: number): [React.RefObject<T | null>, number] {
  const ref = React.useRef<T | null>(null);
  const [width, setWidth] = React.useState(fallback);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const update = () => setWidth(Math.round(node.clientWidth) || fallback);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, width];
}
