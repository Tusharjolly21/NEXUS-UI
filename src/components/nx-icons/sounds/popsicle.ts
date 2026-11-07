import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.97;

/** A rubbery squeak as the lolly rocks on its stick, a wet stretching whine as the drip grows, a tiny pinch-pop when it lets go and a plip as the drop falls out of sight. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 700, 1500, 0.02); // 0.02-0.32 the drip stretches, sticky air
  blip(c, o, 900, t(0.05), 0.04, 0.26, 1500, "triangle"); // 0.05-0.31 the stretch whines up in pitch
  blip(c, o, 1900, t(0.2), 0.05, 0.08, 1300, "triangle"); // 0.22 the lolly rocks to the left, a rubbery squeak
  blip(c, o, 1250, t(0.45), 0.05, 0.08, 1800, "triangle"); // 0.45 it rocks right, a squeak the other way
  blip(c, o, 420, t(0.46), 0.05, 0.08, 900); // 0.46 a drop breaks free, a wet bloop
  blip(c, o, 2300, t(0.6), 0.06, 0.05, 800); // 0.6 the stretched drip snaps back into the lolly
  tick(c, o, t(0.6), 0.05, 4000);
  blip(c, o, 1500, t(0.86), 0.05, 0.07, 650); // 0.87 the falling drop drips away out of sight
}
