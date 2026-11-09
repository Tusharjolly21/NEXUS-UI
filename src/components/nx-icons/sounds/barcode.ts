import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.08;

/** A laser sweep that glides up as the scan line rises, drops slowly as it crosses the code, and a sharp checkout beep when the corners snap in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.22), 900, 2600, 0.035); // 0.00-0.22 the scan line rises to the top
  swish(c, o, t(0.22), t(0.52), 2600, 800, 0.04); // 0.22-0.74 it sweeps down across the bars
  swish(c, o, t(0.74), t(0.26), 800, 1500, 0.025); // 0.74-1.00 it returns to the middle
  blip(c, o, 2650, t(0.88), 0.07, 0.1, undefined, "square"); // 0.88 the corners snap in: the scanner beeps
}
