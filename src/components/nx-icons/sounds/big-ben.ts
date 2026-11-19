import { ding, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.79;

/** Quick clockwork clicks that speed up and slow down with the sweeping minute hand, then one deep bronze bell stroke as it reaches the hour and the tower shudders. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.133, 0.187, 0.228, 0.265, 0.298, 0.33, 0.362, 0.395, 0.432, 0.473, 0.527].forEach((at) => tick(c, o, t(at), 0.07, 3400)); // 0.00-0.66 the escapement clicks every 30 degrees of the sweeping hand
  ding(c, o, 196, t(0.66), 0.16, 0.85); // 0.66 the hand reaches the hour: the great bell strikes
  ding(c, o, 466, t(0.66), 0.04, 0.55); // 0.66 the bell's bright upper partial
  thud(c, o, t(0.66), 70, 0.12, 0.25); // 0.66 the tower shudders with the stroke
}
