"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Terminal, type TerminalCommand, type TerminalTheme } from "./terminal";

const SCRIPT: TerminalCommand[] = [
  {
    input: "npm install",
    runDelayMs: 900,
    output: ["added 182 packages, and audited 183 packages in 3s", { text: "found 0 vulnerabilities", tone: "success" }],
  },
  {
    input: "npm run dev -- --port 3000",
    runDelayMs: 600,
    output: [{ text: "ready - started server on http://localhost:3000", tone: "success" }, "watching for changes..."],
  },
  {
    input: "git push origin main",
    runDelayMs: 800,
    output: ["Enumerating objects: 42, done.", "To github.com:your-org/your-repo.git", { text: "   61f3c4b..a8b21de  main -> main", tone: "success" }],
  },
  {
    input: "npx shadcn@latest add @nexus-labs/terminal",
    runDelayMs: 800,
    output: ["fetching registry...", { text: "wrote components/terminal.tsx", tone: "success" }],
  },
];

const THEMES: { id: TerminalTheme; label: string }[] = [
  { id: "carbon", label: "Carbon" },
  { id: "midnight", label: "Midnight" },
  { id: "paper", label: "Paper" },
];

/** Full-page demo used by /demos/terminal. */
export function TerminalDemo() {
  const [theme, setTheme] = React.useState<TerminalTheme>("carbon");
  return (
    <section className="mx-auto max-w-3xl px-4 py-14">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-balance text-[clamp(30px,5vw,44px)] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">A terminal that types for you.</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">
          It plays a script with human timing, then the prompt is yours. Click in and type <code className="font-mono">help</code>.
        </p>
      </div>
      <div role="radiogroup" aria-label="Theme" className="mx-auto mt-6 flex w-fit rounded-full bg-[#e8e8ed] p-0.5 dark:bg-[#2c2c2e]">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={theme === t.id}
            onClick={() => setTheme(t.id)}
            className="relative rounded-full px-4 py-1.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
          >
            {theme === t.id && <motion.span layoutId="terminal-demo-theme" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] dark:bg-[#48484a]" transition={{ type: "spring", stiffness: 500, damping: 32 }} />}
            <span className={`relative ${theme === t.id ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}`}>{t.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex h-[min(520px,70vh)] w-full flex-col">
        <Terminal
          fillHeight
          className="min-h-0 flex-1"
          commands={SCRIPT}
          username="tushar"
          hostname="nexus"
          theme={theme}
          autoplay
        />
      </div>
    </section>
  );
}
