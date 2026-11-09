import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A starter growl as the car winds back, two square-wave meter beeps exactly as the roof sign lights (0.27 and 0.56), little relay ticks as it dims, and an engine rev with an air sweep that surges as the car lurches forward, then drops away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.02-0.18 the car winds back on its springs, the engine growls
  blip(c, o, 90, t(0.02), 0.07, 0.16, 140, "sawtooth");
  // 0.13 the roof sign goes dark
  tick(c, o, t(0.13), 0.06, 2400);
  // 0.20-0.50 the car surges forward, the engine revs up
  blip(c, o, 120, t(0.2), 0.06, 0.3, 270, "sawtooth");
  swish(c, o, t(0.2), t(0.3), 600, 2400, 0.022);
  // 0.27 the roof sign lights up
  blip(c, o, 1760, t(0.27), 0.05, 0.09, undefined, "square");
  // 0.41 the roof sign goes dark again
  tick(c, o, t(0.41), 0.06, 2000);
  // 0.50-0.80 the car eases back, the engine note drops away
  blip(c, o, 260, t(0.5), 0.05, 0.3, 105, "sawtooth");
  // 0.56 the roof sign lights up a second time
  blip(c, o, 2349, t(0.56), 0.05, 0.09, undefined, "square");
  // 0.90 the car settles on its springs
  thud(c, o, t(0.88), 85, 0.09, 0.1);
}
