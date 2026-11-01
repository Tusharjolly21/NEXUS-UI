import { ding, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.53;

/** A rising ratchet of ticks as the hammer lifts, a swish down, and a hard clank with a ringing overtone on impact. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.1, 0.16, 0.22, 0.28, 0.34].forEach((at, i) => tick(c, o, t(at), 0.05, 2000 + i * 200));
  swish(c, o, t(0.38), t(0.2), 700, 2800, 0.04);
  tick(c, o, t(0.56), 0.2, 3600);
  ding(c, o, N.A6, t(0.56), 0.1, 0.6);
  ding(c, o, N.E7, t(0.56), 0.05, 0.4);
  thud(c, o, t(0.56), 100, 0.24, 0.1);
}
