import { blip, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.77;

/** Four rubbery slaps on ice as the penguin rocks from foot to foot, each a squeaky pat over a low thump, the right foot a little higher than the left. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  thud(c, o, t(0.1), 165, 0.1, 0.08); // 0.12 the left foot slaps down as the body tilts left
  puff(c, o, t(0.11), 0.03, 1800, 0.09, "bandpass"); // 0.12 flipper pat
  blip(c, o, 760, t(0.11), 0.045, 0.07, 430); // 0.12 rubbery squeak
  thud(c, o, t(0.35), 195, 0.1, 0.08); // 0.37 the right foot slaps down as the body tilts right
  puff(c, o, t(0.36), 0.03, 2100, 0.09, "bandpass"); // 0.37 flipper pat
  blip(c, o, 900, t(0.36), 0.045, 0.07, 520); // 0.37 rubbery squeak, higher
  thud(c, o, t(0.6), 165, 0.09, 0.08); // 0.62 left slap
  puff(c, o, t(0.61), 0.03, 1800, 0.08, "bandpass"); // 0.62 flipper pat
  blip(c, o, 760, t(0.61), 0.04, 0.07, 430); // 0.62 squeak
  thud(c, o, t(0.85), 195, 0.08, 0.08); // 0.87 right slap
  puff(c, o, t(0.86), 0.03, 2100, 0.07, "bandpass"); // 0.87 flipper pat
  blip(c, o, 900, t(0.86), 0.035, 0.07, 520); // 0.87 squeak
}
