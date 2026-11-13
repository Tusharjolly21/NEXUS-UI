import { swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 8;

/** A soft breath of air that rises on the inhale and falls away on the exhale. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.5), 350, 1100, 0.03); // 0.00-0.50 the lungs fill, rising air
  swish(c, o, t(0.5), t(0.4), 900, 300, 0.024); // 0.50-0.90 the breath leaves
}
