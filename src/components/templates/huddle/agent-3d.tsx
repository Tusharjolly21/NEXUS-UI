"use client";

/* eslint-disable react-hooks/immutability -- three.js scenes, materials and textures are mutable objects that
   react-three-fiber expects to be changed in place, every frame. */

import { Component, useEffect, useMemo, useRef, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import { useReducedMotion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  Color,
  ExtrudeGeometry,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PMREMGenerator,
  SRGBColorSpace,
  Shape,
  Vector2,
  type BufferGeometry,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type PlaneGeometry,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { AgentFace } from "./agent-face";
import { SHAPE_BY_KEY, drawFeatures, shapeOutline } from "./shapes";
import { clamp } from "./theme";
import type { Agent, Pulse } from "./types";

const EXTRUDE_SCALE = 0.022;

const geometryCache = new Map<string, BufferGeometry>();

/** The shape's outline, extruded and bevelled into a soft pebble, built once per shape. */
function shapeGeometry(key: string) {
  const cached = geometryCache.get(key);
  if (cached) {
    return cached;
  }
  const outline = new Shape(
    shapeOutline(key).map(([x, y]) => new Vector2((x - 50) * EXTRUDE_SCALE, (50 - y) * EXTRUDE_SCALE)),
  );
  let geometry: BufferGeometry = new ExtrudeGeometry(outline, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.3,
    bevelSize: 0.15,
    bevelSegments: 16,
    curveSegments: 4,
    steps: 1,
  });
  geometry.deleteAttribute("uv");
  geometry.deleteAttribute("normal");
  geometry = mergeVertices(geometry, 1e-4);
  geometry.translate(0, 0, -0.07);
  geometry.computeVertexNormals();
  geometryCache.set(key, geometry);
  return geometry;
}

const FACE_Z = 0.07 + 0.3 + 0.004;

const FACE_CANVAS_W = 84;

const FACE_CANVAS_H = 46;

const FACE_DPR = 6;

/** Draws the face (eyes, brows, blush) onto the canvas that textures the front of the 3D agent. */
function paintFace(ctx: CanvasRenderingContext2D, eyes: string, shapeKey: string, look: number[], blink: number) {
  const eyeY = SHAPE_BY_KEY[shapeKey].eyeY;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.setTransform(FACE_DPR, 0, 0, FACE_DPR, -8 * FACE_DPR, -(eyeY - FACE_CANVAS_H / 2) * FACE_DPR);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawFeatures(eyes, shapeKey, look, blink).forEach((feature) => {
    const path = new Path2D(feature.d);
    if (feature.fill) {
      ctx.fillStyle = feature.fill;
      ctx.fill(path);
    }
    if (feature.stroke) {
      ctx.strokeStyle = feature.stroke;
      ctx.lineWidth = feature.w ?? 2;
      ctx.stroke(path);
    }
  });
}

/** A soft dark ellipse for the contact shadow under the agent. */
function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(128, 32, 2, 128, 32, 128);
  gradient.addColorStop(0, "rgba(0,0,0,.6)");
  gradient.addColorStop(0.45, "rgba(0,0,0,.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.setTransform(1, 0, 0, 0.25, 0, 24);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, -100, 256, 400);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function RoomLight() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envMap;
    return () => {
      scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

type AgentMeshProps = {
  agent: Agent;
  /** Where the pointer is, relative to the agent, or null when it has left the page. */
  pointer: RefObject<number[] | null>;
  pulse: RefObject<Pulse>;
  reduce: boolean;
};

function AgentMesh({ agent, pointer, pulse, reduce }: AgentMeshProps) {
  const group = useRef<Group>(null);
  const body = useRef<Group>(null);
  const shadow = useRef<Mesh<PlaneGeometry, MeshBasicMaterial>>(null);
  const geometry = useMemo(() => shapeGeometry(agent.shape), [agent.shape]);
  const bodyMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: agent.color,
        roughness: 0.42,
        metalness: 0,
        clearcoat: 0.85,
        clearcoatRoughness: 0.32,
        sheen: 0.6,
        sheenRoughness: 0.5,
        sheenColor: new Color("#ffffff"),
        envMapIntensity: 0.85,
      }),
    // made once: a new colour is eased into this material each frame (see `tint`), not swapped in
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const tint = useMemo(() => new Color(agent.color), [agent.color]);
  const shadowMap = useMemo(() => shadowTexture(), []);
  const faceTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = FACE_CANVAS_W * FACE_DPR;
    canvas.height = FACE_CANVAS_H * FACE_DPR;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return {
      ctx: canvas.getContext("2d")!,
      texture,
    };
  }, []);
  const motion = useRef({
    x: 0,
    v: 0,
    look: [0, 0],
    blink: 0,
    nextBlink: 1.5,
    blinkT: -1,
    last: "",
    rx: 0,
    ry: 0,
    kick: 0,
    boop: 0,
    boopUntil: 0,
  });
  useEffect(
    () => () => {
      bodyMaterial.dispose();
      shadowMap.dispose();
      faceTexture.texture.dispose();
    },
    [bodyMaterial, shadowMap, faceTexture],
  );
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.03333333333333333);
    const time = state.clock.elapsedTime;
    const m = motion.current;
    if (pulse.current.kick !== m.kick) {
      m.kick = pulse.current.kick;
      m.v += 5.2;
    }
    if (pulse.current.boop !== m.boop) {
      m.boop = pulse.current.boop;
      m.v -= 4;
      m.boopUntil = time + 0.9;
    }
    const force = -190 * m.x - 11 * m.v;
    m.v += force * dt;
    m.x += m.v * dt;
    const bob = reduce ? 0 : Math.sin(time * 1.7) * 0.012;
    if (body.current) {
      body.current.scale.set(1 + m.x * 0.45 - bob * 0.5, 1 - m.x + bob, 1 + m.x * 0.3);
    }
    const pointerAt = pointer.current;
    const targetX = pointerAt ? clamp(pointerAt[0] * 1.3, -1, 1) : Math.sin(time * 0.4) * 0.3;
    const targetY = pointerAt ? clamp(pointerAt[1] * 1.3, -1, 1) : 0.1;
    const ease = 1 - Math.exp(-dt * 9);
    m.look = [m.look[0] + (targetX - m.look[0]) * ease, m.look[1] + (targetY - m.look[1]) * ease];
    m.ry += (targetX * 0.38 - m.ry) * ease * 0.6;
    m.rx += (targetY * 0.22 - m.rx) * ease * 0.6;
    if (group.current) {
      group.current.rotation.set(m.rx, m.ry, 0);
      group.current.position.y = reduce ? 0 : Math.sin(time * 1.2) * 0.035;
    }
    if (shadow.current) {
      shadow.current.material.opacity = 0.75 - (group.current?.position.y ?? 0) * 3 - m.x * 0.6;
      shadow.current.scale.set(1 + m.x * 0.5, 1, 1);
    }
    if (!reduce && m.blinkT < 0 && time > m.nextBlink) {
      m.blinkT = 0;
      m.nextBlink = time + 2.2 + Math.random() * 3.8 + (Math.random() < 0.2 ? -1.9 : 0);
    }
    if (m.blinkT >= 0) {
      m.blinkT += dt;
      const progress = m.blinkT / 0.16;
      m.blink = progress < 0.5 ? progress * 2 : Math.max(0, 2 - progress * 2);
      if (progress >= 1) {
        m.blinkT = -1;
        m.blink = 0;
      }
    }
    bodyMaterial.color.lerp(tint, 1 - Math.exp(-dt * 8));
    const eyes = time < m.boopUntil ? "happy" : agent.eyes;
    const key = `${eyes}|${agent.shape}|${m.look[0].toFixed(2)}|${m.look[1].toFixed(2)}|${m.blink.toFixed(2)}`;
    if (key !== m.last) {
      m.last = key;
      paintFace(faceTexture.ctx, eyes, agent.shape, m.look, m.blink);
      faceTexture.texture.needsUpdate = true;
    }
  });
  const faceY = (50 - SHAPE_BY_KEY[agent.shape].eyeY) * EXTRUDE_SCALE;
  return (
    <>
      <mesh ref={shadow} position={[0, -1.32, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[2.9, 0.75]} />
        <meshBasicMaterial map={shadowMap} transparent={true} depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={group}>
        <group ref={body} position={[0, -1.08, 0]}>
          <group position={[0, 1.08, 0]}>
            <mesh geometry={geometry} material={bodyMaterial} />
            <mesh position={[0, faceY, FACE_Z]}>
              <planeGeometry args={[FACE_CANVAS_W * EXTRUDE_SCALE, FACE_CANVAS_H * EXTRUDE_SCALE]} />
              <meshBasicMaterial map={faceTexture.texture} transparent={true} depthWrite={false} toneMapped={false} />
            </mesh>
          </group>
        </group>
      </group>
    </>
  );
}

/** Shows the flat face instead if the 3D scene throws (a lost WebGL context, an old GPU). */
class WebGLBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { err: boolean }> {
  state = { err: false };
  static getDerivedStateFromError() {
    return {
      err: true,
    };
  }
  componentDidCatch() {}
  render() {
    return this.state.err ? this.props.fallback : this.props.children;
  }
}

let webglSupport: boolean | null = null;
/** Tested once per page; probing creates a context, so do not repeat it on every render. */
const hasWebGL = () => {
  if (webglSupport === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
};
const noSubscribe = () => () => {};

/** The agent being edited, as a glossy 3D pebble that watches the pointer and hops when you change it. */
export function Agent3D({ agent, pulse }: { agent: Agent; pulse: RefObject<Pulse> }) {
  const box = useRef<HTMLDivElement>(null);
  const pointer = useRef<number[] | null>(null);
  const reduce = !!useReducedMotion();
  // False on the server and during hydration (it cannot know), then the real answer in the browser.
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => false);
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const rect = box.current?.getBoundingClientRect();
      if (!(!rect || !rect.width)) {
        pointer.current = [
          (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 0.9),
          (event.clientY - (rect.top + rect.height * 0.45)) / (rect.height * 1.1),
        ];
      }
    };
    const onLeave = () => {
      pointer.current = null;
    };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  const fallback = (
    <div className="grid size-full place-items-center">
      <AgentFace shape={agent.shape} color={agent.color} eyes={agent.eyes} size={150} />
    </div>
  );
  return (
    <div ref={box} className="relative h-full w-full">
      {webgl ? (
        <WebGLBoundary fallback={fallback}>
          <Canvas
            dpr={[1, 2]}
            camera={{
              position: [0, 0.05, 6.6],
              fov: 30,
            }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: "low-power",
            }}
            onCreated={({ gl }) => {
              gl.toneMapping = NeutralToneMapping;
              gl.toneMappingExposure = 0.96;
            }}
            style={{
              position: "absolute",
              inset: 0,
            }}
          >
            <RoomLight />
            <hemisphereLight args={["#ffffff", "#2a2730", 0.55]} />
            <directionalLight position={[-3, 4, 5]} intensity={1.9} />
            <directionalLight position={[3.5, 2.5, -4]} intensity={3.2} color="#ffffff" />
            <directionalLight position={[0, -3, 2]} intensity={0.25} color={agent.color} />
            <AgentMesh agent={agent} pointer={pointer} pulse={pulse} reduce={reduce} />
          </Canvas>
        </WebGLBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
