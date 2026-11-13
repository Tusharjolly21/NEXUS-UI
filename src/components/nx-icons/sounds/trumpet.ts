import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three brass notes, each starting with a dry valve click as a finger presses down: a warm buzzy tone with a brighter edge that rises a little as the bell swells. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.26), 0.1, 2600); // 0.26 first valve bottoms out
  blip(c, o, 349, t(0.25), 0.05, 0.22, 362, "sawtooth"); // 0.25 first note, bell swells
  blip(c, o, 349, t(0.25), 0.03, 0.22, 362, "square"); // 0.25 brassy edge
  tick(c, o, t(0.48), 0.1, 2900); // 0.48 second valve bottoms out
  blip(c, o, 415, t(0.47), 0.05, 0.22, 430, "sawtooth"); // 0.47 second note
  blip(c, o, 415, t(0.47), 0.03, 0.22, 430, "square"); // 0.47 brassy edge
  tick(c, o, t(0.7), 0.1, 3200); // 0.70 third valve bottoms out
  blip(c, o, 523, t(0.69), 0.055, 0.26, 548, "sawtooth"); // 0.69 third note, highest
  blip(c, o, 523, t(0.69), 0.033, 0.26, 548, "square"); // 0.69 brassy edge
}
