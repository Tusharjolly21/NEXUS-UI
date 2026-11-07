import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.08;

/** Gritty plastic scrapes as the stick moves, a solid micro-switch clack when it hits each side and a soft click through the centre, with two crisp button taps. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.2), 250, 650, 0.06); // 0.04 the stick pushes left
  thud(c, o, t(0.25), 170, 0.1, 0.06); // 0.25 the stick hits the left gate
  tick(c, o, t(0.25), 0.1, 2000); // 0.25 micro-switch clack
  tick(c, o, t(0.3), 0.1, 4800); // 0.30 left button pressed down
  blip(c, o, 950, t(0.3), 0.05, 0.04, 600, "sine"); // 0.30 button tap
  tick(c, o, t(0.4), 0.05, 5500); // 0.40 left button springs back
  swish(c, o, t(0.27), t(0.22), 650, 250, 0.06); // 0.27 the stick returns through centre
  tick(c, o, t(0.5), 0.06, 3000); // 0.50 the stick passes centre
  swish(c, o, t(0.52), t(0.22), 250, 650, 0.06); // 0.52 the stick pushes right
  tick(c, o, t(0.6), 0.1, 4800); // 0.60 right button pressed down
  blip(c, o, 1150, t(0.6), 0.05, 0.04, 720, "sine"); // 0.60 button tap, a bit higher
  tick(c, o, t(0.7), 0.05, 5500); // 0.70 right button springs back
  thud(c, o, t(0.75), 150, 0.1, 0.06); // 0.75 the stick hits the right gate
  tick(c, o, t(0.75), 0.1, 2000); // 0.75 micro-switch clack
  swish(c, o, t(0.77), t(0.22), 650, 250, 0.06); // 0.77 the stick returns to rest
  tick(c, o, t(1.0), 0.08, 3000); // 1.00 the stick settles upright
}
