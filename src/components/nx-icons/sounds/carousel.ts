import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.14;

/** A little fairground organ waltz: a reedy note each time the horses turn at the top or bottom of their poles, ending on a held note. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 554, t(0.0), 0.06, 0.2, undefined, "triangle"); // 0.00 the horses start to move
  blip(c, o, 698, t(0.25), 0.06, 0.2, undefined, "triangle"); // 0.25 the left horse is up, the right one down
  blip(c, o, 830, t(0.5), 0.06, 0.2, undefined, "triangle"); // 0.50 both pass level
  blip(c, o, 698, t(0.75), 0.06, 0.2, undefined, "triangle"); // 0.75 they turn again
  blip(c, o, 466, t(1.0), 0.06, 0.3, undefined, "triangle"); // 1.00 the horses come to rest
  blip(c, o, 277, t(1.0), 0.04, 0.3, undefined, "triangle"); // 1.00 the organ's low note under it
}
