"use client";

import { Terminal, type TerminalCommand } from "@/components/terminal";

const SCRIPT: TerminalCommand[] = [
  { input: "npx shadcn@latest add @nexus-labs/terminal", runDelayMs: 800, output: ["fetching registry...", { text: "wrote components/terminal/terminal.tsx", tone: "success" }] },
  { input: "npm run dev", runDelayMs: 600, output: ["  ready in 412 ms", { text: "  Local: http://localhost:3000", tone: "info" }] },
  { input: "git commit -m \"ship the terminal\"", runDelayMs: 400, output: [{ text: "[main 8f2c1d4] ship the terminal", tone: "success" }, "2 files changed, 318 insertions(+)"] },
];

export function PreviewTerminalRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={`flex w-full max-w-[560px] flex-col ${compact ? "h-[300px]" : "h-[360px]"}`}>
        <Terminal fillHeight className="min-h-0 flex-1" commands={SCRIPT} autoplay hint={compact ? "" : undefined} showSoundToggle={!compact} />
      </div>
    </div>
  );
}

export function PreviewTerminalPaperRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={`flex w-full max-w-[560px] flex-col ${compact ? "h-[300px]" : "h-[360px]"}`}>
        <Terminal fillHeight className="min-h-0 flex-1" theme="paper" commands={SCRIPT} autoplay hint="" />
      </div>
    </div>
  );
}
