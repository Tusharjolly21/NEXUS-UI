"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BackgroundGradient } from "@/components/background-gradient";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "BackgroundGradient",
    importPath: "@/components/background-gradient",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "animationSpeed", label: "Spin", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "ringWidth", label: "Ring", min: 1, max: 6, step: 0.5, unit: "px", defaultValue: 1.5 },
      { kind: "range", prop: "blur", label: "Glow blur", min: 0, max: 48, step: 2, unit: "px", defaultValue: 24 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[320px] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <BackgroundGradient
          key={String(v.autoplay)}
          className="w-full"
          containerClassName="p-6"
          animationSpeed={v.animationSpeed as number}
          ringWidth={v.ringWidth as number}
          blur={v.blur as number}
          autoplay={v.autoplay as boolean}
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">Pro</p>
            <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0066cc] dark:bg-[#0a84ff]/20 dark:text-[#64b5ff]">Popular</span>
          </div>
          <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            $18<span className="text-[15px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]"> / month</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">Unlimited projects, team seats and priority builds.</p>
        </BackgroundGradient>
      </div>
    ),
  };
