import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.86;

/** A rising sweep as the lens swells, a bubbly note as the plus spins, and a bright ping as the view locks in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.45), 700, 3000, 0.03);
  plink(c, o, N.C6, t(0.05), 0.07, 0.12);
  plink(c, o, N.G6, t(0.3), 0.07, 0.12);
  ding(c, o, N.C7, t(0.52), 0.06, 0.4);
}
