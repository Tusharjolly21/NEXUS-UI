import { plink, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.72;

/** A rubbery squeak as the balloon lifts, a bobbing note at each swing of the string, a tick of the knot, and a soft final pluck. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 1000, 3000, 0.02);
  blip(c, o, 380, t(0.04), 0.05, 0.3, 880, "triangle");
  blip(c, o, N.G5, t(0.5), 0.045, 0.16, 330, "triangle");
  blip(c, o, 480, t(0.68), 0.04, 0.2, 760, "triangle");
  tick(c, o, t(0.3), 0.05, 3800);
  plink(c, o, N.D6, t(0.98), 0.05, 0.2);
  puff(c, o, t(0.3), 0.08, 5200, 0.015, "highpass");
}
