"use client";

/**
 * ============================================================================
 *  3D OBJECT  —  a rotating, mouse-reactive wireframe shape (Three.js).
 * ============================================================================
 *
 * One of three optional hero backgrounds. Pick which background the hero uses
 * in src/components/HeroBackground.tsx.
 *
 * ►► To tune it, edit the CONFIG object below. Nothing else needs changing. ◄◄
 *
 * It uses your theme's accent color automatically, spins on its own, and tilts
 * toward your cursor. It sits behind the hero text and ignores clicks.
 */

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// --- TUNING -----------------------------------------------------------------
const CONFIG = {
  // The shape. Try any of:
  //   "torusKnot" | "icosahedron" | "dodecahedron" | "octahedron" | "torus"
  shape: "torusKnot" as
    | "torusKnot"
    | "icosahedron"
    | "dodecahedron"
    | "octahedron"
    | "torus",

  // "wireframe" = glowing line cage (ignores lighting).
  // "solid"     = filled, shaded surface.
  style: "wireframe" as "wireframe" | "solid",

  size: 1.45, // overall radius of the shape
  detail: 1, // subdivisions for polyhedra (higher = smoother/denser)
  autoRotateSpeed: 0.35, // base spin speed
  mouseParallax: 0.4, // how far it tilts toward the cursor (0 = no reaction)
  bob: 0.15, // vertical floating amount (0 = perfectly still vertically)
  offsetX: 1.2, // shift right so it sits beside the hero text (0 = centered)
  opacity: 0.7, // 0–1; keep < 1 so text stays readable over it
};

/** Reads your accent color (stored as "r g b" channels) as a THREE color. */
function useAccentColor() {
  return useMemo(() => {
    if (typeof window === "undefined") return new THREE.Color("#7c5cff");
    const ch = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-accent")
      .trim();
    if (!ch) return new THREE.Color("#7c5cff");
    const [r, g, b] = ch.split(/\s+/).map(Number);
    return new THREE.Color(`rgb(${r}, ${g}, ${b})`);
  }, []);
}

/** Returns the chosen geometry element. */
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

function Shape() {
  const accent = useAccentColor();
  const group = useRef<THREE.Group>(null); // handles tilt + bob
  const mesh = useRef<THREE.Mesh>(null); // handles the constant spin
  const target = useRef({ x: 0, y: 0 }); // normalized cursor position

  // Track the cursor on the whole window (the canvas itself ignores pointers).
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * CONFIG.autoRotateSpeed * 0.55;
      mesh.current.rotation.y += delta * CONFIG.autoRotateSpeed;
    }
    if (group.current) {
      // Ease the whole shape's tilt toward the cursor.
      group.current.rotation.x +=
        (target.current.y * CONFIG.mouseParallax - group.current.rotation.x) *
        0.05;
      group.current.rotation.y +=
        (target.current.x * CONFIG.mouseParallax - group.current.rotation.y) *
        0.05;
      // Gentle vertical bob using the shared clock.
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
    // Behind content (z-0), fills the hero, never blocks clicks.
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        {/* Lights only matter for the "solid" style. */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 3, 5]} intensity={1.4} />
        <Shape />
      </Canvas>
    </div>
  );
}
