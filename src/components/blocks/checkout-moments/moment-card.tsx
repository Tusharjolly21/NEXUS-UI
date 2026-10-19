"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Ink, muted and hairline colours shared by every Checkout Moments card (light + dark). */
export const ink = "text-[#17171c] dark:text-[#f5f5f7]";
export const muted = "text-[#6e6e78] dark:text-[#a1a1aa]";
export const hairline = "border-[#17171c]/[0.07] dark:border-white/[0.08]";

/** The white card every moment sits on: 28px corners, a hairline ring and a soft drop shadow. */
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
        "shadow-[0_0_0_1px_rgba(23,23,28,0.06),0_1px_2px_rgba(23,23,28,0.04),0_24px_48px_-20px_rgba(23,23,28,0.18)]",
        "dark:bg-[#16161d] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_24px_48px_-20px_rgba(0,0,0,0.6)]",
        ink,
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Cross-fades between the steps of a card (form → success) while the card eases to the new height. */
export function StepSwap({ step, children }: { step: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div layout={!reduce} transition={{ type: "spring", stiffness: 420, damping: 38 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: reduce ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/** A green check that draws itself inside a soft disc. */
export function SuccessMark({ size = 56, color = "#16a34a" }: { size?: number; color?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="grid place-items-center rounded-full"
      style={{ width: size, height: size, backgroundColor: `${color}1f` }}
      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
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
          transition={{ duration: 0.45, delay: 0.12, ease: "easeOut" }}
        />
      </svg>
    </motion.span>
  );
}

/** A primary pill button in ink (white in dark mode). */
export function InkButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#17171c] text-[15px] font-semibold text-white transition-[background-color,transform,opacity]",
        "hover:bg-black active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17171c]",
        "dark:bg-white dark:text-[#17171c] dark:hover:bg-white/90 dark:focus-visible:outline-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** A quiet text button. */
export function GhostButton({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-3 text-[13.5px] font-medium transition-colors",
        "text-[#6e6e78] hover:bg-[#17171c]/[0.05] hover:text-[#17171c] dark:text-[#a1a1aa] dark:hover:bg-white/[0.06] dark:hover:text-white",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17171c] dark:focus-visible:outline-white",
        "disabled:pointer-events-none disabled:opacity-40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/** "$128.40" with the dollars rolling digit by digit when the amount changes. */
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
        <span className="relative inline-block overflow-hidden leading-[1.15]">{currency}</span>
        {text
          .slice(currency.length)
          .split("")
          .map((ch, i, all) => (
            <span key={`${all.length - i}`} className="relative inline-block overflow-hidden leading-[1.15]">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={ch}
                  className="inline-block"
                  initial={reduce ? { opacity: 0 } : { y: "70%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
                  transition={{ type: "spring", stiffness: 520, damping: 34 }}
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
