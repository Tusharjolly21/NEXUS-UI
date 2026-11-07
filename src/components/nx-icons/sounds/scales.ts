import { ding, swish, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A wooden thud and creak as the beam tips, a heavier thud the other way, then smaller and smaller knocks, closing with a calm two-tone chime when the scales settle level. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), t(0.3), 300, 900, 0.03);
  thud(c, o, t(0.3), 130, 0.26, 0.16);
  swish(c, o, t(0.38), t(0.4), 900, 300, 0.028);
  thud(c, o, t(0.76), 105, 0.2, 0.14);
  thud(c, o, t(1.0), 90, 0.1, 0.12);
  ding(c, o, N.D5, t(1.1), 0.05, 0.6);
  ding(c, o, N.A5, t(1.2), 0.04, 0.6);
}
