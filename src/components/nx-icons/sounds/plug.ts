import { ding, blip, swish, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.89;

/** A low pull as the plug leaves the socket, then a push, a thud, a crackle of spark and a short buzz as power flows. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.26), 1600, 500, 0.04);
  tick(c, o, t(0.28), 0.1, 2400);
  swish(c, o, t(0.38), t(0.18), 500, 2200, 0.05);
  thud(c, o, t(0.56), 110, 0.22, 0.1);
  puff(c, o, t(0.56), 0.14, 6500, 0.07, "highpass");
  blip(c, o, 180, t(0.56), 0.05, 0.18, 90, "sawtooth");
  ding(c, o, N.A6, t(0.64), 0.06, 0.4);
}
