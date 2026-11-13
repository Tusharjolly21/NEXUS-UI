import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Two comic wah sounds as the masks swap faces: one voice slides up into a smile while the other slides down into a frown, a beat apart, then each slides back. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 250, t(0.15), 0.05, 0.25, 420, "triangle"); // 0.15-0.40 left mask frown becomes smile (slides up)
  blip(c, o, 520, t(0.23), 0.045, 0.25, 330, "triangle"); // 0.23-0.48 right mask smile becomes frown (slides down)
  blip(c, o, 420, t(0.65), 0.045, 0.25, 250, "triangle"); // 0.65-0.90 left mask goes back to a frown
  blip(c, o, 330, t(0.73), 0.045, 0.25, 520, "triangle"); // 0.73-0.98 right mask smiles again
}
