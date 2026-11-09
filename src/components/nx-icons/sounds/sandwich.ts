import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A papery whoosh as the top slice lifts and a soft pat as it lands, then a second lift and a crisp lettuce crunch when the filling comes down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 700, 2200, 0.04); // 0.00 to 0.22 the top bread lifts
  thud(c, o, t(0.4), 150, 0.12, 0.07); // 0.40 the top bread lands on the lettuce
  swish(c, o, t(0.17), t(0.22), 600, 1900, 0.03); // 0.17 to 0.39 the middle lifts
  puff(c, o, t(0.57), 0.04, 3800, 0.1, "bandpass"); // 0.57 lettuce crunches as it lands
  puff(c, o, t(0.6), 0.03, 5200, 0.07, "bandpass"); // 0.60 a second crisp crackle
  thud(c, o, t(0.57), 120, 0.1, 0.06); // 0.57 and the soft thump of the filling
}
