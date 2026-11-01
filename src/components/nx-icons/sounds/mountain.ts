import { ding, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.98;

/** A deep rumble as the peaks lift, a rising string-like swell, and three icy glints as the snow line draws in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.02), 0.5, 160, 0.09, "lowpass");
  thud(c, o, t(0.04), 60, 0.2, 0.25);
  blip(c, o, 130, t(0.05), 0.05, 0.5, 260, "triangle");
  swish(c, o, t(0.08), t(0.4), 400, 1800, 0.02);
  [0.4, 0.5, 0.58].forEach((at, i) => ding(c, o, [N.E7, N.G7, N.C8][i], t(at), 0.03, 0.4));
  ding(c, o, N.E6, t(0.65), 0.05, 0.7);
}
