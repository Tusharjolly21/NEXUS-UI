import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 8.0;

/** A very soft dry flutter of the wings on each close and open, with a faint breath of air as it floats up. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.03), t(0.16), 2600, 4400, 0.02); // 0.10 wings fold in
  swish(c, o, t(0.23), t(0.16), 4400, 2800, 0.018); // 0.30 wings open
  swish(c, o, t(0.43), t(0.16), 2600, 4400, 0.02); // 0.50 wings fold in again
  swish(c, o, t(0.63), t(0.16), 4400, 2800, 0.018); // 0.70 wings open
  puff(c, o, t(0.1), 0.05, 6500, 0.012, "highpass"); // 0.10 wing flutter detail
  puff(c, o, t(0.5), 0.05, 6500, 0.012, "highpass"); // 0.50 wing flutter detail
  swish(c, o, t(0.05), t(0.8), 900, 1500, 0.008); // 0.05-0.85 body floats upward
}
