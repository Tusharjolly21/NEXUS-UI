import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A rising rush of water as the board accelerates along the wave, a foamy crest, then a falling hiss and a small rubbery squeak as it settles back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.28), 400, 1500, 0.06); // 0.00-0.28 the board surges forward
  puff(c, o, t(0.28), 0.13, 3500, 0.05); // 0.30 crest of the surge
  swish(c, o, t(0.3), t(0.55), 1500, 480, 0.045); // 0.30-0.85 it slides back
  blip(c, o, 340, t(0.5), 0.05, 0.1, 210, "triangle"); // 0.55 wax squeak on the rebound
}
