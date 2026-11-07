import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 5.0;

/** Paper flicks as the colour cards fan out one after another, a soft pat as they fold, and two last pats as they settle back into the stack. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.34), 1800, 3600, 0.025); // 0.00-0.34 the first card fans left
  swish(c, o, t(0.08), t(0.34), 2200, 4200, 0.025); // 0.08-0.42 the third card fans right
  puff(c, o, t(0.15), 0.04, 3600, 0.07, "bandpass"); // 0.15 the first card flicks past
  puff(c, o, t(0.25), 0.04, 4400, 0.07, "bandpass"); // 0.25 the third card flicks past
  tick(c, o, t(0.35), 0.04, 6200); // 0.35 the first card reaches its widest
  tick(c, o, t(0.43), 0.04, 6800); // 0.43 the third card reaches its widest
  swish(c, o, t(0.5), t(0.35), 3800, 1500, 0.02); // 0.50-0.85 the cards fold back
  puff(c, o, t(0.6), 0.04, 3800, 0.07, "bandpass"); // 0.60 the first card flicks back
  puff(c, o, t(0.68), 0.04, 4200, 0.07, "bandpass"); // 0.68 the third card flicks back
  puff(c, o, t(0.85), 0.05, 1400, 0.06, "lowpass"); // 0.85 the first card pats onto the stack
  puff(c, o, t(0.93), 0.05, 1200, 0.06, "lowpass"); // 0.93 the third card pats onto the stack
}
