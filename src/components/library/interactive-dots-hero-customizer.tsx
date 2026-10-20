"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { InteractiveDots, type InteractiveDotsMode } from "@/components/interactive-dots";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────────────────
 * Shared pieces for the background hero customizers (dots, waves, particles).
 * ────────────────────────────────────────────────────────────────────────── */

const SPRING_UI = { type: "spring", stiffness: 460, damping: 34 } as const;
const SPRING_SOFT = { type: "spring", stiffness: 240, damping: 30 } as const;

function subscribeToThemeClass(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** True while `<html>` carries the `.dark` class. Canvas effects need real colours, not CSS variants. */
export function useIsDarkTheme() {
  return React.useSyncExternalStore(
    subscribeToThemeClass,
    () => document.documentElement.classList.contains("dark"),
    () => false,
  );
}

const RISE: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: SPRING_SOFT },
};
const FADE: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export function HeroCopy({
  eyebrow,
  title,
  body,
  primary,
  secondary,
  align = "bottom",
  className,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primary: string;
  secondary: string;
  align?: "bottom" | "center";
  className?: string;
}) {
  const reduce = useReducedMotion() === true;
  const rise = reduce ? FADE : RISE;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      className={cn(
        "pointer-events-none absolute inset-x-0 flex flex-col px-6 sm:px-10 lg:pr-[360px] lg:pl-14",
        "bottom-0 pb-8 sm:pb-12",
        align === "bottom" ? "lg:pb-14" : "lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:pb-0",
        className,
      )}
    >
      <motion.p
        variants={rise}
        className="text-[15px] font-semibold tracking-[-0.01em] text-[#6e6e73] dark:text-[#a1a1a6] sm:text-[17px]"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        variants={rise}
        className="mt-2 max-w-[17ch] text-balance text-[36px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[48px] lg:text-[56px]"
      >
        {title}
      </motion.h2>
      <motion.p
        variants={rise}
        className="mt-4 max-w-[44ch] text-pretty text-[17px] leading-[1.47] text-[#6e6e73] dark:text-[#a1a1a6]"
      >
        {body}
      </motion.p>
      <motion.div variants={rise} className="pointer-events-auto mt-7 flex flex-wrap items-center gap-3">
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#0077ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
        >
          {primary}
        </motion.button>
        <motion.button
          type="button"
          whileTap={reduce ? undefined : { scale: 0.97 }}
          className="inline-flex h-11 items-center rounded-full bg-[#e8e8ed]/85 px-5 text-[15px] font-medium text-[#1d1d1f] backdrop-blur-md transition-colors hover:bg-[#dcdce1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e]/85 dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]"
        >
          {secondary}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Frosted control panel. Open by default on large screens and collapsed on
 * small ones (decided in CSS, so there is no hydration flash); the header
 * toggles it either way.
 */
export function HeroControlPanel({
  title = "Customize",
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion() === true;
  const bodyId = React.useId();
  const [open, setOpen] = React.useState<boolean | null>(null);

  const toggle = () => {
    const current = open ?? window.matchMedia("(min-width: 1024px)").matches;
    setOpen(!current);
  };

  const body = (
    <div className="min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 [scrollbar-width:thin]">
      <div className="space-y-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.08]">{children}</div>
    </div>
  );

  return (
    <div
      className={cn(
        "absolute inset-x-4 top-4 z-20 flex max-h-[calc(100%-2rem)] flex-col overflow-hidden rounded-[18px] bg-white/70 backdrop-blur-xl backdrop-saturate-150",
        "shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_16px_40px_-16px_rgba(0,0,0,.28)] dark:bg-[#1c1c1e]/70 dark:shadow-[0_0_0_.5px_rgba(255,255,255,.14),0_16px_40px_-16px_rgba(0,0,0,.7)]",
        "sm:left-auto sm:w-[300px]",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggle}
        aria-controls={bodyId}
        aria-expanded={open ?? undefined}
        className="flex shrink-0 items-center justify-between gap-3 rounded-[18px] px-4 py-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        <span className="min-w-0">
          <span className="block text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
          {subtitle ? (
            <span className="block truncate text-[12px] text-[#86868b] dark:text-[#98989d]">{subtitle}</span>
          ) : null}
        </span>
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-black/[0.05] text-[#6e6e73] dark:bg-white/[0.08] dark:text-[#a1a1a6]">
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2}
            className={cn(
              "size-3.5 transition-transform duration-300",
              open === null ? "lg:rotate-180" : open ? "rotate-180" : "rotate-0",
            )}
          />
        </span>
      </button>

      {open === null ? (
        <div id={bodyId} className="hidden min-h-0 flex-col lg:flex">
          {body}
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              key="body"
              id={bodyId}
              className="flex min-h-0 flex-col overflow-hidden"
              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={SPRING_SOFT}
            >
              {body}
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  );
}

export function PanelSegmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  const id = React.useId();
  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 text-[12px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">
        {label}
      </p>
      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className="grid auto-cols-fr grid-flow-col rounded-[10px] bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative h-7 rounded-[7px] px-2 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3]",
                selected ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
              )}
            >
              {selected ? (
                <motion.span
                  layoutId={`${id}-pill`}
                  transition={SPRING_UI}
                  className="absolute inset-0 rounded-[7px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
                />
              ) : null}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PanelSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <label className={cn("block transition-opacity", disabled && "opacity-40")}>
      <span className="flex items-center justify-between gap-4 text-[12px]">
        <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{label}</span>
        <span className="tabular-nums text-[#86868b] dark:text-[#98989d]">{Number(value.toFixed(2))}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
        className={cn(
          "mt-1 block h-5 w-full cursor-pointer appearance-none rounded-full bg-transparent disabled:cursor-not-allowed",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
          "[--track:#dcdce1] dark:[--track:#48484a]",
          "[&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:[background:linear-gradient(to_right,#0071e3_var(--fill),var(--track)_var(--fill))]",
          "[&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:size-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,.28),0_0_0_.5px_rgba(0,0,0,.08)]",
          "[&::-moz-range-track]:h-1 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-[var(--track)]",
          "[&::-moz-range-progress]:h-1 [&::-moz-range-progress]:rounded-full [&::-moz-range-progress]:bg-[#0071e3]",
          "[&::-moz-range-thumb]:size-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_1px_4px_rgba(0,0,0,.28),0_0_0_.5px_rgba(0,0,0,.08)]",
        )}
      />
    </label>
  );
}

export function PanelSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-3">
      <span id={`${id}-label`} className="text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[2px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
          checked ? "justify-end bg-[#34c759]" : "justify-start bg-[#dcdce1] dark:bg-[#48484a]",
        )}
      >
        <motion.span
          layout
          transition={SPRING_UI}
          className="size-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25),0_0_0_.5px_rgba(0,0,0,.04)]"
        />
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Interactive dots hero
 * ────────────────────────────────────────────────────────────────────────── */

type DotsSwatch = { dotColor: string; activeDotColor: string; lineColor: string; backgroundColor: string };

const PRESETS = [
  {
    name: "Graphite",
    light: { dotColor: "rgba(29, 29, 31, 0.22)", activeDotColor: "#1d1d1f", lineColor: "rgba(29, 29, 31, 0.55)", backgroundColor: "#f5f5f7" },
    dark: { dotColor: "rgba(245, 245, 247, 0.24)", activeDotColor: "#ffffff", lineColor: "rgba(245, 245, 247, 0.6)", backgroundColor: "#000000" },
  },
  {
    name: "Silver",
    light: { dotColor: "rgba(134, 134, 139, 0.32)", activeDotColor: "#6e6e73", lineColor: "rgba(134, 134, 139, 0.55)", backgroundColor: "#f5f5f7" },
    dark: { dotColor: "rgba(152, 152, 157, 0.3)", activeDotColor: "#d1d1d6", lineColor: "rgba(161, 161, 166, 0.5)", backgroundColor: "#000000" },
  },
  {
    name: "Blue",
    light: { dotColor: "rgba(0, 113, 227, 0.2)", activeDotColor: "#0071e3", lineColor: "rgba(0, 113, 227, 0.5)", backgroundColor: "#f5f5f7" },
    dark: { dotColor: "rgba(41, 151, 255, 0.28)", activeDotColor: "#2997ff", lineColor: "rgba(41, 151, 255, 0.6)", backgroundColor: "#000000" },
  },
] as const satisfies ReadonlyArray<{ name: string; light: DotsSwatch; dark: DotsSwatch }>;

type PresetName = (typeof PRESETS)[number]["name"];

const PRESET_OPTIONS = PRESETS.map((preset) => ({ value: preset.name, label: preset.name }));
const MODE_OPTIONS = [
  { value: "dots", label: "Dots" },
  { value: "lines", label: "Lines" },
] as const satisfies ReadonlyArray<{ value: InteractiveDotsMode; label: string }>;

export function InteractiveDotsHeroCustomizer() {
  const isDark = useIsDarkTheme();
  const [mode, setMode] = React.useState<InteractiveDotsMode>("lines");
  const [dotSize, setDotSize] = React.useState(2);
  const [dotSpacing, setDotSpacing] = React.useState(30);
  const [interactionRadius, setInteractionRadius] = React.useState(130);
  const [repulsionStrength, setRepulsionStrength] = React.useState(48);
  const [lineDistance, setLineDistance] = React.useState(64);
  const [lineOpacity, setLineOpacity] = React.useState(0.3);
  const [presetName, setPresetName] = React.useState<PresetName>("Graphite");
  const preset = PRESETS.find((item) => item.name === presetName) ?? PRESETS[0];
  const swatch = isDark ? preset.dark : preset.light;

  return (
    <div className="relative h-full min-h-[560px] w-full overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <InteractiveDots
        mode={mode}
        dotSize={dotSize}
        dotSpacing={dotSpacing}
        dotColor={swatch.dotColor}
        activeDotColor={swatch.activeDotColor}
        lineColor={swatch.lineColor}
        backgroundColor={swatch.backgroundColor}
        interactionRadius={interactionRadius}
        repulsionStrength={repulsionStrength}
        lineDistance={lineDistance}
        lineOpacity={lineOpacity}
        showToggle={false}
        className="absolute inset-0 h-full min-h-0 rounded-none border-0"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#f5f5f7] via-[#f5f5f7]/80 to-transparent dark:from-black dark:via-black/75"
      />

      <HeroCopy
        eyebrow="Fieldwork 2.0"
        title="See where your users actually look."
        body="Fieldwork maps attention across every page, then tells you which part of the layout is doing the work."
        primary="Start free trial"
        secondary="Watch the demo"
      />

      <HeroControlPanel subtitle="Move the pointer over the grid.">
        <PanelSegmented label="Style" options={MODE_OPTIONS} value={mode} onChange={setMode} />
        <PanelSegmented label="Color" options={PRESET_OPTIONS} value={presetName} onChange={setPresetName} />
        <PanelSlider label="Dot size" value={dotSize} min={1} max={6} step={0.2} onChange={setDotSize} />
        <PanelSlider label="Dot spacing" value={dotSpacing} min={18} max={54} step={2} onChange={setDotSpacing} />
        <PanelSlider label="Interaction radius" value={interactionRadius} min={70} max={220} step={5} onChange={setInteractionRadius} />
        <PanelSlider label="Repulsion strength" value={repulsionStrength} min={16} max={90} step={2} onChange={setRepulsionStrength} />
        <PanelSlider label="Line distance" value={lineDistance} min={36} max={120} step={2} onChange={setLineDistance} disabled={mode === "dots"} />
        <PanelSlider label="Line opacity" value={lineOpacity} min={0.08} max={0.8} step={0.02} onChange={setLineOpacity} disabled={mode === "dots"} />
      </HeroControlPanel>
    </div>
  );
}
