import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 4.26;

/** Low washes of sea water rolling past the hull, with a deep wooden creak at each end of the ship's pitch. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.32), 300, 650, 0.05); // 0.00-0.30 the bow rises on the swell
  blip(c, o, 150, t(0.3), 0.05, 0.12, 120, "triangle"); // 0.30 the hull creaks at the top of the pitch
  swish(c, o, t(0.3), t(0.32), 650, 280, 0.045); // 0.30-0.60 the ship pitches forward
  blip(c, o, 132, t(0.6), 0.045, 0.12, 105, "triangle"); // 0.60 a creak as the bow dips
  swish(c, o, t(0.6), t(0.6), 360, 520, 0.03); // 0.60-1.20 the swell passes and the ship levels out
}
