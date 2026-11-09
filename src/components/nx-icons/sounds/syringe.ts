import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.83;

/** A rubbery squeak as the plunger slides in, a small click as it bottoms out, a watery plip as the drop leaves the needle, and a softer slide back ending with a snug click. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.43), 1500, 900, 0.03); // 0.02-0.45 the plunger slides in, fastest at 0.23
  blip(c, o, 1900, t(0.1), 0.015, 0.3, 1250, "triangle"); // 0.10-0.40 the rubber squeaks along the barrel
  tick(c, o, t(0.46), 0.12, 2500); // 0.46 the plunger is all the way in
  blip(c, o, 900, t(0.55), 0.09, 0.09, 1900); // 0.55 the drop leaves the needle
  swish(c, o, t(0.74), t(0.44), 900, 1200, 0.018); // 0.74-1.18 the plunger eases back out
  tick(c, o, t(1.2), 0.1, 2000); // 1.20 the plunger is home
}
