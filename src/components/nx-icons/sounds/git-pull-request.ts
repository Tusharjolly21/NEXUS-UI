import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.64;

/** A rising whoosh with a glide from a low note up high as the arrow loops across, a dry tick and a short blip as it nudges in, then two bell notes as the base branch answers. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.08), t(0.5), 500, 3000, 0.04);
  blip(c, o, N.G4, t(0.1), 0.06, 0.45, N.D6);
  tick(c, o, t(0.58), 0.1, 3600);
  blip(c, o, N.B5, t(0.6), 0.06, 0.06);
  ding(c, o, N.E5, t(0.72), 0.07, 0.4);
  plink(c, o, N.B6, t(0.82), 0.04, 0.18);
}
