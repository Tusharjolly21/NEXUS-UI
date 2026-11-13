import { ding, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.6;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three clicky key taps, then a ka-ching: a thump of the drawer shooting out with a ringing bell on top, and a rattle as it shuts. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.2), 0.1, 3000); // 0.20 the first key is pressed
  tick(c, o, t(0.3), 0.1, 3400); // 0.30 the second key is pressed
  tick(c, o, t(0.4), 0.1, 3800); // 0.40 the third key is pressed
  thud(c, o, t(0.82), 170, 0.14, 0.1); // 0.82 the drawer shoots out
  ding(c, o, 2637, t(0.84), 0.09, 0.9); // 0.84 the bell rings at the peak of the jolt
  ding(c, o, 3520, t(0.84), 0.04, 0.5); // 0.84 the bell overtone
  puff(c, o, t(1.0), 0.07, 3000, 0.04, "bandpass"); // 1.00 the coins rattle as the drawer shuts
  thud(c, o, t(1.05), 120, 0.08, 0.07); // 1.05 the drawer closes
}
