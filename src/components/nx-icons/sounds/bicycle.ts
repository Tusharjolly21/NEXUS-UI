import { ding, swish, tick, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.12;

/** The freewheel ticking faster and faster as the wheels spin up, then two bright rings of a bicycle bell. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.14, 0.23, 0.31, 0.38, 0.44, 0.5, 0.55, 0.59].forEach((at, i) => tick(c, o, t(at), 0.05 + i * 0.006, 3400 + i * 150));
  swish(c, o, t(0.05), t(0.55), 500, 1500, 0.015);
  ding(c, o, N.E7, t(0.7), 0.09, 0.5);
  ding(c, o, N.E7, t(0.8), 0.07, 0.5);
}
