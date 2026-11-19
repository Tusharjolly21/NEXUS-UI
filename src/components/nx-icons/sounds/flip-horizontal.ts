import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.46;

/** A card flick through the air as the triangle flips over the mirror line, a crisp paper snap when it lands, then the same flick and snap pitched lower as it flips back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 2100, 5200, 0.035); // 0.00-0.40 the triangle flips over the axis
  puff(c, o, t(0.4), 0.03, 5600, 0.06, "highpass"); // 0.40 it snaps down onto its twin
  swish(c, o, t(0.6), t(0.4), 4300, 1800, 0.035); // 0.60-1.00 it flips back
  puff(c, o, t(1.0), 0.03, 4100, 0.06, "highpass"); // 1.00 it snaps home on the left
}
