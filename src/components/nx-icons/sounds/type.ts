import { ding, plink, blip, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.89;

/** Three notes growing in size, low then middle then high, as the letter shrinks and swells, with a stream of air as the crossbar opens and a bell on the serif. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.C5, t(0.04), 0.06, 0.12, N.C5 * 0.9, "triangle");
  swish(c, o, t(0.06), t(0.4), 800, 2800, 0.025);
  plink(c, o, N.E5, t(0.3), 0.07, 0.14);
  plink(c, o, N.A5, t(0.46), 0.07, 0.14);
  plink(c, o, N.E6, t(0.62), 0.06, 0.2);
  tick(c, o, t(0.44), 0.06, 3600);
  ding(c, o, N.C6, t(0.82), 0.05, 0.4);
}
