import type { SoundName } from "@/lib/ui-sounds";

/**
 * What each sound is called in the Mac style, kept apart from the recipes so the sounds page can
 * label them without loading the recipes. `scripts/scan-sound-usage.mjs` fails the build if this
 * list and `MAC_SOUNDS` in `ui-sounds-mac.ts` ever disagree.
 */
export const MAC_SOUND_LABELS: Record<SoundName, string> = {
  tap: "Key tock",
  pop: "Bubble",
  knock: "Soft bonk",
  success: "Glass ding",
  error: "Low thud",
  paid: "Card ding",
  whoosh: "Send swoosh",
  step: "Glass step",
  glide: "Slide",
  chime: "Glass bowl",
  ping: "Clear ping",
  beacon: "Sonar",
  tick: "Glass tick",
  on: "Switch on",
  off: "Switch off",
  lift: "Lift",
  drop: "Settle",
  swipe: "Swish",
  charge: "Rise",
  done: "Bright chord",
  loading: "Soft drops",
  boot: "Warm start",
  hush: "Fade out",
  alert: "Two bells",
};
