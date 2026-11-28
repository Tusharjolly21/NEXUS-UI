"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { CardCarousel3D } from "@/components/card-carousel-3d";
import { cn } from "@/lib/utils";

function ControlSlider({
  label, value, min, max, step = 1,
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400">{label}</span>
        <span className="font-mono text-[11px] text-zinc-300">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-600 accent-white"
      />
    </div>
  );
}

export function PreviewCardCarousel3D({ compact = true }: { compact?: boolean } = {}) {
  const [radius, setRadius]           = React.useState(380);
  const [itemWidth, setItemWidth]     = React.useState(280);
  const [itemHeight, setItemHeight]   = React.useState(380);
  const [perspective, setPerspective] = React.useState(1000);
  const [autoRotate, setAutoRotate]   = React.useState(true);
  const [autoSpeed, setAutoSpeed]     = React.useState(1);
  const [scrollSpeed, setScrollSpeed] = React.useState(1);
  const [direction, setDirection]     = React.useState<"cw" | "ccw">("cw");

  if (compact) {
    return (
      <div className="pointer-events-none h-[420px] overflow-hidden">
        <CardCarousel3D radius={400} itemWidth={220} itemHeight={300} perspective={900} autoRotate autoSpeed={0.8} />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Carousel fills remaining space */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <CardCarousel3D
          radius={radius}
          itemWidth={itemWidth}
          itemHeight={itemHeight}
          perspective={perspective}
          autoRotate={autoRotate}
          autoSpeed={autoSpeed}
          scrollSpeed={scrollSpeed}
          direction={direction}
        />
      </div>

      {/* Control panel pinned to bottom */}
      <div className="shrink-0 border-t border-zinc-700/60 bg-zinc-900 px-6 py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
          {/* 3D Layout */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              3D Layout
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <ControlSlider label="Radius" value={radius} min={200} max={1000} step={10} onChange={setRadius} />
              <ControlSlider label="Item Width" value={itemWidth} min={160} max={500} step={10} onChange={setItemWidth} />
              <ControlSlider label="Item Height" value={itemHeight} min={200} max={600} step={10} onChange={setItemHeight} />
              <ControlSlider label="Perspective" value={perspective} min={500} max={3000} step={50} onChange={setPerspective} />
            </div>
          </div>

          {/* Rotation */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              Rotation
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {/* Auto Rotate toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Auto Rotate</span>
                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    autoRotate ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span
                    className={cn(
                      "size-5 rounded-full bg-zinc-900 shadow transition-transform",
                      autoRotate ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>

              <ControlSlider label="Auto Speed" value={autoSpeed} min={0.1} max={5} step={0.1} onChange={setAutoSpeed} />
              <ControlSlider label="Scroll Speed" value={scrollSpeed} min={0.1} max={5} step={0.1} onChange={setScrollSpeed} />

              {/* Direction */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Direction</span>
                <div className="mt-0.5 flex overflow-hidden rounded-lg border border-zinc-600">
                  {(["cw", "ccw"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDirection(d)}
                      className={cn(
                        "flex-1 py-1 text-[11px] font-semibold transition-colors",
                        direction === d
                          ? "bg-white text-zinc-900"
                          : "text-zinc-400 hover:text-zinc-200",
                      )}
                    >
                      {d === "cw" ? "↻ CW" : "↺ CCW"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
