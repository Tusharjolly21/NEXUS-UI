import { ding, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.36;

/** A breath as the lid sweeps shut and open, two little glides as it looks left and right, and a glint. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.03), 0.12, 2200, 0.05);
  tick(c, o, t(0.135), 0.1, 3000);
  puff(c, o, t(0.18), 0.1, 2800, 0.04);
  blip(c, o, N.G5, t(0.5), 0.07, 0.1, N.E5);
  blip(c, o, N.E5, t(0.78), 0.07, 0.1, N.G5);
  ding(c, o, N.C7, t(1.02), 0.05, 0.5);
}
