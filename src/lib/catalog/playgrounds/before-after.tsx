"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { BeforeAfter } from "@/components/before-after";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "BeforeAfter",
    importPath: "@/components/before-after",
    snippetBaseProps: ['before={<img src="/before.jpg" alt="" className="h-full w-full object-cover" />}', 'after={<img src="/after.jpg" alt="" className="h-full w-full object-cover" />}'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "beforeLabel", label: "Before label", options: ["Before", "Original", "Raw"], defaultValue: "Before" },
      { kind: "select", prop: "afterLabel", label: "After label", options: ["After", "Edited", "Graded"], defaultValue: "After" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <BeforeAfter key={String(v.autoplay)} autoplay={v.autoplay as boolean}
          beforeLabel={v.beforeLabel as string}
          afterLabel={v.afterLabel as string}
          before={<div className="h-full w-full bg-[linear-gradient(180deg,#9a9a9a,#d6d6d6_60%,#5c5c5c)]" />}
          after={<div className="h-full w-full bg-[linear-gradient(180deg,#7fb3e8,#f6d9b8_60%,#3e5f7e)]" />}
        />
      </div>
    ),
  };
