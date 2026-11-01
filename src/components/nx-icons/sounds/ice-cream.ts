import { ding, plink, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.58;

/** A soft thump as the scoop settles, a crisp crunch as the waffle draws in, and a cherry plink. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.04), 120, 0.14, 0.1);
  [0.18, 0.26, 0.34].forEach((at, i) => { tick(c, o, t(at), 0.08, 3200 + i * 300); puff(c, o, t(at), 0.03, 4800, 0.03, "highpass"); });
  plink(c, o, N.G6, t(0.12), 0.07, 0.14);
  ding(c, o, N.E7, t(0.5), 0.06, 0.4);
}
