"use client";

import * as React from "react";
import { SquigglyDrinksHeadline, SquigglyText } from "./squiggly-text";
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
      <div className="flex items-center justify-between gap-3">
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
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
      />
    </div>
  );
}

export function SquigglyTextDemo() {
  const [steps, setSteps] = React.useState(5);
  const [stepDuration, setStepDuration] = React.useState(80);
  const [scaleA, setScaleA] = React.useState(6);
  const [scaleB, setScaleB] = React.useState(8);
  const [baseFrequency, setBaseFrequency] = React.useState(0.02);
  const [numOctaves, setNumOctaves] = React.useState(3);
  const [tupleScale, setTupleScale] = React.useState(true);

  const scaleProp = tupleScale ? ([scaleA, scaleB] as const) : scaleA;

  return (
    <div className="mx-auto max-w-4xl space-y-16 px-4 py-14">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Squiggly text</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Stepped SVG displacement
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Multiple <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">feTurbulence</code>{" "}
          presets cycled on a timer with a Motion-friendly cadence.
        </p>
      </header>

      {/* Same headline structure as the public demo */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950 px-6 py-20 shadow-2xl sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.12),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(232,121,249,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <SquigglyDrinksHeadline
            steps={5}
            stepDuration={80}
            baseFrequency={0.02}
            numOctaves={3}
            headingClassName="text-neutral-50 dark:text-neutral-50"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-foreground">Playground</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Match the prop table from the reference: steps, stepDuration, scale, baseFrequency, numOctaves.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-border pb-6">
          <Switch id="sq-tuple" checked={tupleScale} onCheckedChange={setTupleScale} />
          <Label htmlFor="sq-tuple" className="text-xs font-medium">
            scale as [a, b] tuple (alternate per frame)
          </Label>
        </div>
        <div className="mt-8 grid gap-8 sm:grid-cols-2">
          <Range
            id="sq-steps"
            label="steps"
            value={steps}
            onChange={(n) => setSteps(Math.round(n))}
            min={2}
            max={12}
            step={1}
            format={(v) => String(Math.round(v))}
          />
          <Range
            id="sq-dur"
            label="stepDuration (ms)"
            value={stepDuration}
            onChange={setStepDuration}
            min={40}
            max={220}
            step={5}
            format={(v) => `${Math.round(v)}ms`}
          />
          {tupleScale ? (
            <>
              <Range
                id="sq-sa"
                label="scale[0]"
                value={scaleA}
                onChange={setScaleA}
                min={1}
                max={16}
                step={0.5}
                format={(v) => v.toFixed(1)}
              />
              <Range
                id="sq-sb"
                label="scale[1]"
                value={scaleB}
                onChange={setScaleB}
                min={1}
                max={16}
                step={0.5}
                format={(v) => v.toFixed(1)}
              />
            </>
          ) : (
            <Range
              id="sq-sc"
              label="scale (number)"
              value={scaleA}
              onChange={setScaleA}
              min={1}
              max={16}
              step={0.5}
              format={(v) => v.toFixed(1)}
            />
          )}
          <Range
            id="sq-bf"
            label="baseFrequency"
            value={baseFrequency}
            onChange={setBaseFrequency}
            min={0.008}
            max={0.06}
            step={0.001}
            format={(v) => v.toFixed(3)}
          />
          <Range
            id="sq-oct"
            label="numOctaves"
            value={numOctaves}
            onChange={(n) => setNumOctaves(Math.round(n))}
            min={1}
            max={5}
            step={1}
            format={(v) => String(Math.round(v))}
          />
        </div>

        <div
          className={cn(
            "mt-10 rounded-xl border border-dashed border-border px-6 py-12 text-center",
            "bg-gradient-to-b from-muted/40 to-background dark:from-zinc-950 dark:to-background",
          )}
        >
          <SquigglyText
            as="div"
            steps={steps}
            stepDuration={stepDuration}
            scale={scaleProp}
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            textClassName="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            <span className="block">How many ideas</span>
            <span className="block">are too many ideas?</span>
          </SquigglyText>
        </div>
      </section>
    </div>
  );
}
