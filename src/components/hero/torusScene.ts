/* ---------------------------------------------------------------------------
   TORUS SCENE — the three.js side of the hero figure ("Fig. 1").
   Imported only by TorusField.tsx, which is itself loaded with
   next/dynamic({ ssr: false }), so three.js never reaches the server bundle
   or the page's first-load JS.

   What is on screen
     - A (2,3) torus knot, TorusKnotGeometry(3.5, 3.5 × 0.32, 180, 28), as a
       faint wireframe in --scene-wire, scaled to fit its box.
     - 150 of its vertices, sampled evenly along the knot and at a seeded
       random angle around the tube, as round glowing points in --scene-point.

   Motion
     - A slow two-axis spin (0.35 rad/s on y, 0.55 × that on x).
     - A tilt that eases toward the cursor (±0.5 rad; the owner passes a
       normalised pointer, -1…1 on each axis, 0 = over the knot's centre).
     - A slow sine bob.
     - One 900 ms fade-in, the first time a frame is drawn.

   The canvas is created here, inside the host the owner passes, and is sized
   by resize(width, height): the owner measures its box (ResizeObserver) and
   the scene fits the knot to it. Colours come from the theme tokens
   (--scene-*) and update live through setTheme().

   Cost control: the device pixel ratio is capped at 1.5; the renderer asks
   for the low-power GPU; shaders are compiled asynchronously before the
   first frame; the owner stops the loop when the figure is off screen or the
   tab is hidden (setActive); reduced motion draws single static frames on
   demand (theme change, resize) and never starts the loop.

   Owner API
     new TorusScene(host, { tokens, reducedMotion, canvasClassName?, onReady?, onLost? })
     prepare()                  compile, draw frame one, start if active
     resize(width, height)      the host's size in CSS px
     setPointer(nx, ny)         normalised cursor, -1…1
     setActive(bool)            in view and the tab is visible
     setTheme(tokens)           re-tint
     setReducedMotion(bool)     switch between loop and static frame
     dispose()                  release the GPU and remove the canvas
   --------------------------------------------------------------------------- */

import * as THREE from "three";
import type { ThemeTokens } from "@/lib/theme";

/* --- Tuning ------------------------------------------------------------------ */

export const CONFIG = {
  knot: { radius: 3.5, tube: 3.5 * 0.32, tubularSegments: 180, radialSegments: 28 },

  /** Camera. */
  fov: 45,
  distance: 10,

  /** Motion. */
  spin: 0.35,
  spinXRatio: 0.55,
  tilt: 0.5,
  /** Share of the remaining tilt closed per 60 Hz frame. */
  tiltEase: 0.05,
  /** Bob amplitude, as a share of the knot's bounding radius. */
  bob: 0.03,

  /** Sampled points. The seed keeps the sample the same on every visit. */
  points: 150,
  seed: 0.19144689152017236,

  /** Look. */
  wireOpacity: 0.14,
  pointOpacity: 0.95,
  /** Sprite size (px) of a point per px of knot radius, clamped. */
  pointPxPerRadius: 0.05,
  pointPxMin: 7,
  pointPxMax: 16,
  fadeInMs: 900,

  /** The knot's bounding radius as a share of the box's smaller half-side. */
  fill: 0.8,
  /** Resting angle for the first and the static frame. */
  restRotation: { x: 0.9, y: 0.55 },

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

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const POINT_VERTEX = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uDistance;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * uDistance / -mv.z;
  }
`;

const POINT_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = 1.0 - smoothstep(0.34, 0.44, d);
    float halo = 1.0 - smoothstep(0.0, 1.0, d);
    float a = max(core, halo * halo * 0.5) * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }
`;

/* --- Scene ------------------------------------------------------------------- */

export class TorusScene {
  readonly canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;

  private root = new THREE.Group(); // scale to fit the box
  private tiltGroup = new THREE.Group(); // cursor tilt + bob
  private spinGroup = new THREE.Group(); // constant two-axis spin

  private knotGeometry: THREE.TorusKnotGeometry;
  private wireMaterial: THREE.MeshBasicMaterial;
  private pointsGeometry = new THREE.BufferGeometry();
  private pointsMaterial: THREE.ShaderMaterial;
  private boundRadius = 1;

  private tokens: ThemeTokens;
  private reduced: boolean;
  private onReady?: () => void;
  private onLost?: () => void;

  /* Animated state. */
  private time = 0;
  private lastNow = 0;
  private pointer = { nx: 0, ny: 0 };
  private fade = 0;
  private running = false;
  private active = true;
  private ready = false;
  private announced = false;
  private disposed = false;
  private lastOpacity = -1;

  constructor(host: HTMLElement, options: TorusSceneOptions) {
    this.tokens = options.tokens;
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

    /* The knot, as a wireframe. */
    const { radius, tube, tubularSegments, radialSegments } = CONFIG.knot;
    this.knotGeometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments);
    this.knotGeometry.computeBoundingSphere();
    this.boundRadius = this.knotGeometry.boundingSphere?.radius ?? radius + tube;
    this.wireMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      transparent: true,
      opacity: CONFIG.wireOpacity,
      depthTest: false,
      depthWrite: false,
    });
    const wire = new THREE.Mesh(this.knotGeometry, this.wireMaterial);
    wire.renderOrder = 0;
    this.spinGroup.add(wire);

    /* Sampled vertices: evenly along the knot, seeded random around the tube. */
    const random = mulberry32(Math.floor(CONFIG.seed * 2 ** 32));
    const position = this.knotGeometry.getAttribute("position");
    const pointPositions = new Float32Array(CONFIG.points * 3);
    for (let k = 0; k < CONFIG.points; k++) {
      const i = Math.floor(((k + random()) / CONFIG.points) * tubularSegments);
      const j = Math.floor(random() * radialSegments);
      const index = i * (radialSegments + 1) + j;
      pointPositions[k * 3] = position.getX(index);
      pointPositions[k * 3 + 1] = position.getY(index);
      pointPositions[k * 3 + 2] = position.getZ(index);
    }
    this.pointsGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    this.pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color() },
        uOpacity: { value: CONFIG.pointOpacity },
        uSize: { value: CONFIG.pointPxMin },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uDistance: { value: CONFIG.distance },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    points.frustumCulled = false;
    points.renderOrder = 1;
    this.spinGroup.add(points);

    this.tiltGroup.add(this.spinGroup);
    this.root.add(this.tiltGroup);
    this.scene.add(this.root);
    this.spinGroup.rotation.set(CONFIG.restRotation.x, CONFIG.restRotation.y, 0);

    this.applyTheme(this.tokens);
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
    await this.renderer.compileAsync(this.scene, this.camera);
    if (this.disposed) return;
    this.ready = true;
    if (this.reduced) this.fade = 1;
    this.draw(0);
    this.wake();
  }

  /** The host's size changed (or first layout). CSS px. */
  resize(width: number, height: number): void {
    const w = Math.max(1, Math.round(width));
    const h = Math.max(1, Math.round(height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, CONFIG.maxPixelRatio);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(w, h, false);
    this.pointsMaterial.uniforms.uPixelRatio.value = pixelRatio;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    /* Fit the knot: its bounding radius spans `fill` of the shorter half-side
       at the knot's own depth. */
    const halfH = CONFIG.distance * Math.tan(THREE.MathUtils.degToRad(CONFIG.fov / 2));
    const halfW = halfH * this.camera.aspect;
    const fitUnits = CONFIG.fill * Math.min(halfW, halfH);
    this.root.scale.setScalar(fitUnits / this.boundRadius);
    const radiusPx = fitUnits * (h / (2 * halfH));
    this.pointsMaterial.uniforms.uSize.value = clamp(
      radiusPx * CONFIG.pointPxPerRadius,
      CONFIG.pointPxMin,
      CONFIG.pointPxMax,
    );
    this.redrawIfIdle();
  }

  /** Normalised cursor: -1…1 on each axis, 0 over the knot's centre. */
  setPointer(nx: number, ny: number): void {
    this.pointer.nx = clamp(nx, -1, 1);
    this.pointer.ny = clamp(ny, -1, 1);
  }

  setTheme(tokens: ThemeTokens): void {
    this.tokens = tokens;
    this.applyTheme(tokens);
    this.lastOpacity = -1;
    this.redrawIfIdle();
  }

  /** In view and the tab is visible: the loop runs only then. */
  setActive(active: boolean): void {
    this.active = active;
    if (active) this.wake();
    else this.stop();
  }

  setReducedMotion(reduced: boolean): void {
    if (reduced === this.reduced) return;
    this.reduced = reduced;
    if (reduced) {
      this.stop();
      this.fade = 1;
      this.tiltGroup.rotation.set(0, 0, 0);
      this.tiltGroup.position.y = 0;
      this.spinGroup.rotation.set(CONFIG.restRotation.x, CONFIG.restRotation.y, 0);
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
    this.knotGeometry.dispose();
    this.wireMaterial.dispose();
    this.pointsGeometry.dispose();
    this.pointsMaterial.dispose();
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
    const animate = !this.reduced && dt > 0;
    if (animate) {
      this.time += dt;
      const seconds = dt / 1000;
      this.fade = Math.min(1, this.fade + dt / CONFIG.fadeInMs);

      this.spinGroup.rotation.x += seconds * CONFIG.spin * CONFIG.spinXRatio;
      this.spinGroup.rotation.y += seconds * CONFIG.spin;

      const k = 1 - Math.pow(1 - CONFIG.tiltEase, dt / (1000 / 60));
      const tilt = this.tiltGroup.rotation;
      tilt.x += (this.pointer.ny * CONFIG.tilt - tilt.x) * k;
      tilt.y += (this.pointer.nx * CONFIG.tilt - tilt.y) * k;
      this.tiltGroup.position.y = Math.sin(this.time / 1000) * CONFIG.bob * this.boundRadius;
    }

    const opacity = Math.round(this.fade * this.tokens.sceneOpacity * 1000) / 1000;
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
    this.wireMaterial.color.set(tokens.sceneWire);
    (this.pointsMaterial.uniforms.uColor.value as THREE.Color).set(tokens.scenePoint);
  }
}
