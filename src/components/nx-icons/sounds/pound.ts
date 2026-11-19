import { ding, blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.67;

/** A short rising whoop as the pound sign hops up, a heavy weighted thump as it lands and squashes, and a small iron clank from the crossbar bouncing a beat later. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 196, t(0.0), 0.06, 0.27, 352, "triangle"); // 0.00-0.27 the sign hops up
  thud(c, o, t(0.476), 74, 0.3, 0.2); // 0.48 it lands like a weight
  puff(c, o, t(0.476), 0.09, 420, 0.05, "lowpass"); // 0.48 dust under the base
  ding(c, o, 742, t(0.646), 0.045, 0.22); // 0.65 the crossbar bounces and clanks
  thud(c, o, t(0.85), 112, 0.04, 0.06); // 0.85 it settles
}
