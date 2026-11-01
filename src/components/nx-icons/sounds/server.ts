import { blip, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.93;

/** A low fan drone with the irregular chatter of disk activity and a beep as each light blinks. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 95, t(0.02), 0.04, 0.85, 100, "sawtooth");
  puff(c, o, t(0.0), 0.9, 260, 0.04, "lowpass");
  [0.04, 0.09, 0.11, 0.19, 0.23, 0.31, 0.34, 0.4, 0.52, 0.57, 0.63].forEach((at, i) => tick(c, o, t(at), 0.05, 2600 + (i % 3) * 700));
  blip(c, o, N.A6, t(0.2), 0.04, 0.06);
  blip(c, o, N.A6, t(0.6), 0.04, 0.06);
}
