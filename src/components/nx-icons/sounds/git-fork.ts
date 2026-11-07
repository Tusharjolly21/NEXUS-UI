import { ding, blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.82;

/** Chalky strokes as each branch line draws (the left first, the right 80 ms later), a snap as each line arrives at its node, a water-drop pop as the new node on the right appears, a glass ping as it overshoots, and a faint tick as it settles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.01 / 0.09 the two lines start to draw
  tick(c, o, t(0.01), 0.07, 3500);
  tick(c, o, t(0.09), 0.06, 4600);
  puff(c, o, t(0.02), 0.4, 2600, 0.035, "bandpass");
  puff(c, o, t(0.1), 0.4, 3700, 0.035, "bandpass");
  // 0.45 left line arrives at its node, 0.53 right line arrives
  tick(c, o, t(0.45), 0.1, 3000);
  tick(c, o, t(0.53), 0.1, 4200);
  // 0.47 the fresh node on the right pops out of nothing
  blip(c, o, 350, t(0.47), 0.11, 0.12, 1250);
  // 0.69 left node bumps to 1.15, 0.71 right node overshoots to 1.3
  ding(c, o, 880, t(0.685), 0.035, 0.25);
  ding(c, o, 1760, t(0.71), 0.06, 0.3);
  // 0.86 right node settles after undershooting
  tick(c, o, t(0.86), 0.05, 4000);
}
