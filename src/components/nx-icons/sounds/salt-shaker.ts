import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.43;

/** A soft whoosh as the shaker tips over, two gritty rattles of salt as it is shaken, a fine sprinkling hiss and a glassy tap as it stands back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 400, 900, 0.02); // 0.00-0.24 the shaker tips over
  puff(c, o, t(0.24), 0.04, 6200, 0.05); // 0.24 the salt slides inside
  puff(c, o, t(0.36), 0.05, 5600, 0.07); // 0.36 the first shake
  puff(c, o, t(0.46), 0.04, 6400, 0.05); // 0.46 it swings back
  puff(c, o, t(0.58), 0.05, 5800, 0.06); // 0.58 the second shake
  swish(c, o, t(0.34), t(0.5), 7000, 8500, 0.02); // 0.34-0.84 grains of salt sprinkle out
  swish(c, o, t(0.68), t(0.3), 800, 400, 0.015); // 0.68-0.98 the shaker turns upright
  ding(c, o, 1975, t(1.0), 0.03, 0.15); // 1.00 the glass base taps the table
}
