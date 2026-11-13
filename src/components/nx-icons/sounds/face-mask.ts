import { blip, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.93;

/** An elastic stretch that rises in pitch, a thwack as the loops snap back, and a quiet paper rustle as the pleats open. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 280, t(0.0), 0.04, 0.21, 540, "triangle"); // 0.00-0.21 the ear loops stretch
  tick(c, o, t(0.315), 0.14, 2200); // 0.32 the loops snap back
  thud(c, o, t(0.315), 210, 0.05, 0.05); // 0.32 the mask body bounces
  puff(c, o, t(0.52), 0.1, 3800, 0.03, "highpass"); // 0.52 the pleats open like paper
}
