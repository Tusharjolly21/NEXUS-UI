"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { RippleToast } from "@/components/ripple-toast";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "RippleToast",
    importPath: "@/components/ripple-toast",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <RippleToast key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  };
