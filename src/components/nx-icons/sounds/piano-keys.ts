import { blip, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A quick chromatic run of seven felt-hammer piano notes from F up to B, one per key press, ending on a soft ringing fifth. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [[349.23, 0], [369.99, 0.13], [392, 0.2], [415.3, 0.33], [440, 0.4], [466.16, 0.53], [493.88, 0.6]].forEach(([f, at]) => {
    blip(c, o, f, t(at), 0.1, 0.3);
    blip(c, o, f * 2, t(at), 0.025, 0.14);
    tick(c, o, t(at), 0.04, 1500);
  });
  blip(c, o, 493.88, t(0.62), 0.05, 0.55);
  blip(c, o, 739.99, t(0.64), 0.035, 0.5);
}
