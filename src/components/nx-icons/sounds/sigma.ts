import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.74;

/** A rising sweep with a pitch glide as the sign draws itself in, three pops counting up beside it, then a shimmering sweep and two bells for the total. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 600, 3000, 0.04);
  blip(c, o, N.A4, t(0.05), 0.05, 0.5, N.E5, "triangle");
  [N.D5, N.G5, N.B5].forEach((f, i) => blip(c, o, f, t(0.4 + i * 0.1), 0.07, 0.07, undefined, "square"));
  swish(c, o, t(0.72), t(0.4), 1500, 4200, 0.03);
  ding(c, o, N.E7, t(0.98), 0.05, 0.5);
  ding(c, o, N.B6, t(1.06), 0.04, 0.4);
}
