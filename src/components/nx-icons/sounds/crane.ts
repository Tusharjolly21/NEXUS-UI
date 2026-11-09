import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A winch ratchet of seven quick ticks under a rising motor whine as the load is hoisted (0.00 to 0.33), a cable twang and clunk when it stops, a deep steel groan and slow hum while the jib swings out (0.33 to 0.70), then six slower ticks with a falling whine as it swings back and lowers, ending in a thud as the load sets down at 1.10. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00-0.33 the winch hoists the load, motor whine rising, ratchet ticking on the drum
  blip(c, o, 260, t(0.0), 0.03, 0.33, 520, "triangle");
  tick(c, o, t(0.02), 0.09, 3200);
  tick(c, o, t(0.07), 0.09, 3200);
  tick(c, o, t(0.12), 0.09, 3200);
  tick(c, o, t(0.17), 0.09, 3200);
  tick(c, o, t(0.22), 0.09, 3200);
  tick(c, o, t(0.27), 0.09, 3200);
  tick(c, o, t(0.32), 0.09, 3200);
  // 0.33 the load stops at the top, the cable twangs
  blip(c, o, 880, t(0.33), 0.03, 0.2, 800);
  thud(c, o, t(0.33), 150, 0.12, 0.08);
  // 0.33-0.70 the jib swings out, a steel groan and a low hum
  blip(c, o, 140, t(0.35), 0.05, 0.36, 190, "triangle");
  swish(c, o, t(0.33), t(0.37), 300, 700, 0.028);
  // 0.70 the swing turns round at its widest point
  tick(c, o, t(0.7), 0.08, 1800);
  // 0.72-1.10 the jib swings back and the load comes down, whine falling, ratchet slower
  blip(c, o, 520, t(0.72), 0.03, 0.38, 250, "triangle");
  swish(c, o, t(0.72), t(0.36), 700, 300, 0.025);
  tick(c, o, t(0.76), 0.08, 2800);
  tick(c, o, t(0.83), 0.08, 2800);
  tick(c, o, t(0.9), 0.08, 2800);
  tick(c, o, t(0.97), 0.08, 2800);
  tick(c, o, t(1.04), 0.08, 2800);
  // 1.10 the load sets down
  thud(c, o, t(1.1), 85, 0.2, 0.14);
}
