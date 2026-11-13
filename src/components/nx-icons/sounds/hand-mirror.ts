import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A shimmer of glass that climbs while the glint slides across the mirror, a bright glassy ting when it reaches the far side, a falling shimmer on the way back and a tiny ting as it rests. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.43), 2400, 5200, 0.025); // 0.00-0.43 the glint slides across the glass
  ding(c, o, 3520, t(0.43), 0.07, 0.4); // 0.43 the glint reaches the far edge: a ting
  swish(c, o, t(0.57), t(0.38), 5000, 2200, 0.02); // 0.57-0.95 the glint slides back
  ding(c, o, 2350, t(0.95), 0.03, 0.3); // 0.95 the mirror settles and the glint is home
}
