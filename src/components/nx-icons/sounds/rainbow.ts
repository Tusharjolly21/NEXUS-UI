import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.12;

/** Three sliding notes climbing C, E, G as each arc is painted, then three bright bells shimmering at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [N.C5, N.E5, N.G5].forEach((f, i) => blip(c, o, f, t(0.02 + i * 0.14), 0.07, 0.4, f * 1.5, "triangle"));
  swish(c, o, t(0.05), t(0.6), 1000, 4200, 0.02);
  ding(c, o, N.C7, t(0.72), 0.07, 0.7);
  ding(c, o, N.G7, t(0.82), 0.04, 0.6);
  ding(c, o, N.E7, t(0.94), 0.03, 0.5);
}
