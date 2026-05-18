"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type WavyLinesProps = {
  lineColor?: string;
  backgroundColorStart?: string;
  backgroundColorEnd?: string;
  speed?: number;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
};

const VERTEX_SHADER = `
  attribute vec4 aVertexPosition;

  void main() {
    gl_Position = aVertexPosition;
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec3 uLineColor;
  uniform vec3 uBgColor1;
  uniform vec3 uBgColor2;
  uniform float uSpeed;

  const float gridSmoothWidth = 0.015;
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.2;
  const float lineAmplitude = 1.0;
  const float lineFrequency = 0.2;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 1.0;
  const float offsetFrequency = 0.5;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const float scale = 5.0;
  const int linesPerGroup = 16;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float hFade, float offset, float speed) {
    return random(x * lineFrequency + iTime * speed) * hFade * lineAmplitude + offset;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 space = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.x * 2.0 * scale;

    float lineSpeed = 0.2 * uSpeed;
    float warpSpeed = 0.04 * uSpeed;
    float offsetSpeed = 0.266 * uSpeed;

    float hFade = 1.0 - (cos(uv.x * 6.28318) * 0.5 + 0.5);
    float vFade = 1.0 - (cos(uv.y * 6.28318) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + hFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * hFade;

    vec4 lines = vec4(0.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float nIdx = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPos = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPos + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * hFade) / 2.0;
      float offset = random(offsetPos + offsetTime * (1.0 + nIdx)) * mix(minOffsetSpread, maxOffsetSpread, hFade);
      float linePos = getPlasmaY(space.x, hFade, offset, lineSpeed);
      float line = drawSmoothLine(linePos, halfWidth, space.y) / 2.0 + drawCrispLine(linePos, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePos = vec2(circleX, getPlasmaY(circleX, hFade, offset, lineSpeed));
      float circle = drawCircle(circlePos, 0.01, space) * 4.0;

      lines += (line + circle) * vec4(uLineColor, 1.0) * rand;
    }

    vec4 bg = mix(vec4(uBgColor1, 1.0), vec4(uBgColor2, 1.0), uv.x);
    bg *= vFade;
    bg.a = 1.0;
    bg += lines;

    gl_FragColor = bg;
  }
`;

function cssColorToRgb(color: string): [number, number, number] {
  if (typeof document === "undefined") return [0, 0, 0];

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return [0, 0, 0];

  context.fillStyle = color;
  context.fillRect(0, 0, 1, 1);
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
  return [red / 255, green / 255, blue / 255];
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("WavyLines shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("WavyLines program error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function WavyLines({
  lineColor = "#22d3ee",
  backgroundColorStart = "#062525",
  backgroundColorEnd = "#0f3f2d",
  speed = 1.2,
  radius = 24,
  className,
  style,
}: WavyLinesProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const propsRef = React.useRef({
    lineColor,
    backgroundColorStart,
    backgroundColorEnd,
    speed,
  });

  React.useEffect(() => {
    propsRef.current = {
      lineColor,
      backgroundColorStart,
      backgroundColorEnd,
      speed,
    };
  }, [backgroundColorEnd, backgroundColorStart, lineColor, speed]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    if (!buffer) {
      gl.deleteProgram(program);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const position = gl.getAttribLocation(program, "aVertexPosition");
    const resolution = gl.getUniformLocation(program, "iResolution");
    const time = gl.getUniformLocation(program, "iTime");
    const line = gl.getUniformLocation(program, "uLineColor");
    const backgroundStart = gl.getUniformLocation(program, "uBgColor1");
    const backgroundEnd = gl.getUniformLocation(program, "uBgColor2");
    const shaderSpeed = gl.getUniformLocation(program, "uSpeed");

    let frame = 0;
    const start = performance.now();

    const resize = () => {
      const width = Math.max(1, canvas.offsetWidth);
      const height = Math.max(1, canvas.offsetHeight);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const render = () => {
      const elapsed = (performance.now() - start) / 1000;
      const current = propsRef.current;

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform2f(resolution, canvas.width, canvas.height);
      gl.uniform1f(time, elapsed);
      gl.uniform3fv(line, cssColorToRgb(current.lineColor));
      gl.uniform3fv(backgroundStart, cssColorToRgb(current.backgroundColorStart));
      gl.uniform3fv(backgroundEnd, cssColorToRgb(current.backgroundColorEnd));
      gl.uniform1f(shaderSpeed, current.speed);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(position);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("block h-full min-h-[320px] w-full", className)}
      style={{ borderRadius: radius, ...style }}
    />
  );
}

export default WavyLines;
