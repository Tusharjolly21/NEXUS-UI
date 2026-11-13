import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Four rubbery boings, one per rabbit ear flick, each sliding up in pitch, left ear then right, then again, ending with two tiny taps as the ears flop back down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 300, t(0.1), 0.06, 0.18, 520, "triangle"); // 0.10-0.28 left ear flicks up
  blip(c, o, 360, t(0.18), 0.06, 0.18, 620, "triangle"); // 0.18-0.36 right ear flicks up
  blip(c, o, 280, t(0.46), 0.05, 0.18, 470, "triangle"); // 0.46-0.64 left ear flicks again
  blip(c, o, 330, t(0.54), 0.05, 0.18, 540, "triangle"); // 0.54-0.72 right ear flicks again
  tick(c, o, t(1.0), 0.04, 1800); // 1.00 left ear settles on the hat
  tick(c, o, t(1.08), 0.04, 2100); // 1.08 right ear settles
}
