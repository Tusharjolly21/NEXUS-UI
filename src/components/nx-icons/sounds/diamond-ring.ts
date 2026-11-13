import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.52;

/** A bright glassy ting as the diamond pops, then two higher twinkles as each sparkle peaks, with a faint shimmer between them. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 3000, 6500, 0.015); // 0.00-0.21 the diamond swells
  ding(c, o, 3400, t(0.21), 0.07, 0.5); // 0.21 the diamond reaches its biggest: a ting
  swish(c, o, t(0.12), t(0.25), 5500, 9000, 0.012); // 0.12-0.37 the first sparkle opens
  ding(c, o, 5200, t(0.365), 0.05, 0.4); // 0.37 the first sparkle peaks
  ding(c, o, 2800, t(0.42), 0.03, 0.3); // 0.42 the diamond springs back
  ding(c, o, 6300, t(0.545), 0.04, 0.35); // 0.55 the second sparkle peaks
  swish(c, o, t(0.6), t(0.4), 7000, 4000, 0.01); // 0.60-1.00 the sparkles fade out
}
