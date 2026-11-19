import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.14;

/** A low grinding scrape of marble as the pediment lifts and rocks, a heavy stone thud as it comes down, a puff of dust and a small knock as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.34), 260, 520, 0.05); // 0.00-0.34 marble grinds as the roof lifts
  swish(c, o, t(0.34), t(0.3), 480, 300, 0.035); // 0.34-0.64 it rocks and starts to come down
  thud(c, o, t(0.66), 85, 0.2, 0.18); // 0.66 the roof lands on the columns
  puff(c, o, t(0.67), 0.18, 700, 0.03, "lowpass"); // 0.67 dust shakes off the stone
  thud(c, o, t(1.0), 120, 0.07, 0.08); // 1.00 the little bump settles
}
