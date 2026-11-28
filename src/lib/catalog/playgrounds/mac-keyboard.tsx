"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { MacKeyboard } from "@/components/keyboard";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "MacKeyboard",
    importPath: "@/components/keyboard",
    snippetBaseProps: ["listen"],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Backlight", options: ["#0a84ff", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0a84ff" },
      { kind: "select", prop: "theme", label: "Finish", options: ["auto", "light", "dark"], defaultValue: "auto" },
      { kind: "select", prop: "layout", label: "Layout", options: ["mac", "compact"], defaultValue: "mac" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[600px]">
        <MacKeyboard
          key={String(v.autoplay)}
          accent={v.accent as string}
          theme={v.theme as "auto"}
          layout={v.layout as "mac"}
          autoplay={v.autoplay as boolean}
          listen
        />
      </div>
    ),
  };
