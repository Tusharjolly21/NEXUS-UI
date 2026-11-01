"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { playIconSound } from "./icon-sounds";
import { NX_ICONS } from "./registry";

/**
 * A tiny live scene that shows one icon the way a real interface would use it: a button, a list row, a toast,
 * a tab, a text field... The icon plays while the pointer or keyboard focus is on the scene.
 */
export type SceneKind = "button" | "ghost" | "iconbtn" | "row" | "toast" | "tab" | "field" | "chip" | "card" | "fab" | "hero";

export type IconUse = {
  scene: SceneKind;
  /** The heading under the scene: where it goes. */
  title: string;
  /** The text shown inside the mock-up itself. */
  label: string;
  /** A second line of text inside the mock-up, when the scene has room for one. */
  sub?: string;
  /** One sentence on how and why. */
  body: string;
};

export function UseScene({ slug, accent, scene, label, sub }: { slug: string; accent: string; scene: SceneKind; label: string; sub?: string }) {
  const [hover, setHover] = React.useState(false);
  const Icon = NX_ICONS[slug];
  const on = hover;
  const ico = (size: number, extra?: string) => (
    <span className={extra} style={{ display: "inline-flex" }}>
      <Icon size={size} accent={accent} play={on} />
    </span>
  );
  const shell = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const handlers = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onFocus: () => setHover(true),
    onBlur: () => setHover(false),
    onClick: () => playIconSound(slug),
  };
  const tint = { backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`, color: accent } as React.CSSProperties;

  switch (scene) {
    case "button":
      return (
        <button type="button" {...handlers} className={cn("inline-flex h-12 items-center gap-2.5 rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform active:scale-[0.97]", shell)}>
          {ico(19)} {label}
        </button>
      );
    case "ghost":
      return (
        <button type="button" {...handlers} className={cn("inline-flex h-12 items-center gap-2.5 rounded-full bg-background px-5 text-[15px] font-medium text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.12)] transition-transform active:scale-[0.97] dark:shadow-[0_0_0_1px_rgba(255,255,255,.18)]", shell)}>
          {ico(19)} {label}
        </button>
      );
    case "iconbtn":
      return (
        <span className="relative inline-flex flex-col items-center gap-2">
          <button type="button" aria-label={label} {...handlers} className={cn("relative grid size-14 place-items-center rounded-2xl bg-background text-foreground shadow-[0_6px_20px_-8px_rgba(0,0,0,.3)] transition-transform active:scale-95", shell)}>
            {ico(26)}
            {sub ? (
              sub === "dot" ? (
                <span aria-hidden className="absolute right-3 top-3 size-2.5 rounded-full bg-[#ff375f] ring-2 ring-background" />
              ) : (
                <span aria-hidden className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-[#ff375f] px-1 text-[11px] font-semibold leading-5 text-white ring-2 ring-secondary">{sub}</span>
              )
            ) : null}
          </button>
          <span className="text-[12.5px] text-foreground/75">{label}</span>
        </span>
      );
    case "row":
      return (
        <button type="button" {...handlers} className={cn("flex w-full max-w-[320px] items-center gap-3.5 rounded-2xl bg-background p-3 text-left shadow-[0_6px_20px_-10px_rgba(0,0,0,.3)]", shell)}>
          <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={tint}>{ico(22)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[15px] font-medium text-foreground">{label}</span>
            {sub ? <span className="block truncate text-[13px] text-muted-foreground">{sub}</span> : null}
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      );
    case "toast":
      return (
        <div tabIndex={0} role="status" {...handlers} className={cn("flex w-full max-w-[330px] items-start gap-3 rounded-2xl bg-background p-3.5 shadow-[0_6px_20px_-10px_rgba(0,0,0,.3)]", shell)}>
          <span className="mt-0.5 shrink-0" style={{ color: accent }}>{ico(22)}</span>
          <span className="min-w-0">
            <span className="block text-[14.5px] font-semibold text-foreground">{label}</span>
            {sub ? <span className="block text-[13px] text-muted-foreground">{sub}</span> : null}
          </span>
        </div>
      );
    case "tab":
      return (
        <div className="flex w-full max-w-[300px] items-center justify-around rounded-[22px] bg-background px-2 py-2 shadow-[0_6px_20px_-10px_rgba(0,0,0,.3)]">
          <span aria-hidden className="flex flex-col items-center gap-1 px-3 py-1 opacity-30"><span className="size-[22px] rounded-md bg-foreground/40" /><span className="h-1.5 w-7 rounded-full bg-foreground/30" /></span>
          <button type="button" aria-label={label} {...handlers} className={cn("flex flex-col items-center gap-1 rounded-xl px-3 py-1 text-foreground", shell)}>
            {ico(24)}
            <span className="text-[11px] font-medium">{label}</span>
          </button>
          <span aria-hidden className="flex flex-col items-center gap-1 px-3 py-1 opacity-30"><span className="size-[22px] rounded-md bg-foreground/40" /><span className="h-1.5 w-7 rounded-full bg-foreground/30" /></span>
        </div>
      );
    case "field":
      return (
        <label {...handlers} className="flex h-12 w-full max-w-[310px] cursor-text items-center gap-3 rounded-2xl bg-background px-4 text-muted-foreground shadow-[0_0_0_1px_rgba(0,0,0,.1)] focus-within:shadow-[0_0_0_2px_var(--ring)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.14)]">
          {ico(20, "text-foreground")}
          <input placeholder={label} aria-label={label} className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground" />
          {sub ? <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px]">{sub}</span> : null}
        </label>
      );
    case "chip":
      return (
        <button type="button" {...handlers} className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-transform active:scale-95", shell)} style={tint}>
          {ico(17)} {label}
        </button>
      );
    case "card":
      return (
        <button type="button" {...handlers} className={cn("flex w-full max-w-[250px] flex-col items-start gap-3 rounded-[22px] bg-background p-4 text-left shadow-[0_6px_20px_-10px_rgba(0,0,0,.3)]", shell)}>
          <span className="grid size-12 place-items-center rounded-2xl" style={tint}>{ico(26)}</span>
          <span>
            <span className="block text-[15.5px] font-semibold text-foreground">{label}</span>
            {sub ? <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{sub}</span> : null}
          </span>
        </button>
      );
    case "fab":
      return (
        <button type="button" aria-label={label} {...handlers} className={cn("grid size-16 place-items-center rounded-full text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,.45)] transition-transform active:scale-95", shell)} style={{ backgroundColor: accent }}>
          <Icon size={28} accent="#ffffff" play={on} />
        </button>
      );
    case "hero":
      return (
        <div tabIndex={0} {...handlers} className={cn("flex flex-col items-center gap-3 rounded-3xl px-6 py-5 text-center", shell)}>
          <span className="text-foreground">{ico(52)}</span>
          <span>
            <span className="block text-[15.5px] font-semibold text-foreground">{label}</span>
            {sub ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{sub}</span> : null}
          </span>
        </div>
      );
  }
}
