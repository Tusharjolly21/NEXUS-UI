import { ding, plink, blip, swish, tick, thud, puff, N, type Time } from "./sound-kit";

/**
 * The sounds of the liquid looks (Mercury, Liquid and Glass), in the same score format as every icon's sound:
 * `length`, `level` and `play(c, o, t)`. Each look has two:
 *
 *   hover   a short layer that plays on top of an icon's own sound while it wears the look
 *   switch  a longer one for the moment a look is picked
 *
 * With the standalone engine: playIconScore(mercury.switch)  or  playIconScore(mercury.hover, { volume: 0.6 }).
 * Like the icon sounds, they are synthesised in the browser: no audio files.
 */
export type MaterialScore = { length: number; level: number; play: (c: AudioContext, o: AudioNode, t: Time) => void };
export type MaterialSoundName = "mercury" | "liquid" | "glass";

/** Mercury: a bead of liquid metal, rolling, then ringing as it sets. */
export const mercury: { hover: MaterialScore; switch: MaterialScore } = {
  hover: {
    length: 0.6,
    level: 1.25,
    play(c, o, t) {
      blip(c, o, 430, t(0.0), 0.05, 0.34, 150, "triangle"); // the weight of the bead rolling
      swish(c, o, t(0.02), t(0.3), 1800, 7400, 0.05); // the shine sweeping over it
      tick(c, o, t(0.1), 0.06, 6500);
      ding(c, o, N.E7, t(0.1), 0.05, 0.5); // metal ringing
      ding(c, o, N.B6, t(0.18), 0.035, 0.45);
    },
  },
  switch: {
    length: 1.1,
    level: 0.98,
    play(c, o, t) {
      swish(c, o, t(0.0), t(0.34), 2800, 500, 0.05); // mercury pouring
      blip(c, o, 520, t(0.02), 0.06, 0.4, 120, "sine");
      thud(c, o, t(0.34), 120, 0.2, 0.12); // the blob lands
      swish(c, o, t(0.36), t(0.3), 2000, 9000, 0.06); // and polishes up
      ding(c, o, N.E7, t(0.4), 0.08, 0.8);
      ding(c, o, N.A6, t(0.46), 0.05, 0.7);
      ding(c, o, N.C8, t(0.55), 0.035, 0.6);
      [0.52, 0.62, 0.72].forEach((at, i) => tick(c, o, t(at), 0.04, 7000 - i * 800));
    },
  },
};

/** Liquid: a wet droplet: bloops, a slosh, a drip. */
export const liquid: { hover: MaterialScore; switch: MaterialScore } = {
  hover: {
    length: 0.6,
    level: 1.5,
    play(c, o, t) {
      puff(c, o, t(0.0), 0.4, 700, 0.03, "lowpass"); // the slosh
      blip(c, o, 380, t(0.02), 0.08, 0.12, 820);
      blip(c, o, 520, t(0.15), 0.07, 0.1, 1000);
      blip(c, o, 300, t(0.27), 0.06, 0.14, 640);
      plink(c, o, N.A6, t(0.34), 0.04, 0.1);
    },
  },
  switch: {
    length: 0.95,
    level: 1.39,
    play(c, o, t) {
      blip(c, o, 200, t(0.0), 0.1, 0.24, 720); // one big bloop
      puff(c, o, t(0.02), 0.5, 600, 0.04, "lowpass");
      thud(c, o, t(0.26), 100, 0.12, 0.1);
      [[0.3, N.E6], [0.43, N.C6], [0.56, N.G5]].forEach(([at, f]) => plink(c, o, f as number, t(at as number), 0.07, 0.14)); // drips
      ding(c, o, N.A6, t(0.7), 0.03, 0.3);
    },
  },
};

/** Glass: a clink and a long, thin ring. */
export const glass: { hover: MaterialScore; switch: MaterialScore } = {
  hover: {
    length: 0.5,
    level: 1.38,
    play(c, o, t) {
      tick(c, o, t(0.0), 0.08, 6500);
      ding(c, o, N.G7, t(0.01), 0.06, 0.45);
      ding(c, o, N.C8, t(0.05), 0.03, 0.3);
      swish(c, o, t(0.02), t(0.2), 5000, 9500, 0.02);
    },
  },
  switch: {
    length: 1.2,
    level: 1.2,
    play(c, o, t) {
      tick(c, o, t(0.0), 0.1, 6000); // two glasses touching
      ding(c, o, N.E7, t(0.01), 0.07, 0.6);
      tick(c, o, t(0.14), 0.1, 7000);
      ding(c, o, N.G7, t(0.15), 0.06, 0.7);
      ding(c, o, N.C8, t(0.3), 0.05, 1.0); // the long shimmering ring
      ding(c, o, N.G7, t(0.34), 0.035, 0.9);
      swish(c, o, t(0.3), t(0.5), 4500, 10000, 0.015);
    },
  },
};

export const MATERIAL_SOUNDS = { mercury, liquid, glass } as const;
