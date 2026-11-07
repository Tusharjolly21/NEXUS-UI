import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low slosh as the olive dips in, then a bright glassy clink of two bells and three sparkling high notes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.06), t(0.3), 400, 900, 0.03);
  blip(c, o, 320, t(0.34), 0.06, 0.1, 210);
  ding(c, o, 2960, t(0.58), 0.1, 0.5);
  ding(c, o, 3720, t(0.6), 0.07, 0.4);
  [N.E7, N.A6, N.C8].forEach((f, i) => ding(c, o, f, t(0.7 + i * 0.07), 0.03, 0.3));
}
