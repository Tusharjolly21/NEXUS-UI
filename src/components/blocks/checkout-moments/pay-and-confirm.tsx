"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CreditCard, Lock, Minus, Plus, RotateCcw } from "lucide-react";
import { SlideToConfirm } from "@/components/slide-to-confirm";
import { ToastStack, useToastStack } from "@/components/toast-stack";
import { cn } from "@/lib/utils";
import {
  ACCENT,
  focusRing,
  formatMoney,
  GhostButton,
  hairline,
  MomentCard,
  Money,
  muted,
  StepSwap,
  SUCCESS,
  SuccessMark,
  useElementWidth,
} from "./moment-card";

export type CheckoutProduct = {
  name: string;
  variant?: string;
  /** Unit price in cents. */
  price: number;
  /** CSS background for the thumbnail swatch (a colour or gradient) when there is no image. */
  swatch?: string;
  image?: string;
};

export type ShippingOption = { id: string; label: string; eta: string; price: number };

export type PayAndConfirmProps = {
  merchant?: string;
  product?: CheckoutProduct;
  shipping?: ShippingOption[];
  /** Tax rate applied to the subtotal, e.g. 0.08. */
  taxRate?: number;
  /** Last four digits of the saved card. */
  cardLast4?: string;
  currency?: string;
  /** Runs when the slider reaches the end. Resolve to finish, reject to let the visitor retry. */
  onPay?: (totalCents: number) => Promise<void> | void;
  /** Where the receipt goes, shown in the success toast. */
  receiptEmail?: string;
  className?: string;
};

const DEFAULT_PRODUCT: CheckoutProduct = {
  name: "Ceramic Pour-Over Set",
  variant: "Sand · 2 cups",
  price: 6400,
  swatch: "linear-gradient(135deg,#f3e3cf 0%,#d9b99b 55%,#b98b6a 100%)",
};

const DEFAULT_SHIPPING: ShippingOption[] = [
  { id: "standard", label: "Standard", eta: "3–5 days", price: 0 },
  { id: "express", label: "Express", eta: "Tomorrow", price: 1200 },
];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * An order summary that is paid by sliding: quantity and delivery update a rolling total, the
 * slider runs `onPay`, and the card turns into a receipt while a toast confirms it.
 */
export function PayAndConfirm({
  merchant = "Studio Supply",
  product = DEFAULT_PRODUCT,
  shipping = DEFAULT_SHIPPING,
  taxRate = 0.08,
  cardLast4 = "4242",
  currency = "$",
  onPay = () => wait(1400),
  receiptEmail = "you@studio.co",
  className,
}: PayAndConfirmProps) {
  const uid = React.useId();
  const reduce = useReducedMotion();
  const [qty, setQty] = React.useState(1);
  const [shipId, setShipId] = React.useState(shipping[0]?.id ?? "");
  const [paid, setPaid] = React.useState<string | null>(null);
  const { toasts, push, dismiss, clear } = useToastStack();
  const [slotRef, slotWidth] = useElementWidth<HTMLDivElement>(352);

  const ship = shipping.find((s) => s.id === shipId) ?? shipping[0];
  const subtotal = product.price * qty;
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + (ship?.price ?? 0) + tax;

  const pay = async () => {
    await onPay(total);
    const receipt = `#${Math.floor(100000 + Math.random() * 900000)}`;
    // let the slider show its success state before the card changes
    window.setTimeout(() => {
      setPaid(receipt);
      push({ type: "success", title: "Payment received", description: `Receipt ${receipt} sent to ${receiptEmail}`, action: { label: "View" } });
    }, 700);
  };

  const reset = () => {
    setPaid(null);
    clear();
  };

  const row = "flex items-center justify-between text-[14px]";

  return (
    <div className={cn("flex w-full max-w-[400px] flex-col items-center gap-4", className)}>
      <MomentCard label={`Checkout with ${merchant}`}>
        <StepSwap step={paid ? "paid" : "order"}>
          {paid ? (
            <div className="flex flex-col items-center py-4 text-center">
              <SuccessMark />
              <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">Payment complete</h3>
              <p className={cn("mt-1 text-[14px]", muted)}>
                {formatMoney(total, currency)} to {merchant} · Receipt {paid}
              </p>
              <div className={cn("mt-6 w-full space-y-2 rounded-2xl border bg-[#f5f5f7] p-4 text-left dark:bg-[#2c2c2e]", hairline)}>
                <div className={row}>
                  <span className={muted}>{product.name}</span>
                  <span className="tabular-nums">×{qty}</span>
                </div>
                <div className={row}>
                  <span className={muted}>Arrives</span>
                  <span>{ship?.eta}</span>
                </div>
              </div>
              <GhostButton className="mt-4" onClick={reset}>
                <RotateCcw className="size-3.5" aria-hidden />
                Start a new order
              </GhostButton>
            </div>
          ) : (
            <>
              <header className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-[#1d1d1f] text-[13px] font-semibold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]">
                    {merchant.slice(0, 1)}
                  </span>
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold">{merchant}</p>
                    <p className={cn("text-[12.5px]", muted)}>Checkout</p>
                  </div>
                </div>
                <span className={cn("inline-flex items-center gap-1 text-[12.5px]", muted)}>
                  <Lock className="size-3.5" strokeWidth={2} aria-hidden />
                  Secure
                </span>
              </header>

              <div className="mt-6 flex items-center gap-3.5">
                <span
                  aria-hidden
                  className="size-14 shrink-0 rounded-[14px] bg-cover bg-center shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]"
                  style={{ background: product.image ? `center / cover url(${product.image})` : product.swatch }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold tracking-[-0.01em]">{product.name}</p>
                  {product.variant ? <p className={cn("truncate text-[13px]", muted)}>{product.variant}</p> : null}
                </div>
                <div
                  role="group"
                  aria-label="Quantity"
                  className="flex items-center rounded-full bg-[#f5f5f7] p-0.5 dark:bg-[#2c2c2e]"
                >
                  <button
                    type="button"
                    aria-label="Remove one"
                    disabled={qty <= 1}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className={cn("grid size-7 place-items-center rounded-full transition-[background-color,transform] hover:bg-white active:scale-90 disabled:opacity-30 dark:hover:bg-[#3a3a3c]", focusRing)}
                  >
                    <Minus className="size-3.5" aria-hidden />
                  </button>
                  <span aria-live="polite" className="relative grid w-6 overflow-hidden text-center text-[14px] font-semibold tabular-nums">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={qty}
                        className="block"
                        initial={reduce ? { opacity: 0 } : { opacity: 0, y: "100%", filter: "blur(4px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={reduce ? { opacity: 0 } : { opacity: 0, y: "-100%", filter: "blur(4px)" }}
                        transition={reduce ? { duration: 0.12 } : { type: "spring", stiffness: 500, damping: 34 }}
                      >
                        {qty}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <button
                    type="button"
                    aria-label="Add one"
                    disabled={qty >= 9}
                    onClick={() => setQty((q) => Math.min(9, q + 1))}
                    className={cn("grid size-7 place-items-center rounded-full transition-[background-color,transform] hover:bg-white active:scale-90 disabled:opacity-30 dark:hover:bg-[#3a3a3c]", focusRing)}
                  >
                    <Plus className="size-3.5" aria-hidden />
                  </button>
                </div>
              </div>

              <fieldset className="mt-5">
                <legend className={cn("mb-2 text-[12.5px] font-medium", muted)}>Delivery</legend>
                <div className="grid grid-cols-2 gap-2">
                  {shipping.map((s) => {
                    const active = s.id === shipId;
                    return (
                      <label
                        key={s.id}
                        className={cn(
                          "relative cursor-pointer rounded-2xl border p-3 transition-[border-color,background-color] duration-200 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#0071e3]",
                          active
                            ? "border-transparent bg-[#0071e3]/[0.04] dark:bg-[#2997ff]/[0.08]"
                            : cn(hairline, "hover:border-black/20 dark:hover:border-white/25"),
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId={`${uid}-ship`}
                            aria-hidden
                            className="pointer-events-none absolute -inset-px rounded-2xl shadow-[inset_0_0_0_2px_#0071e3]"
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                          />
                        ) : null}
                        <input
                          type="radio"
                          name={`${uid}-shipping`}
                          value={s.id}
                          checked={active}
                          onChange={() => setShipId(s.id)}
                          className="sr-only"
                        />
                        <span className="relative block truncate text-[13.5px] font-semibold">{s.label}</span>
                        <span className={cn("relative block truncate text-[12.5px]", muted)}>
                          {s.eta} · {s.price ? formatMoney(s.price, currency) : "Free"}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <dl className={cn("mt-5 space-y-2 border-t pt-4", hairline)}>
                <div className={row}>
                  <dt className={muted}>Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(subtotal, currency)}</dd>
                </div>
                <div className={row}>
                  <dt className={muted}>Shipping</dt>
                  <dd className="tabular-nums">{ship?.price ? formatMoney(ship.price, currency) : "Free"}</dd>
                </div>
                <div className={row}>
                  <dt className={muted}>Tax</dt>
                  <dd className="tabular-nums">{formatMoney(tax, currency)}</dd>
                </div>
                <div className="flex items-baseline justify-between pt-2">
                  <dt className="text-[15px] font-semibold">Total</dt>
                  <dd className="text-[28px] font-semibold tracking-[-0.03em]">
                    <Money cents={total} currency={currency} />
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#f5f5f7] px-3.5 py-2.5 dark:bg-[#2c2c2e]">
                <span className="inline-flex items-center gap-2 whitespace-nowrap text-[13.5px]">
                  <CreditCard className={cn("size-4", muted)} aria-hidden />
                  Card •••• {cardLast4}
                </span>
                <span className={cn("text-[12.5px]", muted)}>Default</span>
              </div>

              <div ref={slotRef} className="mt-4">
                <SlideToConfirm
                  width={slotWidth}
                  label={`Slide to pay ${formatMoney(total, currency)}`}
                  pendingLabel="Processing…"
                  successLabel="Paid"
                  onConfirm={pay}
                  resetAfter={0}
                  accent={ACCENT}
                  successColor={SUCCESS}
                />
              </div>
            </>
          )}
        </StepSwap>
      </MomentCard>

      <ToastStack toasts={toasts} onDismiss={dismiss} width={Math.min(352, slotWidth)} max={2} />
    </div>
  );
}
