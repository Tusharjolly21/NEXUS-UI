import { plink, blip, thud, puff, N, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1;

/** A hissing fuse crackle with a thin whistle that sinks lower as the fuse burns down, a wobbly rattle, and a small relit pop at the end. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  [0.04, 0.12, 0.19, 0.3, 0.38, 0.47, 0.6, 0.68].forEach((at, i) => puff(c, o, t(at), 0.05, 5000 + i * 300, 0.05, "highpass"));
  blip(c, o, 1900, t(0.05), 0.04, 0.6, 600, "sawtooth");
  blip(c, o, 140, t(0.2), 0.05, 0.5, 120, "square");
  thud(c, o, t(0.82), 130, 0.2, 0.1);
  plink(c, o, N.D6, t(0.84), 0.05, 0.12);
}
