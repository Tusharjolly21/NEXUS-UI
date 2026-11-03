import { plink, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.23;

/** A low wooden thud as the folder front tips open, a rising rustle as the plus spins up from inside, and three pops that climb in pitch as it lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.04), 120, 0.2, 0.12);
  puff(c, o, t(0.1), 0.1, 2200, 0.04, "bandpass");
  swish(c, o, t(0.2), t(0.35), 500, 2200, 0.03);
  plink(c, o, N.D5, t(0.42), 0.07, 0.14);
  plink(c, o, N.G5, t(0.5), 0.07, 0.14);
  plink(c, o, N.C6, t(0.58), 0.06, 0.14);
  plink(c, o, N.A6, t(0.66), 0.04, 0.22);
  thud(c, o, t(0.7), 110, 0.1, 0.1);
}
