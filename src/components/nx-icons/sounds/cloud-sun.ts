import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.56;

/** A soft air drift as the cloud slides aside and back, little glassy sparkles as the sun's rays swing to and fro, and one warm chime as the sun swells to its fullest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), 0.42, 500, 1100, 0.03); // 0.23 cloud drifts aside
  swish(c, o, t(0.5), 0.45, 1100, 500, 0.027); // 0.7 cloud drifts back
  ding(c, o, 2637, t(0.1), 0.035, 0.3); // 0.10 rays swing left, a sparkle
  ding(c, o, 3136, t(0.16), 0.03, 0.3); // 0.16 next ray catches the light
  ding(c, o, 2349, t(0.31), 0.04, 0.3); // 0.31 big swing across, rising sparkles
  ding(c, o, 3136, t(0.37), 0.04, 0.3); // 0.37
  ding(c, o, 3951, t(0.43), 0.035, 0.3); // 0.43
  ding(c, o, 523, t(0.48), 0.06, 0.6); // 0.5 the sun swells to its fullest, warm chime
  ding(c, o, 3520, t(0.57), 0.03, 0.28); // 0.57 rays swing back
  ding(c, o, 2960, t(0.64), 0.025, 0.28); // 0.64
  ding(c, o, 3136, t(0.85), 0.02, 0.3); // 0.85 last small swing
}
