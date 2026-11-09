import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.85;

/** A breath of air as the helmet tips up, a hard plastic knock at full tilt, a bright shimmer that runs along the shell with a glassy ping as the glint crosses the ridge, and a soft knock as the hat settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.24), 700, 1900, 0.04); // 0.02-0.26 the helmet tips up
  tick(c, o, t(0.28), 0.16, 2300); // 0.28 the tip reaches full tilt, shell knocks
  thud(c, o, t(0.28), 330, 0.1, 0.06); // 0.28 hollow plastic body of the knock
  swish(c, o, t(0.3), t(0.55), 3400, 7200, 0.05); // 0.30-0.85 the glint runs along the outline
  ding(c, o, 2870, t(0.575), 0.05, 0.3); // 0.575 the glint crosses the top of the ridge
  tick(c, o, t(0.78), 0.07, 1700); // 0.78 the hat tips past level and rocks back
}
