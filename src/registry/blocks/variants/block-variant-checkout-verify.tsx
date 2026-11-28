"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { VerifyPayment } from "@/components/blocks/checkout-moments";
import type { ReactNode } from "react";

function CheckoutStage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[640px] grid-cols-[minmax(0,1fr)] content-center justify-items-center bg-[#f5f5f7] p-4 sm:p-8 dark:bg-black">
      {children}
    </div>
  );
}

export function PreviewBlockVariantCheckoutVerify() {
  return <CheckoutStage><VerifyPayment hint="Demo code: 424242" /></CheckoutStage>;
}
