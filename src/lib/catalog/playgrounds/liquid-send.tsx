"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { LiquidSend } from "@/components/liquid-send";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "LiquidSend",
    importPath: "@/components/liquid-send",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Message", "Reply to Maya", "Ask anything"], defaultValue: "Message" },
      { kind: "toggle", prop: "autoplay", label: "Write and send by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <LiquidSend key={String(v.autoplay)} placeholder={v.placeholder as string} autoplay={v.autoplay as boolean} />
      </div>
    ),
  };
