import { plink, blip, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.85;

/** A curious rising 'huh?' glide, then a rubbery boing and a plink as the dot hops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.A4, t(0.04), 0.07, 0.3, N.E5);
  plink(c, o, N.G6, t(0.3), 0.08, 0.14);
  plink(c, o, N.E6, t(0.46), 0.06, 0.12);
  plink(c, o, N.C6, t(0.58), 0.04, 0.1);
}
