"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { SoundDef } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

/** A sound's real shape: loudness in `bars` slices over its audible length, and that length. */
export type SoundShape = { bars: number[]; dur: number };

const SR = 48000;

/**
 * Renders a recipe offline (no speakers, no user gesture needed) and measures how loud it is over
 * time, so every tile draws the sound it will actually play.
 */
export async function measureSound(def: SoundDef, bars = 28): Promise<SoundShape | null> {
  if (typeof window === "undefined") return null;
  const Offline = window.OfflineAudioContext ?? (window as unknown as { webkitOfflineAudioContext?: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  if (!Offline) return null;
  try {
    const c = new Offline(1, Math.ceil(SR * 2), SR);
    def.play(c as unknown as AudioContext, c.destination);
    const buf = await c.startRendering();
    const d = buf.getChannelData(0);
    let peak = 0;
    for (let i = 0; i < d.length; i++) peak = Math.max(peak, Math.abs(d[i]));
    if (peak === 0) return null;
    let end = 0;
    for (let i = d.length - 1; i >= 0; i--) {
      if (Math.abs(d[i]) > peak * 0.02) {
        end = i;
        break;
      }
    }
    const len = Math.max(end, Math.round(SR * 0.04));
    const step = len / bars;
    const out: number[] = [];
    for (let b = 0; b < bars; b++) {
      let sum = 0;
      const a = Math.floor(b * step);
      const z = Math.max(a + 1, Math.floor((b + 1) * step));
      for (let i = a; i < z; i++) sum += d[i] * d[i];
      out.push(Math.sqrt(sum / (z - a)));
    }
    const top = Math.max(...out) || 1;
    // A square root keeps quiet tails visible next to a loud attack.
    return { bars: out.map((v) => Math.sqrt(v / top)), dur: len / SR };
  } catch {
    return null;
  }
}

/** Two colours per kind of sound, light to deep. */
export const WAVE_COLORS: Record<string, [string, string]> = {
  Actions: ["#c084fc", "#7c3aed"],
  Feedback: ["#34d399", "#0f766e"],
  Navigation: ["#60a5fa", "#1d4ed8"],
  Notifications: ["#fde047", "#f59e0b"],
  Selection: ["#f472b6", "#a855f7"],
  Movement: ["#5eead4", "#16a34a"],
  Progress: ["#fb923c", "#ef4444"],
  System: ["#9ca3af", "#4b5563"],
  Glass: ["#a5f3fc", "#0284c7"],
  "Paper and wood": ["#fcd34d", "#b45309"],
  Arcade: ["#e879f9", "#16a34a"],
  Studio: ["#facc15", "#92400e"],
};

/**
 * The sound drawn as its own waveform. At rest the bars show its shape; when it plays, a playhead
 * runs across them in real time, for exactly as long as the sound lasts, and every bar it passes
 * jumps up and lights in the colour of its kind. `hit` changes on every play.
 */
export function SoundWave({
  shape,
  category,
  hit,
  active = false,
  size = "tile",
  reduce = false,
}: {
  shape: SoundShape | null;
  category: string;
  hit: number;
  active?: boolean;
  size?: "tile" | "wide";
  reduce?: boolean;
}) {
  const [from, to] = WAVE_COLORS[category] ?? WAVE_COLORS.System;
  const n = size === "wide" ? 56 : 28;
  // Before the shape is measured, a calm placeholder: a soft hump that is the same on server and client.
  const bars = React.useMemo(() => {
    if (shape && shape.bars.length === n) return shape.bars;
    if (shape) return resample(shape.bars, n);
    return Array.from({ length: n }, (_, i) => 0.18 + 0.12 * Math.sin((i / (n - 1)) * Math.PI));
  }, [shape, n]);
  // The sweep lasts as long as the sound, but never so short that the eye misses it.
  const sweep = Math.min(1.6, Math.max(0.28, shape?.dur ?? 0.3));
  const playing = hit > 0;

  return (
    <span
      aria-hidden
      className={cn(
        "relative flex w-full items-center justify-between overflow-hidden",
        size === "wide" ? "h-16 gap-[3px] px-1" : "h-14 gap-[2px] px-0.5",
      )}
    >
      {bars.map((v, i) => {
        const at = (i / (n - 1)) * sweep;
        const h = Math.max(0.08, v);
        return (
          <span key={i} className="relative flex h-full flex-1 items-center justify-center">
            {/* resting bar */}
            <span
              className="absolute w-full rounded-full transition-opacity duration-300"
              style={{
                height: `${h * 72}%`,
                background: `linear-gradient(180deg, ${from}, ${to})`,
                opacity: active ? 0.55 : 0.28,
              }}
            />
            {/* lit bar: replays on every hit, timed to the playhead */}
            {playing ? (
              <motion.span
                key={hit}
                className="absolute w-full rounded-full"
                style={{ height: `${h * 72}%`, background: `linear-gradient(180deg, ${from}, ${to})`, boxShadow: `0 0 10px ${from}99`, originY: 0.5 }}
                initial={{ opacity: 0, scaleY: 1 }}
                animate={reduce ? { opacity: [0, 1, 0] } : { opacity: [0, 1, 1, 0], scaleY: [1, 1.35, 1, 1] }}
                transition={reduce ? { duration: 0.5 } : { duration: 0.75, times: [0, 0.12, 0.45, 1], delay: at, ease: "easeOut" }}
              />
            ) : null}
          </span>
        );
      })}
      {/* playhead */}
      {playing && !reduce ? (
        <motion.span
          key={`head-${hit}`}
          className="pointer-events-none absolute inset-y-1 w-[2px] rounded-full"
          style={{ background: to, boxShadow: `0 0 12px 2px ${from}` }}
          initial={{ left: "0%", opacity: 1 }}
          animate={{ left: "100%", opacity: [1, 1, 0] }}
          transition={{ left: { duration: sweep, ease: "linear" }, opacity: { duration: sweep + 0.15, times: [0, 0.85, 1] } }}
        />
      ) : null}
    </span>
  );
}

function resample(src: number[], n: number) {
  return Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * (src.length - 1);
    const a = Math.floor(x);
    const b = Math.min(src.length - 1, a + 1);
    return src[a] + (src[b] - src[a]) * (x - a);
  });
}
