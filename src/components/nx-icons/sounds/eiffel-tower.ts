import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.67;

/** Three bright glassy twinkles climbing in pitch, each one timed to a golden sparkle flashing beside the tower, over a faint shimmer. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.85), 5200, 7400, 0.012); // 0.00-0.85 a faint shimmer while the sparkles come and go
  ding(c, o, 2490, t(0.21), 0.06, 0.32); // 0.22 the first sparkle flashes at its largest, upper left
  ding(c, o, 2960, t(0.39), 0.055, 0.32); // 0.40 the second sparkle flashes on the right
  ding(c, o, 3320, t(0.57), 0.05, 0.4); // 0.58 the third sparkle flashes low on the left
}
