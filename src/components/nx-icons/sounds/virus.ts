import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Eight rubbery pops that climb in pitch, one for each spike as it reaches its furthest point, over a soft wobbling swish of the body rolling. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 380, 260, 0.025); // 0.00-0.90 the body rolls from side to side
  [0.2, 0.27, 0.34, 0.41, 0.48, 0.55, 0.62, 0.69].forEach((at, i) => blip(c, o, 330 * Math.pow(1.12, i), t(at), 0.085, 0.07, 330 * Math.pow(1.12, i) * 1.7)); // 0.20-0.69 each spike reaches its furthest point
  tick(c, o, t(0.9), 0.05, 2200); // 0.90 the last spike and the body are back
}
