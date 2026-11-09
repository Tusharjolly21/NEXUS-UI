import { blip, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Five long brushy rustles, one for each frond as it sways in turn and each a little higher than the last, with three wooden knocks as the coconuts swing against each other. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.02), t(0.5), 2200, 3600, 0.04); // 0.02-0.52 frond 1 sways out and back (moves 0.00-0.60)
  swish(c, o, t(0.12), t(0.5), 2600, 4000, 0.04); // 0.12-0.62 frond 2 sways (moves 0.10-0.70)
  swish(c, o, t(0.22), t(0.5), 3000, 4400, 0.04); // 0.22-0.72 frond 3 sways (moves 0.20-0.80)
  swish(c, o, t(0.32), t(0.5), 3400, 4800, 0.04); // 0.32-0.82 frond 4 sways (moves 0.30-0.90)
  swish(c, o, t(0.42), t(0.5), 3800, 5200, 0.04); // 0.42-0.92 frond 5 sways (moves 0.40-1.00)
  blip(c, o, 330, t(0.35), 0.07, 0.05, 250, "triangle"); // 0.35 coconuts swing together (first reversal)
  blip(c, o, 290, t(0.5), 0.05, 0.05, 220, "triangle"); // 0.50 coconuts knock again (second reversal)
  blip(c, o, 260, t(0.65), 0.03, 0.05, 200, "triangle"); // 0.65 a last softer knock (third reversal)
}
