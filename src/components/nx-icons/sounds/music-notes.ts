import { plink, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.1;

/** The beamed pair lands with two quick plucked notes, one for each of its notes, and the single note lands half a beat later with one, each over a soft, low tap of landing. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0), 120, 0.05, 0.09);
  plink(c, o, N.E5, t(0.005), 0.07, 0.2);
  plink(c, o, N.G5, t(0.13), 0.06, 0.22);
  thud(c, o, t(0.7), 150, 0.04, 0.08);
  plink(c, o, N.C6, t(0.705), 0.065, 0.28);
}
