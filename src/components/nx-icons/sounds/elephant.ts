import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.21;

/** A brassy trumpet that swells as the trunk swings, with two leathery flaps of the big ears. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.18, 420, 0.06, "lowpass"); // 0.00-0.20 the ears sweep in, a heavy leathery flap
  blip(c, o, 300, t(0.2), 0.06, 0.45, 560, "sawtooth"); // 0.20-0.65 the elephant trumpets as the trunk swings across
  blip(c, o, 450, t(0.22), 0.03, 0.4, 820, "triangle"); // 0.22 the bright edge of the trumpet call
  puff(c, o, t(0.41), 0.18, 380, 0.05, "lowpass"); // 0.41-0.63 the ears flap again
  thud(c, o, t(0.63), 90, 0.06, 0.18); // 0.63 the ears meet the head with weight
}
