"use client";

/**
 * The prop controls shared by the component pages and the block sections: which props get a
 * control, what each control starts at, and how a value is written back as JSX.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export const PROP_CONTROL_LIMIT = 8;

/** Longest text a playground accepts for a string prop. */
export const PROP_TEXT_LIMIT = 400;

export type PropDoc = {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
  /** Number props: the control's range. Values are clamped to it, so a playground can't be pushed into a freeze. */
  min?: number;
  max?: number;
  step?: number;
  /** Always written into copied JSX, changed or not (the component needs it). */
  required?: boolean;
  /** Documented in the props table but never given a control (URLs, file paths, start-only switches). */
  hidden?: boolean;
};

export function getEditableProps(props: PropDoc[] = []) {
  return props
    .filter((prop) => {
      if (prop.hidden) return false;
      const type = prop.type.toLowerCase();
      if (/^on[A-Z]/.test(prop.name)) return false;
      if (["className", "style", "children"].includes(prop.name) || /ClassName$/.test(prop.name)) return false;
      if (type.includes("reactnode") || type.includes("=>")) return false;
      if (type.includes("[]") || type.includes("array") || type.includes("object") || type.includes("partial<")) {
        return false;
      }
      return isBooleanProp(prop) || isNumberProp(prop) || isUnionProp(prop) || isStringProp(prop);
    })
    .slice(0, PROP_CONTROL_LIMIT);
}

export function isBooleanProp(prop: PropDoc) {
  return prop.type === "boolean";
}

export function isNumberProp(prop: PropDoc) {
  return prop.type === "number";
}

export function isStringProp(prop: PropDoc) {
  return prop.type === "string" || prop.type === "string | undefined";
}

export function isUnionProp(prop: PropDoc) {
  return /"[^"]+"/.test(prop.type) && prop.type.includes("|");
}

export function unionOptions(type: string) {
  return [...type.matchAll(/"([^"]+)"/g)].map((match) => match[1]).slice(0, 6);
}

export function cleanDefaultValue(prop: PropDoc) {
  if (!prop.defaultValue) {
    if (isBooleanProp(prop)) return false;
    if (isNumberProp(prop)) return 0;
    const option = unionOptions(prop.type)[0];
    return option ?? "";
  }

  const value = prop.defaultValue.trim();
  if (isBooleanProp(prop)) return value === "true";
  if (isNumberProp(prop)) return Number.parseFloat(value) || 0;
  const quoted = value.match(/^"([\s\S]*)"$/);
  return quoted?.[1] ?? value;
}

export function propValueToCode(value: unknown, prop: PropDoc) {
  if (isBooleanProp(prop)) return value ? `{true}` : `{false}`;
  if (isNumberProp(prop)) return `{${Number(value)}}`;
  return JSON.stringify(String(value));
}

/** Keep a number inside the prop's declared range (NaN falls back to the minimum). */
export function clampNumber(prop: PropDoc, value: number) {
  const min = prop.min ?? Number.NEGATIVE_INFINITY;
  const max = prop.max ?? Number.POSITIVE_INFINITY;
  if (!Number.isFinite(value)) return Number.isFinite(min) ? min : 0;
  return Math.min(max, Math.max(min, value));
}

export function PropControl({ prop, value, onChange }: { prop: PropDoc; value: unknown; onChange: (value: unknown) => void }) {
  const id = React.useId();
  const head = (
    <div className="min-w-0">
      <label htmlFor={id} className="block truncate font-mono text-[13px] font-semibold text-foreground">
        {prop.name}
      </label>
      <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted-foreground">{prop.description}</p>
    </div>
  );
  const box = "rounded-[20px] bg-card p-4 ring-1 ring-border";

  if (isBooleanProp(prop)) {
    return (
      <div className={cn(box, "flex items-start justify-between gap-3")}>
        {head}
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value ? "bg-foreground" : "bg-muted")}
        >
          <span className={cn("absolute top-1/2 size-4 -translate-y-1/2 rounded-full bg-white shadow transition-[left]", value ? "left-6" : "left-1")} />
        </button>
      </div>
    );
  }

  if (isUnionProp(prop)) {
    return (
      <div className={box}>
        {head}
        <div id={id} role="radiogroup" aria-label={prop.name} className="mt-3 flex flex-wrap gap-1.5">
          {unionOptions(prop.type).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={value === option}
              onClick={() => onChange(option)}
              className={cn(
                "rounded-full px-3 py-1 text-[12.5px] font-medium transition-colors",
                value === option ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-accent",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (isNumberProp(prop)) {
    return (
      <div className={box}>
        <div className="flex items-start justify-between gap-3">
          {head}
          <input
            id={id}
            type="number"
            value={Number(value)}
            min={prop.min}
            max={prop.max}
            step={prop.step}
            onChange={(event) => onChange(clampNumber(prop, Number(event.target.value)))}
            className="h-9 w-20 shrink-0 rounded-lg bg-muted px-2 font-mono text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <input
          type="range"
          aria-label={`${prop.name} slider`}
          min={prop.min ?? 0}
          max={prop.max ?? Math.max(Number(value) * 2 || 10, 10)}
          step={prop.step ?? (Number(value) % 1 === 0 ? 1 : 0.1)}
          value={Number(value)}
          onChange={(event) => onChange(clampNumber(prop, Number(event.target.value)))}
          className="mt-3 w-full accent-[#1d1d1f] dark:accent-white"
        />
      </div>
    );
  }

  const isColor = prop.name.toLowerCase().includes("color") || String(value).startsWith("#");
  return (
    <div className={box}>
      {head}
      <div className="mt-3 flex gap-2">
        {isColor && /^#[0-9a-fA-F]{6}$/.test(String(value)) ? (
          <input
            type="color"
            aria-label={`${prop.name} colour`}
            value={String(value)}
            onChange={(event) => onChange(event.target.value)}
            className="h-9 w-10 shrink-0 cursor-pointer rounded-lg bg-muted p-1"
          />
        ) : null}
        <input
          id={id}
          type="text"
          maxLength={PROP_TEXT_LIMIT}
          value={String(value)}
          onChange={(event) => onChange(event.target.value.slice(0, PROP_TEXT_LIMIT))}
          className="h-9 min-w-0 flex-1 rounded-lg bg-muted px-3 text-[13px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

