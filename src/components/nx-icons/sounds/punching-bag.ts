import { ding, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** A heavy leather thump of the punch, then the chain rattling at each end of the swing, quieter each time, until the bag hangs still. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.0), 90, 0.2, 0.2); // 0.00 the punch lands on the bag
  puff(c, o, t(0.0), 0.06, 700, 0.06, "lowpass"); // 0.00 the slap of leather
  ding(c, o, 3300, t(0.18), 0.03, 0.12); // 0.18 the chain rattles at the far end of the swing
  tick(c, o, t(0.19), 0.04, 6400); // 0.19 a second link
  ding(c, o, 3100, t(0.45), 0.022, 0.1); // 0.45 the chain at the other end
  ding(c, o, 3250, t(0.68), 0.015, 0.08); // 0.68 a smaller rattle
  tick(c, o, t(0.86), 0.02, 6000); // 0.86 the last tiny chink
}
