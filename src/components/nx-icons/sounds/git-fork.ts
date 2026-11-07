import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low stem tone, two swishes as the branches draw out and a bright pop with a short rising pair of bells as the new node appears. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  plink(c, o, N.A4, t(0.03), 0.07, 0.14);
  swish(c, o, t(0.08), t(0.4), 700, 2400, 0.03);
  swish(c, o, t(0.16), t(0.4), 500, 2000, 0.03);
  blip(c, o, 520, t(0.5), 0.1, 0.12, 1300);
  ding(c, o, N.G6, t(0.54), 0.06, 0.4);
  ding(c, o, N.B6, t(0.68), 0.04, 0.5);
  tick(c, o, t(0.9), 0.05, 4400);
}
