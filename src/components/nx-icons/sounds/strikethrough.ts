import { ding, blip, swish, tick, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.84;

/** A quick sharp slash of air, a dry click as the line lands, and a dull falling note while the letter fades, answered by a small bell when it returns. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.12), t(0.22), 4800, 1200, 0.06);
  tick(c, o, t(0.3), 0.12, 6000);
  blip(c, o, N.G4, t(0.32), 0.06, 0.25, N.C4, "square");
  puff(c, o, t(0.32), 0.1, 2200, 0.04, "bandpass");
  ding(c, o, N.B5, t(0.7), 0.05, 0.3);
}
