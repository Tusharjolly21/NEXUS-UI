"use client";

import * as React from "react";
import Link from "next/link";
import { useInView } from "framer-motion";
import { Lock, LockOpen, PartyPopper, Search, Volume2, VolumeX, Waves } from "lucide-react";
import { Chip, ChipRail } from "@/components/site/chip-rail";
import { ICONS, ICON_CATEGORIES, type IconCategory, type IconMeta } from "@/lib/icons/catalog";
import { ProBadge, useLocked, useProAccess } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";
import { IconMaterial, type IconMaterialName } from "./icon-material";
import { CopyButton } from "./copy-button";
import { hasIconSound, isLiquidLook, playIconSound, playMaterialSound } from "./icon-sounds";
import { NX_ICONS } from "./registry";

export const MATERIALS: { id: IconMaterialName; label: string; dark?: boolean }[] = [
  { id: "line", label: "Line" },
  { id: "spark", label: "Spark" },
  { id: "neon", label: "Neon", dark: true },
  { id: "aurora", label: "Aurora" },
  { id: "chrome", label: "Chrome", dark: true },
  { id: "mercury", label: "Mercury", dark: true },
  { id: "liquid", label: "Liquid" },
  { id: "glass", label: "Glass", dark: true },
];

type Access = "all" | "free" | "pro";

/** All / Free / Pro, as a segmented control. */
function AccessSwitch({ value, onChange }: { value: Access; onChange: (v: Access) => void }) {
  const { isPro } = useProAccess();
  const counts: Record<Access, number> = { all: ICONS.length, free: ICONS.filter((i) => !i.premium).length, pro: ICONS.filter((i) => i.premium).length };
  const label: Record<Access, string> = { all: "All", free: "Free", pro: "Pro" };
  return (
    <div role="radiogroup" aria-label="Show free or Pro icons" className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
      {(["all", "free", "pro"] as const).map((a) => {
        const on = value === a;
        return (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(a)}
            className={cn(
              "inline-flex h-full items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              on ? "bg-foreground text-background" : "text-foreground/70 hover:text-foreground",
            )}
          >
            {a === "pro" ? isPro ? <LockOpen className="size-3.5" strokeWidth={2.4} aria-hidden /> : <Lock className="size-3.5" strokeWidth={2.4} aria-hidden /> : null}
            {label[a]}
            <span className={cn("tabular-nums text-[12px]", on ? "text-background/70" : "text-muted-foreground")}>{counts[a]}</span>
          </button>
        );
      })}
    </div>
  );
}

export const SWATCHES = ["#1d1d1f", "#2563eb", "#7c3aed", "#e11d48", "#f59e0b", "#059669"] as const;

/** The accent colour an icon gets under a look: its own colours for Spark and Neon, plain otherwise. */
export function accentFor(icon: IconMeta, material: IconMaterialName) {
  return material === "spark" || material === "neon" ? icon.accent : undefined;
}

/**
 * One tile. Icons that play on hover play while the pointer (or keyboard focus) is on the tile, not just on the
 * drawing; loaders loop, but only while their tile is on screen, so a page of a hundred stays light.
 * `pulse` plays the tile once after a delay (the Wave); `party` replays it every few seconds.
 */
export function IconTile({
  icon,
  material = "line",
  size = 40,
  dark = false,
  pulse,
  party = false,
  sound = false,
}: {
  icon: IconMeta;
  material?: IconMaterialName;
  size?: number;
  dark?: boolean;
  pulse?: { id: number; delay: number };
  party?: boolean;
  sound?: boolean;
}) {
  const Icon = NX_ICONS[icon.slug];
  const locked = useLocked(icon.premium);
  const ref = React.useRef<HTMLDivElement>(null);
  const near = useInView(ref, { margin: "120px" });
  const [active, setActive] = React.useState(false);
  const [burst, setBurst] = React.useState(false);
  const [bump, setBump] = React.useState(false);
  const [lap, setLap] = React.useState(0);

  // with the grid's Sound switch on, hovering a tile plays that icon's own score; a loader restarts so its sound and picture begin together
  const hear = () => {
    if (!sound) return;
    // an icon wearing Mercury, Liquid or Glass adds that look's own sound on top of its score
    if (isLiquidLook(material)) playMaterialSound(material, "hover", { force: true });
    if (!hasIconSound(icon.slug)) return;
    if (icon.kind === "loop") setLap((n) => n + 1);
    playIconSound(icon.slug, { force: true, volume: 0.85 });
  };

  const pulseId = pulse?.id ?? 0;
  const pulseDelay = pulse?.delay ?? 0;
  // the Wave: this tile plays, lifts and glows in its own colour, and a loader starts its lap over
  const isLoop = icon.kind === "loop";
  React.useEffect(() => {
    if (!pulseId) return;
    const on = window.setTimeout(() => {
      setBurst(true);
      setBump(true);
      if (isLoop) setLap((n) => n + 1);
    }, pulseDelay);
    const settle = window.setTimeout(() => setBump(false), pulseDelay + 650);
    const off = window.setTimeout(() => setBurst(false), pulseDelay + 1700);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(settle);
      window.clearTimeout(off);
    };
  }, [pulseId, pulseDelay, isLoop]);

  React.useEffect(() => {
    if (!party || !near) return;
    let off: number | undefined;
    let settle: number | undefined;
    const fire = () => {
      setBurst(true);
      setBump(true);
      if (isLoop) setLap((n) => n + 1);
      settle = window.setTimeout(() => setBump(false), 600);
      off = window.setTimeout(() => setBurst(false), 1500);
    };
    const first = window.setTimeout(fire, Math.random() * 1600);
    const id = window.setInterval(fire, 2600 + Math.random() * 900);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
      if (off !== undefined) window.clearTimeout(off);
      if (settle !== undefined) window.clearTimeout(settle);
    };
  }, [party, near, isLoop]);

  const play = icon.kind === "loop" ? near : active || burst;
  if (!Icon) return null;
  return (
    <div
      ref={ref}
      onPointerEnter={(e) => {
        setActive(true);
        // a finger landing can't start audio on iOS; a touch plays on the tap itself (onClickCapture below)
        if (e.pointerType !== "touch") hear();
      }}
      onClickCapture={(e) => {
        const native = e.nativeEvent as PointerEvent;
        if (native.pointerType === "touch" || native.pointerType === "") hear();
      }}
      onPointerLeave={() => setActive(false)}
      onFocus={() => {
        setActive(true);
        hear();
      }}
      onBlur={() => setActive(false)}
      style={bump ? { boxShadow: `0 0 0 2px ${icon.accent}66, 0 22px 44px -20px ${icon.accent}aa` } : undefined}
      className={cn(
        "group relative aspect-square rounded-[22px] transition-[transform,box-shadow,background-color] duration-300 hover:-translate-y-0.5 motion-reduce:transition-none",
        bump ? "-translate-y-2 scale-[1.05]" : "",
        dark
          ? "bg-[#17171a] shadow-[0_0_0_1px_rgba(255,255,255,.08),0_18px_36px_-28px_rgba(0,0,0,.8)] hover:shadow-[0_0_0_1px_rgba(255,255,255,.16),0_24px_44px_-26px_rgba(0,0,0,.9)]"
          : "bg-card shadow-[0_0_0_1px_rgba(0,0,0,.05),0_18px_36px_-28px_rgba(0,0,0,.35)] hover:shadow-[0_0_0_1px_rgba(0,0,0,.07),0_24px_44px_-26px_rgba(0,0,0,.4)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
      )}
    >
      <Link
        href={`/icons/${icon.slug}`}
        className="flex size-full flex-col items-center justify-center gap-4 rounded-[22px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span className={dark ? "text-[#f5f5f7]" : undefined}>
          <Icon key={lap} size={size} play={play} accent={accentFor(icon, material)} />
        </span>
        <span className={cn("text-[13px] font-medium transition-colors", dark ? "text-white/50 group-hover:text-white" : "text-muted-foreground group-hover:text-foreground")}>
          {icon.title}
        </span>
      </Link>
      {icon.premium ? <ProBadge onDark={dark} className="pointer-events-none absolute left-2.5 top-2.5 px-2 py-0.5 text-[11px]" /> : null}
      {/* one click copies this icon's whole file (a Pro icon asks to upgrade); always there on touch screens, on hover or focus elsewhere */}
      <CopyButton
        slug={icon.slug}
        name={icon.title}
        compact
        locked={locked}
        label="Copy code"
        className={cn(
          "absolute right-2.5 top-2.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
          dark ? "bg-white/10 text-white hover:bg-white/20" : "",
        )}
      />
    </div>
  );
}

export function IconGrid() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<IconCategory | "all">("all");
  const [material, setMaterial] = React.useState<IconMaterialName>("spark");
  const [color, setColor] = React.useState<string>(SWATCHES[0]);
  const [size, setSize] = React.useState(40);
  const [party, setParty] = React.useState(false);
  const [wave, setWave] = React.useState(0);
  const [cols, setCols] = React.useState(6);
  const listRef = React.useRef<HTMLDivElement>(null);
  const [sound, setSound] = React.useState(false);
  const [access, setAccess] = React.useState<Access>("all");
  // Picking Mercury, Liquid or Glass plays that look's sound (and switches the grid's Sound on, so hovering keeps it going)
  const pickLook = (id: IconMaterialName) => {
    setMaterial(id);
    if (isLiquidLook(id)) {
      setSound(true);
      playMaterialSound(id, "switch", { force: true });
    }
  };

  const dark = !!MATERIALS.find((m) => m.id === material)?.dark;

  const shown = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return ICONS.filter((i) => {
      if (category !== "all" && i.category !== category) return false;
      if (access === "free" && i.premium) return false;
      if (access === "pro" && !i.premium) return false;
      if (!q) return true;
      return i.title.toLowerCase().includes(q) || i.slug.includes(q) || i.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [query, category, access]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-[420px]">
          <span className="sr-only">Search icons</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${ICONS.length} icons`}
            className="h-12 w-full rounded-full bg-card pl-11 pr-4 text-[15px] text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.06)] outline-none placeholder:text-muted-foreground focus-visible:shadow-[0_0_0_2px_var(--ring)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
          />
        </label>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <AccessSwitch value={access} onChange={setAccess} />
        <p className="text-[14px] text-muted-foreground" aria-live="polite">
          {shown.length} of {ICONS.length} icons
        </p>
        </div>
      </div>

      <ChipRail wrap className="mt-5">
        <Chip active={category === "all"} onClick={() => setCategory("all")} className="py-1.5 text-[13px]">
          All <span className={category === "all" ? "opacity-70" : "text-muted-foreground"}>{ICONS.length}</span>
        </Chip>
        {ICON_CATEGORIES.map((c) => (
          <Chip key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)} className="py-1.5 text-[13px]">
            {c.label} <span className={cn(category === c.slug ? "opacity-70" : "text-muted-foreground")}>{ICONS.filter((i) => i.category === c.slug).length}</span>
          </Chip>
        ))}
      </ChipRail>

      {/* play with the whole set */}
      <div className="mt-5 flex flex-col gap-4 rounded-[22px] bg-card p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Look">
            <span className="mr-1 text-[13px] text-muted-foreground">Look</span>
            {MATERIALS.map((m) => (
              <Chip key={m.id} active={material === m.id} onClick={() => pickLook(m.id)} className="px-3.5 py-1.5 text-[13px]">
                {m.label}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Colour">
            <span className="mr-1 text-[13px] text-muted-foreground">Colour</span>
            {SWATCHES.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={c}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className="size-6 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.14)] outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2 aria-pressed:ring-offset-card"
                style={{ background: c }}
              />
            ))}
          </div>
          <label className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
            Size
            <input type="range" min={28} max={64} step={2} value={size} onChange={(e) => setSize(Number(e.target.value))} className="h-1.5 w-28 cursor-pointer accent-[var(--foreground)]" />
          </label>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const ul = listRef.current?.querySelector("ul");
              if (ul) setCols(Math.max(1, getComputedStyle(ul).gridTemplateColumns.split(" ").length));
              setWave((w) => w + 1);
            }}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[14px] font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <Waves className="size-4" aria-hidden /> Wave
          </button>
          <button
            type="button"
            aria-pressed={sound}
            onClick={() => setSound((v) => !v)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              sound ? "bg-[#0a84ff] text-white" : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]",
            )}
          >
            {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />} Sound
          </button>
          <button
            type="button"
            aria-pressed={party}
            onClick={() => setParty((p) => !p)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              party ? "bg-[#ff375f] text-white" : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1]",
            )}
          >
            <PartyPopper className="size-4" aria-hidden /> Party
          </button>
        </div>
      </div>

      {shown.length ? (
        <IconMaterial material={material} color={dark || color === SWATCHES[0] ? undefined : color} className="mt-6"><div ref={listRef}>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6">
            {shown.map((i, n) => (
              <li key={i.slug}>
                <IconTile icon={i} material={material} size={size} dark={dark} party={party} sound={sound} pulse={wave ? { id: wave, delay: Math.round(Math.hypot((n % cols) - (cols - 1) / 2, Math.floor(n / cols) + 0.6) * 120) } : undefined} />
              </li>
            ))}
          </ul>
        </div></IconMaterial>
      ) : (
        <p className="mt-16 text-center text-[16px] text-muted-foreground">
          No icon matches &ldquo;{query}&rdquo;. Try a broader word like &ldquo;arrow&rdquo; or &ldquo;time&rdquo;.
        </p>
      )}
    </div>
  );
}
