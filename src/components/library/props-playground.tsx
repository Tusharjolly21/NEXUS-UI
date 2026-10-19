"use client";

import * as React from "react";
import { Check, Copy, Lock, Play, RotateCcw } from "lucide-react";
import type {
  Playground,
  PlaygroundControl,
  PlaygroundValues,
} from "@/lib/catalog/playgrounds";
import { cn } from "@/lib/utils";
import { ProLock, useProAccess } from "@/components/pro/pro-access";

type Fill = "light" | "dark";

export function initialValues(controls: PlaygroundControl[]): PlaygroundValues {
  return Object.fromEntries(controls.map((c) => [c.prop, c.defaultValue]));
}

function formatNumber(value: number, step: number) {
  const decimals = step >= 1 ? 0 : Math.min(3, String(step).split(".")[1]?.length ?? 0);
  return value.toFixed(decimals);
}

export function buildSnippet(playground: Playground, values: PlaygroundValues) {
  const changed = playground.controls
    .filter((c) => values[c.prop] !== c.defaultValue)
    .map((c) => {
      const value = values[c.prop];
      if (typeof value === "string") return `${c.prop}="${value}"`;
      if (typeof value === "boolean") return value ? c.prop : `${c.prop}={false}`;
      return `${c.prop}={${c.kind === "range" ? formatNumber(value, c.step) : value}}`;
    });
  const props = [...(playground.snippetBaseProps ?? []), ...changed];
  const open = `<${playground.componentName}`;
  const body =
    props.length === 0
      ? `${open} />`
      : props.join(" ").length + open.length < 72
        ? `${open} ${props.join(" ")} />`
        : `${open}\n${props.map((p) => `  ${p}`).join("\n")}\n/>`;
  return `import { ${playground.componentName} } from "${playground.importPath}";\n\n${body}`;
}

// ── Controls ────────────────────────────────────────────────────────

function RangeControl({
  control,
  value,
  onChange,
}: {
  control: Extract<PlaygroundControl, { kind: "range" }>;
  value: number;
  onChange: (v: number) => void;
}) {
  const pct = ((value - control.min) / (control.max - control.min)) * 100;
  const id = React.useId();
  return (
    <div className="group/range relative h-9 overflow-hidden rounded-[10px] bg-foreground/[0.05]">
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 bg-foreground/[0.10] transition-[background-color] group-hover/range:bg-foreground/[0.14]"
        style={{ width: `${pct}%` }}
      />
      <div className="pointer-events-none relative flex h-full items-center justify-between px-3 text-[13px]">
        <label htmlFor={id} className="text-foreground/75">
          {control.label}
        </label>
        <span className="font-medium tabular-nums text-foreground">
          {formatNumber(value, control.step)}
          {control.unit ?? ""}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={control.min}
        max={control.max}
        step={control.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap items-center gap-0.5 rounded-[10px] bg-foreground/[0.07] p-[3px]">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "h-7 rounded-[8px] px-2.5 text-xs capitalize transition-colors",
            value === option
              ? "bg-card font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function ControlRow({
  control,
  value,
  onChange,
}: {
  control: PlaygroundControl;
  value: number | boolean | string;
  onChange: (v: number | boolean | string) => void;
}) {
  if (control.kind === "range") {
    return <RangeControl control={control} value={value as number} onChange={onChange} />;
  }

  return (
    <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
      <span className="text-[13px] text-foreground/75">{control.label}</span>

      {control.kind === "toggle" ? (
        <button
          type="button"
          role="switch"
          aria-checked={value as boolean}
          aria-label={control.label}
          onClick={() => onChange(!value)}
          className={cn(
            "relative h-6 w-10 rounded-full transition-colors",
            value ? "bg-foreground" : "bg-foreground/15",
          )}
        >
          <span
            className={cn(
              "absolute left-0 top-0.5 size-5 rounded-full bg-background shadow-sm transition-transform",
              value ? "translate-x-[18px]" : "translate-x-0.5",
            )}
          />
        </button>
      ) : control.kind === "select" ? (
        <Segmented
          label={control.label}
          options={control.options}
          value={value as string}
          onChange={onChange}
        />
      ) : (
        <div role="radiogroup" aria-label={control.label} className="flex items-center gap-1.5">
          {control.options.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={value === color}
              aria-label={color}
              onClick={() => onChange(color)}
              className={cn(
                "size-6 rounded-full ring-1 ring-inset ring-foreground/15 transition-transform hover:scale-110",
                value === color && "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Playground ──────────────────────────────────────────────────────

export function LivePropsPlayground({
  playground,
  name,
  description,
  locked = false,
}: {
  playground: Playground;
  name: string;
  description: string;
  /** Pro component without access: the preview plays, the controls and code ask for Pro. */
  locked?: boolean;
}) {
  const { requestUpgrade } = useProAccess();
  const [values, setValues] = React.useState(() => initialValues(playground.controls));
  const [fill, setFill] = React.useState<Fill>(playground.defaultFill ?? "light");
  const [view, setView] = React.useState<"preview" | "code">("preview");
  const [replayKey, setReplayKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const snippet = React.useMemo(() => buildSnippet(playground, values), [playground, values]);
  const isDirty = playground.controls.some((c) => values[c.prop] !== c.defaultValue);

  const copy = async () => {
    if (locked) return requestUpgrade(name);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Stage */}
      <div
        className={cn(
          "relative min-h-[420px] overflow-hidden rounded-[28px] sm:min-h-[540px]",
          fill === "dark" ? "dark bg-zinc-950 text-zinc-50" : "bg-zinc-100 text-zinc-900",
        )}
      >
        {view === "preview" ? (
          <div key={replayKey} className="absolute inset-0 flex items-center justify-center p-6">
            {playground.render(values, fill)}
          </div>
        ) : (
          <pre className="absolute inset-0 overflow-auto p-6 pt-16 font-mono text-[13px] leading-relaxed">
            <code>{snippet}</code>
          </pre>
        )}

        <div className="absolute left-3 top-3 z-10">
          <div
            className={cn(
              "flex items-center gap-0.5 rounded-full p-0.5 shadow-sm backdrop-blur-md",
              fill === "dark" ? "bg-zinc-900/80" : "bg-white/80",
            )}
          >
            {(["preview", "code"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => (v === "code" && locked ? requestUpgrade(name) : setView(v))}
                className={cn(
                  "h-7 rounded-full px-3 text-xs capitalize transition-colors",
                  view === v
                    ? fill === "dark"
                      ? "bg-white text-zinc-900"
                      : "bg-zinc-900 text-white"
                    : fill === "dark"
                      ? "text-zinc-400 hover:text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-900",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {view === "preview" && (
          <button
            type="button"
            onClick={() => setReplayKey((k) => k + 1)}
            aria-label="Replay animation"
            className={cn(
              "absolute bottom-3 right-3 z-10 grid size-9 place-items-center rounded-full shadow-sm backdrop-blur-md transition",
              fill === "dark"
                ? "bg-zinc-900/80 text-zinc-100 hover:bg-zinc-800"
                : "bg-white/80 text-zinc-900 hover:bg-white",
            )}
          >
            <Play className="size-3.5 fill-current" />
          </button>
        )}
      </div>

      {/* Panel */}
      <aside className="flex flex-col rounded-[24px] border border-border/70 bg-card p-4 lg:sticky lg:top-20 lg:self-start">
        <div>
          <h2 className="text-[15px] font-medium text-foreground">{name}</h2>
          <p className="mt-1.5 line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <ProLock locked={locked} name={name} label="Edit it with Pro" className="mt-1 rounded-2xl">
        {playground.lightOnly ? null : (
          <div className="mt-5 flex items-center justify-between">
            <span className="text-[13px] text-foreground/75">Fill</span>
            <Segmented label="Fill" options={["light", "dark"] as const} value={fill} onChange={setFill} />
          </div>
        )}

        <div className="mt-3 space-y-2">
          {playground.controls.map((control) => (
            <ControlRow
              key={control.prop}
              control={control}
              value={values[control.prop]}
              onChange={(v) => setValues((prev) => ({ ...prev, [control.prop]: v }))}
            />
          ))}
        </div>

        </ProLock>

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={() => setValues(initialValues(playground.controls))}
            disabled={!isDirty}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-border text-sm text-foreground transition hover:bg-foreground/[0.04] disabled:pointer-events-none disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={copy}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-foreground text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            {locked ? <Lock className="size-3.5" /> : copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {locked ? "Copy code with Pro" : copied ? "Copied" : "Copy code"}
          </button>
        </div>
      </aside>
    </div>
  );
}
