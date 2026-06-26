"use client";

/**
 * ============================================================================
 *  PARTICLE NETWORK  —  the signature animated background.
 * ============================================================================
 *
 * Floating nodes connected by lines that react to your mouse. It draws on a
 * <canvas>, uses your theme's accent color, and is fully tunable below.
 *
 * ►► To tune the look, edit the CONFIG object. Nothing else needs changing. ◄◄
 *
 * Want a totally different centerpiece instead (e.g. a 3D object or gradient
 * blobs)? This is a self-contained component — just swap <ParticleNetwork/>
 * for your own component in src/components/sections/Hero.tsx.
 */

import { useEffect, useRef } from "react";

// --- TUNING -----------------------------------------------------------------
const CONFIG = {
  density: 0.00009, // nodes per pixel. Higher = more dots. Try 0.00005–0.00015
  maxNodes: 140, // hard cap on node count (keeps it fast on big screens)
  speed: 0.25, // base drift speed of nodes
  linkDistance: 130, // px: draw a line between two nodes closer than this
  mouseRadius: 170, // px: nodes/links within this of the cursor light up
  dotRadius: 1.8, // px: size of each node
  lineWidth: 1, // px: thickness of links
  baseOpacity: 0.35, // opacity of links when far from the mouse
  glowOpacity: 0.9, // opacity of links near the mouse
};

type Node = { x: number; y: number; vx: number; vy: number };

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Local non-null aliases so TypeScript keeps the narrowing inside the
    // nested animation functions below (closures otherwise widen back to null).
    const cv: HTMLCanvasElement = canvas;
    const c2d: CanvasRenderingContext2D = ctx;

    // Read the accent color from the CSS variable so it always matches theme.
    // The variable holds space-separated RGB channels, e.g. "124 92 255".
    const accentChannels =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim() || "124 92 255";

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999 };

    // Respect reduced-motion: render a single static frame, no animation loop.
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

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

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap DPR for perf
      const rect = cv.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildNodes();
    }

    // Build "rgba(r,g,b,a)" from the accent channels so we can vary opacity.
    function rgba(alpha: number) {
      return `rgba(${accentChannels.split(/\s+/).join(",")},${alpha})`;
    }

    function draw() {
      c2d.clearRect(0, 0, width, height);

      // Move nodes + bounce off edges.
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      // Draw links between nearby nodes.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist > CONFIG.linkDistance) continue;

          // Brighten links whose midpoint is near the cursor.
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const near = Math.hypot(mx - mouse.x, my - mouse.y);
          const proximity =
            near < CONFIG.mouseRadius ? 1 - near / CONFIG.mouseRadius : 0;

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

      // Draw the nodes themselves.
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
    // The canvas sits behind content (z-0) and ignores pointer events so it
    // never blocks clicks. `absolute inset-0` makes it fill its parent.
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
    />
  );
}
