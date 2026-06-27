"use client";

/**
 * ============================================================================
 *  3D OBJECT  —  rotating, mouse-reactive wireframe shape (Three.js).
 * ============================================================================
 *
 * Hero background option #1. Selected when HERO_BACKGROUND = "object3d" in
 * HeroBackground.tsx.
 *
 * STACK:
 *   @react-three/fiber  → React renderer for Three.js (Canvas, useFrame)
 *   three               → 3D math + WebGL (geometries, materials, colors)
 *
 * BEHAVIOR:
 *   - Auto-rotates on two axes (mesh ref)
 *   - Tilts toward cursor with smooth easing (group ref)
 *   - Gentle vertical bob via sin(elapsedTime)
 *   - Accent color read from CSS --color-accent at runtime
 *
 * TUNE: edit CONFIG below. No other files need changing for visual tweaks.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- DEVELOPER TUNING KNOBS -------------------------------------------------
const CONFIG = {
  // Geometry shape — swap to change the centerpiece silhouette
  shape: "torusKnot" as
    | "torusKnot"
    | "icosahedron"
    | "dodecahedron"
    | "octahedron"
    | "torus",

  // wireframe = glowing line cage (meshBasicMaterial, ignores lights)
  // solid     = shaded surface (meshStandardMaterial, needs lights in Canvas)
  style: "wireframe" as "wireframe" | "solid",

  size: 3.5, // overall scale of the geometry
  detail: 10, // subdivision level for polyhedra (higher = smoother mesh)
  autoRotateSpeed: 0.35, // radians/sec-ish spin multiplier
  mouseParallax: 0.5, // max tilt angle toward cursor (0 = no mouse reaction)
  bob: 0.15, // vertical float amplitude (0 = no bob)
  offsetX: 1.2, // shift right so shape sits beside hero text (world units)
  opacity: 0.5, // 0–1 transparency — keep < 1 so text stays readable
};

/**
 * Reads --color-accent from the document (injected by theme.config.ts).
 * Returns a THREE.Color for materials. Fallback violet if SSR or missing var.
 */
function useAccentColor() {
  return useMemo(() => {
    if (typeof window === "undefined") return new THREE.Color("#7c5cff");
    const ch = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    if (!ch) return new THREE.Color("#7c5cff");
    // if (!ch) return new THREE.Color("#C0C0C0");
    const [r, g, b] = ch.split(/\s+/).map(Number);
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  }, []);
}

/** Picks the Three.js geometry element based on CONFIG.shape */
function Geometry() {
  const s = CONFIG.size;
  switch (CONFIG.shape) {
    case "icosahedron":
      return <icosahedronGeometry args={[s, CONFIG.detail]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[s, CONFIG.detail]} />;
    case "octahedron":
      return <octahedronGeometry args={[s, CONFIG.detail]} />;
    case "torus":
      return <torusGeometry args={[s, s * 0.38, 24, 120]} />;
    case "torusKnot":
    default:
      return <torusKnotGeometry args={[s, s * 0.32, 180, 28]} />;
  }
}

/** The animated mesh — spin, tilt, bob, and material */
function Shape() {
  const accent = useAccentColor();
  const group = useRef<THREE.Group>(null); // outer group: tilt + bob + position
  const mesh = useRef<THREE.Mesh>(null); // inner mesh: constant spin
  const target = useRef({ x: 0, y: 0 }); // normalized cursor [-1,1] on each axis

  // Track cursor on window (canvas has pointer-events-none)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Normalize to -1..1 so tilt works regardless of screen size
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Runs every frame (~60fps) — delta = seconds since last frame
  useFrame((state, delta) => {
    if (mesh.current) {
      // Continuous spin on X and Y (slightly different rates for organic motion)
      mesh.current.rotation.x += delta * CONFIG.autoRotateSpeed * 0.55;
      mesh.current.rotation.y += delta * CONFIG.autoRotateSpeed;
    }
    if (group.current) {
      // Ease group rotation toward cursor target (0.05 = smoothing factor)
      group.current.rotation.x +=
        (target.current.y * CONFIG.mouseParallax - group.current.rotation.x) *
        0.05;
      group.current.rotation.y +=
        (target.current.x * CONFIG.mouseParallax - group.current.rotation.y) *
        0.05;
      // Vertical sine wave bob using shared scene clock
      group.current.position.y =
        Math.sin(state.clock.elapsedTime) * CONFIG.bob;
    }
  });

  return (
    <group ref={group} position={[CONFIG.offsetX, 0, 0]}>
      <mesh ref={mesh}>
        <Geometry />
        {CONFIG.style === "wireframe" ? (
          <meshBasicMaterial
            color={accent}
            wireframe
            transparent
            opacity={CONFIG.opacity}
          />
        ) : (
          <meshStandardMaterial
            color={accent}
            roughness={0.25}
            metalness={0.5}
            transparent
            opacity={CONFIG.opacity}
          />
        )}
      </mesh>
    </group>
  );
}

export default function Object3D() {
  return (
    // pointer-events-none: clicks pass through to links/buttons in hero
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        {/* Lights only affect meshStandardMaterial (solid style) */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.4} />
        <Shape />
      </Canvas>
    </div>
  );
}
