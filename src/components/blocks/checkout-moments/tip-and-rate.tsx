"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Heart, Loader2, Star } from "lucide-react";
import { TickSlider } from "@/components/tick-slider";
import { cn } from "@/lib/utils";
import { formatMoney, GhostButton, hairline, InkButton, MomentCard, Money, muted, StepSwap } from "./moment-card";

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

/**
 * A post-purchase card: rate with springy stars, tip with preset chips or a tick slider (the two
 * stay in sync), pick compliments, then a send button that resolves into a thank-you.
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

  return (
    <MomentCard label={`Rate your delivery with ${courier}`} className={className}>
      <StepSwap step={state === "done" ? "done" : "form"}>
        {state === "done" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <motion.span
              aria-hidden
              className="grid size-16 place-items-center rounded-full bg-[#ff3b5c]/12"
              initial={reduce ? false : { scale: 0.4, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 14 }}
            >
              <Heart className="size-7 fill-[#ff3b5c] text-[#ff3b5c]" />
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
              <span className="grid size-11 place-items-center rounded-full bg-[linear-gradient(135deg,#ffd6a5,#ffadad)] text-[14px] font-semibold text-[#5c2b1f]">
                {initials}
              </span>
              <div className="min-w-0">
                <h3 className="text-[17px] font-semibold tracking-[-0.02em]">How was it with {first}?</h3>
                <p className={cn("text-[13px]", muted)}>{detail}</p>
              </div>
            </header>

            <div className="mt-5" role="radiogroup" aria-label="Rating">
              <div className="flex items-center gap-1" onPointerLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const on = n <= shown;
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
                      animate={reduce ? undefined : { scale: rating === n ? [1, 1.25, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                      className="grid size-10 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-[#17171c] dark:focus-visible:outline-white"
                    >
                      <Star
                        className={cn(
                          "size-7 transition-colors duration-150",
                          on ? "fill-[#ffb020] text-[#ffb020]" : "text-[#17171c]/20 dark:text-white/20",
                        )}
                        strokeWidth={1.6}
                      />
                    </motion.button>
                  );
                })}
                <span className={cn("ml-2 text-[13.5px] font-medium", shown ? "" : muted)} aria-live="polite">
                  {LABELS[shown] || "Tap to rate"}
                </span>
              </div>
            </div>

            <div className={cn("mt-5 border-t pt-5", hairline)}>
              <div className="flex items-baseline justify-between">
                <p className="text-[14px] font-semibold">Add a tip</p>
                <span className="text-[24px] font-semibold tracking-[-0.03em]">
                  <Money cents={tip * 100} currency={currency} />
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2">
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
                        "h-11 rounded-2xl text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17171c] dark:focus-visible:outline-white",
                        active
                          ? "bg-[#17171c] text-white dark:bg-white dark:text-[#17171c]"
                          : "bg-[#17171c]/[0.05] hover:bg-[#17171c]/[0.09] dark:bg-white/[0.07] dark:hover:bg-white/[0.12]",
                      )}
                    >
                      {p === 0 ? "None" : `${Math.round(p * 100)}%`}
                      {p > 0 ? <span className={cn("block text-[11px] font-medium", active ? "opacity-70" : muted)}>{currency}{amount}</span> : null}
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
              />
            </div>

            <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Compliments">
              {compliments.map((c) => {
                const on = picked.includes(c);
                return (
                  <li key={c}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setPicked((list) => (on ? list.filter((x) => x !== c) : [...list, c]))}
                      className={cn(
                        "h-8 rounded-full border px-3 text-[12.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17171c] dark:focus-visible:outline-white",
                        on
                          ? "border-transparent bg-[#16a34a]/12 text-[#15803d] dark:text-[#4ade80]"
                          : cn(hairline, "hover:bg-[#17171c]/[0.04] dark:hover:bg-white/[0.05]"),
                      )}
                    >
                      {on ? "✓ " : ""}
                      {c}
                    </button>
                  </li>
                );
              })}
            </ul>

            <InkButton className="mt-6" onClick={send} disabled={rating === 0 || state === "sending"}>
              {state === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Sending…
                </>
              ) : rating === 0 ? (
                "Rate to continue"
              ) : tip > 0 ? (
                `Send feedback and ${formatMoney(tip * 100, currency)}`
              ) : (
                "Send feedback"
              )}
            </InkButton>
          </>
        )}
      </StepSwap>
    </MomentCard>
  );
}
