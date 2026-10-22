/**
 * The Mac style for Nexus UI sounds: the same 24 sounds as `@/lib/ui-sounds`, re-voiced to feel at
 * home on a Mac or an iPhone. Glassy, rounded and short: pure tones with bell-like overtones, soft
 * key tocks and airy swooshes, never square waves or buzz. Every one is an original recipe made
 * with the Web Audio API; no Apple recordings are used and there are no audio files.
 *
 * Importing this file registers the "mac" style. Switch to it once and every component that makes
 * sound uses it:
 *
 *   import { useMacSounds } from "@/lib/ui-sounds-mac";
 *   useMacSounds(); // in your root layout's client provider
 *
 * Or from anywhere: `setSoundStyle("mac")` / `setSoundStyle("nexus")` from `@/lib/ui-sounds`.
 */

import * as React from "react";
import { hiss, registerSoundStyle, setSoundStyle, tone, type SoundDef, type SoundName } from "@/lib/ui-sounds";

/** A struck bell: a fundamental plus overtones at the given ratios, each fading faster than the last. */
function bell(c: AudioContext, o: AudioNode, freq: number, opts: { at?: number; ratios?: number[]; decay?: number; gain?: number } = {}) {
  const { at = 0, ratios = [1, 2.01, 2.76], decay = 0.6, gain = 0.14 } = opts;
  ratios.forEach((r, i) => tone(c, o, { at, freq: freq * r, attack: 0.002, decay: decay / (1 + i * 0.9), gain: gain / (1 + i * 1.6) }));
}

export const MAC_SOUNDS = {
  // Actions
  tap: { category: "Actions", label: "Key tock", play: (c, o) => { hiss(c, o, { freq: 2600, decay: 0.008, gain: 0.168, filter: "highpass" }); tone(c, o, { freq: 1650, to: 1480, decay: 0.03, gain: 0.168 }); tone(c, o, { freq: 420, decay: 0.025, gain: 0.14 }); } },
  pop: { category: "Actions", label: "Bubble", play: (c, o) => { tone(c, o, { freq: 520, to: 1240, glide: 0.035, decay: 0.07, gain: 0.3 }); tone(c, o, { at: 0.012, freq: 2480, decay: 0.02, gain: 0.04 }); } },
  knock: { category: "Actions", label: "Soft bonk", play: (c, o) => { tone(c, o, { freq: 311, decay: 0.14, gain: 0.3 }); tone(c, o, { freq: 622, decay: 0.08, gain: 0.1 }); tone(c, o, { freq: 933, decay: 0.05, gain: 0.05 }); hiss(c, o, { freq: 1200, decay: 0.02, gain: 0.08, filter: "lowpass" }); } },

  // Feedback
  success: { category: "Feedback", label: "Glass ding", play: (c, o) => { bell(c, o, 1760, { decay: 0.6, gain: 0.15 }); bell(c, o, 2637, { at: 0.08, decay: 0.7, gain: 0.12 }); } },
  error: { category: "Feedback", label: "Low thud", play: (c, o) => { tone(c, o, { freq: 196, to: 180, decay: 0.28, gain: 0.161, type: "triangle" }); tone(c, o, { freq: 98, decay: 0.24, gain: 0.149 }); hiss(c, o, { freq: 600, decay: 0.05, gain: 0.05, filter: "lowpass" }); } },
  paid: { category: "Feedback", label: "Card ding", play: (c, o) => { bell(c, o, 1568, { ratios: [1, 2.4, 3.9], decay: 0.9, gain: 0.13 }); bell(c, o, 2093, { at: 0.1, ratios: [1, 2.4, 3.9], decay: 1.0, gain: 0.13 }); } },

  // Navigation
  whoosh: { category: "Navigation", label: "Send swoosh", play: (c, o) => { hiss(c, o, { attack: 0.08, decay: 0.22, freq: 600, to: 7000, gain: 0.102, q: 0.7 }); tone(c, o, { freq: 500, to: 1500, glide: 0.25, attack: 0.06, decay: 0.2, gain: 0.032 }); } },
  step: { category: "Navigation", label: "Glass step", play: (c, o) => bell(c, o, 2794, { ratios: [1, 1.5], decay: 0.08, gain: 0.12 }) },
  glide: { category: "Navigation", label: "Slide", play: (c, o) => { tone(c, o, { freq: 660, to: 990, glide: 0.2, attack: 0.04, decay: 0.22, gain: 0.14 }); tone(c, o, { freq: 1320, to: 1980, glide: 0.2, attack: 0.04, decay: 0.18, gain: 0.03 }); } },

  // Notifications
  chime: { category: "Notifications", label: "Glass bowl", play: (c, o) => bell(c, o, 1046.5, { ratios: [1, 2.01, 2.76, 4.07], decay: 1.4, gain: 0.168 }) },
  ping: { category: "Notifications", label: "Clear ping", play: (c, o) => { tone(c, o, { freq: 1318.5, decay: 1.0, gain: 0.15 }); tone(c, o, { freq: 2637, decay: 0.3, gain: 0.03 }); tone(c, o, { at: 0.24, freq: 1318.5, decay: 0.6, gain: 0.04 }); } },
  beacon: { category: "Notifications", label: "Sonar", play: (c, o) => { tone(c, o, { freq: 740, attack: 0.01, decay: 0.8, gain: 0.14 }); tone(c, o, { freq: 1480, decay: 0.3, gain: 0.03 }); tone(c, o, { at: 0.3, freq: 740, attack: 0.01, decay: 0.6, gain: 0.05 }); } },

  // Selection
  tick: { category: "Selection", label: "Glass tick", play: (c, o) => { tone(c, o, { freq: 4186, decay: 0.035, gain: 0.209 }); tone(c, o, { freq: 6280, decay: 0.02, gain: 0.095 }); tone(c, o, { freq: 2093, decay: 0.015, gain: 0.076 }); } },
  on: { category: "Selection", label: "Switch on", play: (c, o) => { hiss(c, o, { freq: 3500, decay: 0.006, gain: 0.32 }); tone(c, o, { at: 0.004, freq: 1100, decay: 0.025, gain: 0.192 }); } },
  off: { category: "Selection", label: "Switch off", play: (c, o) => { hiss(c, o, { freq: 2800, decay: 0.006, gain: 0.306 }); tone(c, o, { at: 0.004, freq: 820, decay: 0.025, gain: 0.17 }); } },

  // Movement
  lift: { category: "Movement", label: "Lift", play: (c, o) => { tone(c, o, { freq: 392, to: 587, glide: 0.1, attack: 0.02, decay: 0.1, gain: 0.1 }); hiss(c, o, { attack: 0.03, decay: 0.08, freq: 1500, to: 4000, gain: 0.05 }); } },
  drop: { category: "Movement", label: "Settle", play: (c, o) => { tone(c, o, { freq: 330, to: 165, glide: 0.06, decay: 0.1, gain: 0.28 }); hiss(c, o, { freq: 800, decay: 0.03, gain: 0.1, filter: "lowpass" }); } },
  swipe: { category: "Movement", label: "Swish", play: (c, o) => hiss(c, o, { attack: 0.03, decay: 0.14, freq: 5000, to: 1200, gain: 0.14, q: 0.8 }) },

  // Progress
  charge: { category: "Progress", label: "Rise", play: (c, o) => { tone(c, o, { freq: 330, to: 660, glide: 0.45, attack: 0.2, decay: 0.4, gain: 0.1 }); hiss(c, o, { attack: 0.35, decay: 0.2, freq: 1000, to: 8000, gain: 0.05, filter: "highpass" }); } },
  done: { category: "Progress", label: "Bright chord", play: (c, o) => [1046.5, 1318.5, 1568, 2093].forEach((f, i) => bell(c, o, f, { at: i * 0.03, ratios: [1, 2.01], decay: 1.0, gain: 0.07 })) },
  loading: { category: "Progress", label: "Soft drops", play: (c, o) => [1175, 1319, 1480].forEach((f, i) => tone(c, o, { at: i * 0.15, freq: f, decay: 0.07, gain: 0.108 })) },

  // System
  boot: { category: "System", label: "Warm start", play: (c, o) => [261.6, 329.6, 392, 523.3, 587.3].forEach((f) => tone(c, o, { freq: f, attack: 0.25, decay: 1.6, gain: 0.05 })) },
  hush: { category: "System", label: "Fade out", play: (c, o) => { tone(c, o, { freq: 880, to: 330, glide: 0.4, attack: 0.03, decay: 0.4, gain: 0.136 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 2500, to: 400, gain: 0.068, filter: "lowpass" }); } },
  alert: { category: "System", label: "Two bells", play: (c, o) => { bell(c, o, 1568, { decay: 0.5, gain: 0.073 }); bell(c, o, 1175, { at: 0.18, decay: 0.6, gain: 0.073 }); } },
} satisfies Record<SoundName, SoundDef>;

registerSoundStyle("mac", MAC_SOUNDS);

/** Switch every sound to the Mac style while `on` is true (and back to the default when it turns false). */
export function useMacSounds(on = true) {
  React.useEffect(() => {
    setSoundStyle(on ? "mac" : "nexus", false);
  }, [on]);
}
