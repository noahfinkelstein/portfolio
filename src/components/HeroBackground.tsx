"use client";

/**
 * ============================================================================
 *  HERO BACKGROUND SWITCH  —  pick the hero animation in ONE place.
 * ============================================================================
 *
 * Change HERO_BACKGROUND below to switch between three backgrounds:
 *
 *   "object3d"  → rotating 3D wireframe (Object3D.tsx)     ← current default
 *   "physics"   → n-body gravity sim (PhysicsSim.tsx)
 *   "particles" → interactive node network (ParticleNetwork.tsx)
 *
 * WHY dynamic() FOR OBJECT3D:
 *   Three.js/WebGL only runs in the browser. dynamic(..., { ssr: false })
 *   skips server rendering and lazy-loads the heavy Three.js bundle only when
 *   object3d is selected.
 */

const HERO_BACKGROUND: "object3d" | "physics" | "particles" = "object3d";

import dynamic from "next/dynamic";
import ParticleNetwork from "./ParticleNetwork";
import PhysicsSim from "./PhysicsSim";

// Lazy-loaded — code-split so Three.js isn't downloaded unless object3d is active
const Object3D = dynamic(() => import("./Object3D"), { ssr: false });

export default function HeroBackground() {
  switch (HERO_BACKGROUND) {
    case "object3d":
      return <Object3D />;
    case "physics":
      return <PhysicsSim />;
    case "particles":
    default:
      return <ParticleNetwork />;
  }
}
