import { ding, plink, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.14;

/** A low elastic groan as the chevrons pull back, two quick twangs as they are flung left one after the other, and a soft echo bell as they settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 420, t(0.02), 0.05, 0.24, 200, "triangle");
  blip(c, o, 240, t(0.2), 0.05, 0.08, 1100, "sawtooth");
  plink(c, o, N.D6, t(0.3), 0.07, 0.12);
  plink(c, o, N.G5, t(0.4), 0.06, 0.14);
  swish(c, o, t(0.26), t(0.24), 3000, 900, 0.025);
  ding(c, o, N.E6, t(0.6), 0.03, 0.4);
}
