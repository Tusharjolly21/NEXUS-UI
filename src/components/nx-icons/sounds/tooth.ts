import { ding, blip, swish, tick, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.8;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.61;

/** A soft polish shimmer, a ceramic tink as the tooth rocks, then a clean high glass ping the moment the sparkle blooms, a smaller glint at its peak and a fading shimmer as it shrinks away. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // 0.04-0.2 the tooth starts to rock and shine
  swish(c, o, t(0.04), t(0.17), 3000, 5200, 0.02);
  // 0.20 the tooth rocks to one side and swells
  ding(c, o, 1900, t(0.2), 0.05, 0.12);
  tick(c, o, t(0.2), 0.07, 3000);
  // 0.27 the sparkle bursts into view
  blip(c, o, 2200, t(0.27), 0.04, 0.1, 3300);
  ding(c, o, 3136, t(0.28), 0.07, 0.45);
  // 0.40 the sparkle is at its biggest
  ding(c, o, 4699, t(0.4), 0.03, 0.3);
  tick(c, o, t(0.4), 0.06, 7000);
  // 0.60-0.78 the tooth pulses once more and the sparkle shrinks away
  tick(c, o, t(0.6), 0.04, 2400);
  swish(c, o, t(0.6), t(0.2), 6500, 3000, 0.014);
}
