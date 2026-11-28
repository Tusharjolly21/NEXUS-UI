"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { DraggableCardStack } from "@/components/draggable-card-stack";
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

export function PreviewDraggableCardStack({ compact = true }: { compact?: boolean } = {}) {
  const [cardWidth, setCardWidth]               = React.useState(300);
  const [cardHeight, setCardHeight]             = React.useState(420);
  const [borderRadius, setBorderRadius]         = React.useState(24);
  const [shadowStrength, setShadowStrength]     = React.useState(1);
  const [stackOffset, setStackOffset]           = React.useState(0);
  const [maxRotation, setMaxRotation]           = React.useState(14);
  const [depthScale, setDepthScale]             = React.useState(0.04);
  const [showOverlay, setShowOverlay]           = React.useState(true);
  const [hoverScale, setHoverScale]             = React.useState(1.03);
  const [transitionDuration, setTransitionDuration] = React.useState(0.25);
  const [autoPlay, setAutoPlay]                 = React.useState(false);
  const [autoInterval, setAutoInterval]         = React.useState(3000);

  if (compact) {
    return (
      <div className="pointer-events-none h-[480px] overflow-hidden">
        <DraggableCardStack />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden">
      {/* Stack fills remaining space */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <DraggableCardStack
          cardWidth={cardWidth}
          cardHeight={cardHeight}
          borderRadius={borderRadius}
          shadowStrength={shadowStrength}
          stackOffset={stackOffset}
          maxRotation={maxRotation}
          depthScale={depthScale}
          showOverlay={showOverlay}
          hoverScale={hoverScale}
          transitionDuration={transitionDuration}
          autoPlay={autoPlay}
          autoInterval={autoInterval}
        />
      </div>

      {/* Control panel */}
      <div className="shrink-0 border-t border-zinc-700/60 bg-zinc-900 px-6 py-4">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">

          {/* Card Size */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Card Size</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              <ControlSlider label="Width"         value={cardWidth}      min={160} max={500} step={10}  onChange={setCardWidth} />
              <ControlSlider label="Height"        value={cardHeight}     min={200} max={700} step={10}  onChange={setCardHeight} />
              <ControlSlider label="Radius"        value={borderRadius}   min={0}   max={48}  step={1}   onChange={setBorderRadius} />
              <ControlSlider label="Shadow"        value={shadowStrength} min={0}   max={1}   step={0.05} onChange={setShadowStrength} />
            </div>
          </div>

          {/* Stack */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Stack</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
              <ControlSlider label="Offset (px)"   value={stackOffset}   min={0}    max={30}  step={1}    onChange={setStackOffset} />
              <ControlSlider label="Max Rotation"  value={maxRotation}   min={0}    max={30}  step={1}    onChange={setMaxRotation} />
              <ControlSlider label="Depth Scale"   value={depthScale}    min={0.01} max={0.12} step={0.01} onChange={setDepthScale} />
            </div>
          </div>

          {/* Hover */}
          <div className="col-span-2 sm:col-span-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Hover & Overlay</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-4">
              {/* Show Overlay toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Show Overlay</span>
                <button
                  type="button"
                  onClick={() => setShowOverlay((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    showOverlay ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span className={cn("size-5 rounded-full bg-zinc-900 shadow transition-transform", showOverlay ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
              <ControlSlider label="Hover Scale"  value={hoverScale}         min={1}   max={1.2}  step={0.01} onChange={setHoverScale} />
              <ControlSlider label="Transition s" value={transitionDuration} min={0.05} max={1}   step={0.05} onChange={setTransitionDuration} />

              {/* Auto-play toggle */}
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-medium text-zinc-400">Auto Play</span>
                <button
                  type="button"
                  onClick={() => setAutoPlay((v) => !v)}
                  className={cn(
                    "mt-0.5 flex h-6 w-11 items-center rounded-full px-0.5 transition-colors",
                    autoPlay ? "bg-white" : "bg-zinc-600",
                  )}
                >
                  <span className={cn("size-5 rounded-full bg-zinc-900 shadow transition-transform", autoPlay ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
            {autoPlay && (
              <div className="mt-3 max-w-[160px]">
                <ControlSlider label="Interval ms" value={autoInterval} min={500} max={8000} step={500} onChange={setAutoInterval} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
