import { swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft low rustle as the ball is pulled back, then a run of dry ticks that speed up as each stitch whips past, ending in a whip of air at the release. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.25, 400, 250, 0.025); // 0.11 the ball is pulled back
  tick(c, o, t(0.314), 0.09, 3200); // 0.314 stitch passes (0 degrees)
  tick(c, o, t(0.356), 0.09, 3500); // 0.356 stitch passes (45)
  tick(c, o, t(0.388), 0.1, 3800); // 0.388 (90)
  tick(c, o, t(0.416), 0.1, 4100); // 0.416 (135)
  tick(c, o, t(0.441), 0.1, 4400); // 0.441 (180)
  tick(c, o, t(0.465), 0.11, 4700); // 0.465 (225)
  tick(c, o, t(0.487), 0.11, 5000); // 0.487 (270)
  tick(c, o, t(0.508), 0.11, 5300); // 0.508 (315)
  tick(c, o, t(0.528), 0.11, 5600); // 0.528 (360), the spin peaks
  swish(c, o, t(0.41), 0.24, 1000, 3800, 0.06); // 0.52 whip of air as the ball is released
  swish(c, o, t(0.56), 0.3, 2400, 800, 0.02); // 0.7 the ball slows and settles
}
