import { blip, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A plastic tap as the card touches the reader, then three rising payment beeps as each wave lights up in turn. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  tick(c, o, t(0.2), 0.12, 2400); // 0.20 the card taps the reader
  thud(c, o, t(0.2), 260, 0.05, 0.04); // 0.20 the card body knocks
  blip(c, o, 1568, t(0.45), 0.05, 0.07, 1568, "sine"); // 0.45 the first wave lights again
  blip(c, o, 1976, t(0.6), 0.05, 0.07, 1976, "sine"); // 0.60 the second wave lights again
  blip(c, o, 2489, t(0.75), 0.055, 0.12, 2489, "sine"); // 0.75 the outer wave lights again
}
