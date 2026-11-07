import { blip, swish, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.12;

/** A quick dry swipe as the marker slides back, a soft felt touch where it meets the page, then a long felt hiss with a squeak that rides along as the yellow band draws in. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.2), 1400, 3000, 0.035); // 0.02-0.22 the marker slides back, the band is wiped away
  tick(c, o, t(0.3), 0.06, 2200); // 0.30 the felt tip meets the page again
  swish(c, o, t(0.31), t(0.79), 1300, 3400, 0.05); // 0.31-1.10 the felt tip glides, fastest near 0.70
  puff(c, o, t(0.32), 0.78, 4200, 0.018, "bandpass"); // 0.32-1.10 the soft felt hiss along the band
  blip(c, o, 1500, t(0.32), 0.022, 0.75, 2500, "triangle"); // 0.32-1.07 squeak of the marker following the stroke
  blip(c, o, 2600, t(0.66), 0.015, 0.2, 1900, "sine"); // 0.66 a squeak at the quickest part
}
