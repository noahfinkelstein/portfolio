"use client";

/**
 * ============================================================================
 *  PHYSICS SIM  —  a real gravitational n-body simulation with glowing trails.
 * ============================================================================
 *
 * One of three optional hero backgrounds. Pick which the hero uses in
 * src/components/HeroBackground.tsx (set HERO_BACKGROUND to "physics").
 *
 * WHAT'S HAPPENING:
 *  - A heavy "sun" sits at the canvas center and bodies orbit under Newtonian
 *    gravity: acceleration a = G·M / r² (see the `pull` function).
 *  - Each body leaves a fading trail (we paint a translucent background each
 *    frame instead of clearing — see `draw`).
 *  - Move your mouse and the cursor becomes a second gravity well.
 *
 * WHERE VISITORS CONTROL IT:
 *  - The floating panel rendered at the bottom of this file (`PhysicsControls`).
 *  - Sliders update React state → a ref (`configRef`) so the animation loop
 *    always reads live values without restarting.
 *
 * WHERE YOU TUNE DEFAULTS:
 *  - The DEFAULT_CONFIG object below (developer defaults before sliders move).
 */

import { useCallback, useEffect, useRef, useState } from "react";

// --- DEFAULT TUNING (developer defaults; visitors override via the panel) ----
export const DEFAULT_CONFIG = {
  bodyCount: 32, // how many orbiting bodies
  G: 55, // gravitational constant — bigger = tighter, faster orbits
  centralMass: 2500, // mass of the central "sun"
  mouseMass: 2800, // pull of the cursor gravity well (0 = no mouse gravity)
  softening: 14, // softens force at r→0 so orbits stay stable
  trailFade: 0.085, // background alpha each frame: lower = longer trails
  dotRadius: 2, // pixel radius of each orbiting body
  sunRadius: 5, // pixel radius of the central glow
  respawnRadius: 1.6, // bodies past this × screen size get recycled
};

type SimConfig = typeof DEFAULT_CONFIG;
type Body = { x: number; y: number; vx: number; vy: number };

/** Labels + ranges for each slider in the visitor control panel. */
const CONTROL_SPECS: {
  key: keyof SimConfig;
  label: string;
  min: number;
  max: number;
  step: number;
}[] = [
  { key: "bodyCount", label: "Bodies", min: 8, max: 64, step: 1 },
  { key: "G", label: "Gravity", min: 20, max: 100, step: 1 },
  { key: "centralMass", label: "Sun mass", min: 800, max: 5000, step: 100 },
  { key: "mouseMass", label: "Mouse pull", min: 0, max: 5000, step: 100 },
  { key: "trailFade", label: "Trail fade", min: 0.02, max: 0.2, step: 0.01 },
];

export default function PhysicsSim() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /*
   * STATE + REF PATTERN:
   *   React state drives the control panel UI (sliders show current values).
   *   Refs mirror state so the requestAnimationFrame loop always reads the
   *   latest values WITHOUT restarting useEffect on every slider tick.
   *   (Re-running useEffect would tear down and recreate the entire sim.)
   */
  const [config, setConfig] = useState<SimConfig>(DEFAULT_CONFIG);
  const configRef = useRef(config);
  configRef.current = config; // sync on every render

  const [mouseGravity, setMouseGravity] = useState(true);
  const mouseGravityRef = useRef(mouseGravity);
  mouseGravityRef.current = mouseGravity;

  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Incrementing resetKey re-mounts the useEffect below → fresh canvas + bodies
  const [resetKey, setResetKey] = useState(0);

  const updateConfig = useCallback((key: keyof SimConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetSimulation = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setMouseGravity(true);
    setPaused(false);
    setResetKey((k) => k + 1);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cv: HTMLCanvasElement = canvas;
    const c2d: CanvasRenderingContext2D = ctx;

    // Theme colors as "r,g,b" strings for canvas fills.
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
    let cx = 0; // sun x (canvas center)
    let cy = 0; // sun y
    let bodies: Body[] = [];
    let raf = 0;
    const mouse = { x: -9999, y: -9999, active: false };

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Place one body on a roughly circular orbit at a random radius.
    function spawn(): Body {
      const cfg = configRef.current;
      const angle = Math.random() * Math.PI * 2;
      const r = (0.12 + Math.random() * 0.32) * Math.min(width, height);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      // Circular orbital speed v = sqrt(G·M / r), with variation for ellipses.
      const v =
        Math.sqrt((cfg.G * cfg.centralMass) / r) * (0.8 + Math.random() * 0.5);
      // Velocity perpendicular to radius → orbital motion around the sun.
      return { x, y, vx: -Math.sin(angle) * v, vy: Math.cos(angle) * v };
    }

    // Match canvas pixel size to its CSS box (handles retina via dpr).
    function resize() {
      const cfg = configRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = cv.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      cx = width / 2;
      cy = height / 2;
      cv.width = width * dpr;
      cv.height = height * dpr;
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      bodies = Array.from({ length: cfg.bodyCount }, spawn);
      // Solid background so trails fade from a clean slate.
      c2d.fillStyle = `rgb(${bg})`;
      c2d.fillRect(0, 0, width, height);
    }

    // Add gravitational acceleration from a mass at (mx, my) onto body b.
    function pull(b: Body, mx: number, my: number, mass: number, dt: number) {
      const cfg = configRef.current;
      const dx = mx - b.x;
      const dy = my - b.y;
      const distSq = dx * dx + dy * dy + cfg.softening * cfg.softening;
      const dist = Math.sqrt(distSq);
      const force = (cfg.G * mass) / distSq; // a = G·M / r²
      b.vx += (force * dx) / dist * dt;
      b.vy += (force * dy) / dist * dt;
    }

    // One simulation tick: gravity → integrate position → recycle escapees.
    function step(dt: number) {
      const cfg = configRef.current;

      // Grow or shrink the swarm when the visitor moves the Bodies slider.
      while (bodies.length < cfg.bodyCount) bodies.push(spawn());
      while (bodies.length > cfg.bodyCount) bodies.pop();

      const maxR = Math.max(width, height) * cfg.respawnRadius;
      for (let i = 0; i < bodies.length; i++) {
        const b = bodies[i];
        pull(b, cx, cy, cfg.centralMass, dt); // central sun
        if (mouseGravityRef.current && mouse.active && cfg.mouseMass > 0) {
          pull(b, mouse.x, mouse.y, cfg.mouseMass, dt); // cursor well
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // Flung too far? Respawn on a fresh orbit.
        if (Math.hypot(b.x - cx, b.y - cy) > maxR) bodies[i] = spawn();
      }
    }

    // Paint one frame: fade trails, advance physics, draw sun + bodies.
    function draw() {
      const cfg = configRef.current;

      // Translucent fill instead of clearRect → glowing orbital trails.
      c2d.fillStyle = `rgba(${bg},${cfg.trailFade})`;
      c2d.fillRect(0, 0, width, height);

      if (!pausedRef.current) step(1);

      // Central sun — radial gradient glow at (cx, cy).
      const glow = c2d.createRadialGradient(
        cx,
        cy,
        0,
        cx,
        cy,
        cfg.sunRadius * 4
      );
      glow.addColorStop(0, `rgba(${accent},0.9)`);
      glow.addColorStop(1, `rgba(${accent},0)`);
      c2d.fillStyle = glow;
      c2d.beginPath();
      c2d.arc(cx, cy, cfg.sunRadius * 4, 0, Math.PI * 2);
      c2d.fill();

      // Orbiting bodies — small accent-colored dots.
      c2d.fillStyle = `rgb(${accent})`;
      for (const b of bodies) {
        c2d.beginPath();
        c2d.arc(b.x, b.y, cfg.dotRadius, 0, Math.PI * 2);
        c2d.fill();
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    // Track cursor in canvas-local coordinates for the mouse gravity well.
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
  }, [resetKey]); // resetKey bump re-runs this effect → full canvas reset

  return (
    <>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />

      {/* Visitor controls — bottom-right overlay on the hero background. */}
      <PhysicsControls
        config={config}
        mouseGravity={mouseGravity}
        paused={paused}
        onConfigChange={updateConfig}
        onMouseGravityChange={setMouseGravity}
        onPausedChange={setPaused}
        onReset={resetSimulation}
      />
    </>
  );
}

// --- CONTROL PANEL (visitor-facing UI on the hero when physics is active) ---
// Sliders call onConfigChange → setState → configRef sync → sim reads live values.

type ControlsProps = {
  config: SimConfig;
  mouseGravity: boolean;
  paused: boolean;
  onConfigChange: (key: keyof SimConfig, value: number) => void;
  onMouseGravityChange: (v: boolean) => void;
  onPausedChange: (v: boolean) => void;
  onReset: () => void;
};

function PhysicsControls({
  config,
  mouseGravity,
  paused,
  onConfigChange,
  onMouseGravityChange,
  onPausedChange,
  onReset,
}: ControlsProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="absolute bottom-6 right-6 z-20 w-56 rounded-xl border border-border bg-bg/85 p-3 font-mono text-xs backdrop-blur-sm sm:bottom-8 sm:right-8 sm:w-64"
      aria-label="Physics simulation controls"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-accent">
          Physics
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="text-fg-muted transition-colors hover:text-fg"
          aria-expanded={!collapsed}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed && (
        <div className="space-y-3">
          {/* Sliders — each maps to a key in DEFAULT_CONFIG / configRef */}
          {CONTROL_SPECS.map(({ key, label, min, max, step }) => (
            <label key={key} className="block">
              <span className="flex justify-between text-fg-muted">
                <span>{label}</span>
                <span className="text-fg">
                  {key === "trailFade"
                    ? config[key].toFixed(2)
                    : Math.round(config[key])}
                </span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={config[key]}
                onChange={(e) =>
                  onConfigChange(key, Number(e.target.value))
                }
                className="mt-1 w-full accent-accent"
              />
            </label>
          ))}

          {/* Toggles + reset */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => onMouseGravityChange(!mouseGravity)}
              className={`rounded-md border px-2 py-1 transition-colors ${
                mouseGravity
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border text-fg-muted hover:text-fg"
              }`}
            >
              Mouse gravity {mouseGravity ? "on" : "off"}
            </button>
            <button
              type="button"
              onClick={() => onPausedChange(!paused)}
              className={`rounded-md border px-2 py-1 transition-colors ${
                paused
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border text-fg-muted hover:text-fg"
              }`}
            >
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              type="button"
              onClick={onReset}
              className="rounded-md border border-border px-2 py-1 text-fg-muted transition-colors hover:border-border hover:text-fg"
            >
              Reset
            </button>
          </div>

          <p className="text-[10px] leading-relaxed text-fg-muted/80">
            Move your cursor over the hero to bend orbits with mouse gravity.
          </p>
        </div>
      )}
    </div>
  );
}
