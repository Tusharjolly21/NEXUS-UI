import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.55;

/** A quiet draw back, a fast whoosh as the axe swings down, a woody crack with a hollow tock as the blade bites, two small chip ticks as the chip spins away, and a low sigh as the axe eases back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.24), 380, 800, 0.03); // 0.02-0.26 the axe is drawn back
  swish(c, o, t(0.28), t(0.17), 700, 3600, 0.07); // 0.28-0.45 the swing down, fastest near 0.36
  thud(c, o, t(0.45), 120, 0.34, 0.14); // 0.45 the blade bites the wood
  tick(c, o, t(0.45), 0.16, 1400); // 0.45 wood cracks
  blip(c, o, 540, t(0.45), 0.1, 0.1, 230, "triangle"); // 0.45 hollow tock of the log
  tick(c, o, t(0.6), 0.05, 4000); // 0.60 the chip spins past the top of its flight
  tick(c, o, t(0.74), 0.04, 3100); // 0.74 the chip comes down
  swish(c, o, t(0.58), t(0.3), 330, 700, 0.025); // 0.58-0.88 the axe eases back to rest
}
