import { ding, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A crisp button click, a run of eight dry ticks as the hand sweeps its turn, then a second firmer click and three soft bells as it stops. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.06), 0.15, 2800);
  thud(c, o, t(0.07), 260, 0.05, 0.04);
  [0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.7, 0.78].forEach((at, i) => tick(c, o, t(at), 0.05 + i * 0.006, 3400));
  tick(c, o, t(0.98), 0.17, 2600);
  thud(c, o, t(0.99), 220, 0.06, 0.05);
  ding(c, o, N.C6, t(1.0), 0.06, 0.4);
  ding(c, o, N.G5, t(1.07), 0.04, 0.3);
  ding(c, o, N.B5, t(1.14), 0.03, 0.25);
}
