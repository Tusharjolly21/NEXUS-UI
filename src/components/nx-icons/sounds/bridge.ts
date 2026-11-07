import { plink, blip, swish, thud, type Time } from "../sound-kit";

/** How long it plays at normal speed, in seconds (for a loader, one lap). */
export const length = 1.0;

/** How loud it is next to the other icons. Measured, so they all sound about equally loud. */
export const level = 0.8;

/** A thin metallic zing that rises as the main cable is drawn from left to right, a deep twang as it reaches the far anchor, a zip as the hangers drop, a heavy thud as the deck sags into place, and low creaks as it bounces up and down. */
export function play(c: AudioContext, o: AudioNode, t: Time) {
  swish(c, o, t(0.0), t(0.6), 600, 3000, 0.04); // 0.00-0.60 the main cable draws across (fastest 0.3)
  blip(c, o, 300, t(0.02), 0.035, 0.58, 1100, "triangle"); // 0.02-0.60 the taut wire sings as it lengthens
  plink(c, o, 160, t(0.6), 0.08, 0.3); // 0.60 the cable reaches the far anchor and twangs taut
  swish(c, o, t(0.49), t(0.25), 3500, 1500, 0.03); // 0.49-0.74 the three hangers drop from the cable
  thud(c, o, t(0.65), 80, 0.28, 0.2); // 0.65 the deck sags to its lowest and lands
  blip(c, o, 140, t(0.65), 0.05, 0.2, 95, "triangle"); // 0.65 the cables groan under the load
  blip(c, o, 100, t(0.68), 0.04, 0.12, 150, "triangle"); // 0.68 the deck springs upward
  blip(c, o, 150, t(0.82), 0.03, 0.1, 105, "triangle"); // 0.82 the deck drops back from its overshoot
  blip(c, o, 105, t(0.91), 0.015, 0.09, 120, "triangle"); // 0.91 a last small settle
}
