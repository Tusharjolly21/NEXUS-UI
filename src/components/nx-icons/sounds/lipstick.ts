import { ding, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.47;

/** A fine ratchet of clicks as the twist mechanism raises the stick, a firm click at the top, the ratchet again as it winds down and a last click when it is home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.02, 0.08, 0.14, 0.2, 0.26, 0.32].forEach((at, i) => tick(c, o, t(at), 0.06, 3000 + i * 180)); // 0.02-0.32 the twist ratchet raises the stick
  tick(c, o, t(0.36), 0.14, 2200); // 0.36 the stick reaches its top
  ding(c, o, 1900, t(0.36), 0.025, 0.1); // 0.36 a short plastic ring of the stop
  [0.56, 0.62, 0.68, 0.74, 0.8, 0.86].forEach((at, i) => tick(c, o, t(at), 0.05, 3700 - i * 180)); // 0.56-0.86 the ratchet winds the stick back down
  tick(c, o, t(0.9), 0.12, 2000); // 0.90 the stick is home
}
