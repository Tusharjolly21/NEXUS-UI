import { ding, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A fine glassy glint, a short rising shimmer under the pulse, and two high bell tones like a sparkle catching the light on clean enamel. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.36), 2400, 5200, 0.02);
  tick(c, o, t(0.2), 0.1, 6800);
  ding(c, o, N.B6, t(0.22), 0.07, 0.5);
  ding(c, o, N.G7, t(0.31), 0.05, 0.42);
  ding(c, o, N.D7, t(0.41), 0.035, 0.36);
  blip(c, o, 1900, t(0.58), 0.04, 0.12, 2600);
}
