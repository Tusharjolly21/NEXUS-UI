import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.68;

/** A rubbery bonk each time the ball hits the floor, a hollow thud under it, with soft air as it falls and rises between the two bounces. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.26, 500, 1300, 0.028); // 0.14 the ball drops, air rushes past
  thud(c, o, t(0.26), 122, 0.26, 0.17); // 0.26 first impact, the ball squashes flat
  blip(c, o, 250, t(0.256), 0.085, 0.1, 150); // 0.26 hollow rubber bonk on the floor
  swish(c, o, t(0.28), 0.28, 1200, 500, 0.02); // 0.4 it springs back up
  swish(c, o, t(0.58), 0.18, 500, 1100, 0.022); // 0.66 it falls again
  thud(c, o, t(0.76), 150, 0.15, 0.12); // 0.76 second, smaller impact
  blip(c, o, 300, t(0.756), 0.05, 0.08, 200); // 0.76 a smaller bonk
}
