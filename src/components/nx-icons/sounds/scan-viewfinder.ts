import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A short electronic zip as the four corners tighten and lock with a click, a thin scanner whine that climbs while the beam goes down and falls as it comes back up, a bar-code beep each time it crosses the centre dot, and a soft release. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 700, 2600, 0.03); // 0.00-0.18 the four corners tighten in
  tick(c, o, t(0.18), 0.1, 3400); // 0.18 the corners lock at their tightest
  blip(c, o, 1100, t(0.12), 0.03, 0.35, 2800, "triangle"); // 0.12-0.47 the scan line sweeps down, the whine climbs
  blip(c, o, 1760, t(0.295), 0.05, 0.06); // 0.30 the line crosses the centre dot, it swells: a beep
  blip(c, o, 2800, t(0.47), 0.03, 0.35, 1100, "triangle"); // 0.47-0.82 the line turns at the bottom and sweeps back up, the whine falls
  blip(c, o, 2350, t(0.645), 0.05, 0.06); // 0.65 the line crosses the dot again: a higher beep
  swish(c, o, t(0.72), t(0.18), 2200, 800, 0.02); // 0.72-0.90 the corners ease back out
  tick(c, o, t(0.88), 0.06, 3000); // 0.88 the corners settle home
}
