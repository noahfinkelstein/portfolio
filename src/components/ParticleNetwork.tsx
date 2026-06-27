"use client";

/**
 * ============================================================================
 *  PARTICLE NETWORK  —  interactive floating nodes + connecting lines.
 * ============================================================================
 *
 * Hero background option #3. Selected when HERO_BACKGROUND = "particles" in
 * HeroBackground.tsx.
 *
 * HOW IT WORKS:
 *   1. Spawn N nodes with random positions and velocities (buildNodes)
 *   2. Each frame: move nodes, bounce off edges, draw lines between nearby pairs
 *   3. Lines near the cursor brighten (proximity glow)
 *   4. Accent color read from CSS --color-accent
 *
 * TUNE: edit CONFIG below. Canvas uses pointer-events-none (mouse tracked on window).
 */

import { useEffect, useRef } from "react";

// --- DEVELOPER TUNING KNOBS -------------------------------------------------
const CONFIG = {
  density: 0.00009, // nodes per pixel² — higher = denser field
  maxNodes: 140, // hard cap (prevents slowdown on 4K displays)
  speed: 0.25, // max initial velocity magnitude per axis
  linkDistance: 130, // px — draw line if two nodes are closer than this
  mouseRadius: 170, // px — cursor influence radius for line brightness
  dotRadius: 1.8, // px — node dot size
  lineWidth: 1, // px — connection line thickness
  baseOpacity: 0.35, // line opacity when far from cursor
  glowOpacity: 0.9, // line opacity when near cursor
};

type Node = { x: number; y: number; vx: number; vy: number };

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Non-null aliases — TypeScript loses narrowing inside nested closures
    const cv: HTMLCanvasElement = canvas;
    const c2d: CanvasRenderingContext2D = ctx;

    // --color-accent holds space-separated RGB channels e.g. "124 92 255"
    const accentChannels =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "124 92 255";

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 }; // off-screen until first mousemove

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    /** Create nodes based on canvas area × density, capped at maxNodes */
    function buildNodes() {
      const target = Math.min(
        CONFIG.maxNodes,
        Math.floor(width * height * CONFIG.density)
      );
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
      }));
    }

    /** Sync canvas internal resolution with CSS size (retina via dpr cap at 2) */
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    /** Build rgba() string from accent channels + alpha */
    function rgba(alpha: number) {
      return `rgba(${accentChannels.split(/\s+/).join(",")},${alpha})`;
    }

    function draw() {
      c2d.clearRect(0, 0, width, height);

      // --- Physics: drift + edge bounce ---
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // --- Draw connection lines (O(n²) pairwise — fine for ~140 nodes) ---
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > CONFIG.linkDistance) continue;

          // Brighten lines whose midpoint is near the cursor
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const near = Math.hypot(mx - mouse.x, my - mouse.y);
          const proximity =
            near < CONFIG.mouseRadius ? 1 - near / CONFIG.mouseRadius : 0;

          // Fade line opacity with distance between nodes
          const fade = 1 - dist / CONFIG.linkDistance;
          const opacity =
            (CONFIG.baseOpacity +
              (CONFIG.glowOpacity - CONFIG.baseOpacity) * proximity) *
            fade;

          c2d.strokeStyle = rgba(opacity);
          c2d.lineWidth = CONFIG.lineWidth;
          c2d.beginPath();
          c2d.moveTo(a.x, a.y);
          c2d.lineTo(b.x, b.y);
          c2d.stroke();
        }
      }

      // --- Draw node dots ---
      c2d.fillStyle = rgba(0.9);
      for (const n of nodes) {
        c2d.beginPath();
        c2d.arc(n.x, n.y, CONFIG.dotRadius, 0, Math.PI * 2);
        c2d.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    function onMove(e: MouseEvent) {
      const rect = cv.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
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
