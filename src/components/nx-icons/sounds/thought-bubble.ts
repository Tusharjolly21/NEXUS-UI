import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two bubbly pops, a small one then a bigger one, a soft puff as the cloud swells, and three light hops of the dots. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 900, t(0.27), 0.06, 0.07, 1500); // 0.27 the small bubble pops in
  blip(c, o, 620, t(0.37), 0.07, 0.09, 1050); // 0.37 the bigger bubble pops in
  swish(c, o, t(0.3), t(0.15), 500, 1100, 0.012); // 0.30-0.45 the cloud puffs out
  ding(c, o, 1900, t(0.43), 0.03, 0.12); // 0.43 the first dot hops
  ding(c, o, 2150, t(0.53), 0.03, 0.12); // 0.53 the second dot hops
  ding(c, o, 2450, t(0.63), 0.03, 0.14); // 0.63 the third dot hops
}
