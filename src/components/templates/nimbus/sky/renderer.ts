import type { Condition } from "../weather";
import { createCloudBuffers, renderCloudField, sampleClouds, type CloudBuffers } from "./clouds";
import { createBolt, createMeteor, flashLevel, type Bolt, type Meteor } from "./effects";
import { renderTexturedMoon } from "./moon";
import { buildNightSky, type NightSky } from "./night-sky";
import { clamp01, TAU, valueNoise } from "./noise";
import { cloneState, easeState, SKY_PRESETS, snapState, type SkyPreset, type SkyState } from "./presets";
import { proceduralMoon, radialSprite, rainHazeTile, waterDropSprite } from "./sprites";

export type SkyOptions = {
  /** How busy the sky is: scales the number of stars, raindrops and snowflakes. 1 is the full hero sky. */
  density: number;
  /** Rain collects as droplets on a pane of glass, like the phone's lock screen. */
  glass: boolean;
  /** Leave the moon out (used by small widgets). */
  moonless: boolean;
  /** Draw a single settled frame instead of animating. */
  reducedMotion: boolean;
};

type RainDrop = { x: number; y: number; z: number; s: number };
type Flake = { x: number; y: number; z: number; phase: number; sway: number; r: number };
type Splash = { x: number; y: number; age: number };
type GlassDrop = { x: number; y: number; r: number; v: number; slide: boolean };
type GlassTrail = { x: number; y: number; r: number; a: number };
type MeteorTrail = { meteor: Meteor; t0: number };

/** The clock reading used for the single frame drawn under reduced motion. */
const STILL_TIME_MS = 30000;
/** Animated skies draw at about 30 frames per second. */
const MIN_FRAME_MS = 31;

/** Shared, read-only images, built the first time a sky needs them. */
let sharedSprites: { starGlow: HTMLCanvasElement; flakeGlow: HTMLCanvasElement; flake: HTMLCanvasElement; haze: HTMLCanvasElement; waterDrop: HTMLCanvasElement } | null = null;
function getSprites() {
  sharedSprites ??= {
    starGlow: radialSprite(32, [
      [0, "rgba(240,244,255,.65)"],
      [0.4, "rgba(225,232,255,.18)"],
      [1, "rgba(220,228,255,0)"],
    ]),
    flakeGlow: radialSprite(64, [
      [0, "rgba(255,255,255,.75)"],
      [0.45, "rgba(255,255,255,.35)"],
      [1, "rgba(255,255,255,0)"],
    ]),
    flake: radialSprite(32, [
      [0, "rgba(255,255,255,1)"],
      [0.5, "rgba(255,255,255,.85)"],
      [1, "rgba(255,255,255,0)"],
    ]),
    haze: rainHazeTile(),
    waterDrop: waterDropSprite(),
  };
  return sharedSprites;
}

function createCanvas() {
  const canvas = document.createElement("canvas");
  return { canvas, ctx: canvas.getContext("2d")! };
}

/**
 * Draws the live sky into a canvas: drifting clouds, the sun with its glare and lens flares, a real night
 * sky with a moon and shooting stars, rain, snow, lightning and droplets running down glass.
 *
 * One renderer owns one canvas. Call `setMode` to change the weather (the sky eases there over about a
 * second), `start` and `stop` to run or pause the loop, and `resize` when the canvas changes size.
 */
export class SkyRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly options: SkyOptions;
  private readonly sprites = getSprites();

  private width = 0;
  private height = 0;
  private dpr = 1;
  private frameId = 0;
  private running = false;
  private lastFrame = 0;

  private target: SkyPreset;
  private readonly state: SkyState;

  // Cloud layer: two small canvases (colour, and the flash used by lightning) scaled up when drawn.
  private readonly cloudLayer = createCanvas();
  private readonly flashLayer = createCanvas();
  private cloudBuffers: CloudBuffers | null = null;
  private lastCloudRender = -1e9;
  /** Cloud density at the sun's position: 1 means the sun is hidden. */
  private sunCover = 0;

  // Night sky.
  private nightSky: NightSky | null = null;
  private nightSkyKey = "";
  private moon: HTMLCanvasElement | null = null;
  private moonRadius = 0;
  private moonRequest = 0;
  private meteors: Meteor[] = [];
  private meteorTrails: MeteorTrail[] = [];
  private nextMeteorAt = performance.now() + 1200;

  // Storm.
  private bolt: Bolt | null = null;
  private nextBoltAt = performance.now() + 900;

  // Rain and snow.
  private readonly rainDrops: RainDrop[];
  private readonly flakes: Flake[];
  private readonly splashes: Splash[] = [];
  private readonly hazeLayer = createCanvas();
  private hazePattern: CanvasPattern | null = null;

  // Droplets on the glass.
  private glassDrops: GlassDrop[] = [];
  private glassTrails: GlassTrail[] = [];

  constructor(canvas: HTMLCanvasElement, mode: Condition, options: SkyOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.options = options;
    this.target = SKY_PRESETS[mode];
    this.state = cloneState(this.target);

    const rand = Math.random;
    this.rainDrops = Array.from({ length: Math.round(800 * options.density) }, () => ({
      x: rand(),
      y: rand(),
      z: Math.pow(rand(), 1.5),
      s: 0.85 + rand() * 0.3,
    }));
    this.flakes = Array.from({ length: Math.round(520 * options.density) }, () => {
      const z = Math.pow(rand(), 1.6);
      return { x: rand(), y: rand(), z, phase: rand() * 6.28, sway: 0.6 + rand() * 0.9, r: z > 0.93 ? 4 + rand() * 7 : 0.6 + z * 2.6 + rand() * 0.6 };
    });
  }

  // ---- control -------------------------------------------------------------------------------------

  /** Changes the weather. The sky eases to it while running; a still sky redraws immediately. */
  setMode(mode: Condition) {
    this.target = SKY_PRESETS[mode];
    if (this.running && this.options.reducedMotion) this.drawStill();
  }

  /** Begins animating (or, under reduced motion, draws one settled frame). */
  start() {
    if (this.running) return;
    this.running = true;
    // Weather may have changed while paused: show it straight away instead of easing from the old sky.
    snapState(this.state, this.target);
    if (this.options.reducedMotion) {
      this.drawStill();
      return;
    }
    this.lastFrame = performance.now();
    this.frameId = requestAnimationFrame(this.tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  /** Matches the canvas to its CSS size. Under reduced motion this also redraws, since resizing clears it. */
  resize() {
    const canvas = this.canvas;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    // Big canvases render at 1x: the clouds and stars are soft anyway and the fill cost is not worth it.
    this.dpr = width * height > 360000 ? 1 : Math.min(1.5, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * this.dpr);
    canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.cloudBuffers = createCloudBuffers(width, height, this.cloudLayer.ctx, this.flashLayer.ctx);
    this.cloudLayer.canvas.width = this.flashLayer.canvas.width = this.cloudBuffers.cols;
    this.cloudLayer.canvas.height = this.flashLayer.canvas.height = this.cloudBuffers.rows;
    this.lastCloudRender = -1e9;

    this.nightSky = null;
    this.moonRadius = Math.max(10, Math.min(40, Math.min(width, height) * 0.038));
    const request = ++this.moonRequest;
    const pixels = this.moonRadius * 2 * Math.max(this.dpr, 1.5);
    renderTexturedMoon(pixels).then((textured) => {
      if (request !== this.moonRequest) return;
      this.moon = textured ?? proceduralMoon(this.moonRadius * this.dpr);
    });

    if (this.running && this.options.reducedMotion) this.drawStill();
  }

  // ---- loop ----------------------------------------------------------------------------------------

  private tick = (now: number) => {
    if (!this.running) return;
    this.frameId = requestAnimationFrame(this.tick);
    if (!this.width || !this.height) return;
    if (now - this.lastFrame < MIN_FRAME_MS) return;
    const dt = Math.min(48, now - this.lastFrame) / 16.7;
    this.lastFrame = now;
    this.draw(now, dt);
  };

  /** One settled frame with no motion in time: used for reduced motion. */
  private drawStill() {
    if (!this.width || !this.height) return;
    snapState(this.state, this.target);
    this.draw(STILL_TIME_MS, 1);
  }

  private get reduced() {
    return this.options.reducedMotion;
  }

  /** Where the sun sits: top right, nudged off the top edge on a phone-sized canvas. */
  private sunPosition(): [number, number] {
    const { width, height } = this;
    return width < 520 && height < 760 ? [width * 0.86, -height * 0.012] : [width * 0.83, Math.min(height * 0.1, 100)];
  }

  private moonPosition(): [number, number] {
    const { width, height } = this;
    return width < 520 && height < 760 ? [width * 0.8, height * 0.14] : [width * 0.83, Math.min(height * 0.1, 100)];
  }

  private draw(now: number, dt: number) {
    const { ctx, width, height, state } = this;
    const seconds = now / 1000;
    easeState(state, this.target, 1 - Math.pow(0.95, dt));

    if (now - this.lastCloudRender > 90 && this.cloudBuffers) {
      renderCloudField(state, width, height, this.cloudBuffers, this.cloudLayer.ctx, this.flashLayer.ctx, seconds);
      const [sunX, sunY] = this.sunPosition();
      this.sunCover = sampleClouds(state, width, height, sunX, sunY, seconds)[0];
      this.lastCloudRender = now;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";

    const sunRadius = Math.max(9, Math.min(19, Math.min(width, height) * 0.02));
    if (state.night > 0.01) this.drawNight(now, seconds);
    if (state.sun > 0.01) this.drawSun(sunRadius);

    ctx.globalAlpha = 1;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(this.cloudLayer.canvas, 0, 0, width, height);

    if (state.sun > 0.01) this.drawSunGlare(seconds, sunRadius);
    if (state.bolt > 0.3 && !this.reduced) this.drawLightning(now);
    if (state.rain > 0.01) this.drawRain(now, seconds, dt);
    if (state.snow > 0.01) this.drawSnow(seconds, dt);
    if (this.options.glass && state.rain > 0.05) this.drawGlassDrops(dt);
    ctx.globalAlpha = 1;
  }

  // ---- night ---------------------------------------------------------------------------------------

  private drawNight(now: number, seconds: number) {
    const { ctx, width, height } = this;
    const strength = this.state.night;
    const key = `${width}x${height}`;
    if (!this.nightSky || this.nightSkyKey !== key) {
      this.nightSky = buildNightSky(width, height, this.dpr, this.options.density);
      this.nightSkyKey = key;
    }
    const sky = this.nightSky;

    ctx.globalAlpha = strength;
    ctx.drawImage(sky.base, 0, 0, width, height);

    // The bright stars twinkle. Stars near the horizon twinkle harder and flicker in colour.
    for (const star of sky.stars) {
      if (star.mag > 3.2) continue;
      const amplitude = this.reduced ? 0 : Math.min(0.55, 0.1 * star.air);
      const wobble = valueNoise(seconds * 7 + star.seed, star.seed);
      const colorWobble = valueNoise(seconds * 11 + star.seed * 1.7, star.seed + 3);
      const flicker = 1 + amplitude * (wobble - 0.5) * 2;
      const flux = Math.pow(10, -0.4 * (star.mag - 1.5)) * flicker;
      const radius = 0.7 + Math.max(0, 4.6 - star.mag) * 0.3;
      const alpha = clamp01(0.5 + (4 - star.mag) * 0.22) * clamp01(flicker) * strength;
      const shift = star.air > 2.2 ? (colorWobble - 0.5) * 60 * amplitude : 0;
      const color = `${Math.round(clamp01((star.col[0] + shift) / 255) * 255)},${Math.round(star.col[1])},${Math.round(clamp01((star.col[2] - shift) / 255) * 255)}`;

      if (star.mag < 2.6) {
        const halo = radius * (2.6 + Math.min(4, flux) * 1.8);
        ctx.globalAlpha = 0.5 * alpha;
        ctx.drawImage(this.sprites.starGlow, star.x - halo, star.y - halo, halo * 2, halo * 2);
      }
      ctx.globalAlpha = alpha;
      ctx.fillStyle = `rgb(${color})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, radius, 0, TAU);
      ctx.fill();
      if (star.mag < 1.2) {
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(star.x, star.y, radius * 0.5, 0, TAU);
        ctx.fill();
      }
    }

    this.drawMeteors(now, strength, sky);

    if (this.moon && !this.options.moonless) {
      const [x, y] = this.moonPosition();
      const radius = this.moonRadius;
      ctx.globalCompositeOperation = "lighter";
      const halo = ctx.createRadialGradient(x, y, radius * 0.9, x, y, radius * 7);
      halo.addColorStop(0, `rgba(190,205,255,${0.2 * strength})`);
      halo.addColorStop(1, "rgba(190,205,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.fillRect(x - radius * 7, y - radius * 7, radius * 14, radius * 14);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = strength;
      const size = radius * 1.02;
      ctx.drawImage(this.moon, x - size, y - size, size * 2, size * 2);
    }
  }

  private drawMeteors(now: number, strength: number, sky: NightSky) {
    const { ctx, width, height } = this;
    if (!this.reduced && now > this.nextMeteorAt) {
      this.meteors.push(createMeteor(width, height, now, sky.radiant));
      // Usually a calm gap of a few seconds, occasionally a quick second one.
      this.nextMeteorAt = now + (Math.random() < 0.18 ? 250 + Math.random() * 600 : 2200 + -Math.log(1 - Math.random()) * 3800);
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";

    // Smoke trails left behind by the bright ones.
    for (let i = this.meteorTrails.length - 1; i >= 0; i--) {
      const { meteor, t0 } = this.meteorTrails[i];
      const progress = (now - t0) / 1600;
      if (progress > 1) {
        this.meteorTrails.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = (1 - progress) * (1 - progress) * 0.22 * strength;
      ctx.strokeStyle = `rgb(${meteor.col})`;
      ctx.lineWidth = 0.8 + progress * 2.4 * meteor.size;
      ctx.beginPath();
      ctx.moveTo(meteor.x + meteor.dx * meteor.len * 0.25 + progress * 2, meteor.y + meteor.dy * meteor.len * 0.25 + progress * 3);
      ctx.lineTo(meteor.x + meteor.dx * meteor.len * 0.85 + progress * 2, meteor.y + meteor.dy * meteor.len * 0.85 + progress * 3);
      ctx.stroke();
    }

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      const progress = (now - m.t0) / m.dur;
      if (progress >= 1) {
        if (m.train) this.meteorTrails.push({ meteor: m, t0: now });
        this.meteors.splice(i, 1);
        continue;
      }
      // Fade in over the first fifth, hold, fade out over the last fifth.
      let intensity = progress < 0.2 ? progress / 0.2 : progress < 0.8 ? 1 : (1 - progress) / 0.2;
      if (m.flare && Math.abs(progress - 0.62) < 0.07) intensity += m.flare * (1 - Math.abs(progress - 0.62) / 0.07) * 2;
      const travelled = m.len * (1 - Math.pow(1 - progress, 1.25));
      const headX = m.x + m.dx * travelled;
      const headY = m.y + m.dy * travelled;
      const tail = Math.min(travelled, m.len * (0.25 + 0.3 * Math.min(1, intensity)));

      const streak = ctx.createLinearGradient(headX, headY, headX - m.dx * tail, headY - m.dy * tail);
      streak.addColorStop(0, `rgba(${m.col},${Math.min(1, 0.95 * intensity) * strength})`);
      streak.addColorStop(0.3, `rgba(${m.col},${0.35 * intensity * strength})`);
      streak.addColorStop(1, `rgba(${m.col},0)`);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = streak;
      ctx.lineWidth = 0.7 + m.size * 0.75;
      ctx.beginPath();
      ctx.moveTo(headX, headY);
      ctx.lineTo(headX - m.dx * tail, headY - m.dy * tail);
      ctx.stroke();

      const glow = 1.5 + m.size * 2.2 * Math.min(1.6, intensity);
      const head = ctx.createRadialGradient(headX, headY, 0, headX, headY, glow);
      head.addColorStop(0, `rgba(255,255,255,${Math.min(1, intensity) * strength})`);
      head.addColorStop(0.35, `rgba(${m.col},${0.45 * Math.min(1, intensity) * strength})`);
      head.addColorStop(1, `rgba(${m.col},0)`);
      ctx.fillStyle = head;
      ctx.fillRect(headX - glow, headY - glow, glow * 2, glow * 2);
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // ---- sun -----------------------------------------------------------------------------------------

  /** The sun's disc and the wash of light around it, drawn behind the clouds. */
  private drawSun(sunRadius: number) {
    const { ctx, width, height, state } = this;
    const [x, y] = this.sunPosition();
    const strength = state.sun;
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 1;

    const wash = ctx.createRadialGradient(x, y, 0, x, y, Math.max(width, height) * 0.55);
    wash.addColorStop(0, `rgba(255,246,226,${0.42 * strength})`);
    wash.addColorStop(0.12, `rgba(255,240,215,${0.16 * strength})`);
    wash.addColorStop(1, "rgba(255,240,215,0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);

    const disc = ctx.createRadialGradient(x, y, 0, x, y, sunRadius * 1.25);
    disc.addColorStop(0, `rgba(255,255,255,${strength})`);
    disc.addColorStop(0.55, `rgba(255,255,252,${strength})`);
    disc.addColorStop(1, "rgba(255,250,235,0)");
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(x, y, sunRadius * 1.25, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  /** Glare, rays and lens flares drawn over the clouds. They fade as cloud covers the sun. */
  private drawSunGlare(seconds: number, sunRadius: number) {
    const { ctx, width, height, state } = this;
    const [x, y] = this.sunPosition();
    const strength = state.sun * (1 - this.sunCover * 0.85);
    ctx.globalCompositeOperation = "lighter";

    const reach = sunRadius * 11;
    const glare = ctx.createRadialGradient(x, y, 0, x, y, reach);
    glare.addColorStop(0, `rgba(255,253,245,${0.95 * strength})`);
    glare.addColorStop(0.1, `rgba(255,250,235,${0.7 * strength})`);
    glare.addColorStop(0.3, `rgba(255,244,222,${0.22 * strength})`);
    glare.addColorStop(1, "rgba(255,240,215,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = glare;
    ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2);

    // Six slim rays that sway a little.
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(seconds * 0.15) * 0.05);
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      const length = sunRadius * (i % 2 ? 4 : 6.5);
      const ray = ctx.createLinearGradient(0, 0, length, 0);
      ray.addColorStop(0, `rgba(255,255,255,${0.14 * strength})`);
      ray.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ray;
      ctx.beginPath();
      ctx.moveTo(0, -1.1);
      ctx.lineTo(length, 0);
      ctx.lineTo(0, 1.1);
      ctx.fill();
    }
    ctx.restore();

    // Lens flares: discs strung along the line from the sun through the middle of the screen.
    const centerX = width / 2;
    const centerY = height / 2;
    const flares: [position: number, size: number, rgb: string, alpha: number][] = [
      [0.55, 0.9, "255,214,160", 0.1],
      [0.85, 2.6, "160,205,255", 0.05],
      [1.2, 0.55, "255,255,255", 0.12],
      [1.5, 4, "205,180,255", 0.04],
    ];
    for (const [position, size, rgb, alpha] of flares) {
      const fx = x + (centerX - x) * position * 2;
      const fy = y + (centerY - y) * position * 2;
      const radius = sunRadius * size;
      const disc = ctx.createRadialGradient(fx, fy, radius * 0.2, fx, fy, radius);
      disc.addColorStop(0, `rgba(${rgb},${alpha * strength * 0.4})`);
      disc.addColorStop(0.8, `rgba(${rgb},${alpha * strength})`);
      disc.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(fx, fy, radius, 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // ---- storm ---------------------------------------------------------------------------------------

  private drawLightning(now: number) {
    const { ctx, width, height, state } = this;
    if (now > this.nextBoltAt) {
      // A third of the strikes are "sheet" lightning: the clouds flash and no bolt is visible.
      this.bolt = createBolt(width, height, now, Math.random() < 0.35);
      this.nextBoltAt = now + 2000 + Math.random() * 4200;
    }
    const bolt = this.bolt;
    if (!bolt) return;
    const level = flashLevel(now - bolt.t0) * state.bolt;
    if (now - bolt.t0 > 500) this.bolt = null;
    if (level <= 0.01) return;

    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = level * 0.55;
    ctx.drawImage(this.flashLayer.canvas, 0, 0, width, height);

    const glow = ctx.createRadialGradient(bolt.x, bolt.y, 0, bolt.x, bolt.y, Math.max(width, height) * 0.55);
    glow.addColorStop(0, `rgba(200,210,255,${0.45 * level})`);
    glow.addColorStop(1, "rgba(200,210,255,0)");
    ctx.globalAlpha = 1;
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = `rgba(150,165,220,${0.08 * level})`;
    ctx.fillRect(0, 0, width, height);

    if (!bolt.sheet) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      // Three passes, wide and faint to thin and white, give the bolt its glow.
      const passes: [width: number, rgb: string, alpha: number][] = [
        [9, "180,195,255", 0.1],
        [3.2, "205,215,255", 0.35],
        [1, "255,255,255", 1],
      ];
      for (const [lineWidth, rgb, alpha] of passes) {
        ctx.strokeStyle = `rgba(${rgb},${alpha * level})`;
        for (const [x1, y1, x2, y2, thickness] of bolt.segments) {
          ctx.lineWidth = thickness * lineWidth;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
  }

  // ---- rain ----------------------------------------------------------------------------------------

  private drawRain(now: number, seconds: number, dt: number) {
    const { ctx, width, height, state } = this;
    const amount = state.rain;
    // The wind slants the rain and sways slowly.
    const sway = Math.sin(seconds * 0.35) * 0.05 + Math.sin(seconds * 1.3) * 0.02;
    const slant = -(0.1 + amount * 0.12) + sway;
    const active = Math.round(this.rainDrops.length * Math.min(1, 0.35 + amount * 0.65));

    // Far rain: a scrolling haze texture drawn small and scaled up.
    const { canvas: haze, ctx: hazeCtx } = this.hazeLayer;
    const hazeWidth = Math.ceil(width / 4);
    const hazeHeight = Math.ceil(height / 4);
    if (haze.width !== hazeWidth || haze.height !== hazeHeight) {
      haze.width = hazeWidth;
      haze.height = hazeHeight;
    }
    hazeCtx.setTransform(1, 0, 0, 1, 0, 0);
    hazeCtx.clearRect(0, 0, haze.width, haze.height);
    hazeCtx.translate(haze.width / 2, haze.height / 2);
    hazeCtx.rotate(-slant);
    hazeCtx.scale(0.55, 0.55);
    this.hazePattern ??= hazeCtx.createPattern(this.sprites.haze, "repeat");
    if (this.hazePattern) {
      const scroll = (now * 0.35 * (0.6 + amount)) % 384;
      const reach = Math.hypot(width, height) / 4.4 + 8;
      hazeCtx.translate(0, scroll);
      hazeCtx.fillStyle = this.hazePattern;
      hazeCtx.fillRect(-reach, -reach - 384, reach * 2, reach * 2 + 384);
    }
    ctx.globalAlpha = 0.05 + amount * 0.07;
    ctx.imageSmoothingQuality = "low";
    ctx.drawImage(haze, 0, 0, width, height);

    // Near rain, in three depth layers: [min depth, max depth, line width, alpha]. Nearer drops are longer and brighter.
    const layers: [number, number, number, number][] = [
      [0, 0.45, 0.6, 0.09],
      [0.45, 0.8, 0.9, 0.14],
      [0.8, 1.01, 1.35, 0.22],
    ];
    ctx.lineCap = "round";
    for (const [minZ, maxZ, lineWidth, alpha] of layers) {
      const streaks = new Path2D();
      const heads = new Path2D();
      for (let i = 0; i < active; i++) {
        const drop = this.rainDrops[i];
        if (drop.z < minZ || drop.z >= maxZ) continue;
        const speed = (10 + drop.z * 26) * drop.s * (0.8 + amount * 0.45) * dt * Math.max(0.5, Math.min(1, height / 900));
        drop.y += speed / height;
        drop.x += (speed * slant) / width;
        if (drop.y > 1.04) {
          // Big near drops sometimes splash at the bottom edge.
          if (drop.z > 0.75 && Math.random() < 0.5 && this.splashes.length < 140) {
            this.splashes.push({ x: drop.x * width, y: height * (0.965 + Math.random() * 0.035), age: 0 });
          }
          drop.y = -0.04 - Math.random() * 0.1;
          drop.x = Math.random() * 1.2 - 0.1;
        }
        if (drop.x < -0.1) drop.x += 1.2;
        const x = drop.x * width;
        const y = drop.y * height;
        const length = speed * 1.7 + 4 + drop.z * 10;
        streaks.moveTo(x, y);
        streaks.lineTo(x - length * slant, y - length);
        heads.moveTo(x, y);
        heads.lineTo(x - length * 0.4 * slant, y - length * 0.4);
      }
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = "rgb(214,224,238)";
      ctx.globalAlpha = alpha * 0.55 * Math.min(1, amount * 1.4);
      ctx.stroke(streaks);
      ctx.globalAlpha = alpha * 0.6 * Math.min(1, amount * 1.4);
      ctx.stroke(heads);
    }

    // Splashes: a flat ring and two flicked droplets.
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = "rgb(220,228,240)";
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const splash = this.splashes[i];
      splash.age += dt;
      const t = splash.age / 14;
      if (t >= 1) {
        this.splashes.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = (1 - t) * 0.35 * amount;
      ctx.beginPath();
      ctx.ellipse(splash.x, splash.y, 1 + t * 7, 0.4 + t * 1.6, 0, 0, TAU);
      ctx.stroke();
      const lift = Math.sin(t * Math.PI) * 5;
      ctx.fillStyle = "rgb(225,232,244)";
      ctx.fillRect(splash.x - 3 - t * 5, splash.y - lift, 1, 1);
      ctx.fillRect(splash.x + 2 + t * 5, splash.y - lift * 0.8, 1, 1);
    }

    // A cool mist along the bottom.
    const mist = ctx.createLinearGradient(0, height * 0.55, 0, height);
    mist.addColorStop(0, "rgba(200,210,222,0)");
    mist.addColorStop(1, `rgba(200,210,222,${0.16 * amount})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = mist;
    ctx.fillRect(0, height * 0.55, width, height * 0.45);
  }

  // ---- snow ----------------------------------------------------------------------------------------

  private drawSnow(seconds: number, dt: number) {
    const { ctx, width, height, state } = this;
    const amount = state.snow;
    // A gust that swells and fades.
    const wind = 0.35 + Math.sin(seconds * 0.2) * 0.35;
    for (const flake of this.flakes) {
      const fall = (0.28 + flake.z * 1.25) * dt;
      const drift = Math.sin(flake.phase + seconds * flake.sway * 1.6) * (0.25 + flake.z * 0.6);
      const turbulence = (valueNoise(flake.x * 6 + seconds * 0.15, flake.y * 4 + flake.z * 20) - 0.5) * 1.8 * (0.3 + flake.z);
      flake.y += fall / height;
      flake.x += ((wind * (0.3 + flake.z) + drift + turbulence) * dt) / width;
      if (flake.y > 1.03) {
        flake.y = -0.03;
        flake.x = Math.random();
      }
      if (flake.x > 1.05) flake.x -= 1.1;
      if (flake.x < -0.05) flake.x += 1.1;
      const x = flake.x * width;
      const y = flake.y * height;
      if (flake.r > 3.5) {
        // The biggest flakes are out of focus: large, soft and faint.
        ctx.globalAlpha = 0.42 * amount;
        ctx.drawImage(this.sprites.flakeGlow, x - flake.r * 1.6, y - flake.r * 1.6, flake.r * 3.2, flake.r * 3.2);
      } else {
        ctx.globalAlpha = (0.45 + flake.z * 0.5) * amount;
        ctx.drawImage(this.sprites.flake, x - flake.r, y - flake.r, flake.r * 2, flake.r * 2);
      }
    }
    const haze = ctx.createLinearGradient(0, height * 0.5, 0, height);
    haze.addColorStop(0, "rgba(240,244,248,0)");
    haze.addColorStop(1, `rgba(240,244,248,${0.22 * amount})`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = haze;
    ctx.fillRect(0, height * 0.5, width, height * 0.5);
  }

  // ---- glass ---------------------------------------------------------------------------------------

  private newGlassDrop(y: number): GlassDrop {
    const large = Math.random() < 0.12;
    return {
      x: Math.random() * this.width,
      y,
      r: large ? 2.6 + Math.random() * 2.4 : 0.6 + Math.pow(Math.random(), 2) * 1.8,
      v: 0,
      slide: false,
    };
  }

  /** Rain collecting on the pane: beads grow, the big ones break loose and run down, swallowing others and leaving a trail. */
  private drawGlassDrops(dt: number) {
    const { ctx, width, height, state } = this;
    const strength = Math.min(1, state.rain * 1.3);
    const drops = this.glassDrops;
    const bead = this.sprites.waterDrop;

    if (drops.length === 0) {
      for (let i = 0; i < Math.round((width * height) / 520); i++) drops.push(this.newGlassDrop(Math.random() * height));
    }
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      if (drop.r > 3.6 && !drop.slide && Math.random() < 0.004 * dt) drop.slide = true;
      if (!drop.slide && Math.random() < 0.0015 * dt) drop.r = Math.min(drop.r + 0.4, 6);
      if (!drop.slide) continue;

      drop.v = Math.min(drop.v + 0.06 * dt, 3.4);
      const nextY = drop.y + drop.v * dt;
      drop.x += Math.sin(drop.y * 0.05 + drop.r) * 0.25;
      // Absorb any resting bead the drop runs over.
      for (let j = drops.length - 1; j >= 0; j--) {
        const other = drops[j];
        if (other !== drop && !other.slide && Math.abs(other.x - drop.x) < drop.r + other.r && other.y > drop.y && other.y < nextY + drop.r) {
          drops.splice(j, 1);
          if (j < i) i--;
          drop.r = Math.min(drop.r + other.r * 0.15, 7);
        }
      }
      if (Math.random() < 0.35 * dt) {
        this.glassTrails.push({ x: drop.x + (Math.random() - 0.5) * drop.r * 0.6, y: drop.y - drop.r, r: 0.5 + Math.random() * 0.9, a: 1 });
      }
      drop.y = nextY;
      if (drop.y > height + 10) drops[i] = this.newGlassDrop(-8);
    }
    if (Math.random() < 0.6 * dt && drops.length < (width * height) / 380) drops.push(this.newGlassDrop(Math.random() * height));

    for (let i = this.glassTrails.length - 1; i >= 0; i--) {
      const trail = this.glassTrails[i];
      trail.a -= 0.0025 * dt;
      if (trail.a <= 0) {
        this.glassTrails.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = trail.a * strength * 0.9;
      ctx.drawImage(bead, trail.x - trail.r, trail.y - trail.r, trail.r * 2, trail.r * 2);
    }
    for (const drop of drops) {
      ctx.globalAlpha = strength;
      const stretch = drop.slide ? 1 + drop.v * 0.06 : 1;
      ctx.drawImage(bead, drop.x - drop.r, drop.y - drop.r * stretch, drop.r * 2, drop.r * 2 * stretch);
    }
  }
}
