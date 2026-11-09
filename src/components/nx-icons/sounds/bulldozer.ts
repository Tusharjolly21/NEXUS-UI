import { blip, swish, tick, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.89;

/** A hydraulic whine that sinks as the blade lowers, a metal clunk when it bites the ground at 0.30, a diesel rumble with a gravelly scrape and a rising soft sweep as the pile grows until 0.70, a stop thump, then a rising whine as the blade lifts and a puff of dust as the pile drops away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.00-0.30 the blade lowers on its hydraulics
  blip(c, o, 520, t(0.0), 0.05, 0.3, 300, "triangle");
  swish(c, o, t(0.0), t(0.3), 1800, 800, 0.04);
  // 0.30 the blade bites the ground
  thud(c, o, t(0.3), 95, 0.14, 0.14);
  tick(c, o, t(0.3), 0.08, 2200);
  // 0.30-0.70 the dozer pushes forward, diesel rumble and gravel while the pile grows
  blip(c, o, 52, t(0.3), 0.07, 0.4, 70, "sawtooth");
  puff(c, o, t(0.32), 0.34, 1700, 0.08, "bandpass");
  swish(c, o, t(0.3), t(0.4), 700, 2200, 0.035);
  // 0.70 the dozer stops
  thud(c, o, t(0.7), 70, 0.1, 0.12);
  // 0.72-1.00 the blade lifts, hydraulics whine up
  blip(c, o, 300, t(0.72), 0.05, 0.28, 520, "triangle");
  swish(c, o, t(0.72), t(0.28), 900, 1800, 0.035);
  // 0.88 the pile crumbles away
  puff(c, o, t(0.88), 0.14, 900, 0.07, "lowpass");
}
