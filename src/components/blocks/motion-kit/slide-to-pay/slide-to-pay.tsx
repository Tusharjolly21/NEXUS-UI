"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";

export interface SlideToPayItem {
  id: string;
  name: string;
  meta: string;
  /** Unit price in dollars. */
  price: number;
  qty: number;
  /** CSS background for the thumbnail (a colour or gradient). */
  art: string;
}

export interface SlideToPayProps {
  /** Accent colour. Defaults to Apple blue (#0071e3 light, #0a84ff dark). */
  accent?: string;
  items?: SlideToPayItem[];
  /** Promo code that takes 10% off. Compared case-insensitively. */
  promoCode?: string;
  /** Runs when the slider completes. Nothing is charged; this is where a real checkout would hook in. */
  onPay?: (detail: { total: number; card: string }) => void;
  /** Nudges the slider every few seconds as a hint until the visitor touches the section. */
  autoplay?: boolean;
  className?: string;
}

const ITEMS: SlideToPayItem[] = [
  { id: "a", name: "Studio Headphones", meta: "Graphite", price: 249, qty: 1, art: "linear-gradient(140deg,#3a3a3c,#1d1d1f)" },
  { id: "b", name: "Leather Case", meta: "Sand", price: 39, qty: 2, art: "linear-gradient(140deg,#f2e6d0,#c9a77c)" },
];

/** Fixed, masked demo cards. The block never asks for or accepts a card number. */
const CARDS = [
  { id: "visa", label: "Visa", mark: "VISA", last: "4242", color: "#1a1f71" },
  { id: "mc", label: "Mastercard", mark: "MC", last: "8810", color: "#eb001b" },
] as const;

const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const muted = "text-[#6e6e73] dark:text-[#a1a1a6]";
const card = "rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";
const well = "bg-[#f5f5f7] dark:bg-[#2c2c2e]";
const focusRing = "outline-none focus-visible:ring-2 focus-visible:ring-[var(--mk-a)]";

function Money({ v }: { v: number }) {
  const s = v.toFixed(2);
  return (
    <span className="inline-flex overflow-hidden tabular-nums">
      $
      {s.split("").map((c, i) => (
        <span key={s.length - i} className="relative inline-flex">
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

function Slider({ amount, onDone, hint }: { amount: number; onDone: () => void; hint: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const dragging = useRef(false);
  const x = useMotionValue(0);
  const [w, setW] = useState(300);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(Math.max(0, el.offsetWidth - 56)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
    anim.current?.stop();
  }, []);

  // Autoplay hint: the thumb slides a little way and springs back.
  useEffect(() => {
    if (!hint || reduce) return;
    const t = setInterval(() => {
      if (dragging.current || x.get() !== 0) return;
      anim.current = animate(x, [0, 64, 0], { duration: 1.1, times: [0, 0.45, 1], ease: [0.32, 0.72, 0, 1] });
    }, 3200);
    return () => clearInterval(t);
  }, [hint, reduce, x]);

  const fill = useTransform(x, (v) => v + 52);
  const label = useTransform(x, [0, Math.max(1, w * 0.5)], [1, 0]);

  const finish = (stiffness: number, delay: number) => {
    anim.current?.stop();
    anim.current = animate(x, w, { type: "spring", stiffness, damping: 30 });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(onDone, delay);
  };

  return (
    <div ref={track} className="relative h-14 w-full overflow-hidden rounded-full bg-[#1d1d1f] dark:bg-[#2c2c2e]">
      <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[var(--mk-a)]" style={{ width: fill }} />
      <motion.span
        className="pointer-events-none absolute inset-0 flex items-center justify-center pl-12 pr-3 text-[clamp(13px,3.6vw,15px)] font-medium text-white"
        style={{ opacity: label }}
      >
        <span className="relative overflow-hidden whitespace-nowrap">
          Slide to pay ${amount.toFixed(2)}
          {!reduce && (
            <motion.span
              aria-hidden="true"
              className="absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"
              animate={{ x: [-60, 220] }}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.6 }}
            />
          )}
        </span>
      </motion.span>
      <motion.button
        type="button"
        aria-label={`Slide to pay $${amount.toFixed(2)}. Press Enter to pay.`}
        drag="x"
        dragConstraints={{ left: 0, right: w }}
        dragElastic={0.02}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => {
          dragging.current = true;
          anim.current?.stop();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            finish(300, 300);
          }
        }}
        onDragEnd={() => {
          dragging.current = false;
          if (x.get() > w * 0.85) finish(400, 250);
          else anim.current = animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
        }}
        whileTap={{ scale: 0.94 }}
        className="absolute left-1 top-1 flex h-12 w-12 cursor-grab touch-none items-center justify-center rounded-full bg-white text-[#1d1d1f] shadow-[0_4px_12px_rgba(0,0,0,.3)] outline-none focus-visible:ring-2 focus-visible:ring-white active:cursor-grabbing"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </motion.button>
    </div>
  );
}

/**
 * Checkout section. Change quantities and every total rolls; a promo code either shakes or knocks
 * the price down; pick a saved card and the ring slides to it. Paying is a slide, not a tap, and
 * ends in a receipt. Demo only: the cards are fixed and masked, and nothing is charged.
 */
export function SlideToPay({ accent, items: initial = ITEMS, promoCode = "MOTION10", onPay, autoplay = false, className }: SlideToPayProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [items, setItems] = useState(initial);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<"none" | "bad" | "ok">("none");
  const [cardId, setCardId] = useState<string>(CARDS[0].id);
  const [paid, setPaid] = useState(false);
  const [touched, setTouched] = useState(false);
  const badTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (badTimer.current) clearTimeout(badTimer.current);
  }, []);

  const sub = items.reduce((a, i) => a + i.price * i.qty, 0);
  const off = promo === "ok" ? sub * 0.1 : 0;
  const ship = sub - off > 100 || sub === 0 ? 0 : 9;
  const tax = (sub - off) * 0.08;
  const total = sub - off + ship + tax;
  const promoLabel = promoCode.trim().toUpperCase();

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const entered = code.trim().toUpperCase().slice(0, 24);
    if (entered && entered === promoLabel) {
      setPromo("ok");
      return;
    }
    setPromo("bad");
    if (badTimer.current) clearTimeout(badTimer.current);
    badTimer.current = setTimeout(() => setPromo("none"), 900);
  };
  const qty = (id: string, d: number) =>
    setItems((l) => l.map((i) => (i.id === id ? { ...i, qty: Math.max(0, Math.min(9, i.qty + d)) } : i)).filter((i) => i.qty > 0));

  const chosen = CARDS.find((c) => c.id === cardId) ?? CARDS[0];
  const done = () => {
    setPaid(true);
    onPay?.({ total: Math.round(total * 100) / 100, card: `${chosen.label} •••• ${chosen.last}` });
  };

  const stepBtn = `flex h-10 w-10 items-center justify-center rounded-full bg-white text-[17px] shadow-[0_1px_2px_rgba(0,0,0,.1)] dark:bg-[#3a3a3c] dark:shadow-none ${ink} ${focusRing}`;

  return (
    <section
      className={`w-full bg-[#f5f5f7] px-4 py-[clamp(48px,8vw,80px)] [--mk-a:#0071e3] sm:px-5 dark:bg-black dark:[--mk-a:#0a84ff] ${className ?? ""}`}
      style={accent ? ({ "--mk-a": accent } as CSSProperties) : undefined}
      onPointerDown={() => setTouched(true)}
      onKeyDown={() => setTouched(true)}
    >
      <LayoutGroup id={`stp-${uid}`}>
        <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className={`${card} p-5 sm:p-8`}>
            <h2 className={`m-0 text-[clamp(22px,3vw,26px)] font-semibold tracking-[-0.03em] ${ink}`}>Your bag</h2>
            <motion.ul layout className="m-0 mt-5 flex list-none flex-col p-0 sm:mt-6">
              <AnimatePresence initial={false}>
                {items.map((i) => (
                  <motion.li
                    key={i.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0, x: -40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="overflow-hidden border-b border-black/[.06] dark:border-white/10"
                  >
                    <div className="flex items-center gap-3 py-4 sm:gap-4">
                      <span className="h-14 w-14 flex-none rounded-2xl sm:h-16 sm:w-16" style={{ background: i.art }} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`truncate text-[15px] font-semibold sm:text-[16px] ${ink}`}>{i.name}</span>
                        <span className={`text-[13px] ${muted}`}>
                          {i.meta} · ${i.price}
                        </span>
                      </span>
                      <span className={`flex flex-none items-center gap-0.5 rounded-full p-1 ${well}`}>
                        <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => qty(i.id, -1)} aria-label={`Remove one ${i.name}`} className={stepBtn}>
                          −
                        </motion.button>
                        <span className={`relative w-5 overflow-hidden text-center text-[14px] font-semibold tabular-nums ${ink}`} aria-live="polite">
                          <AnimatePresence mode="popLayout" initial={false}>
                            <motion.span key={i.qty} className="inline-block" initial={{ y: -14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 14, opacity: 0 }}>
                              {i.qty}
                            </motion.span>
                          </AnimatePresence>
                        </span>
                        <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => qty(i.id, 1)} aria-label={`Add one ${i.name}`} className={stepBtn}>
                          +
                        </motion.button>
                      </span>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
              {items.length === 0 && <li className={`py-6 text-[15px] ${muted}`}>Your bag is empty.</li>}
            </motion.ul>
            <motion.form onSubmit={apply} animate={{ x: promo === "bad" ? [0, -8, 7, -5, 3, 0] : 0 }} transition={{ duration: 0.4 }} className="mt-6 flex gap-2">
              <label htmlFor={`${uid}-promo`} className="sr-only">
                Promo code
              </label>
              <input
                id={`${uid}-promo`}
                value={code}
                maxLength={24}
                autoComplete="off"
                onChange={(e) => setCode(e.target.value)}
                disabled={promo === "ok"}
                placeholder={`Promo code (try ${promoLabel})`}
                aria-invalid={promo === "bad"}
                className={`h-11 min-w-0 flex-1 rounded-xl px-4 text-[16px] uppercase outline-none placeholder:normal-case placeholder:text-[#a1a1a6] dark:placeholder:text-[#8e8e93] sm:text-[15px] ${well} ${ink} ${
                  promo === "bad" ? "ring-2 ring-[#ff3b30] dark:ring-[#ff453a]" : "focus:ring-2 focus:ring-[var(--mk-a)]"
                }`}
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                disabled={promo === "ok"}
                className={`h-11 flex-none rounded-xl px-5 text-[14px] font-medium transition-colors ${focusRing} ${
                  promo === "ok" ? "bg-[#248a3d] text-white dark:bg-[#30d158] dark:text-black" : "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                }`}
              >
                {promo === "ok" ? "Applied" : "Apply"}
              </motion.button>
            </motion.form>
            <div className={`mt-6 flex flex-col gap-2 text-[15px] ${muted}`}>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className={ink}>
                  <Money v={sub} />
                </span>
              </div>
              <AnimatePresence initial={false}>
                {off > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-[#248a3d] dark:text-[#30d158]">
                    <span>{promoLabel}</span>
                    <span>
                      −<Money v={off} />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={ink}>{ship === 0 ? "Free" : <Money v={ship} />}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span className={ink}>
                  <Money v={tax} />
                </span>
              </div>
            </div>
          </div>

          <div className={`flex flex-col gap-5 p-5 sm:p-8 ${card}`}>
            <AnimatePresence mode="wait" initial={false}>
              {!paid ? (
                <motion.div key="pay" className="flex flex-1 flex-col gap-5" exit={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}>
                  <div>
                    <span className={`text-[13px] font-medium ${muted}`}>Total</span>
                    <div className={`text-[clamp(36px,6vw,44px)] font-semibold leading-none tracking-[-0.045em] ${ink}`}>
                      <Money v={total} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2" role="radiogroup" aria-label="Payment method">
                    {CARDS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={cardId === c.id}
                        onClick={() => setCardId(c.id)}
                        className={`relative flex min-h-14 items-center gap-3 rounded-2xl p-3.5 text-left ${well} ${focusRing}`}
                      >
                        {cardId === c.id && (
                          <motion.span
                            layoutId="checkout-card"
                            className="absolute inset-0 rounded-2xl shadow-[inset_0_0_0_2px_var(--mk-a)]"
                            transition={{ type: "spring", stiffness: 500, damping: 34 }}
                          />
                        )}
                        <span className="relative flex h-8 w-12 flex-none items-center justify-center rounded-md text-[10px] font-bold text-white" style={{ background: c.color }}>
                          {c.mark}
                        </span>
                        <span className="relative flex min-w-0 flex-col">
                          <span className={`truncate text-[14px] font-semibold ${ink}`}>
                            {c.label} <span className="tracking-[0.08em]">••••</span> {c.last}
                          </span>
                          <span className={`text-[12px] ${muted}`}>Saved demo card · Expires 08/28</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="mt-auto">
                    {total > 0 ? (
                      <Slider amount={total} onDone={done} hint={autoplay && !touched} />
                    ) : (
                      <div className={`flex h-14 items-center justify-center rounded-full text-[15px] ${well} ${muted}`}>Add something to pay</div>
                    )}
                  </div>
                  <span className="text-center text-[12px] text-[#86868b] dark:text-[#8e8e93]">Demo only. No payment is taken.</span>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  role="status"
                  className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 22 }}
                >
                  <motion.span
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[#30d158]/15 text-[#248a3d] dark:bg-[#30d158]/20 dark:text-[#30d158]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 14 }}
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
                    </svg>
                  </motion.span>
                  <h3 className={`m-0 text-[24px] font-semibold tracking-[-0.03em] ${ink}`}>Paid ${total.toFixed(2)}</h3>
                  <p className={`m-0 max-w-[260px] text-[15px] ${muted}`}>
                    Paid with {chosen.label} •••• {chosen.last}. A receipt is on its way and your order ships tomorrow.
                  </p>
                  <button type="button" onClick={() => setPaid(false)} className={`min-h-10 rounded-full px-4 text-[14px] font-medium text-[var(--mk-a)] ${focusRing}`}>
                    Run it again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </LayoutGroup>
    </section>
  );
}
