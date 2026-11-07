import { ding, blip, tick, thud, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two dry bony clacks as the jaw snaps shut, each with a hollow knock, and a low eerie hum that swells while the eyes glow. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.2, 0.6].forEach((at) => {
    tick(c, o, t(at), 0.16, 1800);
    thud(c, o, t(at), 260, 0.1, 0.05);
  });
  [0.4, 0.8].forEach((at) => tick(c, o, t(at), 0.1, 3600));
  blip(c, o, N.A4 * 0.5, t(0.1), 0.05, 0.7, N.G4 * 0.5, "triangle");
  ding(c, o, N.D6, t(0.45), 0.03, 0.5);
}
