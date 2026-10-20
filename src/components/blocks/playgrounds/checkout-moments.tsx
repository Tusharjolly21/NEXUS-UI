"use client";

import type { ReactNode } from "react";
import {
  PayAndConfirm,
  TipAndRate,
  VerifyPayment,
  type PayAndConfirmProps,
  type TipAndRateProps,
  type VerifyPaymentProps,
} from "@/components/blocks/checkout-moments";
import { SlideToPay } from "@/components/blocks/motion-kit/slide-to-pay";
import type { PropDoc } from "@/components/library/prop-controls";
import type { BlockPlaygrounds } from "./types";

/** The light-grey stage the block page centres each Checkout Moments card on. */
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[640px] grid-cols-[minmax(0,1fr)] content-center justify-items-center bg-[#f5f5f7] p-4 sm:p-8 dark:bg-black">
      {children}
    </div>
  );
}

function PayAndConfirmStage(props: PayAndConfirmProps) {
  return (
    <Stage>
      <PayAndConfirm {...props} />
    </Stage>
  );
}

function VerifyPaymentStage(props: VerifyPaymentProps) {
  return (
    <Stage>
      <VerifyPayment {...props} />
    </Stage>
  );
}

function TipAndRateStage(props: TipAndRateProps) {
  return (
    <Stage>
      <TipAndRate {...props} />
    </Stage>
  );
}

const CLASS_NAME: PropDoc = {
  name: "className",
  type: "string",
  description: "Extra classes for the card's outer element.",
};

const CURRENCY: PropDoc = {
  name: "currency",
  type: "string",
  description: "Symbol written before every amount.",
  defaultValue: '"$"',
};

const IMPORT = 'import { PayAndConfirm, VerifyPayment, TipAndRate } from "@/components/blocks/checkout-moments";';

const playgrounds: BlockPlaygrounds = {
  "checkout-pay": {
    Component: PayAndConfirmStage,
    props: [
      {
        name: "merchant",
        type: "string",
        description: "Shop name in the header; its first letter fills the round badge.",
        defaultValue: '"Studio Supply"',
      },
      {
        name: "cardLast4",
        type: "string",
        description: "Last four digits of the saved card shown above the slider.",
        defaultValue: '"4242"',
      },
      {
        name: "taxRate",
        type: "number",
        description: "Tax applied to the subtotal, as a fraction (0.08 is 8%). The total rolls when it changes.",
        defaultValue: "0.08",
        min: 0,
        max: 0.25,
        step: 0.01,
      },
      CURRENCY,
      {
        name: "receiptEmail",
        type: "string",
        description: "Address named in the success toast after paying.",
        defaultValue: '"you@studio.co"',
      },
      {
        name: "product",
        type: "CheckoutProduct",
        description:
          "The line item: { name, variant?, price (cents), swatch?, image? }. Defaults to a Ceramic Pour-Over Set at $64.00.",
      },
      {
        name: "shipping",
        type: "ShippingOption[]",
        description: "Delivery choices: { id, label, eta, price (cents) }. Defaults to Standard (free) and Express ($12).",
      },
      {
        name: "onPay",
        type: "(totalCents: number) => Promise<void> | void",
        description: "Runs when the slider reaches the end. Resolve to show the receipt, reject to let the visitor retry.",
        defaultValue: "() => wait(1400)",
      },
      CLASS_NAME,
    ],
    jsxName: "PayAndConfirm",
    importLine: IMPORT,
  },

  "checkout-verify": {
    Component: VerifyPaymentStage,
    props: [
      {
        name: "hint",
        type: "string",
        description: "One line under the code field. Omit it to show nothing there.",
        defaultValue: '"Demo code: 424242"',
      },
      {
        name: "destination",
        type: "string",
        description: "Where the code was sent, already masked.",
        defaultValue: '"•••• 42"',
      },
      {
        name: "merchant",
        type: "string",
        description: "Shop name in the amount pill and the approved message.",
        defaultValue: '"Studio Supply"',
      },
      {
        name: "amount",
        type: "number",
        description: "Amount being approved, in cents.",
        defaultValue: "12840",
        min: 100,
        max: 100000,
        step: 100,
      },
      {
        name: "length",
        type: "number",
        description: "Digits in the code. Six splits into two groups of three. The demo code only works at 6.",
        defaultValue: "6",
        min: 4,
        max: 8,
        step: 1,
      },
      {
        name: "maxAttempts",
        type: "number",
        description: "Wrong codes allowed before the card locks and asks for a new one.",
        defaultValue: "3",
        min: 1,
        max: 5,
        step: 1,
      },
      {
        name: "resendAfter",
        type: "number",
        description: "Seconds before Resend code becomes available.",
        defaultValue: "30",
        min: 0,
        max: 60,
        step: 1,
      },
      CURRENCY,
      {
        name: "verify",
        type: "(code: string) => Promise<boolean> | boolean",
        description: "Checks the code. Resolve true to approve; anything else counts as wrong. The demo accepts 424242.",
      },
      {
        name: "onResend",
        type: "() => void",
        description: "Called when the visitor asks for a new code.",
      },
      {
        name: "onApproved",
        type: "() => void",
        description: "Called once the approved state shows.",
      },
      {
        name: "onCancel",
        type: "() => void",
        description: "Called by the Cancel button.",
      },
      CLASS_NAME,
    ],
    jsxName: "VerifyPayment",
    importLine: IMPORT,
  },

  "checkout-tip": {
    Component: TipAndRateStage,
    props: [
      {
        name: "courier",
        type: "string",
        description: "Who delivered. Their first name goes in the title, their initials in the avatar.",
        defaultValue: '"Maya Chen"',
      },
      {
        name: "detail",
        type: "string",
        description: "One line under the title.",
        defaultValue: '"Delivered your order in 18 min"',
      },
      {
        name: "orderTotal",
        type: "number",
        description: "Order total in cents. The 10/15/20% chips are worked out from it.",
        defaultValue: "4200",
        min: 1000,
        max: 10000,
        step: 100,
      },
      {
        name: "maxTip",
        type: "number",
        description: "Largest tip on the tick slider, in whole currency units.",
        defaultValue: "20",
        min: 5,
        max: 50,
        step: 1,
      },
      CURRENCY,
      {
        name: "presets",
        type: "number[]",
        description: "Tip presets as fractions of the order total.",
        defaultValue: "[0.1, 0.15, 0.2]",
      },
      {
        name: "compliments",
        type: "string[]",
        description: "Chips the visitor can toggle.",
        defaultValue: '["On time", "Friendly", "Careful packing", "Great directions"]',
      },
      {
        name: "onSubmit",
        type: "(feedback: { rating: number; tip: number; compliments: string[] }) => Promise<void> | void",
        description: "Runs on send. Resolve to show the thank-you; reject to return to the form.",
        defaultValue: "() => wait(1100)",
      },
      CLASS_NAME,
    ],
    jsxName: "TipAndRate",
    importLine: IMPORT,
  },

  "mk-slide-to-pay": {
    Component: SlideToPay,
    props: [
      {
        name: "accent",
        type: "string",
        description: "Accent for the slider fill, card ring and links. Omit it for Apple blue that brightens in dark mode.",
        defaultValue: '"#0071e3"',
      },
      {
        name: "promoCode",
        type: "string",
        description: "Code that takes 10% off, compared case-insensitively. Shown as a hint in the field.",
        defaultValue: '"MOTION10"',
      },
      {
        name: "autoplay",
        type: "boolean",
        description: "Nudges the slider every 3.2 s as a hint until the visitor touches the section.",
        defaultValue: "false",
      },
      {
        name: "items",
        type: "SlideToPayItem[]",
        description: "Bag contents: { id, name, meta, price (dollars), qty, art }. Defaults to headphones and two cases.",
      },
      {
        name: "onPay",
        type: "(detail: { total: number; card: string }) => void",
        description: "Runs when the slide completes. Nothing is charged; hook a real checkout in here.",
      },
      CLASS_NAME,
    ],
    jsxName: "SlideToPay",
    importLine: 'import { SlideToPay } from "@/components/blocks/motion-kit/slide-to-pay";',
  },
};

export default playgrounds;
