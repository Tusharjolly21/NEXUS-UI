import { ding, blip, swish, tick, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.3;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 1.01;

/** A creaking wooden hinge as the lid swings open with a knock at its stop, a tumble of coin clinks as gold pops out, then a slow creak and a heavy wooden slam when the lid closes. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  blip(c, o, 170, t(0.06), 0.06, 0.1, 260, "sawtooth"); // 0.06 the lid starts to creak open
  blip(c, o, 230, t(0.14), 0.05, 0.1, 340, "sawtooth"); // 0.14 hinge creak, lid at full speed
  blip(c, o, 300, t(0.2), 0.04, 0.08, 400, "sawtooth"); // 0.20 the creak slows
  swish(c, o, t(0.2), t(0.2), 2500, 6500, 0.02); // 0.20 the rim glow shimmers on
  thud(c, o, t(0.28), 190, 0.16, 0.07); // 0.28 the lid hits its open stop
  tick(c, o, t(0.28), 0.08, 2200); // 0.28 wooden knock
  ding(c, o, 3400, t(0.3), 0.07, 0.22); // 0.30 first coin sparkle pops out
  tick(c, o, t(0.33), 0.07, 6500); // 0.33 coin clink
  ding(c, o, 4300, t(0.42), 0.065, 0.2); // 0.42 second coin sparkle
  tick(c, o, t(0.45), 0.07, 7500); // 0.45 coin clink
  ding(c, o, 3850, t(0.54), 0.06, 0.28); // 0.54 third coin sparkle
  tick(c, o, t(0.57), 0.06, 6000); // 0.57 coin clink
  blip(c, o, 330, t(0.8), 0.045, 0.14, 190, "sawtooth"); // 0.80 the lid starts to close with a creak
  blip(c, o, 240, t(0.92), 0.04, 0.12, 140, "sawtooth"); // 0.92 closing creak, fastest
  thud(c, o, t(1.08), 105, 0.2, 0.2); // 1.08 the lid slams shut
  tick(c, o, t(1.08), 0.1, 1800); // 1.08 wooden clap
}
