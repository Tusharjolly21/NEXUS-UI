"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import type { ReactNode } from "react";

export function CheckoutStage({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[640px] grid-cols-[minmax(0,1fr)] content-center justify-items-center bg-[#f5f5f7] p-4 sm:p-8 dark:bg-black">
      {children}
    </div>
  );
}
