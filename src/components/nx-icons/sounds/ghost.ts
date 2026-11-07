import { blip, tick, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.96;

/** A hollow whoo that wobbles up as the ghost floats up and down as it sinks, with soft cloth flutters for the rippling hem and two faint ticks as the eyes shut. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 300, t(0.03), 0.05, 0.26, 430, "sine"); // 0.03 the ghost starts floating up
  blip(c, o, 450, t(0.03), 0.012, 0.26, 640, "triangle"); // hollow overtone of the same float
  blip(c, o, 430, t(0.27), 0.05, 0.26, 290, "sine"); // 0.27 it turns and sinks
  blip(c, o, 290, t(0.52), 0.05, 0.26, 400, "sine"); // 0.52 second rise
  blip(c, o, 435, t(0.52), 0.012, 0.26, 600, "triangle"); // hollow overtone
  blip(c, o, 400, t(0.77), 0.045, 0.28, 260, "sine"); // 0.77 final sink
  [0.1, 0.3, 0.5, 0.7, 0.9].forEach((at) => puff(c, o, t(at), 0.12, 700, 0.035, "bandpass")); // hem ripple at its fastest
  tick(c, o, t(0.38), 0.045, 4500); // 0.38 eyes closed in the first blink
  tick(c, o, t(0.78), 0.045, 4500); // 0.78 eyes closed in the second blink
}
