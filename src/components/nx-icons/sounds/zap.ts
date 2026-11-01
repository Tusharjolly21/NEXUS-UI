import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.61;

/** A buzzing electric crack on each flash, crackling sparks, and thunder rolling after. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.15), 0.25, 5800, 0.06, "highpass");
  blip(c, o, 120, t(0.15), 0.1, 0.22, 90, "sawtooth");
  puff(c, o, t(0.5), 0.2, 4800, 0.05, "highpass");
  blip(c, o, 140, t(0.5), 0.08, 0.2, 100, "sawtooth");
  [0.2, 0.26, 0.55].forEach((at) => tick(c, o, t(at), 0.07, 6500));
  puff(c, o, t(0.3), 0.7, 120, 0.07, "lowpass");
}
