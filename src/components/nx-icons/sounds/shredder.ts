import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.0;

/** A paper feed whoosh and quick cutting ticks as the sheet is pulled in, a low motor growl under the shudder, soft papery puffs as the red strips drop into the bin, and a swish as a fresh sheet slides in from above. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.4), 500, 2200, 0.03); // 0.00-0.40 the sheet is pulled in, faster and faster
  [0.12, 0.2, 0.26, 0.31, 0.35, 0.38].forEach((at, i) => tick(c, o, t(at), 0.06, 2400 + i * 200)); // 0.12-0.38 the cutters bite
  blip(c, o, 92, t(0.1), 0.05, 0.8, 104, "sawtooth"); // 0.10-0.90 the motor growls while the head shudders
  swish(c, o, t(0.41), t(0.55), 1800, 900, 0.02); // 0.41-0.96 a fresh sheet slides in from above
  puff(c, o, t(0.48), 0.07, 2200, 0.03); // 0.48 strips start to emerge
  puff(c, o, t(0.88), 0.05, 2000, 0.03); // 0.90 the first strip reaches the bottom
  puff(c, o, t(0.97), 0.05, 2300, 0.03); // 0.99 the second strip lands
  puff(c, o, t(1.06), 0.05, 2600, 0.03); // 1.08 the third strip lands
}
