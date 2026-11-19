import { tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.61;

/** A fizzing hiss as the old sparks fade, a deep boom as the fresh burst explodes, then a run of crackles as the sparkles pop into place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.16, 6000, 0.03, "highpass"); // 0.00-0.16 the old sparks fizzle out
  thud(c, o, t(0.216), 80, 0.3, 0.25); // 0.22 the burst explodes
  puff(c, o, t(0.216), 0.25, 2500, 0.1); // 0.22 the blast of the explosion
  [0.5, 0.54, 0.58, 0.63].forEach((at, i) => tick(c, o, t(at), 0.09 - i * 0.015, 4200 + i * 500)); // 0.50-0.63 the sparkles crackle as they reach their places
}
