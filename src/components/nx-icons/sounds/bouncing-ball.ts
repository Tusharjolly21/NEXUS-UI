import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** A rubbery thud and a little boing each time the ball hits the ground, with air whooshing past. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0), t(0.48), 1400, 300, 0.035);
  thud(c, o, t(0.5), 120, 0.15, 0.12);
  blip(c, o, 170, t(0.5), 0.07, 0.12, 340);
  swish(c, o, t(0.52), t(0.46), 300, 1400, 0.025);
}
