import { ding, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.98;

/** A bright metal clank each time the lid drops back on the pot, with a hiss of steam every time it lifts, getting quieter as the boil calms. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.12), 0.12, 5000, 0.05); // 0.14 the lid lifts, steam escapes
  ding(c, o, 1250, t(0.272), 0.08, 0.22); // 0.27 the lid drops back: clank
  puff(c, o, t(0.4), 0.1, 5200, 0.04); // 0.42 the lid lifts again
  ding(c, o, 1180, t(0.544), 0.06, 0.2); // 0.54 the lid clanks down
  puff(c, o, t(0.65), 0.1, 5400, 0.03); // 0.67 a small lift
  ding(c, o, 1120, t(0.8), 0.04, 0.2); // 0.80 the lid rests
  swish(c, o, t(0.15), t(0.7), 3500, 2000, 0.015); // 0.15-0.87 steam drifts up
}
