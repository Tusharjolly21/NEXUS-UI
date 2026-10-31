import { ding, blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.48;

/** Pages riffling and two ring clicks, a note for each day that lights up, and a bright ding for today. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 0.07, 0.14, 0.21].forEach((at, i) => tick(c, o, t(at), 0.1 - i * 0.015, 3600));
  puff(c, o, t(0.02), 0.2, 3000, 0.03);
  tick(c, o, t(0.05), 0.12, 2400);
  tick(c, o, t(0.12), 0.12, 2400);
  [N.C6, N.E6, N.G6, N.C7, N.E7].forEach((f, i) => blip(c, o, f, t(0.25 + i * 0.1), 0.06, 0.1));
  ding(c, o, N.G6, t(0.7), 0.1, 0.5);
  ding(c, o, N.C7, t(0.7), 0.05, 0.5);
}
