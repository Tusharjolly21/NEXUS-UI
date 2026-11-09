"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArcSpinnerIcon } from "@/components/nx-icons/icons/arc-spinner";
import { BarChartHorizontalIcon } from "@/components/nx-icons/icons/bar-chart-horizontal";
import { CheckCircleIcon } from "@/components/nx-icons/icons/check-circle";
import { CheckIcon } from "@/components/nx-icons/icons/check";
import { CopyIcon } from "@/components/nx-icons/icons/copy";
import { FileCodeIcon } from "@/components/nx-icons/icons/file-code";
import { GridIcon } from "@/components/nx-icons/icons/grid";
import { KeyIcon } from "@/components/nx-icons/icons/key";
import { LayersIcon } from "@/components/nx-icons/icons/layers";
import { LockIcon } from "@/components/nx-icons/icons/lock";
import { MessageIcon } from "@/components/nx-icons/icons/message";
import { PackageIcon } from "@/components/nx-icons/icons/package";
import { PlugIcon } from "@/components/nx-icons/icons/plug";
import { RefreshIcon } from "@/components/nx-icons/icons/refresh";
import { SearchIcon } from "@/components/nx-icons/icons/search";
import { ShieldIcon } from "@/components/nx-icons/icons/shield";
import { StampIcon } from "@/components/nx-icons/icons/stamp";
import { TagIcon } from "@/components/nx-icons/icons/tag";
import { UnlockIcon } from "@/components/nx-icons/icons/unlock";

/**
 * The icons on the MCP page are Nexus UI's own animated icons, not a stock set. Only the ones this page uses are
 * imported, so the page does not pull in the whole icon library.
 */
const ICONS = {
  "arc-spinner": ArcSpinnerIcon,
  "bar-chart-horizontal": BarChartHorizontalIcon,
  "check-circle": CheckCircleIcon,
  check: CheckIcon,
  copy: CopyIcon,
  "file-code": FileCodeIcon,
  grid: GridIcon,
  key: KeyIcon,
  layers: LayersIcon,
  lock: LockIcon,
  message: MessageIcon,
  package: PackageIcon,
  plug: PlugIcon,
  refresh: RefreshIcon,
  search: SearchIcon,
  shield: ShieldIcon,
  stamp: StampIcon,
  tag: TagIcon,
  unlock: UnlockIcon,
} as const;

export type McpIconName = keyof typeof ICONS;

/** Each icon's own accent colour, the one coloured detail of the Spark look (the same ones the Icons page uses). */
const ACCENTS: Record<McpIconName, string> = {
  "arc-spinner": "#0a84ff",
  "bar-chart-horizontal": "#ff9f0a",
  "check-circle": "#30d158",
  check: "#30d158",
  copy: "#30d158",
  "file-code": "#40c8e0",
  grid: "#0a84ff",
  key: "#ff9f0a",
  layers: "#5e5ce6",
  lock: "#30d158",
  message: "#0a84ff",
  package: "#c2763b",
  plug: "#ffd60a",
  refresh: "#30d158",
  search: "#0a84ff",
  shield: "#30d158",
  stamp: "#ff453a",
  tag: "#ff375f",
  unlock: "#30d158",
};

/**
 * The tile behind an icon, in the site's own ink and paper: black with a white icon in light mode, white with a
 * black icon in dark mode. The icon's accent is the only colour on it.
 */
export const ICON_TILE = "size-12 rounded-2xl bg-foreground text-background shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]";

type McpIconProps = {
  name: McpIconName;
  size?: number;
  strokeWidth?: number;
  /** Colour of the icon's accent details. Left out, the icon's own accent colour is used. */
  accent?: string;
  /** Classes for a rounded tile drawn behind the icon. Left out, the icon sits bare. */
  tile?: string;
  className?: string;
  /** Forces the icon to play (true) or rest (false), for an icon whose state is decided by its parent, such as a copy button. */
  play?: boolean;
};

/**
 * One animated icon that plays when its card is hovered or focused, and once when it first scrolls into view, so
 * it also moves on a phone where nothing hovers. The card is the nearest ancestor marked `data-icon-card`; with
 * none, the icon itself is the hover target. With reduced motion the icons stay still.
 */
export function McpIcon({ name, size = 24, strokeWidth = 2, accent, tile, className, play }: McpIconProps) {
  const Icon = ICONS[name];
  const ref = React.useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const [hot, setHot] = React.useState(false);
  const [introDone, setIntroDone] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const card = el.closest<HTMLElement>("[data-icon-card]") ?? el;
    const on = () => setHot(true);
    const off = () => setHot(false);
    card.addEventListener("pointerenter", on);
    card.addEventListener("pointerleave", off);
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
    return () => {
      card.removeEventListener("pointerenter", on);
      card.removeEventListener("pointerleave", off);
      card.removeEventListener("focusin", on);
      card.removeEventListener("focusout", off);
    };
  }, []);

  // The intro play lasts 1.8 s from the moment the icon first scrolls into view.
  React.useEffect(() => {
    if (!seen) return;
    const t = setTimeout(() => setIntroDone(true), 1800);
    return () => clearTimeout(t);
  }, [seen]);

  const intro = seen && !introDone && !reduce;
  const playing = play ?? (hot || intro);

  return (
    <span ref={ref} aria-hidden className={cn("relative inline-grid shrink-0 place-items-center", tile, className)}>
      <Icon size={size} strokeWidth={strokeWidth} accent={accent ?? ACCENTS[name]} play={playing} />
    </span>
  );
}
