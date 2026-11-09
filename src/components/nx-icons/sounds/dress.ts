import { swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 6.92;

/** Five soft cloth swishes, one for each swing of the skirt, alternating rising and falling in pitch and fading as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 900, 2400, 0.05); // 0.00-0.17 skirt swings left
  swish(c, o, t(0.15), t(0.22), 2600, 900, 0.055); // 0.17-0.34 skirt swings right, the widest swing
  swish(c, o, t(0.33), t(0.2), 900, 2300, 0.04); // 0.34-0.51 swings back left
  swish(c, o, t(0.5), t(0.2), 2200, 900, 0.028); // 0.51-0.68 swings right, smaller
  swish(c, o, t(0.67), t(0.2), 900, 1800, 0.016); // 0.68-0.85 the last small sway
}
