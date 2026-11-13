import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.86;

/** A projector reel: a whirr that rises as the reel spins up, holds, and falls as it slows, with four sprocket clicks as the holes pass, the last a firmer stop. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 80, t(0.0), 0.034, 0.36, 200, "sawtooth"); // 0.00-0.36 reel spins up
  blip(c, o, 200, t(0.36), 0.03, 0.27, 210, "sawtooth"); // 0.36-0.63 steady speed
  blip(c, o, 210, t(0.63), 0.03, 0.27, 90, "sawtooth"); // 0.63-0.90 reel winds down
  tick(c, o, t(0.237), 0.08, 3000); // 0.24 first sprocket hole passes
  tick(c, o, t(0.36), 0.08, 3300); // 0.36 second hole
  tick(c, o, t(0.63), 0.08, 3600); // 0.63 third hole
  tick(c, o, t(0.9), 0.11, 2600); // 0.90 the reel stops
  thud(c, o, t(0.9), 120, 0.07, 0.05); // 0.90 small thunk of the stop
}
