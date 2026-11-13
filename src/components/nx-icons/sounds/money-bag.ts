import { ding, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.66;

/** A soft sack thump as the bag squashes, then coin dings that follow the dollar sign as it flips: one at the far side of the flip and a higher one when it faces front again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.16), 100, 0.12, 0.1); // 0.16 the bag squashes down
  puff(c, o, t(0.16), 0.08, 1500, 0.04, "lowpass"); // 0.16 the sack crinkles
  tick(c, o, t(0.3), 0.07, 5200); // 0.30 the dollar sign is edge-on
  ding(c, o, 2960, t(0.5), 0.07, 0.35); // 0.50 the dollar sign is flipped over
  tick(c, o, t(0.7), 0.07, 5600); // 0.70 edge-on again
  ding(c, o, 3720, t(0.9), 0.06, 0.4); // 0.90 the dollar sign faces front again
}
