import { plink, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A dry scratch of a pen nib that rises and dips along the signature, four small ticks where the strokes turn, and a firm tap as the pen lifts at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 3400, 5600, 0.03);
  puff(c, o, t(0.02), 0.8, 4800, 0.016, "highpass");
  [0.1, 0.28, 0.5, 0.7].forEach((at, i) => tick(c, o, t(at), 0.06, 3000 + i * 450));
  thud(c, o, t(0.93), 240, 0.08, 0.06);
  plink(c, o, 1240, t(0.95), 0.05, 0.12);
}
