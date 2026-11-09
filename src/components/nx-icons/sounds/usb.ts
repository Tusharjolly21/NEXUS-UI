import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.11;

/** A soft whoosh as the stick drops out, a rising whoosh as it slides back in, a dull plastic knock as the plug seats, then two small electronic chirps as its light comes on. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.2), 1500, 450, 0.03); // 0.00-0.20 the stick drops out of the port (fastest at the end)
  swish(c, o, t(0.2), t(0.42), 500, 2100, 0.035); // 0.20-0.62 it slides back in, fastest at the start
  thud(c, o, t(0.63), 175, 0.13, 0.06); // 0.63 the plug hits the back of the port
  tick(c, o, t(0.63), 0.1, 1700); // 0.63 plastic click of the seat
  blip(c, o, 1960, t(0.67), 0.04, 0.07, 2350); // 0.67 the light comes on
  blip(c, o, 2350, t(0.9), 0.035, 0.08, 2700); // 0.90 the light settles on after its dip
}
