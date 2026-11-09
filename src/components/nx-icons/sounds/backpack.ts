import { ding, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.69;

/** A fabric rustle as the bag lifts, a small bell-like tick at each swing of the zip pull, and a soft thump with a rustle on each footfall, the second lighter than the first. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.05), t(0.14), 900, 0.04); // 0.05 the bag lifts, canvas rustle
  tick(c, o, t(0.36), 0.1, 4300); // 0.36 the zip pull swings out to the right
  ding(c, o, 3600, t(0.36), 0.03, 0.12); // 0.36 tiny metal ring of the pull
  thud(c, o, t(0.45), 100, 0.3, 0.14); // 0.45 first footfall, the bag lands
  puff(c, o, t(0.45), t(0.1), 1200, 0.05); // 0.45 rustle of the landing
  tick(c, o, t(0.52), 0.08, 3800); // 0.52 the pull swings back to the left
  tick(c, o, t(0.68), 0.05, 3400); // 0.68 the pull swings right again, smaller
  tick(c, o, t(0.84), 0.03, 3000); // 0.84 last small swing
  thud(c, o, t(0.9), 120, 0.15, 0.1); // 0.90 second, lighter footfall
  puff(c, o, t(0.9), t(0.08), 1400, 0.03); // 0.90 rustle
}
