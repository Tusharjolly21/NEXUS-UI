import { ding, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** Quick keyboard clacks as the command types, an enter press, and a ding when it runs. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.2, 0.27, 0.33, 0.42, 0.48, 0.54, 0.6].forEach((at, i) => { tick(c, o, t(at), 0.1, 2400 + (i % 3) * 500); thud(c, o, t(at), 260, 0.03, 0.02); });
  thud(c, o, t(0.7), 150, 0.1, 0.06);
  tick(c, o, t(0.7), 0.14, 2200);
  ding(c, o, N.G6, t(0.78), 0.07, 0.5);
}
