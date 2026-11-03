import { ding, blip, swish, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.6;

/** A sharp crackle as the bolt strikes, a buzzing fall as it flashes twice, then a low rumble of thunder rolling away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.1), 0.1, 6000, 0.1, "highpass");
  blip(c, o, 1800, t(0.1), 0.06, 0.18, 220, "sawtooth");
  puff(c, o, t(0.5), 0.07, 5000, 0.08, "highpass");
  blip(c, o, 1400, t(0.5), 0.04, 0.14, 180, "sawtooth");
  thud(c, o, t(0.22), 62, 0.28, 0.4);
  blip(c, o, N.E4, t(0.28), 0.04, 0.3, undefined, "triangle");
  swish(c, o, t(0.3), t(0.55), 400, 120, 0.05);
  ding(c, o, N.B6, t(0.14), 0.03, 0.3);
  ding(c, o, N.D7, t(0.52), 0.02, 0.25);
}
