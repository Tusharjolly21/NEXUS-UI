import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.61;

/** A rubbery squeak as the heel lifts, a dull thump and a dry scuff as it lands, then a smaller lift and a second thump, with a faint sweep as the stripe draws in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.36), 1500, 4200, 0.02); // 0.05-0.41 the stripe draws in
  blip(c, o, 900, t(0.04), 0.045, 0.2, 1700, "triangle"); // 0.00-0.25 the heel lifts: a rubber squeak
  thud(c, o, t(0.45), 95, 0.3, 0.12); // 0.45 the heel lands the first time
  tick(c, o, t(0.45), 0.1, 2400); // 0.45 sole scuffs the floor
  blip(c, o, 800, t(0.5), 0.035, 0.14, 1300, "triangle"); // 0.45-0.68 the second, smaller lift
  thud(c, o, t(0.9), 100, 0.24, 0.12); // 0.90 the heel lands the second time
  tick(c, o, t(0.9), 0.08, 2200); // 0.90 second scuff
}
