import { ding, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.85;

/** Eight wooden clicks of a scoring wheel that slow down step by step as the lit sector chases round, and a bright chime when it lands back in place. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.045, 0.117, 0.189, 0.261, 0.342, 0.441, 0.558].forEach((at, i) => tick(c, o, t(at), 0.09, 3400 - i * 120)); // 0.05-0.56 the lit sector clicks round the board
  tick(c, o, t(0.702), 0.1, 2600); // 0.70 the last step clicks into place
  ding(c, o, 1240, t(0.702), 0.07, 0.4); // 0.70 a chime: the lit sector is home
}
