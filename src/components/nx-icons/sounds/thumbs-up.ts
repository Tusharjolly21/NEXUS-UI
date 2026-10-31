import { ding, plink, blip, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.73;

/** A rising wind-up, a thud as the thumb snaps up, and three sparkly notes flying off. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 330, t(0.05), 0.06, 0.2, 440, "triangle");
  thud(c, o, t(0.52), 150, 0.2, 0.1);
  plink(c, o, N.A5, t(0.52), 0.12);
  plink(c, o, N.E6, t(0.6), 0.09);
  plink(c, o, N.B6, t(0.68), 0.08);
  ding(c, o, N.E7, t(0.76), 0.05, 0.5);
}
