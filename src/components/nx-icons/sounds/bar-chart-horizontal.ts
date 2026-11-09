import { plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.09;

/** Four short sideways swishes, each ending in a soft plink whose pitch follows how long the bar is. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.12, 0.24, 0.36].forEach((at) => swish(c, o, t(at), t(0.34), 900, 2200, 0.022));
  plink(c, o, N.E6, t(0.42), 0.06, 0.16);
  plink(c, o, N.C6, t(0.54), 0.06, 0.16);
  plink(c, o, N.G5, t(0.66), 0.06, 0.16);
  plink(c, o, N.D5, t(0.78), 0.06, 0.16);
}
