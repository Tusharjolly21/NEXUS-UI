"use client";

import * as React from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { DEFAULT_HEADER } from "@/components/code-block/code-block";
import type { IconMeta } from "@/lib/icons/catalog";
import { NX_ICONS } from "./registry";

const COLORS = [
  { label: "Ink", value: "text-foreground", css: "var(--foreground)" },
  { label: "Blue", value: "text-blue-600", css: "#2563eb" },
  { label: "Violet", value: "text-violet-600", css: "#7c3aed" },
  { label: "Rose", value: "text-rose-500", css: "#f43f5e" },
  { label: "Amber", value: "text-amber-500", css: "#f59e0b" },
  { label: "Green", value: "text-emerald-600", css: "#059669" },
] as const;

function Slider({ label, value, min, max, step, onChange }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-3 text-[14px] text-muted-foreground">
      <span className="w-[74px] shrink-0">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-[var(--foreground)]"
      />
      <span className="w-10 shrink-0 text-right tabular-nums text-foreground">{value}</span>
    </label>
  );
}

/** The big preview with size, line and colour controls, and a usage snippet that follows them. */
export function IconPlayground({ icon }: { icon: IconMeta }) {
  const Icon = NX_ICONS[icon.slug];
  const [size, setSize] = React.useState(96);
  const [stroke, setStroke] = React.useState(2);
  const [color, setColor] = React.useState<(typeof COLORS)[number]>(COLORS[0]);
  const [hover, setHover] = React.useState(false);
  const [replay, setReplay] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  const loop = icon.kind === "loop";
  const play = loop ? !paused : hover || replay;

  const again = () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setReplay(false);
    // a tick later, so a second press restarts the animation instead of joining the first
    timer.current = window.setTimeout(() => {
      setReplay(true);
      timer.current = window.setTimeout(() => setReplay(false), 1600);
    }, 40);
  };

  const props = [
    size !== 24 ? `size={${size}}` : "",
    stroke !== 2 ? `strokeWidth={${stroke}}` : "",
    color.value !== "text-foreground" ? `className="${color.value}"` : "",
  ].filter(Boolean);
  const usage = `import { ${icon.component} } from "@/components/icons/${icon.slug}";

export default function Page() {
  return <${icon.component}${props.length ? " " + props.join(" ") : ""} />;
}`;

  if (!Icon) return null;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-[26px] bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-30px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <div
          className="relative grid h-[280px] place-items-center rounded-[20px] bg-foreground/[0.04]"
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
        >
          <span style={{ color: color.css }}>
            <Icon size={size} strokeWidth={stroke} play={play} />
          </span>
          <button
            type="button"
            onClick={loop ? () => setPaused((p) => !p) : again}
            className="absolute right-3 top-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-card px-3.5 text-[13px] font-medium text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.06)] transition-colors hover:bg-card/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
          >
            {loop ? paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden /> : <RotateCcw className="size-3.5" aria-hidden />}
            {loop ? (paused ? "Play" : "Pause") : "Replay"}
          </button>
          <p className="absolute bottom-3 left-0 right-0 text-center text-[12.5px] text-muted-foreground">
            {loop ? "Loops on its own." : "Plays when you hover it."}
          </p>
        </div>
        <div className="mt-6 grid gap-4">
          <Slider label="Size" value={size} min={16} max={160} step={2} onChange={setSize} />
          <Slider label="Line" value={stroke} min={1} max={3} step={0.25} onChange={setStroke} />
          <div className="flex items-center gap-3 text-[14px] text-muted-foreground">
            <span className="w-[74px] shrink-0">Colour</span>
            <div className="flex flex-wrap gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.label}
                  aria-pressed={c.value === color.value}
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)] outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2 aria-pressed:ring-offset-background"
                  style={{ background: c.css }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col">
        <h2 className="text-[17px] font-semibold text-foreground">Use it</h2>
        <p className="mt-1 text-[15px] text-muted-foreground">Copy the file below into your project, then import it. The snippet follows the controls.</p>
        <div className="mt-4 min-w-0">
          <CodeBlock
            code={usage}
            language="tsx"
            theme="dark"
            header={{ ...DEFAULT_HEADER, title: "page.tsx" }}
            hoverHighlight={false}
            enableSound={false}
          />
        </div>
      </div>
    </div>
  );
}
