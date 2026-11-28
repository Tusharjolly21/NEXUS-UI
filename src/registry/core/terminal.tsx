"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { Volume2, Download } from "lucide-react";
import { Terminal } from "@/components/terminal";

export function PreviewTerminal({
  compact = true,
}: { compact?: boolean } = {}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {!compact && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-950/30">
          <Volume2 className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
          <div className="flex-1 text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">Keyboard sounds require a sound file.</span>{" "}
            Download{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/50">sound.ogg</code>{" "}
            and place it at{" "}
            <code className="rounded bg-amber-100 px-1 py-0.5 font-mono text-xs dark:bg-amber-900/50">public/sounds/sound.ogg</code>.
            Without it the terminal falls back to a synthetic click.
          </div>
          <a
            href="/sounds/sound.ogg"
            download="sound.ogg"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-600 active:scale-95"
          >
            <Download className="size-3.5" aria-hidden />
            Download
          </a>
        </div>
      )}
      <div className="flex h-[min(420px,58vh)] min-h-[300px] w-full flex-col">
      <Terminal
        className="min-h-0 flex-1"
        fillHeight
        theme="carbon"
        autoStart
        loop
        startupDelay={350}
        loopDelay={900}
        typingSpeed={22}
        typingJitter={28}
        delayBetweenCommands={650}
        showControls={false}
        showSoundToggle={!compact}
        enableSound={!compact}
        username="user"
        hostname="Nexus-Macbook"
        commands={[
          {
            input: "npm install",
            runDelayMs: 500,
            output: [{ text: "added 182 packages in 3s", tone: "muted" }],
          },
          {
            input: "pnpm dev",
            runDelayMs: 450,
            output: [
              { text: "ready - http://localhost:3000", tone: "success" },
            ],
          },
          {
            input: "git status",
            runDelayMs: 350,
            output: [
              { text: "On branch main — nothing to commit", tone: "muted" },
            ],
          },
          {
            input: "curl -I https://nexus-ui.com",
            runDelayMs: 400,
            output: [{ text: "HTTP/2 200", tone: "success" }],
          },
          {
            input: 'echo "Nexus UI"',
            runDelayMs: 250,
            output: [{ text: "Nexus UI", tone: "info" }],
          },
        ]}
      />
    </div>
    </div>
  );
}
