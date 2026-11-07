import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.1;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.63;

/** Feathery wing flutters on each wing stroke with a three-note tweet that rises as the head dips forward, falls as it lifts, and rises higher on the second dip. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  // wing strokes (wing swings 0->52, back to 6, up to 52, back to 0), fastest mid-stroke
  swish(c, o, t(0.04), t(0.14), 1800, 4200, 0.035); // 0.10 first wing stroke
  swish(c, o, t(0.25), t(0.14), 4200, 2000, 0.03); // 0.32 wing comes back
  swish(c, o, t(0.45), t(0.14), 1800, 4200, 0.035); // 0.52 second stroke
  swish(c, o, t(0.69), t(0.16), 4200, 1800, 0.03); // 0.76 wing settles
  // head bobs forward (0.198), lifts (0.405), bobs again (0.63): tweet each time
  blip(c, o, 3000, t(0.2), 0.07, 0.1, 4300); // 0.20 head dips: rising tweet
  blip(c, o, 4300, t(0.4), 0.06, 0.08, 3300); // 0.405 head lifts: falling tweet
  blip(c, o, 3200, t(0.63), 0.075, 0.14, 5000); // 0.63 second dip: longer, higher tweet
  puff(c, o, t(0.88), 0.08, 5000, 0.015, "highpass"); // 0.90 feathers settle
}
