import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.72;

/** A whoosh from the sender, a bell as the hook node lights, a falling tone that follows the pulse round the hook, a bubbly pluck and ring at the receiver, and a tiny tick for the barb. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.26), 1200, 3400, 0.04);
  ding(c, o, N.E6, t(0.24), 0.06, 0.4);
  blip(c, o, N.A5, t(0.26), 0.06, 0.45, N.D5, "triangle");
  swish(c, o, t(0.38), t(0.22), 900, 2600, 0.03);
  plink(c, o, N.G6, t(0.6), 0.07, 0.16);
  ding(c, o, N.B6, t(0.64), 0.03, 0.4);
  tick(c, o, t(0.84), 0.08, 4200);
}
