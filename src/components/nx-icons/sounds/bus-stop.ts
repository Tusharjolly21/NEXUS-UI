import { ding, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** An air-brake pssht and a diesel thump as the little bus bounces on its wheels, with a metal rattle from the sign. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), 0.3, 5200, 0.07, "highpass"); // 0.10 the bus hisses to a stop
  ding(c, o, 740, t(0.225), 0.04, 0.3); // 0.225 sign rattles on its pole
  thud(c, o, t(0.3), 95, 0.16, 0.13); // 0.30 the bus drops on its suspension
  thud(c, o, t(0.5), 105, 0.08, 0.1); // 0.50 it rebounds
  ding(c, o, 680, t(0.45), 0.025, 0.25); // 0.45 sign rattles back
  tick(c, o, t(0.7), 0.06, 1800); // 0.70 final nod
}
