import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Twelve fine thread clicks as the knob turns a full circle, a warm rising hum as a ring of light spreads from the sample, a soft glass ping at each glow pulse. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.01), 0.88, 900, 1400, 0.016); // 0.0 to 0.9 the knob turns a full circle
  tick(c, o, t(0.182), 0.06, 3300); // 0.18 knob notch (30 degrees)
  tick(c, o, t(0.255), 0.07, 3600); // 0.26 notch
  tick(c, o, t(0.312), 0.07, 3300); // 0.31 notch
  tick(c, o, t(0.361), 0.07, 3600); // 0.36 notch
  tick(c, o, t(0.406), 0.075, 3300); // 0.41 notch
  tick(c, o, t(0.45), 0.075, 3600); // 0.45 notch, knob at full speed
  tick(c, o, t(0.494), 0.075, 3300); // 0.49 notch
  tick(c, o, t(0.539), 0.07, 3600); // 0.54 notch
  tick(c, o, t(0.588), 0.07, 3300); // 0.59 notch
  tick(c, o, t(0.645), 0.065, 3600); // 0.65 notch
  tick(c, o, t(0.718), 0.06, 3300); // 0.72 notch, knob slowing
  blip(c, o, 300, t(0.24), 0.045, 0.4, 640); // 0.26 the ring of light leaves the sample and spreads
  ding(c, o, 2450, t(0.42), 0.04, 0.4); // 0.43 the sample glow pulses to its brightest
  ding(c, o, 3100, t(0.87), 0.03, 0.4); // 0.88 the second, smaller glow pulse
}
