import { ding, swish, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.83;

/** Three glassy bauble pings climbing as the baubles light one after another, then a bright shimmering sparkle as the star twinkles. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  ding(c, o, 1396, t(0.198), 0.05, 0.3); // 0.20 the top bauble lights
  ding(c, o, 1662, t(0.324), 0.045, 0.3); // 0.32 the left bauble lights
  ding(c, o, 1976, t(0.45), 0.045, 0.3); // 0.45 the right bauble lights
  ding(c, o, 3136, t(0.62), 0.04, 0.35); // 0.62 the star swells
  swish(c, o, t(0.6), t(0.3), 5000, 7000, 0.015); // 0.60-0.90 the star shimmers as it twinkles
}
