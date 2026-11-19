import { blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 3.29;

/** A howling storm wind that climbs as the spiral spins up and tightens, then sinks away as it slows to a stop around the calm eye. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.58), 400, 1700, 0.06); // 0.00-0.58 the storm winds up
  blip(c, o, 220, t(0.05), 0.025, 0.5, 330, "triangle"); // 0.05-0.55 the howl rises
  swish(c, o, t(0.52), t(0.58), 1700, 350, 0.05); // 0.52-1.10 the wind dies away as it slows
  blip(c, o, 330, t(0.55), 0.02, 0.5, 200, "triangle"); // 0.55-1.05 the howl falls
  thud(c, o, t(0.0), 60, 0.03, 0.4); // 0.00 a low rumble as the storm starts
}
