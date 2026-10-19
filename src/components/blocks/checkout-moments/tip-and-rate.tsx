"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Heart, Loader2, Star } from "lucide-react";
import { TickSlider } from "@/components/tick-slider";
import { cn } from "@/lib/utils";
import { ACCENT, focusRing, formatMoney, GhostButton, hairline, InkButton, MomentCard, Money, muted, StepSwap } from "./moment-card";

export type TipAndRateProps = {
  /** Who delivered, shown with their initials. */
  courier?: string;
  /** One line under the title, e.g. "Delivered in 18 min". */
  detail?: string;
  /** Order total in cents; percentage chips are worked out from it. */
  orderTotal?: number;
  /** Tip presets as fractions of the order total. */
  presets?: number[];
  /** Largest tip on the slider, in whole currency units. */
  maxTip?: number;
  currency?: string;
  compliments?: string[];
  onSubmit?: (feedback: { rating: number; tip: number; compliments: string[] }) => Promise<void> | void;
  className?: string;
};

const LABELS = ["", "Not great", "Could be better", "Good", "Great", "Perfect"];
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const UI_SPRING = { type: "spring", stiffness: 420, damping: 34 } as const;

/**
 * A post-purchase card: rate with springy stars, tip with a segmented preset control or a tick
 * slider (the two stay in sync), pick compliments, then a send button that resolves into a thank-you.
 */
export function TipAndRate({
  courier = "Maya Chen",
  detail = "Delivered your order in 18 min",
  orderTotal = 4200,
  presets = [0.1, 0.15, 0.2],
  maxTip = 20,
  currency = "$",
  compliments = ["On time", "Friendly", "Careful packing", "Great directions"],
  onSubmit = () => wait(1100),
  className,
}: TipAndRateProps) {
  const reduce = useReducedMotion();
  const uid = React.useId();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [tip, setTip] = React.useState(Math.round((orderTotal * (presets[1] ?? 0.15)) / 100));
  const [picked, setPicked] = React.useState<string[]>([]);
  const [state, setState] = React.useState<"form" | "sending" | "done">("form");
  const first = courier.split(" ")[0];
  const initials = courier
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  const send = async () => {
    setState("sending");
    try {
      await onSubmit({ rating, tip, compliments: picked });
      setState("done");
    } catch {
      setState("form");
    }
  };

  const shown = hover || rating;
  const buttonLabel =
    state === "sending"
      ? "sending"
      : rating === 0
        ? "Rate to continue"
        : tip > 0
          ? `Send feedback and ${formatMoney(tip * 100, currency)}`
          : "Send feedback";

  return (
    <MomentCard label={`Rate your delivery with ${courier}`} className={className}>
      <StepSwap step={state === "done" ? "done" : "form"}>
        {state === "done" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.span
              aria-hidden
              className="grid size-16 place-items-center rounded-full bg-[#ff3b30]/12"
              initial={reduce ? false : { scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 14 }}
            >
              <Heart className="size-7 fill-[#ff3b30] text-[#ff3b30]" />
            </motion.span>
            <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">Thanks for the love</h3>
            <p className={cn("mt-1 max-w-[280px] text-[14px] leading-relaxed", muted)}>
              {tip > 0 ? `${first} gets all ${formatMoney(tip * 100, currency)} of your tip.` : `We’ll pass your note on to ${first}.`}
            </p>
            <GhostButton className="mt-4" onClick={() => setState("form")}>
              Edit feedback
            </GhostButton>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#e8e8ed] text-[14px] font-semibold text-[#1d1d1f] dark:bg-[#3a3a3c] dark:text-[#f5f5f7]">
                {initials}
              </span>
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">How was it with {first}?</h3>
                <p className={cn("text-[13px]", muted)}>{detail}</p>
              </div>
            </header>

            <div className="mt-5" role="radiogroup" aria-label="Rating">
              <div className="flex items-center gap-0.5" onPointerLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= shown;
                  const filled = n <= rating;
                  return (
                    <motion.button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={rating === n}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onPointerEnter={() => setHover(n)}
                      onClick={() => setRating(n)}
                      whileTap={reduce ? undefined : { scale: 0.8 }}
                      animate={reduce ? undefined : { scale: filled ? [1, 1.28, 1] : 1 }}
                      transition={{ scale: { duration: 0.38, ease: [0.22, 1, 0.36, 1], delay: filled ? (n - 1) * 0.045 : 0 } }}
                      className={cn("grid size-10 place-items-center rounded-full", focusRing)}
                    >
                      <Star
                        className={cn(
                          "size-7 transition-colors duration-150",
                          on ? "fill-[#ff9500] text-[#ff9500]" : "text-[#d2d2d7] dark:text-[#48484a]",
                        )}
                        strokeWidth={1.75}
                      />
                    </motion.button>
                  );
                })}
                <span className={cn("relative ml-2 grid overflow-hidden text-[14px] font-medium", shown ? "" : muted)} aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={shown}
                      className="block whitespace-nowrap"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                      transition={reduce ? { duration: 0.12 } : UI_SPRING}
                    >
                      {LABELS[shown] || "Tap to rate"}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>

            <div className={cn("mt-5 border-t pt-5", hairline)}>
              <div className="flex items-baseline justify-between">
                <p className="text-[15px] font-semibold">Add a tip</p>
                <span className="text-[24px] font-semibold tracking-[-0.03em]">
                  <Money cents={tip * 100} currency={currency} />
                </span>
              </div>
              <div
                role="group"
                aria-label="Tip presets"
                className="mt-3 grid grid-cols-4 rounded-[12px] bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]"
              >
                {[0, ...presets].map((p) => {
                  const amount = Math.round((orderTotal * p) / 100);
                  const active = tip === amount;
                  return (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setTip(amount)}
                      className={cn(
                        "relative h-11 rounded-[9px] text-[13px] font-semibold transition-colors",
                        active ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
                        focusRing,
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId={`${uid}-tip`}
                          aria-hidden
                          className="absolute inset-0 rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
                          transition={reduce ? { duration: 0 } : UI_SPRING}
                        />
                      ) : null}
                      <span className="relative z-10 block leading-tight">
                        {p === 0 ? "None" : `${Math.round(p * 100)}%`}
                        {p > 0 ? (
                          <span className={cn("block text-[11px] font-medium", active ? "text-[#6e6e73] dark:text-[#d1d1d6]" : "")}>
                            {currency}
                            {amount}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              <TickSlider
                className="mt-4"
                label="Custom tip"
                value={tip}
                onChange={setTip}
                min={0}
                max={maxTip}
                step={1}
                ticks={58}
                size="sm"
                showValue={false}
                accent={ACCENT}
              />
            </div>

            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Compliments">
              {compliments.map((c) => {
                const on = picked.includes(c);
                return (
                  <li key={c}>
                    <motion.button
                      layout={!reduce}
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked((list) => (on ? list.filter((x) => x !== c) : [...list, c]))}
                      whileTap={reduce ? undefined : { scale: 0.95 }}
                      transition={UI_SPRING}
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-[13px] font-medium transition-colors",
                        on
                          ? "border-transparent bg-[#0071e3]/10 text-[#0066cc] dark:bg-[#2997ff]/15 dark:text-[#2997ff]"
                          : cn(hairline, "hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"),
                        focusRing,
                      )}
                    >
                      <AnimatePresence initial={false}>
                        {on ? (
                          <motion.span
                            key="check"
                            className="inline-flex overflow-hidden"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: "auto", opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={reduce ? { duration: 0.1 } : UI_SPRING}
                          >
                            <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                      <motion.span layout={!reduce ? "position" : false} transition={UI_SPRING}>
                        {c}
                      </motion.span>
                    </motion.button>
                  </li>
                );
              })}
            </ul>

            <InkButton className="mt-6" onClick={send} disabled={rating === 0 || state === "sending"}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={state === "sending" ? "sending" : rating === 0 ? "rate" : tip > 0 ? "tip" : "plain"}
                  className="inline-flex items-center gap-2"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                  transition={reduce ? { duration: 0.12 } : UI_SPRING}
                >
                  {state === "sending" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    buttonLabel
                  )}
                </motion.span>
              </AnimatePresence>
            </InkButton>
          </>
        )}
      </StepSwap>
    </MomentCard>
  );
}
