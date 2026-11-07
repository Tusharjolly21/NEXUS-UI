import { ding, blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** An engine that revs up in three rising bursts, a rough pop of the exhaust as the front wheel lifts, a whirr of spinning wheels, and a low thump when it lands with a faint bell rattle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2].forEach((i) => blip(c, o, 70 + i * 38, t(0.02 + i * 0.1), 0.07, 0.14, 120 + i * 60, "sawtooth"));
  puff(c, o, t(0.3), 0.07, 700, 0.09, "lowpass");
  swish(c, o, t(0.3), t(0.4), 400, 2400, 0.03);
  [0.34, 0.42, 0.5, 0.58].forEach((at) => tick(c, o, t(at), 0.04, 4200));
  thud(c, o, t(0.84), 95, 0.28, 0.16);
  ding(c, o, N.C4, t(0.88), 0.03, 0.4);
  ding(c, o, N.G6, t(0.92), 0.02, 0.3);
  ding(c, o, N.E4, t(0.98), 0.02, 0.4);
}
