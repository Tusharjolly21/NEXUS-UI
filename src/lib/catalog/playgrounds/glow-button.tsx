"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { GlowButton } from "@/components/glow-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "GlowButton",
    importPath: "@/components/glow-button",
    snippetBaseProps: ['href="/signup"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 0, max: 28, step: 1, unit: "px", defaultValue: 28 },
      { kind: "color", prop: "background", label: "Fill", options: ["#1d1d1f", "#0071e3", "#ffffff", "#2c2c2e"], defaultValue: "#1d1d1f" },
      { kind: "toggle", prop: "openInNewTab", label: "New tab", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GlowButton key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        href="#playground"
        radius={v.radius as number}
        background={v.background === "#1d1d1f" ? undefined : (v.background as string)}
        openInNewTab={v.openInNewTab as boolean}
      >
        Get started
      </GlowButton>
    ),
  };
