import { swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 5.2;

/** A quick reverse rasp of a felt pen rewinding the glyph, a run of small nib scratches while the loops are written, and a fast flick as the coloured tail swoops out. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.26), 5200, 2600, 0.035); // 0.00-0.26 the tail and then the loops rewind
  [0.3, 0.37, 0.44, 0.51, 0.58].forEach((at, i) => puff(c, o, t(at), 0.05, 3400 + i * 260, 0.03)); // 0.29-0.66 the pen writes the bowl and the top loop
  swish(c, o, t(0.64), t(0.2), 2800, 6400, 0.04); // 0.66-0.84 the tail swoops down to the right
  puff(c, o, t(0.84), 0.03, 7200, 0.035, "highpass"); // 0.84 the pen lifts off at the tail end
}
