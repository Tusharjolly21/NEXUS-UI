import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.5;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.63;

/** A clack as the lid opens, paper whistling down and crumpling, and the lid shutting. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.11), 0.16, 2800);
  blip(c, o, 340, t(0.11), 0.07, 0.08, 220, "triangle");
  swish(c, o, t(0.26), t(0.56), 2200, 700, 0.03);
  puff(c, o, t(0.3), 0.2, 3600, 0.02, "highpass");
  thud(c, o, t(0.84), 120, 0.2, 0.1);
  puff(c, o, t(0.86), 0.12, 2400, 0.05);
  tick(c, o, t(1.0), 0.12, 2600);
  thud(c, o, t(1.0), 170, 0.1, 0.06);
}
