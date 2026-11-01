import { ding, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.63;

/** Eight crisp tick-tocks, alternating in pitch, one for each step of the second hand, and a small chime at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  for (let k = 0; k < 8; k++) {
    tick(c, o, t(0.08 + k * 0.1), 0.09, k % 2 ? 2200 : 3400);
    if (k % 2) thud(c, o, t(0.08 + k * 0.1), 240, 0.03, 0.02);
  }
  ding(c, o, N.C7, t(0.88), 0.05, 0.4);
}
