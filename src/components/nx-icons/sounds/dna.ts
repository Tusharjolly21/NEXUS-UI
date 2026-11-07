import { ding, plink, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A spiralling run of tiny plucked notes that climbs and falls twice as the helix turns, ending on one soft double chime. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.E5, N.B5, N.G5, N.D6, N.A5, N.E6, N.D6, N.G5, N.B5, N.E5].forEach((f, i) => plink(c, o, f, t(0.06 + i * 0.09), 0.05, 0.14));
  swish(c, o, t(0.04), t(0.9), 600, 1800, 0.014);
  ding(c, o, N.A6, t(0.97), 0.05, 0.5);
  ding(c, o, N.E6, t(1.03), 0.04, 0.45);
}
