import { plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four airy swishes as the hand sweeps to one side and the other, then three soft plucked notes, a friendly hello, as the motion arcs come back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.16), 700, 2300, 0.035);
  swish(c, o, t(0.18), t(0.24), 2400, 800, 0.04);
  swish(c, o, t(0.42), t(0.22), 800, 2200, 0.035);
  swish(c, o, t(0.64), t(0.2), 2200, 700, 0.03);
  plink(c, o, N.A4, t(0.7), 0.08, 0.16);
  plink(c, o, N.D6, t(0.82), 0.08, 0.16);
  plink(c, o, N.B5, t(0.95), 0.07, 0.3);
}
