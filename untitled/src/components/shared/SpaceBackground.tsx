import React, { useEffect, useRef } from "react";

interface Star {
  x: number; y: number; r: number; alpha: number; speed: number; twinkleSpeed: number; twinkleDir: number;
}
interface Asteroid {
  x: number; y: number; vx: number; vy: number; r: number; rotation: number; rotSpeed: number; sides: number; alpha: number;
}

export const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener("resize", resize);

    // Generate stars
    const STAR_COUNT = 220;
    const stars: Star[] = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.2,
      alpha: Math.random() * 0.7 + 0.2,
      speed: Math.random() * 0.08 + 0.01,
      twinkleSpeed: Math.random() * 0.012 + 0.004,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
    }));

    // Generate asteroids
    const ASTEROID_COUNT = 7;
    const asteroids: Asteroid[] = Array.from({ length: ASTEROID_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 22 + 8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      sides: Math.floor(Math.random() * 4) + 6,
      alpha: Math.random() * 0.18 + 0.06,
    }));

    function drawAsteroid(a: Asteroid) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rotation);
      ctx.beginPath();
      for (let i = 0; i < a.sides; i++) {
        const angle = (i / a.sides) * Math.PI * 2;
        const jitter = a.r * (0.75 + Math.sin(i * 3.7) * 0.25);
        const px = Math.cos(angle) * jitter;
        const py = Math.sin(angle) * jitter;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(148,163,184,${a.alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }

    function tick() {
      ctx!.clearRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= 0.95) { s.alpha = 0.95; s.twinkleDir = -1; }
        if (s.alpha <= 0.05) { s.alpha = 0.05; s.twinkleDir = 1; }
        s.y -= s.speed;
        if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }

        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx!.fill();
      }

      // Asteroids
      for (const a of asteroids) {
        a.x += a.vx;
        a.y += a.vy;
        a.rotation += a.rotSpeed;
        if (a.x < -60) a.x = W + 60;
        if (a.x > W + 60) a.x = -60;
        if (a.y < -60) a.y = H + 60;
        if (a.y > H + 60) a.y = -60;
        drawAsteroid(a);
      }

      animId = requestAnimationFrame(tick);
    }

    tick();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, background: "transparent" }}
    />
  );
};
