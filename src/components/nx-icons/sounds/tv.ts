import { ding, blip, tick, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.48;

/** Crackling static and a tuning whistle that rises until the picture snaps in with a soft thump and a clear tone. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.5, 6000, 0.05, "highpass");
  blip(c, o, 300, t(0.04), 0.04, 0.45, 1100, "sawtooth");
  [0.12, 0.26, 0.4].forEach((at) => tick(c, o, t(at), 0.07, 3000));
  thud(c, o, t(0.56), 120, 0.12, 0.08);
  blip(c, o, N.E6, t(0.58), 0.07, 0.35);
  ding(c, o, N.B6, t(0.6), 0.04, 0.5);
}
