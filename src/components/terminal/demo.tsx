"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { Terminal, type TerminalCommand, type TerminalTheme } from "./terminal";
import { cn } from "@/lib/utils";

const script: TerminalCommand[] = [
  {
    input: "npm install",
    runDelayMs: 950,
    output: [
      { text: "added 182 packages, and audited 183 packages in 3s", tone: "muted" },
      { text: "found 0 vulnerabilities", tone: "success" },
    ],
  },
  {
    input: "pnpm dev --port 3000",
    runDelayMs: 650,
    output: [
      { text: "ready - started server on http://localhost:3000", tone: "success" },
      { text: "watching for changes…", tone: "muted" },
    ],
  },
  {
    input: "git push origin main",
    runDelayMs: 850,
    output: [
      { text: "Enumerating objects: 42, done.", tone: "muted" },
      { text: "Counting objects: 100% (42/42), done.", tone: "muted" },
      { text: "To github.com:your-org/your-repo.git", tone: "muted" },
      { text: "   61f3c4b..a8b21de  main -> main", tone: "success" },
    ],
  },
  {
    input: "deploy --target=production",
    runDelayMs: 1200,
    output: [
      { text: "uploading build artifacts…", tone: "info" },
      { text: "routing traffic…", tone: "info" },
      { text: "success — nexus-ui.com is live", tone: "success" },
    ],
  },
  {
    input: "npx shadcn@latest add @next-ui/gooey-input",
    runDelayMs: 800,
    output: [
      { text: "fetching registry…", tone: "muted" },
      { text: "✔ wrote components/gooey-input.tsx", tone: "success" },
      { text: "✔ installed framer-motion", tone: "muted" },
    ],
  },
];

export function TerminalDemo() {
  const [terminalTheme, setTerminalTheme] = React.useState<TerminalTheme>("carbon");

  return (
    <section className="mx-auto max-w-5xl px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Interactive</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Animated terminal, production feel
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Sequential commands, realistic timing, cursor blink, and optional sound feedback — built as a reusable React
          component.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs text-muted-foreground">Terminal chrome</span>
        <div className="inline-flex rounded-full border border-border bg-muted/50 p-0.5 dark:bg-white/[0.06]">
          <button
            type="button"
            aria-pressed={terminalTheme !== "paper"}
            onClick={() => setTerminalTheme("carbon")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
              terminalTheme !== "paper" ? "bg-background text-foreground shadow-sm dark:bg-zinc-900" : "text-muted-foreground",
            )}
          >
            <Moon className="size-3.5" aria-hidden />
            Dark
          </button>
          <button
            type="button"
            aria-pressed={terminalTheme === "paper"}
            onClick={() => setTerminalTheme("paper")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
              terminalTheme === "paper" ? "bg-background text-foreground shadow-sm dark:bg-zinc-900" : "text-muted-foreground",
            )}
          >
            <Sun className="size-3.5" aria-hidden />
            Light
          </button>
        </div>
      </div>

      <div className="mt-8 flex h-[min(560px,70vh)] w-full flex-col">
        <Terminal
          className="min-h-0 flex-1"
          fillHeight
          commands={script}
          username="tushar"
          hostname="Nexus-Macbook"
          theme={terminalTheme}
          autoStart
          loop
          typingSpeed={26}
          typingJitter={32}
          startupDelay={500}
          delayBetweenCommands={900}
          showControls
          showSoundToggle
        />
      </div>
    </section>
  );
}

