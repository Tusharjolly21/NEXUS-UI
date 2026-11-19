import { swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.79;

/** A rising whoosh of fire as the torch is lifted, a crackle at each flare of the flame and a soft breath as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 600, 1800, 0.045); // 0.00-0.27 the torch lifts and the flame swells
  puff(c, o, t(0.27), 0.12, 1500, 0.05); // 0.27 the flame flares at its tallest
  tick(c, o, t(0.27), 0.05, 4200); // 0.27 a crackle in the flare
  tick(c, o, t(0.45), 0.035, 3600); // 0.45 the flame snaps smaller
  puff(c, o, t(0.65), 0.1, 1300, 0.04); // 0.65 the flame flares again
  tick(c, o, t(0.66), 0.03, 4600); // 0.65 a second crackle
  puff(c, o, t(0.8), 0.14, 700, 0.025, "lowpass"); // 0.80-0.90 the flame settles
}
