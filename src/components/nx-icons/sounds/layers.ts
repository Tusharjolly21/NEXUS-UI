import { ding, plink, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.2;

/** A soft upward whoosh as the sheets fan apart with a bubbly note for the top and a lower one for the bottom, then two muffled thumps as they stack back and a glassy bell for the glow. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.3), 600, 2400, 0.03);
  plink(c, o, N.E5, t(0.1), 0.07, 0.15);
  plink(c, o, N.G4, t(0.17), 0.07, 0.15);
  thud(c, o, t(0.7), 140, 0.14, 0.1);
  thud(c, o, t(0.76), 105, 0.16, 0.12);
  ding(c, o, N.B5, t(0.8), 0.06, 0.45);
}
