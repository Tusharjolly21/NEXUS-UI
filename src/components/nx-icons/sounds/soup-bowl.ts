import { ding, blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A slow watery swirl that follows each swing of the spoon, two quiet liquid plops, a faint ceramic clink at the turning points, and a steady gentle steam hiss. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), 0.8, 6000, 0.012, "highpass"); // 0.10 to 0.9 steam hisses as it curls
  swish(c, o, t(0.0), t(0.18), 260, 520, 0.04); // 0.00 to 0.18 spoon swings out
  swish(c, o, t(0.18), t(0.18), 520, 280, 0.035); // 0.18 to 0.36 spoon swings back
  swish(c, o, t(0.36), t(0.18), 280, 480, 0.03); // 0.36 to 0.54 swings out again
  swish(c, o, t(0.54), t(0.18), 480, 300, 0.022); // 0.54 to 0.72 and back
  swish(c, o, t(0.72), t(0.18), 300, 380, 0.014); // 0.72 to 0.90 settles in the middle
  ding(c, o, 3100, t(0.18), 0.03, 0.12); // 0.18 spoon touches the bowl
  blip(c, o, 300, t(0.36), 0.06, 0.08, 520); // 0.36 liquid plop
  ding(c, o, 3300, t(0.54), 0.02, 0.1); // 0.54 spoon touches the bowl again
  blip(c, o, 260, t(0.72), 0.04, 0.08, 440); // 0.72 liquid plop
}
