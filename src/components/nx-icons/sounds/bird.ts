import { blip, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two soft feathery flaps with a rapid pair of rising chirps between them and a last short trill as the head bobs. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.08), 0.1, 5600, 0.04, "highpass");
  puff(c, o, t(0.4), 0.1, 5000, 0.04, "highpass");
  blip(c, o, N.E7, t(0.18), 0.05, 0.05, N.G7);
  blip(c, o, N.B6, t(0.28), 0.05, 0.06, N.D7);
  blip(c, o, N.G7, t(0.62), 0.045, 0.05, N.E7);
  blip(c, o, N.D7, t(0.7), 0.04, 0.05, N.B6);
}
