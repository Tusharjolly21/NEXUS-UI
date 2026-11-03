import { ding, plink, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.24;

/** Two dry ticks and a short sweep as the line ends run in, a round plucked pop with a soft thump as the node lands, a glassy ring, and two small rising notes for the tick drawing in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.07, 4200);
  tick(c, o, t(0.06), 0.06, 4900);
  swish(c, o, t(0.02), t(0.26), 900, 2600, 0.03);
  plink(c, o, N.D5, t(0.28), 0.1, 0.14);
  thud(c, o, t(0.3), 140, 0.14, 0.08);
  ding(c, o, N.A5, t(0.46), 0.05, 0.4);
  blip(c, o, N.B5, t(0.54), 0.06, 0.07);
  blip(c, o, N.E6, t(0.64), 0.07, 0.16);
}
