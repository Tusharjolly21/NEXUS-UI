import { ding, blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.13;

/** A deep hum that swells and dips as the planet tilts one way and the other, an electronic whirl following the moon around its orbit and a soft ping when the moon is home. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 150, t(0.0), 0.12, 0.26, 105, "triangle"); // 0.00-0.22 planet tilts back 16 degrees
  blip(c, o, 105, t(0.22), 0.12, 0.26, 175, "triangle"); // 0.22-0.45 tilts forward
  blip(c, o, 175, t(0.45), 0.12, 0.26, 120, "triangle"); // 0.45-0.68 tilts back
  blip(c, o, 120, t(0.68), 0.1, 0.24, 150, "triangle"); // 0.68-0.9 settles upright
  swish(c, o, t(0.0), t(0.46), 600, 2400, 0.03); // 0.00-0.46 moon swings out to the far right
  swish(c, o, t(0.45), t(0.45), 2400, 600, 0.03); // 0.45-0.90 moon swings back round
  ding(c, o, 1250, t(0.9), 0.07, 0.3); // 0.90 moon arrives back at its start
}
