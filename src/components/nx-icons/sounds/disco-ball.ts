import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.46;

/** A glassy glitter rattle that follows the rocking mirror ball, quick light zips as the rays flash on and off, and four bright glass chimes of rising and falling pitch as the tiles glint in turn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.6), 2500, 5500, 0.022); // 0.02 the ball rocks one way
  swish(c, o, t(0.62), t(0.6), 5500, 2500, 0.022); // 0.62 the ball rocks back
  swish(c, o, t(0.1), t(0.17), 9000, 6000, 0.03); // 0.10 a ray flashes out
  swish(c, o, t(0.3), t(0.17), 6000, 9500, 0.03); // 0.30 a ray flashes on
  ding(c, o, 3520, t(0.4), 0.07, 0.4); // 0.40 first tile glints
  swish(c, o, t(0.5), t(0.17), 6000, 9500, 0.03); // 0.50 a ray flashes on
  ding(c, o, 4699, t(0.65), 0.065, 0.4); // 0.65 second tile glints
  swish(c, o, t(0.7), t(0.17), 9000, 6000, 0.03); // 0.70 a ray flashes out
  ding(c, o, 3951, t(0.9), 0.065, 0.4); // 0.90 third tile glints
  ding(c, o, 5588, t(1.15), 0.06, 0.3); // 1.15 fourth tile glints
}
