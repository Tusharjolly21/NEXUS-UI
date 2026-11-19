import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.7;

/** A sugary glass tink at each end of the candy cane's swing, getting softer and lower as the ornament comes to rest, with a faint whoosh of the swing. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.9), 900, 600, 0.012); // 0.00-0.90 the cane swings on its hook
  ding(c, o, 2794, t(0.22), 0.05, 0.3); // 0.22 the swing reaches the right
  ding(c, o, 2489, t(0.46), 0.04, 0.28); // 0.46 it swings back to the left
  ding(c, o, 2794, t(0.68), 0.025, 0.24); // 0.68 a smaller swing
  ding(c, o, 2349, t(0.9), 0.015, 0.22); // 0.90 the last tiny sway
}
