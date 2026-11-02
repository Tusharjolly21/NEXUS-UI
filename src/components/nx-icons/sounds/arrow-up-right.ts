import { plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.45;

/** A fast rising swish as the arrow launches, two dry ticks for the speed lines, a short upward slide, a falling swish as the next arrow glides in, and two bright notes when it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 600, 3800, 0.06);
  tick(c, o, t(0.05), 0.07, 4800);
  tick(c, o, t(0.11), 0.05, 4000);
  blip(c, o, N.D6, t(0.28), 0.05, 0.1, N.G6);
  swish(c, o, t(0.4), t(0.34), 2800, 800, 0.04);
  plink(c, o, N.E6, t(0.74), 0.07, 0.14);
  plink(c, o, N.B6, t(0.8), 0.045, 0.2);
}
