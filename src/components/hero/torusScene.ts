/* ---------------------------------------------------------------------------
   TORUS SCENE — the three.js side of the hero figure ("Fig. 1").
   Imported only by TorusField.tsx, which is itself loaded with
   next/dynamic({ ssr: false }), so three.js never reaches the server bundle
   or the page's first-load JS.

   What is on screen
     - The trefoil, a (2,3) torus knot, drawn like a figure in a printed
       paper: one thin solid tube (TubeGeometry along the knot curve) in
       --scene-wire, flat colour, full opacity, depth-tested.
     - Breaks at the crossings, as in a knot diagram: a wider, invisible
       "gap" tube around the same curve is drawn first into the depth buffer
       only (no colour, back faces only). Where one strand passes over
       another, the over-strand's gap tube sits in front of the under-strand,
       so the under-strand's ink fails the depth test there and leaves a
       short transparent gap on either side of the over-strand.

   How it sits
     - The knot lies flat around its own vertical axis, like a ring on a
       turntable seen from high above: the axis is tipped well toward the
       viewer (KNOT_VIEW.tilt) so the three crossings read as in a diagram,
       with a little depth left. At rest it holds the angle KNOT_VIEW.turn,
       one lobe up.
     - The curve and the angle live in knot.ts; TorusKnotSvg.tsx draws the
       same curve from the same angle, so the static figure and the canvas
       line up when one fades into the other.

   Motion
     - One slow turn about that vertical axis (0.12 rad/s). Because the
       trefoil is symmetric about it, every angle is as legible as the rest
       angle.
     - A lean toward the pointer while it is over the figure (at most
       0.3 rad in any direction), easing back to upright when it leaves. The owner passes a
       normalised pointer (-1…1 on each axis about the figure's centre) and
       resets it to 0, 0 on leave; touch is ignored by the owner.
     - One 600 ms fade-in, the first time a frame is drawn.

   The canvas is created here, inside the host the owner passes, and is sized
   by resize(width, height): the owner measures its box (ResizeObserver) and
   the scene fits the knot to it. The ink colour comes from the theme token
   --scene-wire and updates live through setTheme().

   Cost control: the device pixel ratio is capped at 1.5; the renderer asks
   for the low-power GPU; shaders are compiled asynchronously before the
   first frame; the owner stops the loop when the figure is off screen or the
   tab is hidden (setActive); reduced motion draws single static frames at
   the rest angle on demand (theme change, resize) and never starts the loop.

   Owner API
     new TorusScene(host, { tokens, reducedMotion, canvasClassName?, onReady?, onLost? })
     prepare()                  compile, draw frame one, start if active
     resize(width, height)      the host's size in CSS px
     setPointer(nx, ny)         normalised pointer, -1…1 (0, 0 = no lean)
     setActive(bool)            in view and the tab is visible
     setTheme(tokens)           re-tint
     setReducedMotion(bool)     switch between loop and static frame
     dispose()                  release the GPU and remove the canvas
   --------------------------------------------------------------------------- */

import * as THREE from "three";
import type { ThemeTokens } from "@/lib/theme";
import { KNOT_INK, KNOT_SHAPE, KNOT_VIEW, knotPoint } from "./knot";

/* --- Tuning ------------------------------------------------------------------ */

export const CONFIG = {
  tubularSegments: 480,
  radialSegments: 10,

  /** Camera. */
  fov: 35,
  distance: 14,

  /** Motion. */
  turnSpeed: 0.12,
  lean: 0.3,
  /** Share of the remaining lean closed per 60 Hz frame. */
  leanEase: 0.06,
  fadeInMs: 600,

  maxPixelRatio: 1.5,
} as const;

export type TorusSceneOptions = {
  tokens: ThemeTokens;
  reducedMotion: boolean;
  /** Class for the canvas element the scene creates. */
  canvasClassName?: string;
  /** Called once the first visible frame has been drawn (and again after a lost context comes back). */
  onReady?: () => void;
  /** Called when the WebGL context is lost; the canvas is blank until it returns. */
  onLost?: () => void;
};

/* --- Helpers ----------------------------------------------------------------- */

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** The knot curve as a three.js Curve (t in 0…1), for TubeGeometry. */
class KnotCurve extends THREE.Curve<THREE.Vector3> {
  constructor() {
    super();
  }

  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    const [x, y, z] = knotPoint(t * Math.PI * 2);
    return target.set(x, y, z);
  }
}

/* --- Scene ------------------------------------------------------------------- */

export class TorusScene {
  readonly canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;

  private root = new THREE.Group(); // scale to fit the box
  private leanGroup = new THREE.Group(); // lean toward the pointer
  private viewGroup = new THREE.Group(); // fixed tilt toward the viewer
  private turnGroup = new THREE.Group(); // the slow turn about the knot's axis

  private inkGeometry: THREE.TubeGeometry;
  private gapGeometry: THREE.TubeGeometry;
  private inkMaterial: THREE.MeshBasicMaterial;
  private gapMaterial: THREE.MeshBasicMaterial;
  private boundRadius: number;

  private reduced: boolean;
  private onReady?: () => void;
  private onLost?: () => void;

  /* Animated state. */
  private lastNow = 0;
  private pointer = { nx: 0, ny: 0 };
  private fade = 0;
  private running = false;
  private active = false;
  private ready = false;
  private announced = false;
  private disposed = false;
  private lastOpacity = -1;

  constructor(host: HTMLElement, options: TorusSceneOptions) {
    this.reduced = options.reducedMotion;
    this.onReady = options.onReady;
    this.onLost = options.onLost;

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    if (options.canvasClassName) canvas.className = options.canvasClassName;
    canvas.style.opacity = "0";
    this.canvas = canvas;
    host.appendChild(canvas);

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
    } catch (error) {
      canvas.remove();
      throw error;
    }
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio));

    this.camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, CONFIG.distance);

    /* The gap tube: depth only, back faces only, drawn before the ink. Its
       back faces lie behind its own strand's ink (so that strand shows) but
       in front of any strand passing well beneath it (so that one is cut). */
    const curve = new KnotCurve();
    const { tubularSegments, radialSegments } = CONFIG;
    this.gapGeometry = new THREE.TubeGeometry(curve, tubularSegments, KNOT_INK.gapRadius, radialSegments, true);
    this.gapMaterial = new THREE.MeshBasicMaterial({
      colorWrite: false,
      side: THREE.BackSide,
    });
    const gap = new THREE.Mesh(this.gapGeometry, this.gapMaterial);
    gap.renderOrder = 0;

    /* The ink: a thin solid tube in flat colour. */
    this.inkGeometry = new THREE.TubeGeometry(curve, tubularSegments, KNOT_INK.inkRadius, radialSegments, true);
    this.inkMaterial = new THREE.MeshBasicMaterial();
    const ink = new THREE.Mesh(this.inkGeometry, this.inkMaterial);
    ink.renderOrder = 1;

    this.turnGroup.add(gap, ink);
    this.viewGroup.add(this.turnGroup);
    this.leanGroup.add(this.viewGroup);
    this.root.add(this.leanGroup);
    this.scene.add(this.root);
    this.viewGroup.rotation.x = KNOT_VIEW.tilt;
    this.turnGroup.rotation.y = KNOT_VIEW.turn;

    /* Every point of the curve lies within R + A of the axis origin, which is
       also the centre every rotation turns about. */
    this.boundRadius = KNOT_SHAPE.R + KNOT_SHAPE.A + KNOT_INK.gapRadius;

    this.applyTheme(options.tokens);
    this.resize(host.clientWidth || 1, host.clientHeight || 1);

    canvas.addEventListener("webglcontextlost", this.handleContextLost);
    canvas.addEventListener("webglcontextrestored", this.handleContextRestored);
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.lastOpacity = -1;
    this.canvas.style.opacity = "0";
    this.announced = false;
    this.onLost?.();
  };

  private handleContextRestored = () => {
    if (this.disposed) return;
    this.redrawIfIdle();
    this.wake();
  };

  /* --- Public API ------------------------------------------------------------ */

  /** Compile the shaders off the main thread where supported, then draw frame one. */
  async prepare(): Promise<void> {
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } catch (error) {
      /* Disposed (context released) while compiling: nothing to report. */
      if (this.disposed) return;
      throw error;
    }
    if (this.disposed) return;
    this.ready = true;
    if (this.reduced) this.fade = 1;
    this.draw(0);
    this.wake();
  }

  /** The host's size changed (or first layout). CSS px. */
  resize(width: number, height: number): void {
    if (this.disposed) return;
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    /* Fit the knot: its bounding radius spans `fill` of the shorter half-side
       at the knot's own depth. */
    const halfH = CONFIG.distance * Math.tan(THREE.MathUtils.degToRad(CONFIG.fov / 2));
    const halfW = halfH * this.camera.aspect;
    this.root.scale.setScalar((KNOT_VIEW.fill * Math.min(halfW, halfH)) / this.boundRadius);
    this.redrawIfIdle();
  }

  /** Normalised pointer: -1…1 on each axis, 0 over the figure's centre or off it.
   *  The pair is clamped to length 1, so a corner leans no further than an
   *  edge (CONFIG.lean is the true maximum). */
  setPointer(nx: number, ny: number): void {
    let x = Number.isFinite(nx) ? clamp(nx, -1, 1) : 0;
    let y = Number.isFinite(ny) ? clamp(ny, -1, 1) : 0;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    this.pointer.nx = x;
    this.pointer.ny = y;
  }

  setTheme(tokens: ThemeTokens): void {
    if (this.disposed) return;
    this.applyTheme(tokens);
    this.redrawIfIdle();
  }

  /** In view and the tab is visible: the loop runs only then. */
  setActive(active: boolean): void {
    this.active = active;
    if (active) this.wake();
    else this.stop();
  }

  setReducedMotion(reduced: boolean): void {
    if (reduced === this.reduced || this.disposed) return;
    this.reduced = reduced;
    if (reduced) {
      this.stop();
      this.fade = 1;
      this.leanGroup.rotation.set(0, 0, 0);
      this.turnGroup.rotation.y = KNOT_VIEW.turn;
      this.redrawIfIdle();
    } else {
      this.wake();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.canvas.removeEventListener("webglcontextrestored", this.handleContextRestored);
    this.inkGeometry.dispose();
    this.gapGeometry.dispose();
    this.inkMaterial.dispose();
    this.gapMaterial.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  /* --- Frame ------------------------------------------------------------------- */

  private wake(): void {
    if (this.running || this.disposed || this.reduced || !this.ready || !this.active) return;
    this.running = true;
    this.lastNow = 0;
    this.renderer.setAnimationLoop(this.loop);
  }

  private stop(): void {
    if (!this.running) return;
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  private loop = (now: number) => {
    const dt = this.lastNow ? Math.min(now - this.lastNow, 50) : 16.7;
    this.lastNow = now;
    this.draw(dt);
  };

  /** One static frame, for the states where the loop is not running. */
  private redrawIfIdle(): void {
    if (this.running || !this.ready || this.disposed) return;
    this.draw(0);
  }

  /** Advance by dt ms (0 = lay out the current state) and render. */
  private draw(dt: number): void {
    if (!this.reduced && dt > 0) {
      this.fade = Math.min(1, this.fade + dt / CONFIG.fadeInMs);

      /* Wrap the turn so the angle never grows without bound. */
      const turn = this.turnGroup.rotation.y + (dt / 1000) * CONFIG.turnSpeed;
      this.turnGroup.rotation.y = turn % (Math.PI * 2);

      /* Lean: pointer to the right turns the knot's face right, pointer
         below tips it down, toward the pointer either way. */
      const k = 1 - Math.pow(1 - CONFIG.leanEase, dt / (1000 / 60));
      const lean = this.leanGroup.rotation;
      lean.x += (this.pointer.ny * CONFIG.lean - lean.x) * k;
      lean.y += (this.pointer.nx * CONFIG.lean - lean.y) * k;
    }

    const opacity = Math.round(this.fade * 1000) / 1000;
    if (opacity !== this.lastOpacity) {
      this.lastOpacity = opacity;
      this.canvas.style.opacity = String(opacity);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.fade > 0 && !this.announced) {
      this.announced = true;
      this.onReady?.();
    }
  }

  private applyTheme(tokens: ThemeTokens): void {
    /* Plain hex in globals.css; a missing token falls back to the text colour. */
    this.inkMaterial.color.set(tokens.sceneWire || tokens.fg || "#1b1a17");
  }
}
