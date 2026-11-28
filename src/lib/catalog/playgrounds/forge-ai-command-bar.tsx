"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { AiCommandBar } from "@/components/forge-ai-command-bar";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "AiCommandBar",
    importPath: "@/components/forge-ai-command-bar",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultMode", label: "Start in", options: ["ask", "edit", "build"], defaultValue: "build" },
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Describe what you need...", "Ask the copilot...", "What should we build?"], defaultValue: "Describe what you need..." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // hotkey="" keeps Cmd/Ctrl+K free for the site's own search on the docs page.
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <AiCommandBar
          key={`${v.defaultMode}-${v.autoplay}`}
          defaultMode={v.defaultMode as "build"}
          placeholder={v.placeholder as string}
          autoplay={v.autoplay as boolean}
          hotkey=""
        />
      </div>
    ),
  };
