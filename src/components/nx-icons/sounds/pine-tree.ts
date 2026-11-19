import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.77;

/** Two airy gusts of wind and the dry rustle of pine needles as the tree bends, with a low wooden creak at its deepest bend. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.5), 1800, 4200, 0.04); // 0.00-0.50 the first gust sweeps in
  swish(c, o, t(0.12), t(0.5), 1500, 3600, 0.03); // 0.12-0.62 the second gust
  puff(c, o, t(0.24), 0.2, 6000, 0.03, "highpass"); // 0.24-0.44 the needles rustle as the tree bends
  blip(c, o, 180, t(0.3), 0.04, 0.16, 150, "triangle"); // 0.30 the trunk creaks at the deepest bend
  puff(c, o, t(0.56), 0.14, 5200, 0.02, "highpass"); // 0.56 it swings back the other way
}
