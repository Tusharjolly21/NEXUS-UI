"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { OneTimeCode } from "@/components/one-time-code";
import { cn } from "@/lib/utils";
import { ACCENT, formatMoney, GhostButton, hairline, MomentCard, muted, StepSwap, SuccessMark } from "./moment-card";

export type VerifyPaymentProps = {
  /** Where the code was sent, already masked: "•••• 42" or "m•••@studio.co". */
  destination?: string;
  merchant?: string;
  /** Amount being approved, in cents. */
  amount?: number;
  currency?: string;
  length?: number;
  /** Checks the code. Resolve `true` to approve; anything else counts as a wrong code. */
  verify?: (code: string) => Promise<boolean> | boolean;
  /** Called when the visitor asks for a new code. */
  onResend?: () => void;
  /** Seconds before "Resend code" becomes available. */
  resendAfter?: number;
  /** Wrong codes allowed before the card asks for a new one. */
  maxAttempts?: number;
  /** A one-line hint under the field, e.g. the demo code. */
  hint?: string;
  onApproved?: () => void;
  onCancel?: () => void;
  className?: string;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function useCountdown(seconds: number) {
  const [left, setLeft] = React.useState(seconds);
  React.useEffect(() => {
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => window.clearTimeout(t);
  }, [left]);
  return [left, () => setLeft(seconds)] as const;
}

/**
 * A 3-D Secure style approval step: a one-time code field with a resend timer, a running count of
 * attempts, a locked state after too many wrong codes, and an approved receipt.
 */
export function VerifyPayment({
  destination = "•••• 42",
  merchant = "Studio Supply",
  amount = 12840,
  currency = "$",
  length = 6,
  verify = async (code) => {
    await wait(900);
    return code === "424242";
  },
  onResend,
  resendAfter = 30,
  maxAttempts = 3,
  hint,
  onApproved,
  onCancel,
  className,
}: VerifyPaymentProps) {
  const reduce = useReducedMotion();
  const [left, restart] = useCountdown(resendAfter);
  const [attempts, setAttempts] = React.useState(0);
  const [state, setState] = React.useState<"entry" | "approved" | "locked">("entry");
  const [round, setRound] = React.useState(0); // remounts the field after a resend
  const remaining = maxAttempts - attempts;

  const check = async (code: string) => {
    const ok = (await verify(code)) === true;
    if (ok) {
      window.setTimeout(() => {
        setState("approved");
        onApproved?.();
      }, 650);
      return true;
    }
    const next = attempts + 1;
    setAttempts(next);
    if (next >= maxAttempts) window.setTimeout(() => setState("locked"), 500);
    return false;
  };

  const resend = () => {
    onResend?.();
    restart();
    setAttempts(0);
    setRound((r) => r + 1);
    setState("entry");
  };

  return (
    <MomentCard label="Confirm your payment" className={className}>
      <StepSwap step={state}>
        {state === "approved" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <SuccessMark />
            <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">Payment approved</h3>
            <p className={cn("mt-1 text-[14px]", muted)}>
              {formatMoney(amount, currency)} to {merchant}. You can close this window.
            </p>
            <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]" aria-hidden>
              <motion.div
                className="h-full rounded-full bg-[#34c759]"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: reduce ? 0 : 2.4, ease: "linear" }}
              />
            </div>
            <p className={cn("mt-2 text-[12.5px]", muted)}>Returning you to {merchant}…</p>
            <GhostButton className="mt-3" onClick={resend}>
              <RotateCcw className="size-3.5" aria-hidden />
              Try again
            </GhostButton>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <motion.span
                className={cn(
                  "grid size-11 place-items-center rounded-[14px] transition-colors duration-300",
                  state === "locked"
                    ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                    : "bg-[#0071e3]/10 text-[#0071e3] dark:bg-[#2997ff]/15 dark:text-[#2997ff]",
                )}
                animate={reduce || attempts === 0 ? { x: 0 } : { x: [0, -6, 6, -4, 4, 0] }}
                transition={{ duration: 0.4 }}
                key={`shield-${attempts}`}
                aria-hidden
              >
                <ShieldCheck className="size-5" strokeWidth={1.75} />
              </motion.span>
              <span className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[12.5px] font-medium tabular-nums dark:bg-[#2c2c2e]">
                {formatMoney(amount, currency)} · {merchant}
              </span>
            </div>
            <h3 className="mt-5 text-[20px] font-semibold tracking-[-0.02em]">
              {state === "locked" ? "Too many tries" : "Confirm it’s you"}
            </h3>
            <p className={cn("mt-1 text-[14px] leading-relaxed", muted)}>
              {state === "locked"
                ? "For your safety this code no longer works. Ask for a new one to continue."
                : `Enter the ${length}-digit code we sent to ${destination}.`}
            </p>

            <div className={cn("mt-6 flex justify-center transition-opacity", state === "locked" && "pointer-events-none opacity-40")}>
              <OneTimeCode
                key={round}
                length={length}
                groupAfter={length === 6 ? 3 : 0}
                onComplete={check}
                disabled={state === "locked"}
                label={`Verification code sent to ${destination}`}
                accent={ACCENT}
              />
            </div>

            <div className="mt-3 h-5 text-center text-[13px]" aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                {attempts > 0 && state === "entry" ? (
                  <motion.p
                    key={`a${attempts}`}
                    className="text-[#ff3b30]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  >
                    That code didn’t match. {remaining} {remaining === 1 ? "try" : "tries"} left.
                  </motion.p>
                ) : hint ? (
                  <motion.p key="hint" className={muted} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {hint}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <div className={cn("mt-5 flex items-center justify-between border-t pt-4", hairline)}>
              <GhostButton onClick={onCancel} className="-ml-3">
                Cancel
              </GhostButton>
              {left > 0 && state !== "locked" ? (
                <span className={cn("text-[13px] tabular-nums", muted)}>
                  Resend code in 0:{String(left).padStart(2, "0")}
                </span>
              ) : (
                <GhostButton
                  onClick={resend}
                  className={cn(
                    "-mr-3",
                    state === "locked" && "mr-0 bg-[#0071e3] px-4 text-white hover:bg-[#0077ed] dark:bg-[#0071e3] dark:text-white dark:hover:bg-[#0077ed]",
                  )}
                >
                  Resend code
                </GhostButton>
              )}
            </div>
          </>
        )}
      </StepSwap>
    </MomentCard>
  );
}
