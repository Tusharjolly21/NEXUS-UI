"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// ─── Fibonacci sphere distribution ────────────────────────────────────────────
function generateFibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5)); // golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // -1 to +1
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;

    positions[i * 3]     = Math.cos(theta) * r * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * r * radius;
  }

  return positions;
}

// ─── Rotating sphere mesh ──────────────────────────────────────────────────────
function SphereDots() {
  const pointsRef = React.useRef<THREE.Points>(null!);
  const positions = React.useMemo(
    () => generateFibonacciSphere(2000, 2.2),
    [],
  );

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.18;
      pointsRef.current.rotation.x += delta * 0.04;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        transparent
        color="#818cf8"
        size={0.028}
        sizeAttenuation
        depthWrite={false}
        opacity={0.75}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// ─── Fresnel glow ring ────────────────────────────────────────────────────────
function GlowRing() {
  return (
    <mesh>
      <sphereGeometry args={[2.28, 32, 32]} />
      <meshBasicMaterial
        color="#6366f1"
        transparent
        opacity={0.04}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Outer halo ───────────────────────────────────────────────────────────────
function OuterHalo() {
  const meshRef = React.useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.025 + Math.sin(clock.getElapsedTime() * 0.8) * 0.015;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2.6, 32, 32]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.03}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// ─── Equator accent ring ──────────────────────────────────────────────────────
function EquatorRing() {
  const ringRef = React.useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 0.18;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.22, 0.004, 4, 120]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
    </mesh>
  );
}

// ─── Exported component ───────────────────────────────────────────────────────
export default function DottedSphere() {
  return (
    <div className="relative h-full w-full" style={{ minHeight: 480 }}>
      {/* CSS glow beneath canvas */}
      <div
        className="pointer-events-none absolute inset-0 m-auto size-72 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.10) 40%, transparent 70%)",
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 4, 4]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-4, -2, -4]} intensity={0.6} color="#a78bfa" />

        <SphereDots />
        <GlowRing />
        <OuterHalo />
        <EquatorRing />
      </Canvas>
    </div>
  );
}
