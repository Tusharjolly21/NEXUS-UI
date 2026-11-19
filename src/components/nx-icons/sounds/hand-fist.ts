import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.66;

/** A low draw of air as the fist pulls back, a fast whoosh into the punch, and a heavy thump with a sharp crack as the impact lines flash. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 300, 520, 0.02); // 0.00-0.22 the fist pulls back
  swish(c, o, t(0.225), t(0.09), 900, 3200, 0.06); // 0.22-0.31 the punch flies forward
  thud(c, o, t(0.315), 90, 0.3, 0.18); // 0.32 the punch lands
  puff(c, o, t(0.315), 0.06, 1800, 0.08); // 0.32 the crack of the impact lines
  thud(c, o, t(0.51), 130, 0.06, 0.08); // 0.51 the fist rebounds and settles
}
