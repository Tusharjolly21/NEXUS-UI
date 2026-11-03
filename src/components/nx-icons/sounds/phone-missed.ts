import { plink, blip, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.1;

/** A quick upward swish as the arrow shoots off, a dull thud as it rebounds, then three falling plucks, G, D and A, like a sigh, with a muted buzz underneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.26), 800, 2800, 0.04);
  thud(c, o, t(0.3), 130, 0.2, 0.12);
  plink(c, o, N.G5, t(0.34), 0.07, 0.14);
  plink(c, o, N.D5, t(0.48), 0.06, 0.14);
  plink(c, o, N.A4, t(0.62), 0.05, 0.2);
  [0.1, 0.16, 0.22, 0.28].forEach((at) => blip(c, o, 110, t(at), 0.03, 0.05, undefined, "square"));
}
