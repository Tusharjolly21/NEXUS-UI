import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft feather rustle and a low double hoot, one as the head turns to the left and one as it turns to the right, then a tiny click as the eyes blink shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.08), 0.06, 1400, 0.03, "lowpass"); // 0.08 feathers ruffle as the head starts to turn
  blip(c, o, 410, t(0.13), 0.1, 0.22, 345); // 0.20 hoot one while the head is turned left
  blip(c, o, 820, t(0.13), 0.025, 0.14, 690); // 0.20 its brighter overtone
  puff(c, o, t(0.36), 0.07, 1300, 0.03, "lowpass"); // 0.36 feathers ruffle as the head swings across
  blip(c, o, 335, t(0.43), 0.1, 0.24, 280); // 0.50 hoot two while the head is turned right, lower
  blip(c, o, 670, t(0.43), 0.025, 0.14, 560); // 0.50 its overtone
  puff(c, o, t(0.67), 0.05, 1500, 0.02, "lowpass"); // 0.68 the head comes back to centre
  tick(c, o, t(0.8), 0.07, 2600); // 0.82 the eyes shut
  puff(c, o, t(0.9), 0.05, 1500, 0.02, "lowpass"); // 0.92 the eyes open and the feathers settle
}
