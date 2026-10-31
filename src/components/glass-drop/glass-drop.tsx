"use client";

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type DragEvent } from "react";
import { motion } from "framer-motion";
import { LiquidGlassLogo, type LiquidGlassLogoHandle } from "./liquid-glass-logo";
import {
  liquidGlassLogoDuration,
  liquidGlassLogoThemes,
  type LiquidGlassLogoTuning,
} from "./liquid-glass-logo-renderer";

// Glass Drop wraps the ReactDrops liquid glass logo renderer (liquid-glass-logo.tsx,
// liquid-glass-logo-renderer.ts and liquid-glass-logo-shaders.ts, which keep their ReactDrops
// license header). This file adds the three looks, the ending and theme pickers, "use your logo",
// drag and drop, and click to replay.

export type GlassDropEnding = "logo" | "logo-text";
export type GlassDropTheme = "dark" | "light" | "blue";

/** When each ending is finished, in seconds at speed 1. The "logo" run stops at 1.8s. */
const FINISH: Record<GlassDropEnding, number> = { logo: 1.8, "logo-text": liquidGlassLogoDuration };

type Look = {
  label: string;
  dark: boolean;
  /** Which of the renderer's two base themes this builds on. */
  base: "dark" | "light";
  colors: Partial<LiquidGlassLogoTuning>;
  /** A CSS background laid over the flat page colour, for looks that are not one colour. */
  backdrop?: string;
};

const THEMES: Record<GlassDropTheme, Look> = {
  dark: { label: "Dark", dark: true, base: "dark", colors: liquidGlassLogoThemes.dark },
  light: { label: "Light", dark: false, base: "light", colors: liquidGlassLogoThemes.light },
  // The renderer reads the page colour to decide how the glass sits on it, so the flat colour
  // stays a deep navy and the gradient is only painted over it.
  blue: {
    label: "Blue",
    dark: true,
    base: "dark",
    colors: { logoColor: "#ffffff", textColor: "#e6efff", tileColor: "#0a1c4a", background: "#050f2b" },
    backdrop: "radial-gradient(60% 70% at 50% 50%, #1b2a6e 0%, #0d1540 50%, #04061a 100%)",
  },
};

/** The Nexus UI mark, inked to match the theme. Used until you pass `logoSrc` or upload a file. */
function nexusMark(ink: string) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="${ink}">` +
    `<path d="M50 53V12M50 53L14 74M50 53L86 74" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="round"/>` +
    `<circle cx="50" cy="12" r="7"/><circle cx="14" cy="74" r="7"/><circle cx="86" cy="74" r="7"/>` +
    `<circle cx="50" cy="53" r="11.5"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Glass Drop: a logo intro made of liquid glass. A droplet lands as a bubble that magnifies your
 * logo, swells into a glass icon whose walls bend the logo out to the rim and split the light into
 * colour, then clears to the logo at full size. The "logo and name" ending then drops a second
 * ball that opens out over your name. Three looks: dark, light and blue. Drop any SVG or PNG on
 * it and it uses that. Plays in view; click to replay.
 */
export function GlassDrop({
  logoSrc,
  name = "Nexus UI",
  ending: endingProp = "logo",
  theme: themeProp = "dark",
  tint = false,
  depth = 2.9,
  height = 460,
  loop = false,
  autoplay = true,
  controls = true,
  tuning,
  className = "",
}: {
  /** an SVG or PNG to use instead of the Nexus UI mark. A file on another site needs CORS headers. */
  logoSrc?: string;
  /** the name revealed by the logo-text ending */
  name?: string;
  /** "logo" ends on your logo alone; "logo-text" goes on to reveal your name beside it */
  ending?: GlassDropEnding;
  /** the stage and the glass: dark, light or blue */
  theme?: GlassDropTheme;
  /** cast your logo in the theme's ink (white on dark, ink on light) instead of its own colours */
  tint?: boolean;
  /** how thick the glass is; deeper glass bends the logo more */
  depth?: number;
  height?: number;
  /** replay forever; otherwise it plays once when it first comes into view */
  loop?: boolean;
  /** play when it comes into view; otherwise it rests on the finished logo until you replay it */
  autoplay?: boolean;
  /** show the pickers, the upload button and the line of help under the stage */
  controls?: boolean;
  /** any other setting of the glass (dispersion, caustics, bloom, speed…), passed straight through */
  tuning?: Partial<LiquidGlassLogoTuning>;
  className?: string;
}) {
  const glass = useRef<LiquidGlassLogoHandle>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [ending, setEnding] = useState<GlassDropEnding>(endingProp);
  const [theme, setTheme] = useState<GlassDropTheme>(themeProp);
  // the pickers change the look on their own; a new prop value resets them
  const [seenEnding, setSeenEnding] = useState(endingProp);
  const [seenTheme, setSeenTheme] = useState(themeProp);
  // counts replays: 0 means it has only ever played by itself
  const [runs, setRuns] = useState(0);
  if (seenEnding !== endingProp) {
    setSeenEnding(endingProp);
    setEnding(endingProp);
    setRuns((n) => n + 1);
  }
  if (seenTheme !== themeProp) {
    setSeenTheme(themeProp);
    setTheme(themeProp);
    setRuns((n) => n + 1);
  }
  const [dropped, setDropped] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const look = THEMES[theme];
  const ink = String(look.colors.logoColor);
  const ownLogo = dropped ?? logoSrc;
  // your own logo keeps its colours unless you ask for the theme's ink; the built-in mark always takes it
  const inked = !ownLogo || tint;
  const started = autoplay || runs > 0;

  // A replay lands after the glass has applied the new look (child effects run first).
  useEffect(() => {
    if (runs > 0) glass.current?.replay();
  }, [runs]);
  // Waiting for a click: rest on the finished logo rather than an empty stage.
  useEffect(() => {
    if (!autoplay) glass.current?.seek(FINISH[endingProp]);
  }, [autoplay, endingProp]);
  useEffect(() => () => void (dropped && URL.revokeObjectURL(dropped)), [dropped]);

  const replay = () => setRuns((n) => n + 1);
  const takeFile = (file?: File | null) => {
    if (!file || !/^image\/(svg\+xml|png|jpeg|webp)$/.test(file.type)) return;
    setDropped(URL.createObjectURL(file));
    replay();
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    takeFile(e.dataTransfer.files?.[0]);
  };

  // Only keys that are set go in: an explicit undefined would overwrite the theme's colour.
  const settings: Partial<LiquidGlassLogoTuning> = {
    ...look.colors,
    ...tuning,
    logo: ownLogo ?? nexusMark(ink),
    mark: "logo",
    text: name,
    ending: ending === "logo" ? "logo" : "wordmark",
    theme: look.base,
    depth,
    loop,
    paused: !started,
    ...(inked ? {} : { logoColor: "original" }),
  };
  const backdrop: CSSProperties = look.backdrop ? { background: look.backdrop } : {};

  const lightUI = !look.dark;
  const pill = lightUI ? "bg-black/[.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" : "bg-white/[.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]";
  const on = lightUI ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,.12)]" : "bg-white/[.16] text-white";
  const off = lightUI ? "bg-transparent text-[#1d1d1f]/60 hover:text-[#1d1d1f]" : "bg-transparent text-white/60 hover:text-white";

  return (
    <div className={`flex w-full max-w-[1000px] flex-col gap-3 ${className}`}>
      <div
        onClick={replay}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="relative w-full cursor-pointer overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
        style={{ height }}
      >
        <LiquidGlassLogo
          ref={glass}
          {...settings}
          height="100%"
          style={{ minHeight: 0, ...backdrop }}
          aria-label={`The ${name} logo forming out of liquid glass. Click to replay.`}
        />
        {dragOver && (
          <div className={`pointer-events-none absolute inset-3 flex items-center justify-center rounded-[18px] border-2 border-dashed text-[14px] font-medium ${lightUI ? "border-black/25 text-[#1d1d1f]" : "border-white/35 text-white"}`}>
            Drop an SVG or PNG to use it as the logo
          </div>
        )}
        {controls && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className={`flex rounded-full p-1 text-[12.5px] font-medium ${pill}`} role="radiogroup" aria-label="Ending">
              {(
                [
                  ["logo", "Logo"],
                  ["logo-text", "Logo and name"],
                ] as [GlassDropEnding, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={ending === k}
                  onClick={() => {
                    setEnding(k);
                    replay();
                  }}
                  className={`h-7 rounded-full border-0 px-3 outline-none transition-colors [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${ending === k ? on : off}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex rounded-full p-1 text-[12.5px] font-medium ${pill}`} role="radiogroup" aria-label="Theme">
                {(Object.keys(THEMES) as GlassDropTheme[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={theme === k}
                    onClick={() => {
                      setTheme(k);
                      replay();
                    }}
                    className={`h-7 rounded-full border-0 px-3 outline-none transition-colors [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${theme === k ? on : off}`}
                  >
                    {THEMES[k].label}
                  </button>
                ))}
              </div>
              <input ref={fileInput} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} onChange={(e: ChangeEvent<HTMLInputElement>) => takeFile(e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={`h-9 rounded-full border-0 px-4 text-[12.5px] font-medium outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${pill} ${lightUI ? "text-[#1d1d1f]" : "text-white"}`}
              >
                {dropped ? "Change logo" : "Use your logo"}
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={replay}
                className={`h-9 rounded-full border-0 px-4 text-[12.5px] font-medium outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${lightUI ? "bg-[#1d1d1f] text-white" : "bg-white text-black"}`}
              >
                Replay
              </motion.button>
            </div>
          </div>
        )}
      </div>
      {controls && <p className="m-0 px-1 text-[12.5px] text-[#86868b]">Plays when it comes into view. Click to replay, or drop in any SVG or PNG.</p>}
    </div>
  );
}

export default GlassDrop;
