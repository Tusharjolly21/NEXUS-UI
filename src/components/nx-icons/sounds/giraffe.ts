import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.53;

/** A slow airy sweep as the long neck dips, a rustle and two crunchy nibbles at the bottom of the dip, and a soft knock as the head nods back up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.33), 500, 1200, 0.03); // 0.00-0.33 the neck bends down
  puff(c, o, t(0.33), 0.12, 3600, 0.05); // 0.33 the head reaches the leaves: a rustle
  tick(c, o, t(0.36), 0.06, 2600); // 0.36 the first nibble
  tick(c, o, t(0.45), 0.05, 2300); // 0.45 the second nibble
  swish(c, o, t(0.5), t(0.33), 1100, 600, 0.025); // 0.50-0.83 the neck lifts back up
  blip(c, o, 180, t(0.83), 0.06, 0.1, 140, "triangle"); // 0.83 the little nod at the top
}
