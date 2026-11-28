"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CodeBlock } from "@/components/code-block";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    lightOnly: true,
    componentName: "CodeBlock",
    importPath: "@/components/code-block",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light", "auto"], defaultValue: "dark" },
      { kind: "toggle", prop: "hoverHighlight", label: "Glide bar", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[540px]" style={{ height: 340 }}>
        <CodeBlock
          key={String(v.autoplay)}
          theme={v.theme as "dark"}
          hoverHighlight={v.hoverHighlight as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
