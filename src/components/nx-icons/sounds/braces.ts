import { blip, swish, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3;

/** A soft breath that swells as the braces open, two short square-wave blinks for the cursor, and a low airy puff and soft note as they close again. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.3), 700, 1800, 0.03);
  blip(c, o, N.D7, t(0.2), 0.035, 0.09, undefined, "square");
  blip(c, o, N.B6, t(0.57), 0.035, 0.09, undefined, "square");
  swish(c, o, t(0.72), t(0.3), 1800, 600, 0.03);
  puff(c, o, t(0.92), 0.08, 1600, 0.03);
  blip(c, o, N.G4, t(0.9), 0.05, 0.14, undefined, "triangle");
}
