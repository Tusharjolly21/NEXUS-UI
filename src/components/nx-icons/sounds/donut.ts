import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.09;

/** A low soft roll as the ring turns a quarter, a muffled plop when it settles, and three bright rising pops as the sprinkles hop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.66), 220, 620, 0.05); // 0.02 to 0.68 the ring rolls a quarter turn
  thud(c, o, t(0.69), 130, 0.14, 0.1); // 0.69 the roll comes to rest
  blip(c, o, 1500, t(0.45), 0.07, 0.07, 2100, "triangle"); // 0.46 first sprinkle hops
  blip(c, o, 1900, t(0.57), 0.07, 0.07, 2700, "triangle"); // 0.58 second sprinkle hops
  blip(c, o, 2400, t(0.69), 0.07, 0.07, 3300, "triangle"); // 0.70 third sprinkle hops
}
