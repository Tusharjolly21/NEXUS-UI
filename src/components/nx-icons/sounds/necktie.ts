import { thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Soft silky rustles as the tie swings from its knot, one on each pass and each quieter than the last, with a faint cloth thump as it hangs still. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.16, 2200, 0.06, "bandpass"); // 0.00-0.20 the tie swings out
  puff(c, o, t(0.22), 0.18, 1900, 0.055); // 0.22-0.44 it swings back across
  puff(c, o, t(0.46), 0.16, 2300, 0.04); // 0.46-0.66 a smaller swing out
  puff(c, o, t(0.67), 0.14, 2000, 0.03); // 0.67-0.84 a smaller swing back
  puff(c, o, t(0.86), 0.12, 1700, 0.02); // 0.86-1.00 the last little sway
  thud(c, o, t(1.0), 100, 0.03, 0.08); // 1.00 it hangs still
}
