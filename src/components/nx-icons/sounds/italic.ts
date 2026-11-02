import { ding, blip, swish, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.83;

/** A fast upward glide as the letter stands straight, a quick downward slide as it tips back, and two small bells that settle. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, N.G5, t(0.03), 0.07, 0.3, N.B5 * 1.2, "triangle");
  swish(c, o, t(0.03), t(0.3), 900, 3800, 0.03);
  blip(c, o, N.B5 * 1.2, t(0.36), 0.06, 0.28, N.E5, "sine");
  swish(c, o, t(0.36), t(0.25), 3400, 800, 0.025);
  ding(c, o, N.D6, t(0.66), 0.05, 0.3);
  ding(c, o, N.A5, t(0.78), 0.04, 0.35);
}
