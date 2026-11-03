import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.95;

/** A light glide as the cursor slides in, a crisp click with a small thump when it presses, a bell for the first ripple and a smaller one for the second, and a quiet click as it releases. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 500, 1800, 0.02);
  tick(c, o, t(0.44), 0.2, 3000);
  thud(c, o, t(0.44), 220, 0.08, 0.05);
  ding(c, o, N.D7, t(0.46), 0.06, 0.4);
  ding(c, o, N.A6, t(0.56), 0.035, 0.3);
  tick(c, o, t(0.62), 0.12, 6000);
}
