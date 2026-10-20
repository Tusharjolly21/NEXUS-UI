"use client";

import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  MotionConfig,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface SeatRulerTier {
  name: string;
  /** Largest team this tier covers. The last tier also covers anything above. */
  upTo: number;
  /** Price per seat per month on monthly billing. */
  monthly: number;
  /** Price per seat per month on yearly billing. */
  yearly: number;
  note: string;
}

export interface SeatRulerSelection {
  seats: number;
  plan: string;
  billing: "monthly" | "yearly";
  /** Monthly total in the same currency as the tier prices. */
  total: number;
}

export interface SeatRulerPricingProps {
  tiers?: SeatRulerTier[];
  /** Largest team size on the ruler. */
  maxSeats?: number;
  defaultSeats?: number;
  defaultBilling?: "monthly" | "yearly";
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Called with the current selection when the button is pressed. Nothing is sent anywhere. */
  onStart?: (selection: SeatRulerSelection) => void;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Sweeps the ruler through a few team sizes until the viewer touches it. */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_SEAT_RULER_TIERS: SeatRulerTier[] = [
  { name: "Starter", upTo: 10, monthly: 12, yearly: 9, note: "Core features, email support" },
  { name: "Growth", upTo: 50, monthly: 10, yearly: 8, note: "Automations, priority support" },
  { name: "Scale", upTo: 200, monthly: 8, yearly: 6, note: "SSO, audit logs, success manager" },
];

const TICKS = 48;
const AUTOPLAY_SEATS = [24, 6, 48, 140, 72];

function Tick({ index, value, hover }: { index: number; value: MotionValue<number>; hover: MotionValue<number> }) {
  const at = index / (TICKS - 1);
  const near = useTransform([value, hover], ([x, h]: number[]) =>
    Math.max(0, 1 - Math.min(Math.abs(at - x), h >= 0 ? Math.abs(at - h) : 1) * 10),
  );
  const height = useTransform(near, (n) => 18 + n * 18);
  const background = useTransform(value, (x) => (x >= at ? "var(--mk-accent)" : "var(--mk-seat-tick)"));
  return <motion.span className="w-[3px] flex-none rounded-full" style={{ height, background }} />;
}

function Roll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("inline-flex overflow-hidden tabular-nums", className)}>
      {text.split("").map((c, i) => (
        <span key={text.length - i} className="relative inline-flex">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={c}
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            >
              {c}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}

/**
 * Pricing section driven by team size. Drag along the tick ruler (or use the arrow keys): the ticks
 * swell around the thumb, the plan that fits your team lights up, and the monthly total rolls
 * digit by digit. Yearly billing shows what you save.
 */
export function SeatRulerPricing({
  tiers = DEFAULT_SEAT_RULER_TIERS,
  maxSeats = 200,
  defaultSeats = 24,
  defaultBilling = "yearly",
  eyebrow = "Pricing",
  title = "Pay for the team you have.",
  description = "The more people you bring, the less each seat costs. Drag to see your price.",
  onStart,
  accent,
  autoplay = false,
  className,
}: SeatRulerPricingProps) {
  const max = Math.max(2, Math.round(maxSeats));
  const initialSeats = Math.min(max, Math.max(1, Math.round(defaultSeats)));
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  const target = useMotionValue(initialSeats / max);
  const value = useSpring(target, { stiffness: 420, damping: 38 });
  const hover = useMotionValue(-1);
  const [seats, setSeats] = useState(initialSeats);
  const [yearly, setYearly] = useState(defaultBilling === "yearly");
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);

  useMotionValueEvent(value, "change", (x) => setSeats(Math.min(max, Math.max(1, Math.round(x * max)))));

  useEffect(() => {
    if (!autoplay || reduce || touched) return;
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % AUTOPLAY_SEATS.length;
      target.set(Math.min(max, AUTOPLAY_SEATS[step]) / max);
    }, 2200);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, touched, target, max]);

  const tier = tiers.find((t) => seats <= t.upTo) ?? tiers[tiers.length - 1];
  const per = tier ? (yearly ? tier.yearly : tier.monthly) : 0;
  const total = per * seats;
  const saving = tier ? (tier.monthly - tier.yearly) * seats * 12 : 0;
  const marks = [1, ...[0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f))];

  const pos = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };
  const nudge = (delta: number) => target.set(Math.min(1, Math.max(1 / max, target.get() + delta / max)));
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, () => void> = {
      ArrowRight: () => nudge(1),
      ArrowUp: () => nudge(1),
      ArrowLeft: () => nudge(-1),
      ArrowDown: () => nudge(-1),
      PageUp: () => nudge(10),
      PageDown: () => nudge(-10),
      Home: () => target.set(1 / max),
      End: () => target.set(1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    setTouched(true);
    move();
  };

  const accentStyle = accent ? ({ "--mk-accent": accent, "--mk-accent-text": accent } as CSSProperties) : undefined;
  const seatWord = seats === 1 ? "seat" : "seats";

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup id={groupId}>
        <section
          style={accentStyle}
          className={cn(
            "@container w-full bg-white px-4 py-16 sm:px-5 sm:py-20 dark:bg-black",
            "[--mk-accent:#0071e3] [--mk-accent-text:#0071e3] [--mk-seat-tick:#d2d2d7]",
            "dark:[--mk-accent:#0a84ff] dark:[--mk-accent-text:#2997ff] dark:[--mk-seat-tick:#48484a]",
            className,
          )}
        >
          <div className="mx-auto max-w-[1040px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="text-[14px] font-semibold text-[var(--mk-accent-text)]">{eyebrow}</span>
              <h2 className="m-0 max-w-[680px] text-balance text-[clamp(32px,5vw,54px)] font-semibold leading-[1.04] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                {title}
              </h2>
              <p className="m-0 max-w-[520px] text-[clamp(16px,1.6vw,18px)] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
                {description}
              </p>
            </div>

            <div className="mx-auto mt-10 max-w-[720px] rounded-[28px] bg-[#f5f5f7] p-5 sm:mt-12 sm:rounded-[32px] sm:p-10 dark:bg-[#1c1c1e]">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Team size</span>
                  <span className="text-[clamp(36px,9cqw,44px)] font-semibold leading-none tracking-[-0.045em] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <Roll text={String(seats)} />{" "}
                    <span className="text-[18px] font-medium tracking-normal text-[#86868b] dark:text-[#a1a1a6]">
                      {seats === 1 ? "person" : "people"}
                    </span>
                  </span>
                </div>
                <div
                  className="flex rounded-full bg-white p-1 shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]"
                  role="radiogroup"
                  aria-label="Billing period"
                >
                  {[false, true].map((y) => (
                    <button
                      key={String(y)}
                      type="button"
                      role="radio"
                      aria-checked={yearly === y}
                      onClick={() => {
                        setTouched(true);
                        setYearly(y);
                      }}
                      className={cn(
                        "relative h-10 rounded-full px-4 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)]",
                        yearly === y ? "text-white dark:text-[#1d1d1f]" : "text-[#424245] dark:text-[#a1a1a6]",
                      )}
                    >
                      {yearly === y && (
                        <motion.span
                          layoutId="seat-period"
                          className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                          transition={{ type: "spring", stiffness: 500, damping: 34 }}
                        />
                      )}
                      <span className="relative">{y ? "Yearly" : "Monthly"}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div
                role="slider"
                tabIndex={0}
                aria-label="Team size"
                aria-valuemin={1}
                aria-valuemax={max}
                aria-valuenow={seats}
                aria-valuetext={`${seats} ${seats === 1 ? "person" : "people"}, ${tier?.name ?? ""} plan, $${total.toLocaleString("en-US")} a month`}
                onKeyDown={onKey}
                onPointerDown={(e) => {
                  setTouched(true);
                  setDragging(true);
                  e.currentTarget.setPointerCapture(e.pointerId);
                  target.set(Math.max(1 / max, pos(e)));
                }}
                onPointerMove={(e) => {
                  hover.set(pos(e));
                  if (dragging) target.set(Math.max(1 / max, pos(e)));
                }}
                onPointerUp={(e) => {
                  setDragging(false);
                  if (e.pointerType !== "mouse") hover.set(-1);
                }}
                onPointerCancel={() => {
                  setDragging(false);
                  hover.set(-1);
                }}
                onPointerLeave={() => hover.set(-1)}
                className="mt-8 flex h-14 cursor-pointer touch-none select-none items-center justify-between rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-offset-[#1c1c1e]"
              >
                {Array.from({ length: TICKS }, (_, i) => (
                  <Tick key={i} index={i} value={value} hover={hover} />
                ))}
              </div>
              <div aria-hidden="true" className="mt-2 flex justify-between text-[12px] tabular-nums text-[#86868b] dark:text-[#a1a1a6]">
                {marks.map((m, i) => (
                  <span key={`${i}-${m}`}>{m}</span>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-1 gap-2 @2xl:grid-cols-3">
                {tiers.map((t) => {
                  const on = t === tier;
                  return (
                    <motion.div
                      key={t.name}
                      className={cn(
                        "relative rounded-2xl p-4 transition-colors duration-300",
                        on ? "bg-white dark:bg-[#2c2c2e]" : "bg-transparent",
                      )}
                      animate={{ y: on ? -4 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      {on && (
                        <motion.span
                          layoutId="seat-tier"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            boxShadow:
                              "inset 0 0 0 2px var(--mk-accent), 0 16px 30px -18px var(--mk-accent)",
                          }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <div className="relative flex items-center justify-between gap-2">
                        <span className="text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {t.name}
                          {on && <span className="sr-only"> (fits your team)</span>}
                        </span>
                        <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">up to {t.upTo}</span>
                      </div>
                      <div className="relative mt-1 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                        ${yearly ? t.yearly : t.monthly} / seat · {t.note}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-t border-black/[.08] pt-8 dark:border-white/[.1]">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
                    {tier?.name} plan, billed {yearly ? "yearly" : "monthly"}
                  </span>
                  <span
                    className="flex flex-wrap items-baseline gap-1 text-[clamp(40px,11cqw,56px)] font-semibold leading-none tracking-[-0.05em] text-[#1d1d1f] dark:text-[#f5f5f7]"
                  >
                    <span className="text-[0.5em]">$</span>
                    <Roll text={total.toLocaleString("en-US")} />
                    <span className="ml-1 text-[16px] font-medium tracking-normal text-[#86868b] dark:text-[#a1a1a6]">/ month</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {yearly && saving > 0 && (
                      <motion.span
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[14px] font-medium text-[#248a3d] dark:text-[#30d158]"
                      >
                        You save ${saving.toLocaleString("en-US")} a year
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  type="button"
                  onClick={() => {
                    setTouched(true);
                    onStart?.({ seats, plan: tier?.name ?? "", billing: yearly ? "yearly" : "monthly", total });
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex h-12 items-center rounded-full bg-[var(--mk-accent)] px-6 text-[15px] font-medium text-white outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7] dark:focus-visible:ring-offset-[#1c1c1e]"
                >
                  Start with {seats} {seatWord}
                </motion.button>
              </div>
            </div>
          </div>
        </section>
      </LayoutGroup>
    </MotionConfig>
  );
}
