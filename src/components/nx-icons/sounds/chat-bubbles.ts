import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two message pops, a lower one for the first bubble and a higher one for the reply, then a tiny keystroke as its line is written. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.14), 0.09, 0.1, 880); // 0.14 the first bubble pops
  blip(c, o, 780, t(0.54), 0.09, 0.1, 1320); // 0.54 the reply bubble pops
  tick(c, o, t(0.69), 0.08, 4200); // 0.69 the reply line is written
}
