"use client";

/**
 * Motion Kit previews (batch d): money goo, weather puck, metal orbs, bending rail, layout switch.
 * Each component demonstrates itself through `autoplay` until someone takes over.
 */

import type { ReactNode } from "react";
import { MoneyGoo } from "@/components/money-goo";
import { WeatherPuck } from "@/components/weather-puck";
import { MetalOrbs } from "@/components/metal-orbs";
import { BendingRail } from "@/components/bending-rail";
import { LayoutSwitch } from "@/components/layout-switch";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewMoneyGoo({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <MoneyGoo autoplay />
    </Stage>
  );
}

export function PreviewWeatherPuck({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <WeatherPuck autoplay />
    </Stage>
  );
}

export function PreviewMetalOrbs({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <MetalOrbs autoplay />
    </Stage>
  );
}

export function PreviewBendingRail({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <BendingRail autoplay />
    </Stage>
  );
}

export function PreviewLayoutSwitch({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <div className="w-full max-w-[640px]">
        <LayoutSwitch autoplay />
      </div>
    </Stage>
  );
}
