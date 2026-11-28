"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { WebSlingButton } from "@/components/web-sling-button";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "WebSlingButton",
    importPath: "@/components/web-sling-button",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "label", label: "Label", options: ["Get started", "Join the swarm", "Swing in", "Hang on"], defaultValue: "Get started" },
      { kind: "range", prop: "snapAt", label: "Snap point", min: 1.3, max: 4, step: 0.1, unit: "x", defaultValue: 2.3 },
      { kind: "range", prop: "height", label: "Stage height", min: 320, max: 560, step: 10, unit: "px", defaultValue: 460 },
      { kind: "toggle", prop: "autoplay", label: "Ghost shooter", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <WebSlingButton
          label={String(v.label || "Get started")}
          snapAt={v.snapAt as number}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
