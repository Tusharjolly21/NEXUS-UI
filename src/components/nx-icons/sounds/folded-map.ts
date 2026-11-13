import { ding, blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.1;

/** Paper unfolding, a pencil-like scratch as the route is traced, then a pop and a soft chime when the destination dot lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.2, 3000, 0.04, "highpass"); // 0.00 the sheet rustles
  swish(c, o, t(0.08), t(0.6), 1000, 2600, 0.025); // 0.08-0.68 the route draws
  blip(c, o, 760, t(0.64), 0.09, 0.1, 1480); // 0.62-0.77 the dot grows
  ding(c, o, 1760, t(0.77), 0.06, 0.4); // 0.77 the dot lands at full size
  ding(c, o, 2349, t(0.86), 0.025, 0.4); // 0.86 the ring ripples out
}
