"use client";

/**
 * ============================================================================
 *  PHYSICS SIM  —  a real gravitational n-body simulation with glowing trails.
 * ============================================================================
 *
 * One of three optional hero backgrounds. Pick which the hero uses in
 * src/components/HeroBackground.tsx.
 *
 * What's happening: a heavy "sun" sits in the center and a swarm of bodies
 * orbits it under Newtonian gravity (a = G·M / r²). Each body leaves a fading
 * trail, so you see real orbital paths. Move your mouse and the cursor becomes
 * a second gravity well that bends the orbits.
 *
 * ►► Tune everything in the CONFIG object below. ◄◄
 */

import { useEffect, useRef } from "react";

// --- TUNING -----------------------------------------------------------------
const CONFIG = {
  bodyCount: 32, // how many orbiting bodies
  G: 55, // gravitational strength (bigger = tighter, faster orbits)
  centralMass: 1500, // mass of the central "sun"
  mouseMass: 2800, // pull of the cursor gravity well (0 disables it)
  softening: 14, // avoids infinite force when very close (keeps it stable)
  trailFade: 0.085, // 0 = endless trails, 1 = no trails. Small = long glow.
  dotRadius: 2, // size of each body
  sunRadius: 5, // size of the central glow
  respawnRadius: 1.6, // bodies past this × the screen size are recycled
};

type Body = { x: number; y: number; vx: number; vy: number };

export default function PhysicsSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv: HTMLCanvasElement = canvas;
    const c2d: CanvasRenderingContext2D = ctx;

    // Pull accent + background colors from the theme (as "r g b" channels).
    const read = (name: string, fallback: string) => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
      return v || fallback;
    };
    const accent = read("--color-accent", "124 92 255").split(/\s+/).join(",");
    const bg = read("--color-bg", "10 10 15").split(/\s+/).join(",");

    let width = 0;
    let height = 0;
    let cx = 0; // center (the sun)
    let cy = 0;
    let bodies: Body[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Place a body on a (roughly) circular orbit at a random radius.
    function spawn(): Body {
      const angle = Math.random() * Math.PI * 2;
      const r = (0.12 + Math.random() * 0.32) * Math.min(width, height);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      // Circular orbital speed v = sqrt(G·M / r), with a little variation so
      // orbits are elliptical and interesting rather than perfect circles.
      const v = Math.sqrt((CONFIG.G * CONFIG.centralMass) / r) * (0.8 + Math.random() * 0.5);
      // Velocity perpendicular to the radius → orbital motion.
      return { x, y, vx: -Math.sin(angle) * v, vy: Math.cos(angle) * v };
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cx = width / 2;
      cy = height / 2;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodies = Array.from({ length: CONFIG.bodyCount }, spawn);
      // Paint the initial background so the first trails fade from solid.
      c2d.fillStyle = `rgb(${bg})`;
      c2d.fillRect(0, 0, width, height);
    }

    // Add the gravitational pull of a mass at (mx,my) to a body's velocity.
    function pull(b: Body, mx: number, my: number, mass: number, dt: number) {
      const dx = mx - b.x;
      const dy = my - b.y;
      const distSq = dx * dx + dy * dy + CONFIG.softening * CONFIG.softening;
      const dist = Math.sqrt(distSq);
      const force = (CONFIG.G * mass) / distSq; // a = G·M / r²
      b.vx += (force * dx) / dist * dt;
      b.vy += (force * dy) / dist * dt;
    }

    function step(dt: number) {
      const maxR = Math.max(width, height) * CONFIG.respawnRadius;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        pull(b, cx, cy, CONFIG.centralMass, dt); // the sun
        if (mouse.active) pull(b, mouse.x, mouse.y, CONFIG.mouseMass, dt); // cursor
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // If a body is flung too far away, recycle it into a fresh orbit.
        if (Math.hypot(b.x - cx, b.y - cy) > maxR) bodies[i] = spawn();
      }
    }

    function draw() {
      // Instead of clearing, lay down a translucent background → fading trails.
      c2d.fillStyle = `rgba(${bg},${CONFIG.trailFade})`;
      c2d.fillRect(0, 0, width, height);

      step(1); // advance the simulation one tick

      // The central "sun" glow.
      const glow = c2d.createRadialGradient(cx, cy, 0, cx, cy, CONFIG.sunRadius * 4);
      glow.addColorStop(0, `rgba(${accent},0.9)`);
      glow.addColorStop(1, `rgba(${accent},0)`);
      c2d.fillStyle = glow;
      c2d.beginPath();
      c2d.arc(cx, cy, CONFIG.sunRadius * 4, 0, Math.PI * 2);
      c2d.fill();

      // The orbiting bodies.
      c2d.fillStyle = `rgb(${accent})`;
      for (const b of bodies) {
        c2d.beginPath();
        c2d.arc(b.x, b.y, CONFIG.dotRadius, 0, Math.PI * 2);
        c2d.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
    }

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
