import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.32;

/** A rotor buzz that climbs and then falls with the spin, with a rush of air that peaks mid-flight, and a low wobble as the drone rises and settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 140, t(0.0), 0.05, 0.45, 340, "sawtooth"); // 0.00-0.45 the rotors spin up
  blip(c, o, 340, t(0.45), 0.04, 0.45, 140, "sawtooth"); // 0.45-0.90 they wind back down
  swish(c, o, t(0.05), t(0.8), 1200, 2400, 0.04); // 0.05-0.85 rotor blur, fullest near 0.4
  blip(c, o, 70, t(0.25), 0.05, 0.18, 55); // 0.25 the drone reaches the top of its lift
  blip(c, o, 64, t(0.72), 0.04, 0.16, 52); // 0.72 the second, smaller rise
}
