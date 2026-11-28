"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { CodeSnippet } from "@/components/code-snippet";
import type { Playground } from "../playground-types";

export const playground: Playground = {
    componentName: "CodeSnippet",
    importPath: "@/components/code-snippet",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "initial", label: "Language", options: ["js", "ts", "python", "bash", "json"], defaultValue: "js" },
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light"], defaultValue: "dark" },
      { kind: "toggle", prop: "lineNumbers", label: "Line numbers", defaultValue: true },
      { kind: "toggle", prop: "controls", label: "Chip row", defaultValue: true },
    ],
    render: (v) => (
      <CodeSnippet
        key={`${v.initial}-${v.theme}-${v.lineNumbers}`}
        initial={v.initial as "js" | "ts" | "python" | "bash" | "json"}
        theme={v.theme as "dark" | "light"}
        lineNumbers={v.lineNumbers as boolean}
        controls={v.controls as boolean}
      />
    ),
  };
