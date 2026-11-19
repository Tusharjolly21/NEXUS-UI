import { blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.55;

/** A low churning hum of the propeller under a hydraulic hiss as the periscope dips and rises, a latch as it locks up and two small clicks as it turns each way. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 70, t(0.0), 0.05, 1.2, 64, "sawtooth"); // 0.00-1.20 the propeller turns at the stern
  swish(c, o, t(0.0), t(0.22), 2600, 1400, 0.03); // 0.00-0.22 the periscope slides down
  swish(c, o, t(0.22), t(0.24), 1400, 2800, 0.03); // 0.22-0.46 and back up
  tick(c, o, t(0.456), 0.07, 2200); // 0.46 it locks in the raised position
  tick(c, o, t(0.6), 0.04, 3200); // 0.60 it has turned to look the other way
  tick(c, o, t(0.98), 0.04, 2900); // 1.00 it has turned back
}
