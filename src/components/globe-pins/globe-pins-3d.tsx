"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type * as THREE_TYPES from "three";

// ── Types ─────────────────────────────────────────────────────────────────────

export type GlobePin3D = {
  id: string;
  country: string;
  city?: string;
  phone?: string;
  lat: number;
  lon: number;
};

export type GlobeConnection3D = {
  from: string;
  to: string;
};

export type GlobePins3DProps = {
  pins?: GlobePin3D[];
  connections?: GlobeConnection3D[];
  autoRotate?: boolean;
  rotationSpeed?: number;
  initialRotation?: number;
  dotColor?: string;
  dotSize?: number;
  dotOpacity?: number;
  bloom?: boolean;
  pinColor?: string;
  pinSize?: number;
  showLabels?: boolean;
  labelBackground?: string;
  labelColor?: string;
  labelBorderColor?: string;
  fontFamily?: string;
  fontSize?: number;
  className?: string;
  dpr?: number;
  fpsCap?: number;
  maxCanvasSize?: number;
  enableTrails?: boolean;
  trailColor?: string;
  enablePostFX?: boolean;
  fxIntensity?: number;
};

export const DEFAULT_PINS_3D: GlobePin3D[] = [
  {
    id: "uk",
    country: "United Kingdom",
    city: "London",
    phone: "+44 20 7946 0958",
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    id: "us",
    country: "USA",
    city: "Los Angeles",
    phone: "+1 213-555-0173",
    lat: 34.0522,
    lon: -118.2437,
  },
  {
    id: "jp",
    country: "Japan",
    city: "Tokyo",
    phone: "+81 3-3477-5111",
    lat: 35.6895,
    lon: 139.6917,
  },
];

export const DEFAULT_CONNECTIONS_3D: GlobeConnection3D[] = [
  { from: "uk", to: "us" },
  { from: "us", to: "jp" },
  { from: "jp", to: "uk" },
];

// ── Three dynamic import typing ───────────────────────────────────────────────

let THREE_MODULE: any | null = null;

async function getThree(): Promise<any> {
  if (!THREE_MODULE) {
    THREE_MODULE = await import("three");
  }

  return THREE_MODULE;
}

// ── Geo data ──────────────────────────────────────────────────────────────────

type GeoPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type LandFeature = {
  type: string;
  geometry?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
};

type LandCollection = {
  type: "FeatureCollection";
  features: LandFeature[];
};

type GlobeBuffers = {
  edge: Float32Array;
  fill: Float32Array;
};

let landCache: LandCollection | null = null;
const bufferCache = new Map<string, GlobeBuffers>();

async function loadLand(): Promise<LandCollection> {
  if (landCache) return landCache;

  const urls = [
    "https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json",
    "https://unpkg.com/world-atlas@2/land-110m.json",
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: "force-cache" });

      if (!response.ok) continue;

      const topo = await response.json();
      const { feature } = await import("topojson-client");

      landCache = feature(topo, topo.objects.land) as LandCollection;
      return landCache;
    } catch {
      // Try fallback URL.
    }
  }

  return {
    type: "FeatureCollection",
    features: [],
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function lonLatToVec3(
  lon: number,
  lat: number,
  r = 1,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

function hexToRgba(input: string, alpha = 1): string {
  try {
    if (/^rgba?\(/i.test(input)) {
      return input.replace(/rgba?\(([^)]+)\)/i, (_, body) => {
        const [r, g, b] = body
          .split(",")
          .slice(0, 3)
          .map((value: string) => Number.parseFloat(value.trim()));

        return `rgba(${r},${g},${b},${alpha})`;
      });
    }

    const raw = input.replace("#", "");
    const value =
      raw.length === 3
        ? raw
            .split("")
            .map((char) => char + char)
            .join("")
        : raw;

    const number = Number.parseInt(value, 16);

    return `rgba(${(number >> 16) & 255},${(number >> 8) & 255},${
      number & 255
    },${alpha})`;
  } catch {
    return `rgba(255,255,255,${alpha})`;
  }
}

function extractPolygons(land: LandCollection): GeoPolygon[] {
  const polygons: GeoPolygon[] = [];

  for (const feature of land.features ?? []) {
    const geometry = feature.geometry;
    if (!geometry) continue;

    if (geometry.type === "Polygon") {
      polygons.push({
        type: "Polygon",
        coordinates: geometry.coordinates as number[][][],
      });
    }

    if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates as number[][][][]) {
        polygons.push({
          type: "Polygon",
          coordinates: polygon,
        });
      }
    }
  }

  return polygons;
}

function wrapLon(lon: number): number {
  return ((lon + 540) % 360) - 180;
}

function pointInRing(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    const intersects =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

function polygonContainsPoint(
  polygon: GeoPolygon,
  lon: number,
  lat: number,
): boolean {
  const rings = polygon.coordinates;
  if (!rings.length) return false;

  if (!pointInRing([lon, lat], rings[0])) return false;

  for (let i = 1; i < rings.length; i++) {
    if (pointInRing([lon, lat], rings[i])) return false;
  }

  return true;
}

function getRingBounds(ring: number[][]) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  for (const [lon, lat] of ring) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return { minLon, maxLon, minLat, maxLat };
}

function limitFloat32Triples(
  source: number[],
  maxPoints: number,
): Float32Array {
  const totalPoints = Math.floor(source.length / 3);

  if (totalPoints <= maxPoints) {
    return new Float32Array(source);
  }

  const step = Math.ceil(totalPoints / maxPoints);
  const result: number[] = [];

  for (let point = 0; point < totalPoints; point += step) {
    const i = point * 3;
    result.push(source[i], source[i + 1], source[i + 2]);
  }

  return new Float32Array(result);
}

function buildBuffers(
  land: LandCollection,
  fillStep = 2.5,
  edgeStep = 0.8,
  maxFillPoints = 50_000,
): GlobeBuffers {
  const cacheKey = `${fillStep}-${edgeStep}-${maxFillPoints}`;

  const cached = bufferCache.get(cacheKey);
  if (cached) return cached;

  const polygons = extractPolygons(land);
  const edgePos: number[] = [];
  const fillPos: number[] = [];

  for (const polygon of polygons) {
    const outerRing = polygon.coordinates[0];
    if (!outerRing || outerRing.length < 3) continue;

    // Edge dots.
    for (const ring of polygon.coordinates) {
      for (let i = 0; i < ring.length - 1; i++) {
        const [lon1, lat1] = ring[i];
        const [lon2, lat2] = ring[i + 1];

        let wrappedLon2 = lon2;
        let adjustedDeltaLon = lon2 - lon1;
        if (Math.abs(adjustedDeltaLon) > 180) {
          wrappedLon2 += adjustedDeltaLon > 0 ? -360 : 360;
          adjustedDeltaLon = wrappedLon2 - lon1;
        }

        const deltaLat = lat2 - lat1;
        const maxSpan = Math.max(Math.abs(adjustedDeltaLon), Math.abs(deltaLat));
        const steps = Math.max(1, Math.ceil(maxSpan / edgeStep));

        for (let s = 0; s <= steps; s++) {
          const t = s / steps;
          const lon = wrapLon(lon1 + adjustedDeltaLon * t);
          const lat = lat1 + deltaLat * t;
          const [x, y, z] = lonLatToVec3(lon, lat, 1);

          edgePos.push(x, y, z);
        }
      }
    }

    // Fill dots inside actual polygon, not the whole bounding box.
    const bounds = getRingBounds(outerRing);

    for (
      let lat = Math.floor(bounds.minLat / fillStep) * fillStep;
      lat <= Math.ceil(bounds.maxLat / fillStep) * fillStep;
      lat += fillStep
    ) {
      const rowOffset =
        Math.round(Math.abs(lat / fillStep)) % 2 ? fillStep / 2 : 0;

      for (
        let lon = Math.floor(bounds.minLon / fillStep) * fillStep + rowOffset;
        lon <= Math.ceil(bounds.maxLon / fillStep) * fillStep;
        lon += fillStep
      ) {
        if (!polygonContainsPoint(polygon, lon, lat)) continue;

        const [x, y, z] = lonLatToVec3(wrapLon(lon), lat, 1);
        fillPos.push(x, y, z);
      }
    }
  }

  const buffers = {
    edge: new Float32Array(edgePos),
    fill: limitFloat32Triples(fillPos, maxFillPoints),
  };

  bufferCache.set(cacheKey, buffers);

  return buffers;
}

function disposeObject(object: THREE_TYPES.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE_TYPES.Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material as
      | THREE_TYPES.Material
      | THREE_TYPES.Material[]
      | undefined;

    if (material) {
      if (Array.isArray(material)) {
        material.forEach((item) => item.dispose());
      } else {
        material.dispose();
      }
    }
  });
}

// ── Preloader ─────────────────────────────────────────────────────────────────

function Preloader({ progress }: { progress: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "3px solid rgba(255,255,255,.15)",
            borderTopColor: "#7AE1FF",
            animation: "spin .8s linear infinite",
          }}
        />
        <div
          style={{
            marginTop: 8,
            color: "#7AE1FF",
            fontSize: 10,
            fontFamily: "system-ui",
          }}
        >
          {Math.round(progress)}%
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function GlobePins3D({
  pins = DEFAULT_PINS_3D,
  connections = DEFAULT_CONNECTIONS_3D,
  autoRotate = true,
  rotationSpeed = 0.03,
  initialRotation = 0,
  dotColor = "#7AE1FF",
  dotSize = 0.012,
  dotOpacity = 0.72,
  bloom = false,
  pinColor = "#7AE1FF",
  pinSize = 0.025,
  showLabels = true,
  labelBackground = "rgba(12,42,51,0.88)",
  labelColor = "#E7F8FF",
  labelBorderColor = "#7AE1FF",
  fontFamily = "Inter, system-ui, sans-serif",
  fontSize = 12,
  className,
  dpr = 1.5,
  fpsCap = 30,
  maxCanvasSize = 560,
  enableTrails = true,
  trailColor = "#40C5E3",
  enablePostFX = false,
  fxIntensity = 0.6,
}: GlobePins3DProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const mountRef = React.useRef<HTMLDivElement>(null);
  const rafRef = React.useRef<number | null>(null);
  const runningRef = React.useRef(false);

  const [loading, setLoading] = React.useState(true);
  const [progress, setProgress] = React.useState(0);

  const forceActive = className?.includes("preview-force-active");

  let initId = 0;

  React.useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    const myId = ++initId;

    async function init() {
      const container = mountRef.current;
      if (!container || disposed || myId !== initId) return;

      container.replaceChildren();

      setLoading(true);
      setProgress(5);

      const THREE = await getThree();
      if (disposed || myId !== initId) return;

      const { OrbitControls } =
        await import("three/examples/jsm/controls/OrbitControls.js");
      if (disposed || myId !== initId) return;

      const { CSS2DRenderer, CSS2DObject } =
        await import("three/examples/jsm/renderers/CSS2DRenderer.js");
      if (disposed || myId !== initId) return;

      setProgress(15);

      function getSize() {
        if (!wrapperRef.current) return { width: 400, height: 400 };
        const rect = wrapperRef.current.getBoundingClientRect();

        const width = Math.max(
          1,
          Math.min(
            Math.round(rect.width || wrapperRef.current!.clientWidth || 400),
            maxCanvasSize,
          ),
        );

        const height = Math.max(
          1,
          Math.min(
            Math.round(rect.height || wrapperRef.current!.clientHeight || 400),
            maxCanvasSize,
          ),
        );

        return { width, height };
      }

      const { width, height } = getSize();

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);

      camera.position.set(0, 0, 3);

      const renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
        premultipliedAlpha: true,
      });

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);

      container.appendChild(renderer.domElement);

      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(width, height);
      labelRenderer.domElement.style.cssText =
        "position:absolute;top:0;left:0;pointer-events:none;background:transparent;";

      container.appendChild(labelRenderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.enableZoom = false;

      const globeGroup = new THREE.Group();
      globeGroup.rotation.y = initialRotation * (Math.PI / 180);
      scene.add(globeGroup);

      function makeDotTexture(size = 64) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");
        if (!context) return null;

        const radius = size / 2;

        const gradient = context.createRadialGradient(
          radius,
          radius,
          radius * 0.82,
          radius,
          radius,
          radius,
        );

        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        context.fillStyle = gradient;
        context.beginPath();
        context.arc(radius, radius, radius - 0.5, 0, Math.PI * 2);
        context.fill();

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        return texture;
      }

      function makeHaloTexture(size = 128) {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const context = canvas.getContext("2d");
        if (!context) return null;

        const radius = size / 2;

        const gradient = context.createRadialGradient(
          radius,
          radius,
          0,
          radius,
          radius,
          radius,
        );

        gradient.addColorStop(0, "rgba(255,255,255,0.25)");
        gradient.addColorStop(0.35, "rgba(255,255,255,0.1)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        return texture;
      }

      const dotTexture = makeDotTexture(64);
      const haloTexture = makeHaloTexture(128);

      setProgress(30);

      const land = await loadLand();
      if (disposed) return;

      const buffers = buildBuffers(land, 1.6, 0.45, 50_000);

      const makePointsMaterial = (
        color: string,
        size: number,
        opacity: number,
      ) => {
        const material = new THREE.PointsMaterial({
          color: new THREE.Color(color),
          size,
          sizeAttenuation: false,
          depthWrite: false,
          transparent: true,
          map: dotTexture ?? undefined,
          alphaTest: 0,
          opacity,
        });

        material.toneMapped = false;
        return material;
      };

      const edgeGeometry = new THREE.BufferGeometry();
      edgeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(buffers.edge, 3),
      );

      const fillGeometry = new THREE.BufferGeometry();
      fillGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(buffers.fill, 3),
      );

      const edgePoints = new THREE.Points(
        edgeGeometry,
        makePointsMaterial(dotColor, dotSize, dotOpacity),
      );

      const fillPoints = new THREE.Points(
        fillGeometry,
        makePointsMaterial(dotColor, Math.max(dotSize * 0.75, 0.003), 0.42),
      );

      globeGroup.add(fillPoints);
      globeGroup.add(edgePoints);

      setProgress(60);

      const pinPositions: THREE_TYPES.Vector3[] = [];

      for (const pin of pins) {
        const [x, y, z] = lonLatToVec3(pin.lon, pin.lat, 1);

        const pinGroup = new THREE.Group();
        pinGroup.position.set(x, y, z);

        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(pinSize, 12, 12),
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(pinColor),
          }),
        );

        pinGroup.add(sphere);

        if (haloTexture) {
          const halo = new THREE.Sprite(
            new THREE.SpriteMaterial({
              color: new THREE.Color(pinColor),
              map: haloTexture,
              transparent: true,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          );

          const haloSize = pinSize * 8;
          halo.scale.set(haloSize, haloSize, haloSize);
          pinGroup.add(halo);
        }

        if ((pin.country || pin.city || pin.phone) && showLabels) {
          const element = document.createElement("div");

          element.style.cssText = `
            max-width: 260px;
            white-space: normal;
            overflow-wrap: anywhere;
            word-break: break-word;
            padding: 10px 14px;
            border-radius: 8px;
            background: ${hexToRgba(labelBackground, 0.88)};
            backdrop-filter: blur(6px);
            border: 1px solid ${labelBorderColor};
            color: ${labelColor};
            pointer-events: none;
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            line-height: 1.35;
          `;

          const countryHTML = pin.country ? `<b>${pin.country}</b><br/>` : "";
          const cityHTML = pin.city ? `${pin.city}<br/>` : "";
          const phoneHTML = pin.phone ?? "";

          element.innerHTML = `${countryHTML}${cityHTML}${phoneHTML}`;

          const labelObject = new CSS2DObject(element);
          labelObject.position.set(0, 0.08, 0);
          pinGroup.add(labelObject);
        }

        globeGroup.add(pinGroup);
        pinPositions.push(new THREE.Vector3(x, y, z));
      }

      setProgress(75);

      const trailsGroup = new THREE.Group();
      globeGroup.add(trailsGroup);

      const activeTrails: {
        mesh: THREE_TYPES.Mesh;
        progress: number;
        speed: number;
      }[] = [];

      function spawnTrail() {
        if (!enableTrails || pinPositions.length < 2) return;

        const startIndex = Math.floor(Math.random() * pinPositions.length);
        let endIndex = Math.floor(Math.random() * pinPositions.length);

        while (startIndex === endIndex) {
          endIndex = Math.floor(Math.random() * pinPositions.length);
        }

        const start = pinPositions[startIndex];
        const end = pinPositions[endIndex];

        const mid = start.clone().add(end).multiplyScalar(0.5).normalize();
        const curveHeight = 1 + start.distanceTo(end) * 0.5;
        const control = mid.multiplyScalar(curveHeight);

        const curve = new THREE.QuadraticBezierCurve3(start, control, end);

        const geometry = new THREE.TubeGeometry(curve, 20, 0.003, 4, false);

        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(trailColor),
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });

        const mesh = new THREE.Mesh(geometry, material);
        trailsGroup.add(mesh);

        activeTrails.push({
          mesh,
          progress: 0,
          speed: 0.3 + Math.random() * 0.4,
        });
      }

      type ComposerLike = {
        render: (delta?: number) => void;
        setPixelRatio: (value: number) => void;
        setSize: (width: number, height: number) => void;
        addPass: (pass: any) => void;
        dispose?: () => void;
      };

      let composer: ComposerLike | null = null;

      if (enablePostFX) {
        try {
          const { EffectComposer } =
            await import("three/examples/jsm/postprocessing/EffectComposer.js");

          const { RenderPass } =
            await import("three/examples/jsm/postprocessing/RenderPass.js");

          const { UnrealBloomPass } =
            await import("three/examples/jsm/postprocessing/UnrealBloomPass.js");

          const { OutputPass } =
            await import("three/examples/jsm/postprocessing/OutputPass.js");

          if (!disposed) {
            composer = new EffectComposer(renderer);
            composer.setPixelRatio(renderer.getPixelRatio());
            composer.setSize(width, height);
            composer.addPass(new RenderPass(scene, camera));

            if (bloom) {
              composer.addPass(
                new UnrealBloomPass(
                  new THREE.Vector2(width, height),
                  0.15 + fxIntensity * 1.15,
                  0.01 + fxIntensity * 0.15,
                  0.1,
                ),
              );
            }

            composer.addPass(new OutputPass());
          }
        } catch {
          composer = null;
        }
      }

      setProgress(95);

      const clock = new THREE.Clock();
      const frameInterval = 1 / Math.max(1, fpsCap);
      let frameAccumulator = frameInterval;
      let trailTimer = 0;

      function renderOnce(delta = 0) {
        controls.update();

        if (composer) {
          composer.render(delta);
        } else {
          renderer.render(scene, camera);
        }

        labelRenderer.render(scene, camera);
      }

      function loop() {
        if (disposed || !runningRef.current) return;

        const delta = clock.getDelta();
        frameAccumulator += delta;

        if (autoRotate) {
          globeGroup.rotation.y += rotationSpeed * delta;
        }

        if (enableTrails) {
          trailTimer += delta;

          if (trailTimer > 0.75 && activeTrails.length < 4) {
            spawnTrail();
            trailTimer = 0;
          }

          for (let i = activeTrails.length - 1; i >= 0; i--) {
            const trail = activeTrails[i];
            trail.progress += trail.speed * delta;

            const material = trail.mesh.material as THREE_TYPES.Material & {
              opacity?: number;
            };

            if (typeof material.opacity === "number") {
              material.opacity = Math.max(0, 0.65 * (1.2 - trail.progress));
            }

            if (trail.progress >= 1.2) {
              trailsGroup.remove(trail.mesh);
              trail.mesh.geometry.dispose();

              if (Array.isArray(trail.mesh.material)) {
                trail.mesh.material.forEach((item) => item.dispose());
              } else {
                trail.mesh.material.dispose();
              }

              activeTrails.splice(i, 1);
            }
          }
        }

        if (!document.hidden && frameAccumulator >= frameInterval) {
          renderOnce(delta);
          frameAccumulator = 0;
        }

        rafRef.current = requestAnimationFrame(loop);
      }

      function start() {
        if (disposed || runningRef.current) return;

        runningRef.current = true;
        frameAccumulator = frameInterval;
        loop();
      }

      function stop() {
        runningRef.current = false;

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }

      function handleVisibilityChange() {
        if (forceActive) return;

        if (document.hidden) {
          stop();
        } else {
          start();
        }
      }

      document.addEventListener("visibilitychange", handleVisibilityChange);

      const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          if (forceActive) {
            start();
            return;
          }

          if (entry?.isIntersecting) {
            start();
          } else {
            stop();
          }
        },
        { threshold: 0 },
      );

      intersectionObserver.observe(container);

      function handleResize() {
        if (disposed) return;

        const size = getSize();

        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
        renderer.setSize(size.width, size.height);

        labelRenderer.setSize(size.width, size.height);

        if (composer) {
          composer.setPixelRatio(renderer.getPixelRatio());
          composer.setSize(size.width, size.height);
        }

        renderOnce(0);
      }

      window.addEventListener("resize", handleResize);

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      renderOnce(0);
      start();

      setProgress(100);
      setLoading(false);

      cleanup = () => {
        stop();

        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange,
        );

        window.removeEventListener("resize", handleResize);

        intersectionObserver.disconnect();
        resizeObserver.disconnect();

        for (const trail of activeTrails) {
          trailsGroup.remove(trail.mesh);
          trail.mesh.geometry.dispose();

          if (Array.isArray(trail.mesh.material)) {
            trail.mesh.material.forEach((item) => item.dispose());
          } else {
            trail.mesh.material.dispose();
          }
        }

        controls.dispose();

        disposeObject(scene);

        dotTexture?.dispose();
        haloTexture?.dispose();

        composer?.dispose?.();

        labelRenderer.domElement.remove();

        renderer.dispose();

        // Guard against already-removed children
        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }

        mountRef.current?.replaceChildren();
      };
    }

    init().catch(() => {
      setLoading(false);
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [
    pins,
    connections,
    autoRotate,
    rotationSpeed,
    initialRotation,
    dotColor,
    dotSize,
    dotOpacity,
    bloom,
    pinColor,
    pinSize,
    showLabels,
    labelBackground,
    labelColor,
    labelBorderColor,
    fontFamily,
    fontSize,
    dpr,
    fpsCap,
    maxCanvasSize,
    enableTrails,
    trailColor,
    enablePostFX,
    fxIntensity,
    forceActive,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={{
        maxWidth: maxCanvasSize,
        maxHeight: maxCanvasSize,
      }}
    >
      <div ref={mountRef} className="absolute inset-0" />
      {loading && <Preloader progress={progress} />}
    </div>
  );
}

export default GlobePins3D;
