import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.22;

/** A mechanical whirr as the tray slides up, a crisp click as it seats, and a happy ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 600, 2200, 0.04);
  [0.06, 0.12, 0.18, 0.24].forEach((at) => tick(c, o, t(at), 0.05, 3200));
  thud(c, o, t(0.48), 150, 0.16, 0.08);
  tick(c, o, t(0.5), 0.14, 2800);
  ding(c, o, N.C7, t(0.52), 0.08, 0.45);
}
