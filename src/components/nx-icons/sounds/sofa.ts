import { swish, thud, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 0.9;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.19;

/** Two soft foam sounds, each a breath of air into the cushion and a low pillowy thump as it reaches full plumpness, the left first then the right a little higher, with a faint settling sigh after each. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.05), 0.2, 220, 520, 0.07); // 0.05 to 0.25 the left cushion plumps up
  thud(c, o, t(0.25), 92, 0.15, 0.17); // 0.25 the left cushion is at its fullest
  puff(c, o, t(0.52), 0.1, 520, 0.07, "lowpass"); // 0.55 the left cushion settles back
  swish(c, o, t(0.3), 0.2, 260, 600, 0.07); // 0.3 to 0.5 the right cushion plumps up
  thud(c, o, t(0.5), 112, 0.15, 0.17); // 0.5 the right cushion is at its fullest
  puff(c, o, t(0.77), 0.1, 600, 0.07, "lowpass"); // 0.8 the right cushion settles back
}
