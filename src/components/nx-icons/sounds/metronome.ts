import { blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.92;

/** A woody tick and a lower tock alternating at the four ends of the pendulum's swing, each with a dry click and a hollow body, and a faint air swish between the beats. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.24, 0.48, 0.72, 0.96].forEach((at, i) => {
    const hi = i % 2 === 0; // the pendulum reaches the end of a swing and the beat sounds
    blip(c, o, hi ? 760 : 560, t(at), 0.12, 0.07, hi ? 520 : 390);
    thud(c, o, t(at), hi ? 240 : 180, 0.09, 0.05);
    tick(c, o, t(at), 0.06, hi ? 3400 : 2600);
  });
  [0.0, 0.24, 0.48, 0.72, 0.96].forEach((at) => swish(c, o, t(at + 0.02), t(0.2), 500, 900, 0.012)); // the pendulum moves through the air between beats
}
