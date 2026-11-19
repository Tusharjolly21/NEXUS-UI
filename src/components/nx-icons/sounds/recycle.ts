import { ding, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.32;

/** Three turns of a sorting drum, each a short rush of air ending in a hollow plastic clunk and a glassy clink, the clinks stepping up in pitch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 600, 1900, 0.035); // 0.00-0.28 the loop turns one third
  thud(c, o, t(0.28), 196, 0.08, 0.06); // 0.28 it locks into place
  ding(c, o, 1175, t(0.28), 0.035, 0.18); // 0.28 a bottle clinks inside
  swish(c, o, t(0.36), t(0.28), 650, 2000, 0.035); // 0.36-0.64 the second third
  thud(c, o, t(0.64), 208, 0.08, 0.06); // 0.64 it locks
  ding(c, o, 1319, t(0.64), 0.035, 0.18); // 0.64 another clink
  swish(c, o, t(0.72), t(0.28), 700, 2100, 0.035); // 0.72-1.00 the last third
  thud(c, o, t(1.0), 220, 0.08, 0.06); // 1.00 the loop is home
  ding(c, o, 1480, t(1.0), 0.035, 0.18); // 1.00 a last clink
}
