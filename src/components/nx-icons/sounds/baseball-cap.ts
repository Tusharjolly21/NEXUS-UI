import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A cloth swish as the cap tips forward, a soft fabric flop where it turns, then a smaller swish and flop as it swings back past level and a last tiny flop as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.25, 1900, 800, 0.12); // 0.0 to 0.25 the cap tips forward on its peak, fastest at 0.13
  puff(c, o, t(0.25), 0.09, 750, 0.12, "lowpass"); // 0.26 the cap is at its furthest forward tip
  swish(c, o, t(0.27), 0.25, 800, 1700, 0.1); // 0.26 to 0.51 it swings back past level, fastest at 0.38
  puff(c, o, t(0.51), 0.08, 850, 0.09, "lowpass"); // 0.51 it reaches its furthest back tilt
  puff(c, o, t(0.68), 0.07, 950, 0.06, "lowpass"); // 0.68 the small rebound
  puff(c, o, t(0.84), 0.06, 700, 0.04, "lowpass"); // 0.85 the cap settles at rest
}
