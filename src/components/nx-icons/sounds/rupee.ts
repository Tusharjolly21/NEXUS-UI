import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.71;

/** A quick kick of air and then a rubbery spring that twangs back and forth, each wobble smaller and lower, as the leg swings and settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.23), 800, 2600, 0.035); // 0.00-0.23 the leg kicks out
  blip(c, o, 318, t(0.234), 0.08, 0.15, 455, "triangle"); // 0.23 the leg reaches the top of its kick
  blip(c, o, 405, t(0.45), 0.06, 0.13, 287, "triangle"); // 0.45 it swings past rest the other way
  blip(c, o, 300, t(0.612), 0.04, 0.11, 377, "triangle"); // 0.61 a smaller wobble
  blip(c, o, 352, t(0.756), 0.025, 0.09, 310, "triangle"); // 0.76 the last wobble before it settles
}
