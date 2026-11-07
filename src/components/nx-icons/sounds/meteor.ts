import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.01;

/** A scream that rises as the meteor accelerates away, a pass-by whoosh that falls as it comes back in from the opposite corner, then fiery crackles as its flame trails flicker. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), 0.4, 500, 3000, 0.08); // 0.22 the meteor accelerates away
  swish(c, o, t(0.18), 0.24, 1800, 5500, 0.1); // 0.29 it streaks off the corner and is gone
  swish(c, o, t(0.42), 0.3, 3800, 700, 0.1); // 0.55 it sweeps back in from the other corner
  puff(c, o, t(0.7), 0.06, 5200, 0.045, "highpass"); // 0.70 flame trails shrink, crackle
  puff(c, o, t(0.75), 0.05, 6400, 0.04, "highpass"); // 0.75 second trail flickers
  puff(c, o, t(0.8), 0.05, 4600, 0.04, "highpass"); // 0.80 third trail flickers
  puff(c, o, t(0.86), 0.05, 5800, 0.03, "highpass"); // 0.86 trails flare back
  tick(c, o, t(0.99), 0.07, 5200); // 0.99 trails flicker short again
  puff(c, o, t(1.04), 0.05, 4400, 0.025, "highpass"); // 1.04 last flicker
}
