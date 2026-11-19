import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.6;

/** Two short insect wing buzzes as the spotted wing cases lift apart, and a tiny click as they fold shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.0), 0.05, 0.24, 190, "sawtooth"); // 0.00-0.23 the wing cases lift open with a buzz
  puff(c, o, t(0.02), 0.2, 2400, 0.025); // 0.02 the fluttering air under the wings
  blip(c, o, 185, t(0.4), 0.045, 0.2, 205, "sawtooth"); // 0.41-0.59 they lift again with a second buzz
  puff(c, o, t(0.42), 0.16, 2600, 0.02); // 0.42 the flutter of the second lift
  tick(c, o, t(0.9), 0.07, 4600); // 0.90 the wing cases click shut
}
