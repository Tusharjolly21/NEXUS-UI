"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const INFLUENCE_RADIUS = 0.8;
const PUSH_STRENGTH   = 0.4;

// ─── Fibonacci sphere ──────────────────────────────────────────────────────────
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden    = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y     = 1 - (i / (count - 1)) * 2;
    const r     = Math.sqrt(1 - y * y);
    const theta = golden * i;
    positions[i * 3]     = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }
  return positions;
}

// ─── Sphere mesh ───────────────────────────────────────────────────────────────
function SphereDots({
  count,
  interactive,
}: {
  count: number;
  interactive: boolean;
}) {
  const groupRef  = React.useRef<THREE.Group>(null!);
  const pointsRef = React.useRef<THREE.Points>(null!);
  const { camera, pointer, raycaster } = useThree();

  // ── Scratch vectors — never allocated inside useFrame ──────────────────────
  const cursor3D    = React.useMemo(() => new THREE.Vector3(), []);
  const localCursor = React.useMemo(() => new THREE.Vector3(), []);
  const tempOrig    = React.useMemo(() => new THREE.Vector3(), []);
  const pushDir     = React.useMemo(() => new THREE.Vector3(), []);
  // Project mouse onto the plane at z = 0 (sphere centre in world space)
  const plane       = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  // ── Position buffers ───────────────────────────────────────────────────────
  const originalPositions = React.useMemo(() => fibonacciSphere(count, 2), [count]);
  const currentPositions  = React.useMemo(
    () => new Float32Array(originalPositions),
    [originalPositions],
  );

  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));
    return geo;
  }, [currentPositions]);

  const material = React.useMemo(
    () =>
      new THREE.PointsMaterial({
        size: 0.025,
        color: new THREE.Color("#8b5cf6"),
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!groupRef.current || !pointsRef.current) return;

    // Slow continuous Y-axis rotation — star of the show is the displacement
    groupRef.current.rotation.y += 0.0008;

    // Breathing scale (±1 % over 3 s)
    const breath = 1 + Math.sin(clock.getElapsedTime() * ((2 * Math.PI) / 3)) * 0.01;
    pointsRef.current.scale.setScalar(breath);

    if (!interactive) return;

    // ── Project 2D cursor onto z = 0 plane in world space ─────────────────
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.ray.intersectPlane(plane, cursor3D);
    if (!hit) return;

    // Transform world cursor into the rotating group's local space so the
    // displacement stays aligned with the sphere no matter its orientation
    groupRef.current.worldToLocal(localCursor.copy(cursor3D));

    const attr = geometry.attributes.position as THREE.BufferAttribute;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;

      const origX = originalPositions[ix];
      const origY = originalPositions[ix + 1];
      const origZ = originalPositions[ix + 2];

      const curX = currentPositions[ix];
      const curY = currentPositions[ix + 1];
      const curZ = currentPositions[ix + 2];

      tempOrig.set(origX, origY, origZ);
      const dist = tempOrig.distanceTo(localCursor);

      let targetX: number, targetY: number, targetZ: number;

      if (dist < INFLUENCE_RADIUS) {
        let falloff = 1 - dist / INFLUENCE_RADIUS;
        falloff = falloff * falloff; // quadratic for softer edge

        pushDir.subVectors(tempOrig, localCursor).normalize();

        targetX = origX + pushDir.x * falloff * PUSH_STRENGTH;
        targetY = origY + pushDir.y * falloff * PUSH_STRENGTH;
        targetZ = origZ + pushDir.z * falloff * PUSH_STRENGTH;
      } else {
        targetX = origX;
        targetY = origY;
        targetZ = origZ;
      }

      // Lerp toward target — 0.15 gives a snappy-but-smooth return
      currentPositions[ix]     = curX + (targetX - curX) * 0.15;
      currentPositions[ix + 1] = curY + (targetY - curY) * 0.15;
      currentPositions[ix + 2] = curZ + (targetZ - curZ) * 0.15;
    }

    attr.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  );
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
function Scene({ interactive }: { interactive: boolean }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <SphereDots count={interactive ? 2500 : 1500} interactive={interactive} />
      <EffectComposer>
        <Bloom intensity={0.3} luminanceThreshold={0.2} />
      </EffectComposer>
    </>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export default function DottedSphere() {
  const [interactive, setInteractive] = React.useState(true);

  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = (e: MediaQueryListEvent | MediaQueryList) =>
      setInteractive(!e.matches);
    update(mq);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative h-full w-full" style={{ minHeight: 480 }}>
      {/* CSS radial glow */}
      <div
        className="pointer-events-none absolute inset-0 m-auto size-120 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <Scene interactive={interactive} />
      </Canvas>
    </div>
  );
}
