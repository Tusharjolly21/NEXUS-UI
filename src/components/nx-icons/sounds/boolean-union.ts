import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.34;

/** A stretchy rubber squeak as the shape pulls apart at the waist, a short rush as the halves rush back, and a round soft pop as they fuse into one. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 265, t(0.0), 0.06, 0.29, 590, "triangle"); // 0.00-0.29 the shape stretches apart
  swish(c, o, t(0.4), t(0.19), 1500, 3300, 0.03); // 0.40-0.59 the two squares rush together
  blip(c, o, 940, t(0.594), 0.09, 0.09, 330); // 0.59 they fuse with a pop
  blip(c, o, 520, t(0.756), 0.03, 0.07, 445); // 0.76 the merged shape wobbles and settles
}
