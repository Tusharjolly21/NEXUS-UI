import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 6.36;

/** A springy squeak as the pram dips and another as it rises, twice, each pair softer, like a well sprung pram being rocked. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 1100, t(0.2), 0.035, 0.09, 820, "triangle"); // 0.20 the body dips on its springs
  blip(c, o, 820, t(0.42), 0.03, 0.09, 1150, "triangle"); // 0.42 the body springs up
  blip(c, o, 1050, t(0.62), 0.022, 0.09, 800, "triangle"); // 0.62 a smaller dip
  blip(c, o, 790, t(0.82), 0.015, 0.09, 1010, "triangle"); // 0.82 a last small rise
  swish(c, o, t(0.0), t(0.9), 500, 380, 0.01); // 0.00-0.90 the rocking hush
}
