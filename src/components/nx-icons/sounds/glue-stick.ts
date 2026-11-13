import { tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.42;

/** A plastic ratchet clicks as the glue is twisted up, a soft thunk when it reaches the top, a small tick at each end of its wobble, then the clicks run back down at a lower pitch and a thud closes it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.089, 0.126, 0.157, 0.189, 0.226, 0.315].forEach((at, i) => tick(c, o, t(at), 0.07 + i * 0.01, 2000 + i * 120)); // 0.09-0.32 the wheel clicks as the stick rises
  thud(c, o, t(0.315), 240, 0.08, 0.06); // 0.315 the glue is at its full height
  tick(c, o, t(0.45), 0.05, 1600); // 0.45 the body wobbles to its right
  tick(c, o, t(0.675), 0.04, 1500); // 0.675 the body wobbles to its left
  [0.642, 0.684, 0.72, 0.756, 0.798, 0.9].forEach((at, i) => tick(c, o, t(at), 0.07, 1500 - i * 80)); // 0.54-0.90 the clicks run back down
  thud(c, o, t(0.9), 200, 0.1, 0.08); // 0.90 the glue is home
}
