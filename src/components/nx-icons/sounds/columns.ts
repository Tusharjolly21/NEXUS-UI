import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** Two airy sweeps pulling apart in opposite directions, a hollow held tone while the middle column swells, then a sweep back in and a dry snap with a small bell as the dividers close. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 700, 1900, 0.03);
  swish(c, o, t(0.02), t(0.3), 1900, 700, 0.03);
  blip(c, o, N.A4, t(0.3), 0.045, 0.3, undefined, "triangle");
  swish(c, o, t(0.5), t(0.24), 900, 2000, 0.04);
  tick(c, o, t(0.72), 0.12, 3500);
  thud(c, o, t(0.72), 200, 0.12, 0.08);
  ding(c, o, N.D6, t(0.74), 0.05, 0.35);
  ding(c, o, N.G5, t(0.82), 0.03, 0.3);
}
