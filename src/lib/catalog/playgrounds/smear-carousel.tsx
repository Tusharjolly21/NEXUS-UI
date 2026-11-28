"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { SmearCarousel } from "@/components/smear-carousel";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "SmearCarousel",
    importPath: "@/components/smear-carousel",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Demo it by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto flex w-full max-w-[960px] justify-center">
        <SmearCarousel key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
