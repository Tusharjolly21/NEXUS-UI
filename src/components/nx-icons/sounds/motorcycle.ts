import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.79;

/** A rough engine that revs up in four rising bursts as the front wheel lifts, an exhaust pop at the top of the lift, a spoke whirr that winds down, the engine falling away as the bike drops, and a fork thump when the front wheel lands. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0, 1, 2, 3].forEach((i) => blip(c, o, 65 + i * 28, t(0.02 + i * 0.07), 0.07, 0.1, 100 + i * 35, "sawtooth")); // 0.02-0.23 revs climb while the front wheel rises
  swish(c, o, t(0.02), t(0.2), 3000, 2200, 0.04); // 0.02-0.22 the wheels spin up fastest (peak 0.1)
  swish(c, o, t(0.22), t(0.6), 2200, 600, 0.022); // 0.22-0.82 spokes slow down (ease-out)
  puff(c, o, t(0.22), 0.07, 600, 0.09, "lowpass"); // 0.22 exhaust pop as the wheel reaches its full lift
  blip(c, o, 160, t(0.32), 0.05, 0.1, 150, "sawtooth"); // 0.32 engine holds high while the wheel hangs up
  blip(c, o, 150, t(0.42), 0.04, 0.1, 140, "sawtooth"); // 0.42 still held
  blip(c, o, 140, t(0.52), 0.035, 0.1, 125, "sawtooth"); // 0.52 about to come down
  blip(c, o, 120, t(0.62), 0.04, 0.1, 100, "sawtooth"); // 0.62 front starts to drop, revs fall
  blip(c, o, 95, t(0.7), 0.04, 0.1, 80, "sawtooth"); // 0.70 dropping at its fastest
  tick(c, o, t(0.86), 0.09, 1800); // 0.86 front fork bottoms out
  thud(c, o, t(0.86), 90, 0.26, 0.15); // 0.86 front wheel lands
}
