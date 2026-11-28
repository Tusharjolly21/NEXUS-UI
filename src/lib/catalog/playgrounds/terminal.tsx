"use client";

// Moved out of playgrounds.tsx so a component's page loads only its own playground.
import { Terminal, type TerminalCommand } from "@/components/terminal";
import type { Playground } from "../playground-types";

const DEMO_TERMINAL_SCRIPT: TerminalCommand[] = [
  { input: "npx shadcn@latest add @nexus-labs/terminal", runDelayMs: 800, output: ["fetching registry...", { text: "wrote components/terminal/terminal.tsx", tone: "success" }] },
  { input: "npm run dev", runDelayMs: 600, output: ["  ready in 412 ms", { text: "  Local: http://localhost:3000", tone: "info" }] },
  { input: 'git commit -m "ship the terminal"', runDelayMs: 400, output: [{ text: "[main 8f2c1d4] ship the terminal", tone: "success" }, "2 files changed, 318 insertions(+)"] },
];

export const playground: Playground = {
    lightOnly: true,
    componentName: "Terminal",
    importPath: "@/components/terminal",
    snippetBaseProps: ["commands={commands}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "theme", label: "Theme", options: ["carbon", "midnight", "paper"], defaultValue: "carbon" },
      { kind: "range", prop: "typingSpeed", label: "Typing", min: 10, max: 100, step: 2, unit: "ms", defaultValue: 34 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex h-[360px] w-full max-w-[560px] flex-col">
        <Terminal
          key={`${v.autoplay}-${v.typingSpeed}`}
          fillHeight
          className="min-h-0 flex-1"
          commands={DEMO_TERMINAL_SCRIPT}
          theme={v.theme as "carbon"}
          typingSpeed={v.typingSpeed as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  };
