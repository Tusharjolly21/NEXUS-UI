import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.41;

/** A wet squeezy sputter that follows the mustard as it is piped along the sausage, ending in a tiny splat. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.65), 1100, 1700, 0.03); // 0.00-0.65 the mustard is piped along the sausage
  [0.04, 0.2, 0.36, 0.52].forEach((at, i) => blip(c, o, 210 + i * 12, t(at), 0.035, 0.05, 160, "sawtooth")); // 0.04 0.20 0.36 0.52 the bottle sputters at each squiggle
  blip(c, o, 520, t(0.65), 0.05, 0.06, 300); // 0.65 the squiggle ends with a small splat
}
