import { ding, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.36;

/** Three cloth flaps on the hanger, each a little lighter, a hanger tick, and a sparkly two-note ding for the star. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.22, 0.45, 0.68].forEach((at, i) => { puff(c, o, t(at), 0.16, 700 - i * 150, 0.07, "lowpass"); puff(c, o, t(at), 0.1, 3200, 0.025, "bandpass"); });
  tick(c, o, t(0.02), 0.06, 4800);
  ding(c, o, N.G6, t(0.52), 0.05, 0.4);
  ding(c, o, N.C7, t(0.58), 0.04, 0.4);
}
