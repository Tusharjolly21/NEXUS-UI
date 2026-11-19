import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.97;

/** Dry skittering taps of little legs as the crab scuttles each way, with two hard shell clicks where both pincers snap shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.03, 0.08, 0.14, 0.25, 0.31, 0.37, 0.56, 0.62, 0.68].forEach((at, i) => tick(c, o, t(at), 0.05, i % 2 ? 6200 : 7400)); // 0.00-0.72 the legs patter as it scuttles left, right and left
  tick(c, o, t(0.126), 0.16, 3200); // 0.13 both pincers snap shut
  blip(c, o, 1300, t(0.126), 0.05, 0.03, 900, "square"); // 0.13 the hard shell knock of the snap
  tick(c, o, t(0.432), 0.15, 3000); // 0.43 the pincers snap a second time
  blip(c, o, 1200, t(0.432), 0.045, 0.03, 850, "square"); // 0.43 the second shell knock
  tick(c, o, t(0.9), 0.04, 5200); // 0.90 the crab stops
}
