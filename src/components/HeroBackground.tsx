"use client";

/**
 * ============================================================================
 *  HERO BACKGROUND SWITCH  —  choose your signature graphic in ONE place.
 * ============================================================================
 *
 * Change the single value below to pick which animated background the hero
 * uses. That's the only edit you need.
 *
 *   "object3d"  → a rotating 3D wireframe shape   (tune: Object3D.tsx)
 *   "physics"   → an n-body gravity simulation    (tune: PhysicsSim.tsx)
 *   "particles" → an interactive node network      (tune: ParticleNetwork.tsx)
 */
const HERO_BACKGROUND: "object3d" | "physics" | "particles" = "object3d";

// ----------------------------------------------------------------------------

import dynamic from "next/dynamic";
import ParticleNetwork from "./ParticleNetwork";
import PhysicsSim from "./PhysicsSim";

// The 3D object uses Three.js / WebGL, which only runs in the browser. Loading
// it dynamically (ssr: false) keeps it out of the server render AND means its
// heavy code only downloads when you actually use this background.
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
