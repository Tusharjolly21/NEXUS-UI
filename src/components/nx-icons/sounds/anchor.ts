import { ding, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.94;

/** A splash as the anchor plunges, a deep bell tone, and three clinking chain links, each softer as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 2400, 500, 0.05);
  puff(c, o, t(0.2), 0.18, 900, 0.07, "bandpass");
  thud(c, o, t(0.2), 80, 0.14, 0.15);
  [0.3, 0.58, 0.85].forEach((at, i) => { tick(c, o, t(at), 0.1 - i * 0.025, 3400); ding(c, o, N.A6 - i * 150, t(at), 0.05, 0.25); });
  ding(c, o, N.C4, t(0.1), 0.1, 0.9);
}
