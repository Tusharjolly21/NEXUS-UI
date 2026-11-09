import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.53;

/** A continuous bright buzz that wavers in pitch while the wings beat and the bee hovers in its figure of eight, with a thin hiss of wing air over it, fading as the wings stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 205, t(0.0), 0.05, 0.17, 228, "sawtooth"); // 0.00 the wings start beating
  blip(c, o, 228, t(0.13), 0.05, 0.17, 196, "sawtooth"); // 0.13 the bee swings right, the buzz sinks
  blip(c, o, 196, t(0.26), 0.05, 0.17, 236, "sawtooth"); // 0.26 the bee swings back, the buzz climbs
  blip(c, o, 236, t(0.39), 0.05, 0.17, 192, "sawtooth"); // 0.39 buzz sinks
  blip(c, o, 192, t(0.52), 0.05, 0.17, 232, "sawtooth"); // 0.52 buzz climbs
  blip(c, o, 232, t(0.65), 0.045, 0.17, 205, "sawtooth"); // 0.65 buzz settles
  blip(c, o, 205, t(0.78), 0.035, 0.14, 190, "sawtooth"); // 0.78 the wings slow
  blip(c, o, 410, t(0.0), 0.012, 0.8, 440, "triangle"); // 0.00-0.80 octave shimmer of the wing beats
  swish(c, o, t(0.0), t(0.85), 6500, 4200, 0.03); // 0.00-0.85 wing air
}
