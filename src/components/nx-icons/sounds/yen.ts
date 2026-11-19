import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.99;

/** Two sliding whooshes in opposite pitch directions as the bars leave the box and glide back, each landing on the stem with a light wooden click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.24), 1100, 3600, 0.035); // 0.00-0.24 the upper bar slides out to the right
  swish(c, o, t(0.1), t(0.24), 3400, 1000, 0.03); // 0.10-0.34 the lower bar slides out to the left
  swish(c, o, t(0.26), t(0.31), 2600, 1250, 0.03); // 0.24-0.58 the upper bar glides back in from the left
  tick(c, o, t(0.576), 0.08, 2300); // 0.58 the upper bar lands on the stem
  swish(c, o, t(0.36), t(0.34), 1300, 2900, 0.028); // 0.34-0.70 the lower bar glides back from the right
  tick(c, o, t(0.702), 0.07, 2750); // 0.70 the lower bar lands
}
