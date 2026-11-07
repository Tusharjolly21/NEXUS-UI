import { swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** A dry pen scratch that follows the drawn line in three strokes (up, down through the loop, then the tail), with a tap where the nib touches down, a tick at each turn of the stroke (0.3 and 0.6) and a final tap as the pen finishes at 0.9. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02 nib touches the paper
  tick(c, o, t(0.02), 0.08, 3000);
  puff(c, o, t(0.02), 0.85, 5000, 0.012, "highpass");
  // 0.02-0.3 upstroke to the top of the S
  swish(c, o, t(0.02), t(0.28), 2800, 5200, 0.03);
  // 0.3 the stroke turns at the top
  tick(c, o, t(0.3), 0.07, 3400);
  // 0.3-0.6 down through the loop
  swish(c, o, t(0.3), t(0.3), 5200, 3000, 0.03);
  // 0.6 the stroke turns at the bottom of the loop
  tick(c, o, t(0.6), 0.07, 3800);
  // 0.6-0.9 tail to the right
  swish(c, o, t(0.6), t(0.3), 3000, 4800, 0.03);
  // 0.9 the pen finishes the line
  thud(c, o, t(0.9), 240, 0.07, 0.05);
  tick(c, o, t(0.9), 0.06, 4200);
}
