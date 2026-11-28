"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CopyChip } from "@/components/copy-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CopyChip",
    importPath: "@/components/copy-button",
    snippetBaseProps: ['value="inv_3fK9xQ2Lq7"'],
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CopyChip key={String(v.autoplay)} autoplay={v.autoplay as boolean} value="inv_3fK9xQ2Lq7" display="inv_3fK9…2Lq7" accent={v.accent as string} />,
  };
