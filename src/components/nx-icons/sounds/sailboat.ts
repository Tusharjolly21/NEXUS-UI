import { ding, blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A low wash of waves, two soft creaking glides as the hull rocks, a flap of canvas as the sails fill, and a small buoy bell rung four times, G, D, A and a low E. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.45), 300, 900, 0.05);
  swish(c, o, t(0.4), t(0.45), 800, 260, 0.04);
  blip(c, o, 210, t(0.12), 0.05, 0.22, 175, "triangle");
  blip(c, o, 175, t(0.38), 0.045, 0.22, 230, "triangle");
  puff(c, o, t(0.3), 0.09, 1500, 0.06, "bandpass");
  ding(c, o, N.G5, t(0.6), 0.07, 0.5);
  ding(c, o, N.D6, t(0.72), 0.08, 0.5);
  ding(c, o, N.A5, t(0.84), 0.06, 0.55);
  ding(c, o, N.E5, t(0.96), 0.04, 0.5);
}
