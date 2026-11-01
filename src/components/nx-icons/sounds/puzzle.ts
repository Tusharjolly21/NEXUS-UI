import { ding, blip, swish, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.88;

/** A slide as the piece arrives, a satisfying click when it fits, and a happy ding. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 600, 2400, 0.04);
  tick(c, o, t(0.35), 0.16, 2400);
  thud(c, o, t(0.35), 200, 0.12, 0.06);
  blip(c, o, N.G6, t(0.37), 0.06, 0.1);
  ding(c, o, N.C7, t(0.44), 0.08, 0.5);
}
