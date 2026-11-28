"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BloomGiftCard } from "@/components/bloom-gift-card";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BloomGiftCard",
    importPath: "@/components/bloom-gift-card",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[460px] justify-center">
        <BloomGiftCard key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
