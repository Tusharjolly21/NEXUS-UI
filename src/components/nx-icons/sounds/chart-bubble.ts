import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.7;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick suck of air as the bubbles collapse, then three wet bloops, a low one for the big bubble, a middle one and a high one for the small bubble, as each swells out and settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.14), 1800, 500, 0.02); // 0.02-0.16 the three bubbles collapse
  blip(c, o, 220, t(0.17), 0.08, 0.28, 440, "sine"); // 0.17 the big bubble swells out
  blip(c, o, 330, t(0.3), 0.07, 0.26, 690, "sine"); // 0.30 the medium bubble swells out
  blip(c, o, 520, t(0.43), 0.06, 0.24, 1040, "sine"); // 0.43 the small bubble swells out
}
