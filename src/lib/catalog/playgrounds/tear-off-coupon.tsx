"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { TearOffCoupon } from "@/components/tear-off-coupon";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "TearOffCoupon",
    importPath: "@/components/tear-off-coupon",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "select", prop: "offer", label: "Offer", options: ["20% off", "Free shipping", "$10 off"], defaultValue: "20% off" },
      { kind: "select", prop: "brand", label: "Brand", options: ["Lumen", "Northwind", "Kite"], defaultValue: "Lumen" },
      { kind: "toggle", prop: "enableSound", label: "Sound", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[380px] justify-center">
        <TearOffCoupon
          key={`${String(v.autoplay)}`}
          autoplay={v.autoplay as boolean}
          offer={v.offer as string}
          brand={v.brand as string}
          enableSound={v.enableSound as boolean}
        />
      </div>
    ),
  };
