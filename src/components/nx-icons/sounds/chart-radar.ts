import { ding, blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.1;

/** A soft sonar sweep for each of the three reshapes, rising, falling, then rising again, each ending in a fine tick and a small glassy ping where the shape locks in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 420, t(0.04), 0.045, 0.3, 820, "sine"); // 0.04-0.33 the first reshape sweeps open
  tick(c, o, t(0.33), 0.08, 3600); // 0.33 the vertices lock
  ding(c, o, 1880, t(0.33), 0.035, 0.14); // 0.33 ping
  blip(c, o, 900, t(0.37), 0.04, 0.3, 500, "sine"); // 0.37-0.66 the second reshape sweeps down
  tick(c, o, t(0.66), 0.08, 3000); // 0.66 lock
  ding(c, o, 1480, t(0.66), 0.035, 0.14); // 0.66 lower ping
  blip(c, o, 520, t(0.7), 0.04, 0.3, 1000, "sine"); // 0.70-1.0 the shape returns to its start
  tick(c, o, t(1.0), 0.09, 3800); // 1.00 it settles
  ding(c, o, 2250, t(1.0), 0.04, 0.25); // 1.00 final ping
}
