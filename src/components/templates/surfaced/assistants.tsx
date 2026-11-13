"use client";

import { ASSISTANT_LOGOS } from "./assistant-logos";
import { Icon } from "./ui";

/** Fallback icon and colours per assistant, used where no logo is drawn. */
export const ASSISTANTS: Record<string, { icon: string; bg: string; fg: string }> = {
  ChatGPT: {
    icon: "ph:chat-circle-dots",
    bg: "#1F2421",
    fg: "#E8F3EC",
  },
  Claude: {
    icon: "ph:asterisk",
    bg: "#C8643E",
    fg: "#FFF3EC",
  },
  Gemini: {
    icon: "ph:star-four",
    bg: "#3A4BD8",
    fg: "#EEF1FF",
  },
  Perplexity: {
    icon: "ph:hexagon",
    bg: "#1E5F63",
    fg: "#E3FAFB",
  },
  Google: {
    icon: "ph:magnifying-glass",
    bg: "#F2F2F4",
    fg: "#2A2A30",
  },
};

/** How each logo sits in its rounded tile: background, scale, and whether it fills the tile. */
const LOGO_TILES: Record<string, { bg?: string; scale: number; full?: boolean }> = {
  ChatGPT: {
    bg: "#0D0D0D",
    scale: 0.62,
  },
  Claude: {
    bg: "#FAF6F0",
    scale: 0.66,
  },
  Gemini: {
    scale: 1,
    full: true,
  },
  Google: {
    bg: "#FFFFFF",
    scale: 0.6,
  },
  Perplexity: {
    bg: "#102527",
    scale: 0.62,
  },
};

type AssistantIconProps = {
  /** assistant name, e.g. "ChatGPT" */
  n: string;
  size?: number;
  ring?: boolean;
  /** fill the parent instead of a fixed size */
  fluid?: boolean;
};

export function AssistantIcon({ n: name, size = 18, ring = false, fluid = false }: AssistantIconProps) {
  const meta = ASSISTANTS[name];
  const tile = LOGO_TILES[name];
  const logo = ASSISTANT_LOGOS[name];
  return fluid && tile && logo ? (
    <span
      className="grid size-full place-items-center overflow-hidden"
      style={{
        borderRadius: "27%",
        background: tile.bg ?? "transparent",
        boxShadow: tile.full
          ? "0 2px 8px rgba(0,0,0,.45)"
          : "inset 0 0 0 1px rgba(255,255,255,.14), 0 2px 8px rgba(0,0,0,.45)",
      }}
      title={name}
    >
      <img
        src={logo}
        alt={name}
        draggable={false}
        className="object-contain"
        style={{
          width: `${tile.scale * 100}%`,
          height: `${tile.scale * 100}%`,
        }}
      />
    </span>
  ) : tile && logo ? (
    <span
      className="inline-grid shrink-0 place-items-center overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: tile.bg ?? "transparent",
        boxShadow: tile.full
          ? ring
            ? "0 2px 8px rgba(0,0,0,.45)"
            : "none"
          : ring
            ? "inset 0 0 0 1px rgba(255,255,255,.14), 0 2px 8px rgba(0,0,0,.45)"
            : "inset 0 0 0 1px rgba(255,255,255,.1)",
      }}
      title={name}
    >
      <img
        src={logo}
        alt={name}
        draggable={false}
        className="object-contain"
        style={{
          width: size * tile.scale,
          height: size * tile.scale,
        }}
      />
    </span>
  ) : (
    <span
      className="inline-grid shrink-0 place-items-center"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: meta.bg,
        color: meta.fg,
        boxShadow: ring
          ? "inset 0 0 0 1px rgba(255,255,255,.18), 0 2px 6px rgba(0,0,0,.35)"
          : "inset 0 0 0 1px rgba(255,255,255,.1)",
      }}
      title={name}
    >
      <Icon name={meta.icon} size={Math.round(size * 0.6)} />
    </span>
  );
}
