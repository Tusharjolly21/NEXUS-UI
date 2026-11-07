import { ding, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A short rising sweep as the pin lifts, a quick whistle down, a sharp metallic tack as it bites, a low thump and a ringing ripple, then a small rebound tick. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.18), 500, 1600, 0.025);
  swish(c, o, t(0.22), t(0.2), 3000, 900, 0.035);
  tick(c, o, t(0.45), 0.2, 6500);
  thud(c, o, t(0.45), 140, 0.26, 0.12);
  ding(c, o, 3400, t(0.46), 0.05, 0.25);
  ding(c, o, 910, t(0.5), 0.05, 0.5);
  tick(c, o, t(0.66), 0.06, 4200);
}
