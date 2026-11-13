import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A bowed string: a rough rosin-edged tone that changes pitch with each bow stroke, down, up, down, up, with a soft rubbing hiss of horsehair under it. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(1.0), 4400, 2800, 0.012); // 0.00-1.00 bow hair rubbing the strings
  blip(c, o, 247, t(0.0), 0.034, 0.3, 262, "sawtooth"); // 0.00 first stroke starts
  blip(c, o, 494, t(0.0), 0.012, 0.3, 524, "sine"); // 0.00 octave above, for body
  blip(c, o, 330, t(0.25), 0.036, 0.34, 349, "sawtooth"); // 0.25 bow reverses, strong stroke
  blip(c, o, 660, t(0.25), 0.012, 0.34, 698, "sine"); // 0.25 octave above
  blip(c, o, 294, t(0.55), 0.032, 0.3, 277, "sawtooth"); // 0.55 bow reverses again
  blip(c, o, 588, t(0.55), 0.011, 0.3, 554, "sine"); // 0.55 octave above
  blip(c, o, 262, t(0.8), 0.026, 0.26, 247, "sawtooth"); // 0.80 last short stroke
}
