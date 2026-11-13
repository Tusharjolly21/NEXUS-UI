import { ding, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft whoomp as the flame catches, tiny metal clinks of the handle on each sway, and crackles at the flame's biggest flickers. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.16, 700, 0.07, "lowpass"); // 0.00 the flame catches
  ding(c, o, 2200, t(0.225), 0.035, 0.22); // 0.225 handle clinks at the first swing
  puff(c, o, t(0.225), 0.05, 3400, 0.05); // 0.225 flame at its biggest
  ding(c, o, 1900, t(0.45), 0.025, 0.2); // 0.45 handle clinks back
  puff(c, o, t(0.675), 0.05, 3000, 0.04); // 0.675 second flicker
  ding(c, o, 2500, t(0.675), 0.018, 0.16);
}
