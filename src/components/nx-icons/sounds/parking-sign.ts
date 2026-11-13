import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.15;

/** A parking-meter style beep as the sign pops, a thin marker scratch while the P is drawn, and a confirming chirp when the stroke finishes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 620, t(0.16), 0.09, 0.1, 930, "triangle"); // 0.18 the sign pops to its largest
  tick(c, o, t(0.18), 0.1, 3600);
  swish(c, o, t(0.22), t(0.55), 2600, 4600, 0.022); // 0.22-0.77 the P is drawn
  blip(c, o, 1320, t(0.76), 0.07, 0.09, 1760, "square"); // 0.77 the stroke ends
}
