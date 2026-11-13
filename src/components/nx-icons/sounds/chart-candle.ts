import { blip, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** Three short falling blips as the candles squash flat one after another, then three rising blips, each higher than the last, as they shoot back up past their size. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 520, t(0.22), 0.03, 0.08, 330, "square"); // 0.24 candle one is at its flattest
  blip(c, o, 440, t(0.32), 0.03, 0.08, 280, "square"); // 0.34 candle two is flat
  blip(c, o, 360, t(0.42), 0.03, 0.08, 230, "square"); // 0.44 candle three is flat
  blip(c, o, 700, t(0.5), 0.07, 0.1, 1050, "triangle"); // 0.56 candle one overshoots its height
  blip(c, o, 880, t(0.6), 0.07, 0.1, 1320, "triangle"); // 0.66 candle two overshoots
  blip(c, o, 1180, t(0.7), 0.07, 0.12, 1760, "triangle"); // 0.76 candle three overshoots
}
