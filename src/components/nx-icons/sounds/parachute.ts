import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Canopy cloth flaps on each swing of the pendulum, with a rope creak at the widest point and a thin wind running underneath. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.05), 300, 700, 0.03); // 0.00-1.05 wind in the canopy
  puff(c, o, t(0.2), 0.14, 1700, 0.06); // 0.22 canopy flaps at +7 deg
  puff(c, o, t(0.42), 0.16, 1500, 0.07); // 0.44 flaps back at -6 deg
  blip(c, o, 390, t(0.42), 0.03, 0.14, 330, "sawtooth"); // 0.44 rope creak
  puff(c, o, t(0.64), 0.12, 1700, 0.045); // 0.66 third swing
  puff(c, o, t(0.86), 0.1, 1900, 0.03); // 0.88 last small flap
}
