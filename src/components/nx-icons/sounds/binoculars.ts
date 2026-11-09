import { ding, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A soft rubber whirr under seven knurled ratchet clicks that follow the focus wheel's eased roll, then a bright glass ping as the glint redraws on the left lens and a higher one on the right. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), 0.78, 600, 1500, 0.022); // 0.01 to 0.8 the focus wheel rolls round, fastest at 0.4
  tick(c, o, t(0.203), 0.07, 2100); // 0.2 ridge click 1 (wheel still easing in)
  tick(c, o, t(0.282), 0.075, 2400); // 0.28 ridge click 2
  tick(c, o, t(0.345), 0.08, 2100); // 0.35 ridge click 3
  tick(c, o, t(0.404), 0.08, 2400); // 0.4 ridge click 4, wheel at full speed
  tick(c, o, t(0.462), 0.08, 2100); // 0.46 ridge click 5
  tick(c, o, t(0.525), 0.075, 2400); // 0.53 ridge click 6
  tick(c, o, t(0.605), 0.07, 2100); // 0.6 ridge click 7 (wheel slowing)
  ding(c, o, 3720, t(0.27), 0.05, 0.3); // 0.26 the left lens glint shrinks to a dot and redraws
  ding(c, o, 4350, t(0.47), 0.05, 0.3); // 0.46 the right lens glint redraws
}
