import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.4;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.03;

/** A motor hum and air sweep as the cabin glides off along the cable, the same hum swelling as it glides back in from the left, a clunk as it docks in the station, and soft hanger creaks that fade as the cabin swings to rest. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.04), t(0.34), 500, 1400, 0.04); // 0.04-0.38 the cabin glides off to the right (fastest 0.2)
  blip(c, o, 120, t(0.04), 0.03, 0.34, 200, "sawtooth"); // 0.04-0.38 the pulley motor whirr rises as it speeds up
  swish(c, o, t(0.42), t(0.58), 1200, 500, 0.04); // 0.42-1.00 the cabin glides back in from the left (fastest 0.7)
  blip(c, o, 110, t(0.42), 0.03, 0.5, 180, "sawtooth"); // 0.42-0.92 the motor hum swells as it re-enters
  thud(c, o, t(0.97), 110, 0.2, 0.12); // 0.97 the cabin docks into the station
  tick(c, o, t(0.97), 0.1, 1900); // 0.97 the grip clamps on
  blip(c, o, 220, t(0.66), 0.035, 0.2, 280, "triangle"); // 0.66 the cabin starts to swing out (7 degrees)
  blip(c, o, 280, t(0.87), 0.045, 0.18, 210, "triangle"); // 0.87 it swings back through the middle
  blip(c, o, 210, t(1.05), 0.035, 0.15, 260, "triangle"); // 1.05 it swings out the other way
  blip(c, o, 260, t(1.22), 0.02, 0.12, 235, "triangle"); // 1.22 the last small swing before it stops
}
