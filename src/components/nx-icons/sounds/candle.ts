import { tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft breath of flame at each flicker with a tiny crackle where the flame snaps back, calming as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  puff(c, o, t(0.0), 0.16, 900, 0.07); // 0.00-0.18 the flame swells up
  puff(c, o, t(0.2), 0.12, 700, 0.05); // 0.20 the flame leans over to the right
  puff(c, o, t(0.36), 0.12, 1000, 0.05); // 0.36 the flame shrinks, a soft breath
  tick(c, o, t(0.378), 0.05, 3800); // 0.38 the flame snaps back with a crackle
  puff(c, o, t(0.54), 0.1, 800, 0.04); // 0.56 the flame swells a little
  tick(c, o, t(0.738), 0.035, 3100); // 0.74 a last small crackle as the flame settles
  puff(c, o, t(0.8), 0.1, 600, 0.025); // 0.80 the flame calms
}
