import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A latch snap and a springy pop as the lid flies up, a metal clink and rattle as a wrench and hammer rise, then a heavy clunk when it shuts. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.02), 0.14, 2400);
  blip(c, o, 260, t(0.06), 0.08, 0.16, 520, "triangle");
  ding(c, o, N.D7, t(0.3), 0.06, 0.35);
  ding(c, o, N.G6, t(0.36), 0.03, 0.25);
  [0.46, 0.54, 0.6].forEach((at) => tick(c, o, t(at), 0.06, 5400));
  puff(c, o, t(0.84), 0.06, 1200, 0.05, "lowpass");
  thud(c, o, t(0.9), 120, 0.3, 0.12);
  tick(c, o, t(0.92), 0.1, 2000);
}
