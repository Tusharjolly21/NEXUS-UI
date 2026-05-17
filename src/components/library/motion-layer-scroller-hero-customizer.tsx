"use client";

import * as React from "react";
import { MotionLayerScroller } from "@/components/motion-layer-scroller";
import { cn } from "@/lib/utils";

const DIRECTIONS = [
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
] as const;

const BACKGROUNDS = [
  { id: "dark", label: "Dark", color: "#05070d" },
  { id: "deep", label: "Deep", color: "#020617" },
  { id: "midnight", label: "Midnight", color: "#0f0f1a" },
] as const;

export function MotionLayerScrollerHeroCustomizer() {
  const [direction, setDirection] = React.useState<"vertical" | "horizontal">("vertical");
  const [bg, setBg] = React.useState("dark");
  const [showGrid, setShowGrid] = React.useState(true);
  const [showGlow, setShowGlow] = React.useState(true);
  const [scrollHeight, setScrollHeight] = React.useState(500);

  return (
    <div className="flex h-full flex-col gap-6 p-6 lg:flex-row">
      {/* Preview */}
      <div className="relative flex-1 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div className="relative h-full">
          <MotionLayerScroller
            direction={direction}
            scrollHeight={scrollHeight}
            backgroundColor={BACKGROUNDS.find((b) => b.id === bg)?.color ?? "#05070d"}
            showGrid={showGrid}
            showGlow={showGlow}
            heading="Motion that moves people"
            description="A scroll-driven 3D layered hero section with parallax depth and smooth motion."
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-950/80 p-4 lg:w-52">
        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Direction</p>
          <div className="flex flex-col gap-2">
            {DIRECTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDirection(d.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                  direction === d.id
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Background</p>
          <div className="flex flex-col gap-2">
            {BACKGROUNDS.map((b) => (
              <button
                key={b.id}
                onClick={() => setBg(b.id)}
                className={cn(
                  "w-full rounded-xl border px-3 py-2 text-left text-xs font-medium transition",
                  bg === b.id
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-white/5 bg-white/5 text-white/50 hover:border-white/10 hover:bg-white/8 hover:text-white/70",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Options</p>
          <div className="space-y-2">
            {[
              { label: "Show Grid", checked: showGrid, onChange: setShowGrid },
              { label: "Show Glow", checked: showGlow, onChange: setShowGlow },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                <button
                  type="button"
                  role="switch"
                  aria-checked={opt.checked}
                  onClick={() => opt.onChange(!opt.checked)}
                  className={cn(
                    "relative inline-flex h-5 w-8 items-center rounded-full border transition-colors",
                    opt.checked
                      ? "border-cyan-500/50 bg-cyan-500/20"
                      : "border-white/10 bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "inline-block size-3 rounded-full transition-transform",
                      opt.checked ? "translate-x-4 bg-cyan-400" : "translate-x-1 bg-white/30",
                    )}
                  />
                </button>
                <span className="text-xs text-white/50">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5" />

        <div>
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/40">Scroll Height</p>
          <input
            type="range"
            min={300}
            max={800}
            value={scrollHeight}
            onChange={(e) => setScrollHeight(Number(e.target.value))}
            className="w-full accent-cyan-400"
          />
          <p className="mt-1 text-right text-[10px] text-white/30">{scrollHeight}px</p>
        </div>
      </div>
    </div>
  );
}