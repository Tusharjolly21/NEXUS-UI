import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.5;

/** A soft rocking swish as the level tips, a wet gloop of the bubble running to each end with a small glassy tap, four times, shorter each time, until it settles in the middle with a last tap. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.3), 400, 900, 0.02); // 0.00-0.30 the level tips one way
  blip(c, o, 520, t(0.26), 0.07, 0.14, 900, "sine"); // 0.30 the bubble runs to the high end
  ding(c, o, 2600, t(0.3), 0.03, 0.15); // 0.30 glassy tap at the end of the vial
  swish(c, o, t(0.3), t(0.3), 900, 400, 0.02); // 0.30-0.60 it rocks the other way
  blip(c, o, 900, t(0.56), 0.06, 0.14, 480, "sine"); // 0.60 the bubble runs the other way
  ding(c, o, 2300, t(0.6), 0.025, 0.15); // 0.60 glassy tap
  blip(c, o, 480, t(0.77), 0.04, 0.1, 740, "sine"); // 0.80 the bubble turns again
  ding(c, o, 2000, t(0.8), 0.02, 0.12); // 0.80 a smaller tap
  blip(c, o, 700, t(0.97), 0.03, 0.08, 560, "sine"); // 1.00 the bubble comes to rest in the middle
  ding(c, o, 1800, t(1.0), 0.03, 0.2); // 1.00 final tap as the level is true
}
