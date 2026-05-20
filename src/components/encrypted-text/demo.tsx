"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RefreshCw, MousePointerClick, Eye, Zap } from "lucide-react";
import { EncryptedText } from "./encrypted-text";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

function Range({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        <span className="font-mono text-[11px] text-muted-foreground">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

function DemoCard({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-background/60 backdrop-blur-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <span className="text-primary">{icon}</span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">{children}</div>
    </div>
  );
}

export function EncryptedTextDemo() {
  const [speed, setSpeed] = React.useState(50);
  const [shuffleSpeed, setShuffleSpeed] = React.useState(35);
  const [iterations, setIterations] = React.useState(8);
  const [loopEnabled, setLoopEnabled] = React.useState(false);
  const [playgroundKey, setPlaygroundKey] = React.useState(0);
  const [customText, setCustomText] = React.useState("Hello, World!");

  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-14">
      {/* ── Page header ── */}
      <header className="mx-auto max-w-2xl space-y-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-[11px] font-semibold text-primary dark:border-cyan-400/20 dark:bg-cyan-400/8 dark:text-cyan-300">
          <Zap className="size-3.5" />
          Motion Effects
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Encrypted Text
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Characters shuffle through gibberish before locking into the final string — a
          futuristic reveal effect for hero headings, buttons, and beyond.
        </p>
      </header>

      {/* ── Hero demo ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-muted/10 px-6 py-16 text-center sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/8 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 size-64 rounded-full bg-fuchsia-500/8 blur-[80px]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Trigger: load · Loop: true
          </p>
          <EncryptedText
            text="INITIALIZING SYSTEM"
            trigger="load"
            loop
            loopDelay={2500}
            speed={55}
            shuffleSpeed={30}
            iterations={10}
            className="block text-4xl font-bold tracking-[0.12em] text-foreground sm:text-5xl md:text-6xl"
          />
          <EncryptedText
            text="Security clearance: GRANTED"
            trigger="load"
            loop
            loopDelay={2500}
            speed={45}
            shuffleSpeed={28}
            iterations={6}
            revealDelay={600}
            className="block text-base tracking-widest text-primary dark:text-cyan-300 sm:text-lg"
          />
        </div>
      </section>

      {/* ── Trigger showcase grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Hover */}
        <DemoCard icon={<Eye className="size-4" />} label="Hover to reveal">
          <EncryptedText
            text="HOVER OVER ME"
            trigger="hover"
            speed={40}
            shuffleSpeed={25}
            iterations={5}
            className="text-xl font-bold tracking-widest text-foreground"
          />
        </DemoCard>

        {/* Click to replay */}
        <DemoCard icon={<MousePointerClick className="size-4" />} label="Click to replay">
          <EncryptedText
            text="CLICK TO DECODE"
            trigger="click"
            speed={45}
            shuffleSpeed={28}
            iterations={6}
            className="text-xl font-bold tracking-widest text-foreground"
          />
        </DemoCard>

        {/* Viewport */}
        <DemoCard icon={<RefreshCw className="size-4" />} label="Viewport trigger">
          <EncryptedText
            text="SCROLL REVEAL"
            trigger="viewport"
            speed={55}
            shuffleSpeed={32}
            iterations={7}
            className="text-xl font-bold tracking-widest text-foreground"
          />
        </DemoCard>
      </div>

      {/* ── Use-case examples ── */}
      <section className="space-y-8">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Use cases
          </p>
          <h2 className="text-xl font-bold tracking-tight text-foreground">In context</h2>
        </div>

        <div className="space-y-6">
          {/* Button label */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Button
            </span>
            <button
              type="button"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <EncryptedText
                text="Get started"
                trigger="hover"
                speed={35}
                shuffleSpeed={20}
                iterations={4}
              />
            </button>
          </div>

          {/* Badge */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Badge
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <EncryptedText
                text="ONLINE"
                trigger="load"
                loop
                loopDelay={3000}
                speed={80}
                shuffleSpeed={40}
                iterations={3}
                className="text-[11px]"
              />
            </span>
          </div>

          {/* Nav link */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Nav link
            </span>
            <a
              href="#"
              className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              <EncryptedText
                text="Documentation"
                trigger="hover"
                speed={40}
                shuffleSpeed={22}
                iterations={5}
              />
            </a>
          </div>

          {/* Terminal line */}
          <div className="flex flex-wrap items-start gap-4">
            <span className="w-28 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Terminal
            </span>
            <div className="rounded-xl border border-border/70 bg-zinc-950 px-4 py-3 font-mono text-sm text-green-400">
              <span className="text-muted-foreground">$ </span>
              <EncryptedText
                text="npm install @nexus-labs/core"
                trigger="load"
                loop
                loopDelay={4000}
                speed={35}
                shuffleSpeed={20}
                iterations={5}
                characters="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/-_."
                className="text-green-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Playground ── */}
      <section className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Playground</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Adjust speed, shuffle, and iterations. Click replay to re-run.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPlaygroundKey((k) => k + 1)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary"
          >
            <RefreshCw className="size-3" />
            Replay
          </button>
        </div>

        {/* Text input */}
        <div className="mt-4">
          <Label htmlFor="pg-text" className="text-xs font-medium">
            Text
          </Label>
          <input
            id="pg-text"
            type="text"
            value={customText}
            onChange={(e) => { setCustomText(e.target.value); setPlaygroundKey((k) => k + 1); }}
            className="mt-1.5 w-full rounded-lg border border-border/70 bg-background px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Controls */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Range
            id="pg-speed"
            label="speed (ms / char)"
            value={speed}
            onChange={setSpeed}
            min={15}
            max={150}
            step={5}
            format={(v) => `${v}ms`}
          />
          <Range
            id="pg-shuffle"
            label="shuffleSpeed (ms)"
            value={shuffleSpeed}
            onChange={setShuffleSpeed}
            min={10}
            max={100}
            step={5}
            format={(v) => `${v}ms`}
          />
          <Range
            id="pg-iter"
            label="iterations (pre-shuffle)"
            value={iterations}
            onChange={(n) => setIterations(Math.round(n))}
            min={0}
            max={20}
            step={1}
            format={(v) => String(Math.round(v))}
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <Switch id="pg-loop" checked={loopEnabled} onCheckedChange={setLoopEnabled} />
          <Label htmlFor="pg-loop" className="text-xs font-medium">
            Loop
          </Label>
        </div>

        {/* Preview */}
        <div className="mt-6 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 dark:bg-white/[0.02]">
          <EncryptedText
            key={playgroundKey}
            text={customText || "Type something above…"}
            trigger="load"
            speed={speed}
            shuffleSpeed={shuffleSpeed}
            iterations={iterations}
            loop={loopEnabled}
            loopDelay={2000}
            className="text-2xl font-bold tracking-widest text-foreground sm:text-3xl"
          />
        </div>
      </section>

      {/* ── Prop table ── */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Props</h2>
        <div className="overflow-x-auto rounded-2xl border border-border/70">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border/70 bg-muted/30">
              <tr>
                {["Prop", "Type", "Default", "Description"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[
                ["text", "string", "—", "The final revealed string"],
                ["trigger", '"load" | "hover" | "viewport" | "click"', '"load"', "What starts the animation"],
                ["speed", "number", "50", "ms between each character lock-in"],
                ["shuffleSpeed", "number", "35", "ms between gibberish shuffle ticks"],
                ["iterations", "number", "8", "Shuffle cycles before first character locks"],
                ["revealDelay", "number", "0", "ms before animation begins"],
                ["characters", "string", "alphanum+symbols", "Charset used for gibberish"],
                ["loop", "boolean", "false", "Replay after completion"],
                ["loopDelay", "number", "2000", "ms between loops"],
                ["as", "span | p | h1 | h2 | h3 | div", '"span"', "Rendered HTML element"],
                ["onComplete", "() => void", "—", "Callback when reveal finishes"],
                ["className", "string", "—", "Additional Tailwind classes"],
              ].map(([prop, type, def, desc]) => (
                <tr key={prop} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-mono text-[13px] text-foreground">{prop}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-primary/80">{type}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{def}</td>
                  <td className="px-4 py-3 text-[13px] text-muted-foreground">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
