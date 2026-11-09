import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.61;

/** A low rumble as the ball rolls away and thunders back in, a sharp crack and wooden clonk when it strikes the pin, then two little clacks as the pin rocks upright on the lane. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), 0.29, 180, 420, 0.09); // 0.13 the ball rolls out of view
  swish(c, o, t(0.29), 0.14, 150, 260, 0.05); // 0.35 it comes rolling back
  swish(c, o, t(0.4), 0.15, 250, 480, 0.1); // 0.47 it speeds up toward the pin
  thud(c, o, t(0.552), 95, 0.3, 0.2); // 0.552 the ball strikes the pin
  tick(c, o, t(0.552), 0.2, 2500); // 0.552 sharp crack of impact
  blip(c, o, 700, t(0.554), 0.1, 0.1, 420, "triangle"); // 0.554 the pin clonks as it tips
  tick(c, o, t(0.8), 0.12, 1800); // 0.80 the pin rocks back and slaps the lane
  blip(c, o, 520, t(0.8), 0.06, 0.05, 380); // 0.80 wooden clack
  tick(c, o, t(0.92), 0.07, 1600); // 0.92 smaller second rock
  blip(c, o, 460, t(0.92), 0.035, 0.04, 340); // 0.92 smaller clack
}
