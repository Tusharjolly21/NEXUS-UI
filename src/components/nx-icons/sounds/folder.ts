import { plink, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.03;

/** A drawer sliding open with a soft thunk, a sheet of paper rustling up, and a gentle done note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.2), 700, 2000, 0.04);
  thud(c, o, t(0.18), 130, 0.1, 0.08);
  puff(c, o, t(0.26), 0.14, 4200, 0.05, "highpass");
  plink(c, o, N.G6, t(0.45), 0.08);
}
