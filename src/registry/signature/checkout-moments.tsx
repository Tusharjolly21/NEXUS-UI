"use client";

import { PayAndConfirm } from "@/components/blocks/checkout-moments";
import { DemoCursor, type DemoStep } from "@/registry/signature/demo-cursor";

/** The demo box is a fixed size so the ghost cursor can find the slider and the reset button. */
const BOX = { w: 440, h: 700 };
const at = (x: number, y: number) => ({ x: x / BOX.w, y: y / BOX.h });

const SCRIPT: DemoStep[] = [
  { ...at(300, 120), ms: 600, wait: 300 },
  { ...at(310, 216), ms: 700, wait: 250 },
  { action: "click", wait: 700 },
  { ...at(72, 523), ms: 900, wait: 250 },
  { action: "down", wait: 150 },
  { ...at(250, 525), ms: 700 },
  { ...at(392, 523), ms: 550, wait: 120 },
  { action: "up", wait: 3600 },
  { ...at(220, 309), ms: 900, wait: 250 },
  { action: "click", wait: 600 },
];

/** Checkout Moments block: the Pay & Confirm section, with a cursor that slides to pay. */
export function PreviewCheckoutMomentsBlock() {
  return (
    <div className="relative flex h-full min-h-[720px] w-full items-center justify-center p-6">
      <div className="relative" style={{ width: BOX.w, height: BOX.h }}>
        <div className="absolute inset-x-0 top-0 flex justify-center px-5">
          <PayAndConfirm />
        </div>
        <DemoCursor script={SCRIPT} loopDelay={1200} />
      </div>
    </div>
  );
}
