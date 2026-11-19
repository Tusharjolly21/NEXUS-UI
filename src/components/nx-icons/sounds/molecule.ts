import { ding, blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.66;

/** Three springy boings one after another as each atom stretches out on its bond, and a soft glassy tick as the last one settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 430, t(0.22), 0.05, 0.12, 650); // 0.24 the first atom stretches out
  blip(c, o, 500, t(0.3), 0.045, 0.12, 750); // 0.32 the second atom stretches out
  blip(c, o, 570, t(0.38), 0.04, 0.12, 860); // 0.40 the third atom stretches out
  ding(c, o, 2480, t(0.96), 0.02, 0.15); // 0.96 the last atom settles
}
