import { blip, swish, puff, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.2;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 2.31;

/** Water washes past all the way through, a splash and a bubbly gulp as the paddle blade dips in, a few drips as it lifts out, soft wooden creaks of the hull gliding, and a light air sweep as the paddle swings across. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.1), 1.1, 600, 900, 0.035); // 0.6 waves slide past, loudest when they move fastest
  puff(c, o, t(0.26), 0.09, 2800, 0.07, "highpass"); // 0.26 the blade splashes in
  blip(c, o, 380, t(0.3), 0.07, 0.1, 760); // 0.30 gulp of water at the deepest dip
  blip(c, o, 1400, t(0.46), 0.05, 0.05, 2200); // 0.46 first drip as the blade lifts out
  blip(c, o, 1600, t(0.52), 0.045, 0.05, 2500); // 0.52 second drip
  blip(c, o, 1800, t(0.58), 0.04, 0.05, 2800); // 0.58 third drip
  blip(c, o, 170, t(0.35), 0.04, 0.18, 230, "sawtooth"); // 0.35 the hull creaks as it glides
  blip(c, o, 150, t(0.85), 0.03, 0.18, 200, "sawtooth"); // 0.85 creak as it glides back
  swish(c, o, t(0.7), 0.3, 1500, 900, 0.02); // 0.83 the paddle sweeps through the air
  swish(c, o, t(0.6), 0.6, 800, 500, 0.02); // 0.87 the waves slow down and settle
}
