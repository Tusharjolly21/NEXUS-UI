"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion } from "framer-motion";

const W = 440;
const H = 300;
const BOX = { x: W / 2, w: 150, h: 92, floor: H - 22 };
const COLORS = ["#ff375f", "#ff9f0a", "#ffd60a", "#30d158", "#64d2ff", "#0a84ff", "#bf5af2", "#ff6482"];

interface Ball { x: number; y: number; vx: number; vy: number; r: number; c: string; face: boolean; a: number; va: number }

/**
 * A cardboard box full of little characters. Open it and the flaps swing back
 * as everything bursts out, tumbles, bounces off each other and piles up on
 * the floor. Pack it up and they all fly home.
 */
export default function BoxSpill({ count = 30, autoplay = false }: { count?: number; autoplay?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const balls = useRef<Ball[]>([]);
  const flap = useRef(0); // 0 closed .. 1 open
  const mode = useRef<"idle" | "free" | "home">("idle");
  const [open, setOpen] = useState(false);
  const touched = useRef(false);

  const spill = () => {
    setOpen(true);
    animate(0, 1, { type: "spring", stiffness: 200, damping: 12, onUpdate: (v) => (flap.current = v) });
    const top = BOX.floor - BOX.h;
    balls.current = Array.from({ length: count }, (_, i) => ({
      x: BOX.x + (Math.random() - 0.5) * 80,
      y: top + 10 + Math.random() * 30,
      vx: (Math.random() - 0.5) * 520,
      vy: -380 - Math.random() * 420,
      r: 9 + Math.random() * 8,
      c: COLORS[i % COLORS.length],
      face: i % 3 === 0,
      a: Math.random() * Math.PI * 2,
      va: (Math.random() - 0.5) * 8,
    }));
    mode.current = "free";
  };

  const pack = () => {
    mode.current = "home";
    setTimeout(() => {
      animate(1, 0, { type: "spring", stiffness: 260, damping: 22, onUpdate: (v) => (flap.current = v) });
      setOpen(false);
      setTimeout(() => { if (mode.current === "home") { balls.current = []; mode.current = "idle"; } }, 400);
    }, 650);
  };

  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = W * dpr;
    cv.height = H * dpr;
    let raf = 0;
    let last = performance.now();
    const top = BOX.floor - BOX.h;
    const drawBox = (front: boolean) => {
      const x0 = BOX.x - BOX.w / 2, x1 = BOX.x + BOX.w / 2;
      if (!front) {
        // inside back wall + flaps
        ctx.fillStyle = "#8a6233";
        ctx.fillRect(x0, top, BOX.w, 14);
        const f = flap.current;
        const ang = f * 2.3; // radians the flaps swing back
        ctx.fillStyle = "#c9955a";
        ctx.strokeStyle = "rgba(0,0,0,.08)";
        // left flap hinged at left top edge
        ctx.save();
        ctx.translate(x0, top);
        ctx.rotate(-Math.min(ang, 2.6));
        ctx.fillRect(0, -2, BOX.w / 2, 6 + 30 * Math.sin(Math.min(ang, Math.PI / 2)));
        ctx.restore();
        ctx.save();
        ctx.translate(x1, top);
        ctx.rotate(Math.min(ang, 2.6));
        ctx.fillRect(-BOX.w / 2, -2, BOX.w / 2, 6 + 30 * Math.sin(Math.min(ang, Math.PI / 2)));
        ctx.restore();
        return;
      }
      const g = ctx.createLinearGradient(0, top, 0, BOX.floor);
      g.addColorStop(0, "#d9a768");
      g.addColorStop(1, "#c08a4c");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.roundRect(x0, top, BOX.w, BOX.h, 4);
      ctx.fill();
      // tape strip
      ctx.fillStyle = "rgba(255,255,255,.35)";
      ctx.fillRect(BOX.x - 14, top, 28, BOX.h);
      ctx.fillStyle = "rgba(0,0,0,.18)";
      ctx.font = "600 10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("FRAGILE · THIS SIDE UP", BOX.x, BOX.floor - 14);
      if (flap.current < 0.05) {
        ctx.fillStyle = "#b47f45";
        ctx.fillRect(x0, top - 4, BOX.w, 6);
      }
    };
    const frame = (now: number) => {
      const dt = Math.min(0.025, (now - last) / 1000);
      last = now;
      const bs = balls.current;
      if (mode.current === "free") {
        for (const b of bs) {
          b.vy += 1300 * dt;
          b.x += b.vx * dt; b.y += b.vy * dt; b.a += b.va * dt;
          if (b.y > BOX.floor - b.r) { b.y = BOX.floor - b.r; b.vy *= -0.35; b.vx *= 0.88; b.va = b.vx / b.r; }
          if (b.x < b.r) { b.x = b.r; b.vx *= -0.5; }
          if (b.x > W - b.r) { b.x = W - b.r; b.vx *= -0.5; }
        }
        for (let it = 0; it < 3; it++) {
          for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
            const a = bs[i], c = bs[j];
            const dx = c.x - a.x, dy = c.y - a.y, d = Math.hypot(dx, dy), m = a.r + c.r;
            if (d < m && d > 0.01) {
              const nx = dx / d, ny = dy / d, o = (m - d) / 2;
              a.x -= nx * o; a.y -= ny * o; c.x += nx * o; c.y += ny * o;
              const rv = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
              if (rv < 0) { const imp = -rv * 0.6; a.vx -= imp * nx; a.vy -= imp * ny; c.vx += imp * nx; c.vy += imp * ny; }
            }
          }
        }
      } else if (mode.current === "home") {
        for (const b of bs) {
          b.x += (BOX.x - b.x) * 0.14;
          b.y += (top + 20 - b.y) * 0.14;
          b.r *= 0.985;
        }
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // floor shadow
      const sg = ctx.createRadialGradient(BOX.x, BOX.floor, 10, BOX.x, BOX.floor, 160);
      sg.addColorStop(0, "rgba(0,0,0,.12)");
      sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sg;
      ctx.fillRect(0, BOX.floor - 10, W, 30);
      drawBox(false);
      for (const b of bs) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(b.a);
        ctx.fillStyle = b.c;
        ctx.beginPath();
        if (b.face) ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        else ctx.roundRect(-b.r, -b.r * 0.8, b.r * 2, b.r * 1.6, b.r * 0.6);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,.45)";
        ctx.beginPath();
        ctx.arc(-b.r * 0.35, -b.r * 0.35, b.r * 0.28, 0, Math.PI * 2);
        ctx.fill();
        if (b.face) {
          ctx.fillStyle = "#1d1d1f";
          ctx.beginPath(); ctx.arc(-b.r * 0.3, 0, b.r * 0.13, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.r * 0.3, 0, b.r * 0.13, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      }
      drawBox(true);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (!autoplay) return;
    let o = false;
    const run = () => { if (touched.current) return; o = !o; if (o) spill(); else pack(); };
    const a = setTimeout(run, 700);
    const t = setInterval(run, 3600);
    return () => { clearTimeout(a); clearInterval(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvas} role="img" aria-label={open ? "The box is open and its contents are spilled on the floor." : "A closed cardboard box."} className="rounded-[24px] bg-[linear-gradient(180deg,#ffffff,#f1f1f4)] shadow-[0_0_0_1px_rgba(0,0,0,.05)]" style={{ width: W, height: H, maxWidth: "100%" }} />
      <motion.button
        type="button"
        whileTap={{ scale: 0.94 }}
        onClick={() => { touched.current = true; if (open) pack(); else spill(); }}
        className="h-10 rounded-full bg-[#1d1d1f] px-5 text-[14px] font-medium text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]"
      >
        {open ? "Pack it up" : "Open the box"}
      </motion.button>
    </div>
  );
}
