import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.04;

/** Leather squeaks as the wheel is cranked left, right and back, each turn a pitch glide, with a soft tock at every end and a click when it centres. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 620, t(0.02), 0.045, 0.22, 980, "triangle"); // 0.00-0.25 cranks left
  tick(c, o, t(0.25), 0.07, 1400); // 0.25 full left lock (-80 deg)
  blip(c, o, 1020, t(0.27), 0.05, 0.24, 520, "triangle"); // 0.25-0.50 swings right
  tick(c, o, t(0.5), 0.07, 1700); // 0.50 right lock (65 deg)
  blip(c, o, 540, t(0.52), 0.04, 0.2, 860, "triangle"); // 0.50-0.75 back left
  tick(c, o, t(0.75), 0.05, 1300); // 0.75 small left (-24 deg)
  blip(c, o, 820, t(0.77), 0.03, 0.2, 610, "triangle"); // 0.75-1.00 returns straight
  tick(c, o, t(1.0), 0.08, 2400); // 1.00 centred
}
