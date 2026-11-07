import { ding, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rush of air as the hands part, a firm low clasp, a quick triple shake of dry taps, and a bright two-note sparkle on the join. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.22), 500, 1100, 0.03);
  thud(c, o, t(0.35), 100, 0.26, 0.12);
  puff(c, o, t(0.35), 0.06, 900, 0.05, "lowpass");
  [0.47, 0.55, 0.64].forEach((at, i) => blip(c, o, 340 + i * 40, t(at), 0.06, 0.05, 280 + i * 40, "triangle"));
  ding(c, o, N.D5, t(0.6), 0.06, 0.4);
  ding(c, o, N.B6, t(0.68), 0.05, 0.45);
  ding(c, o, N.G7, t(0.77), 0.03, 0.4);
}
