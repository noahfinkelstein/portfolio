/* ---------------------------------------------------------------------------
   TORUS SCENE — the three.js side of the hero's torus-knot field.
   Imported only by TorusField.tsx, which is itself loaded with
   next/dynamic({ ssr: false }), so three.js never reaches the server bundle
   or the page's first-load JS.

   What is on screen
     - The old site's torus knot, TorusKnotGeometry(3.5, 3.5 × 0.32, 180, 28),
       as a faint wireframe (scaled to fit the viewport).
     - 150 of its vertices, sampled evenly along the knot, as round glowing
       points.
     - Animated
       lines: every second, 15 Line2 lines between random sampled vertices,
       each starting after a random 0–0.5 s delay, growing A→B over 1 s at
       opacity 0.8 and fading out over the last 30 %; where each one lands, an
       expanding "tap" ring (0.8 s, radius ×4, fading) lies flat on the
       knot's surface.

   Motion
     - Old site: two-axis spin (0.35 rad/s on y, 0.55 × that on x), a tilt
       that eases toward the cursor (±0.5 rad, 5 % per frame) and a sine bob.
     - The camera follows the mouse (0.003 per px, rescaled to this
       scene) and a "talk" dolly pulses the camera in to 17/18 and back out
       (0.5 s wait, 1 s in, 1.5 s out).
     - Scroll: progress 0 → 1 moves the knot from the middle of the viewport
       to a fixed dock in the bottom-right corner, shrinking as it goes. The
       mouse parallax and talk dolly fade out on the way so the dock sits
       still. At 1 the canvas itself shrinks to the dock box and renders a
       crop of the same view (camera.setViewOffset), so the hand-off is
       seamless and the docked knot costs almost nothing to draw.

   Colours come from the theme tokens (--scene-*) and update live.

   Cost control: the device pixel ratio is capped at 2; line and ring
   objects are pooled and animated with transforms only (no buffer uploads,
   no allocation per frame); shaders are compiled asynchronously before the
   first frame; the owner stops the loop in a hidden tab and when the docked
   knot is hidden; reduced motion renders single static frames on demand.
   --------------------------------------------------------------------------- */

import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import type { ThemeTokens } from "@/lib/theme";

/* --- Tuning ------------------------------------------------------------------ */

export const CONFIG = {
  /** The old site's knot. */
  knot: { radius: 3.5, tube: 3.5 * 0.32, tubularSegments: 180, radialSegments: 28 },

  /** Camera: the old site's 45° field of view. */
  fov: 45,
  distance: 10,

  /** Old site motion. */
  spin: 0.35,
  spinXRatio: 0.55,
  tilt: 0.5,
  tiltEase: 0.05,
  bob: 0.15,

  /** Camera motion. */
  parallax: 0.003,
  /** Half-height (units) the parallax constant is tuned for (z = 25, fov 70). */
  parallaxHalfHeight: 25 * Math.tan((35 * Math.PI) / 180),
  talk: { waitMs: 500, inMs: 1000, outMs: 1500, factor: 17 / 18 },

  /** Sampled vertices. */
  points: 150,
  seed: 0.19144689152017236,

  /** Growing lines. */
  linesPerBatch: 15,
  batchMs: 1000,
  lineMs: 1000,
  lineDelay: 0.5,
  lineFadeFrom: 0.7,
  lineOpacity: 0.8,
  lineWidth: 3,

  /** Tap rings (radius in knot units). */
  ringMs: 800,
  ringGrow: 4,
  ringRadius: 0.22,
  ringWidth: 3,

  /** A coarser copy of the knot the wireframe crossfades to on the way to the
      dock; the full-detail mesh turns into a solid blob at 124 px. */
  dockKnot: { tubularSegments: 72, radialSegments: 7 },

  /** Look. */
  wireOpacity: 0.13,
  wireOpacityDocked: 0.3,
  pointOpacity: 0.95,
  pointOpacityDocked: 0.7,
  /** Sprite size (px) of a point in the hero, per px of knot radius. */
  pointPxPerRadius: 0.05,
  pointPxMin: 11,
  pointPxMax: 22,
  dockOpacity: 0.95,
  fadeInMs: 900,

  /** Knot radius in the hero, as a share of the viewport. */
  heroRadius: (w: number, h: number) => Math.min(w * 0.6, h * 0.46),
  /** The knot's radius in the dock, as a share of the dock box. */
  dockFill: 0.4,
} as const;

export type SceneMode = "full" | "dock";

/** The dock box in viewport CSS px. */
export type DockRect = { x: number; y: number; size: number };

export type TorusSceneOptions = {
  tokens: ThemeTokens;
  reducedMotion: boolean;
  /** Class for the canvas element the scene creates. */
  canvasClassName?: string;
  /** Called when the canvas switches between the full viewport and the dock. */
  onModeChange?: (mode: SceneMode, dock: DockRect) => void;
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

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Camera distance factor of the talk pulse at time t (ms). */
function talkFactor(t: number): number {
  const { waitMs, inMs, outMs, factor } = CONFIG.talk;
  const c = t % (waitMs + inMs + outMs);
  if (c < waitMs) return 1;
  if (c < waitMs + inMs) {
    const u = (c - waitMs) / inMs;
    return 1 - (1 - factor) * u * u * u; // power3.in
  }
  const u = (c - waitMs - inMs) / outMs;
  return factor + (1 - factor) * (1 - Math.pow(1 - u, 3)); // power3.out
}

/** Dock size and margin for a viewport width (CSS px). */
export function dockMetrics(width: number): { size: number; margin: number } {
  return width < 640 ? { size: 88, margin: 14 } : { size: 124, margin: 24 };
}

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

type LineSlot = {
  obj: Line2;
  mat: LineMaterial;
  active: boolean;
  start: number;
  delay: number;
  length: number;
  target: number;
};

type RingSlot = {
  obj: Line2;
  mat: LineMaterial;
  active: boolean;
  start: number;
};

const Z_AXIS = new THREE.Vector3(0, 0, 1);

/* --- Scene ------------------------------------------------------------------- */

export class TorusScene {
  readonly canvas: HTMLCanvasElement;

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;

  private root = new THREE.Group(); // position + scale (scroll / dock)
  private tiltGroup = new THREE.Group(); // cursor tilt + bob
  private spinGroup = new THREE.Group(); // constant two-axis spin

  private knotGeometry: THREE.TorusKnotGeometry;
  private wireMaterial: THREE.MeshBasicMaterial;
  private dockGeometry: THREE.TorusKnotGeometry;
  private dockWireMaterial: THREE.MeshBasicMaterial;
  private dockWire: THREE.Mesh;
  private pointsGeometry = new THREE.BufferGeometry();
  private pointsMaterial: THREE.ShaderMaterial;
  private lineGeometry = new LineGeometry();
  private ringGeometry = new LineGeometry();
  private lines: LineSlot[] = [];
  private rings: RingSlot[] = [];

  /** Sampled vertices and their surface normals, knot-local. */
  private vertices: THREE.Vector3[] = [];
  private normals: THREE.Vector3[] = [];
  private boundRadius = 1;

  private tokens: ThemeTokens;
  private reduced: boolean;
  private onModeChange?: TorusSceneOptions["onModeChange"];

  /* Layout, CSS px. */
  private viewW = 1;
  private viewH = 1;
  private dock: DockRect = { x: 0, y: 0, size: 124 };
  private mode: SceneMode = "full";

  /* Animated state. */
  private time = 0;
  private lastNow = 0;
  private lastBatch = -Infinity;
  private progress = 0;
  private progressTarget = 0;
  private pointer = { nx: 0, ny: 0, dx: 0, dy: 0 };
  private fade = 0;
  private hidden = false;
  private visibility = 1;
  private running = false;
  private pageVisible = true;
  private ready = false;
  private disposed = false;
  private lastOpacity = -1;
  private random = mulberry32(Math.floor(CONFIG.seed * 2 ** 32));

  constructor(host: HTMLElement, options: TorusSceneOptions) {
    this.tokens = options.tokens;
    this.reduced = options.reducedMotion;
    this.onModeChange = options.onModeChange;

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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 100);
    this.camera.position.set(0, 0, CONFIG.distance);

    /* Knot + wireframe. */
    const { radius, tube, tubularSegments, radialSegments } = CONFIG.knot;
    this.knotGeometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments);
    this.knotGeometry.computeBoundingSphere();
    this.boundRadius = this.knotGeometry.boundingSphere?.radius ?? 6.6;
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

    this.dockGeometry = new THREE.TorusKnotGeometry(
      radius,
      tube,
      CONFIG.dockKnot.tubularSegments,
      CONFIG.dockKnot.radialSegments,
    );
    this.dockWireMaterial = this.wireMaterial.clone();
    this.dockWireMaterial.opacity = 0;
    this.dockWire = new THREE.Mesh(this.dockGeometry, this.dockWireMaterial);
    this.dockWire.renderOrder = 0;
    this.dockWire.visible = false;
    this.spinGroup.add(this.dockWire);

    /* Sampled vertices: evenly along the knot, random around the tube. */
    const position = this.knotGeometry.getAttribute("position");
    const normal = this.knotGeometry.getAttribute("normal");
    const pointPositions = new Float32Array(CONFIG.points * 3);
    for (let k = 0; k < CONFIG.points; k++) {
      const i = Math.floor(((k + this.random()) / CONFIG.points) * tubularSegments);
      const j = Math.floor(this.random() * radialSegments);
      const index = i * (radialSegments + 1) + j;
      const v = new THREE.Vector3().fromBufferAttribute(position, index);
      const n = new THREE.Vector3().fromBufferAttribute(normal, index).normalize();
      this.vertices.push(v);
      this.normals.push(n);
      v.toArray(pointPositions, k * 3);
    }
    this.pointsGeometry.setAttribute("position", new THREE.BufferAttribute(pointPositions, 3));
    this.pointsMaterial = new THREE.ShaderMaterial({
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      uniforms: {
        uColor: { value: new THREE.Color() },
        uOpacity: { value: CONFIG.pointOpacity },
        uSize: { value: 14 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uDistance: { value: CONFIG.distance },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const points = new THREE.Points(this.pointsGeometry, this.pointsMaterial);
    points.frustumCulled = false;
    points.renderOrder = 2;
    this.spinGroup.add(points);

    /* Pools. A unit segment along +z, and a unit circle in the xy plane;
       each object is placed, turned and scaled per frame. */
    this.lineGeometry.setPositions([0, 0, 0, 0, 0, 1]);
    const circle: number[] = [];
    for (let s = 0; s <= 32; s++) {
      const theta = (s / 32) * Math.PI * 2;
      circle.push(Math.cos(theta), Math.sin(theta), 0);
    }
    this.ringGeometry.setPositions(circle);

    for (let i = 0; i < 40; i++) {
      const mat = this.makeLineMaterial(CONFIG.lineWidth, CONFIG.lineOpacity);
      const obj = new Line2(this.lineGeometry, mat);
      obj.visible = false;
      obj.frustumCulled = false;
      obj.renderOrder = 1;
      this.spinGroup.add(obj);
      this.lines.push({ obj, mat, active: false, start: 0, delay: 0, length: 0, target: 0 });
    }
    for (let i = 0; i < 28; i++) {
      const mat = this.makeLineMaterial(CONFIG.ringWidth, 1);
      const obj = new Line2(this.ringGeometry, mat);
      obj.visible = false;
      obj.frustumCulled = false;
      obj.renderOrder = 1;
      this.spinGroup.add(obj);
      this.rings.push({ obj, mat, active: false, start: 0 });
    }

    this.tiltGroup.add(this.spinGroup);
    this.root.add(this.tiltGroup);
    this.scene.add(this.root);

    // A pleasant resting angle for the static (reduced-motion) frame.
    this.spinGroup.rotation.set(0.5, 0.9, 0);

    this.applyTheme(this.tokens);
    this.resize();

    canvas.addEventListener("webglcontextlost", this.handleContextLost);
  }

  private makeLineMaterial(width: number, opacity: number): LineMaterial {
    return new LineMaterial({
      color: 0xffffff,
      linewidth: width,
      transparent: true,
      opacity,
      depthTest: false,
      depthWrite: false,
    });
  }

  private handleContextLost = (event: Event) => {
    event.preventDefault();
    this.stop();
    this.canvas.style.opacity = "0";
  };

  /* --- Public API ------------------------------------------------------------ */

  /** Compile shaders off the main thread where supported, then draw frame one. */
  async prepare(): Promise<void> {
    // Make one line and one ring visible so their program compiles too.
    this.lines[0].obj.visible = true;
    this.rings[0].obj.visible = true;
    try {
      await this.renderer.compileAsync(this.scene, this.camera);
    } finally {
      this.lines[0].obj.visible = false;
      this.rings[0].obj.visible = false;
    }
    if (this.disposed) return;
    this.ready = true;
    if (this.reduced) this.fade = 1;
    this.update(0);
    this.renderer.render(this.scene, this.camera);
    this.wake();
  }

  /** Viewport changed (or first layout). Reads the window size. */
  resize(): void {
    this.viewW = Math.max(1, document.documentElement.clientWidth || window.innerWidth);
    this.viewH = Math.max(1, window.innerHeight);
    const { size, margin } = dockMetrics(this.viewW);
    this.dock = {
      x: this.viewW - margin - size,
      y: this.viewH - margin - size,
      size,
    };
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(pixelRatio);
    this.pointsMaterial.uniforms.uPixelRatio.value = pixelRatio;
    this.camera.aspect = this.viewW / this.viewH;
    this.applyMode(this.mode, true);
    this.redrawIfIdle();
  }

  /** Scroll progress 0 (hero) → 1 (docked). */
  setScrollProgress(value: number): void {
    const p = clamp01(value);
    this.progressTarget = this.reduced ? (p >= 0.5 ? 1 : 0) : p;
    if (this.reduced) {
      this.progress = this.progressTarget;
      this.redrawIfIdle();
    } else {
      this.wake();
    }
  }

  setPointer(clientX: number, clientY: number): void {
    this.pointer.nx = (clientX / this.viewW) * 2 - 1;
    this.pointer.ny = (clientY / this.viewH) * 2 - 1;
    this.pointer.dx = clientX - this.viewW / 2;
    this.pointer.dy = clientY - this.viewH / 2;
  }

  setTheme(tokens: ThemeTokens): void {
    this.tokens = tokens;
    this.applyTheme(tokens);
    this.lastOpacity = -1;
    this.redrawIfIdle();
  }

  /** Hide the docked knot (e.g. over the footer). */
  setHidden(hidden: boolean): void {
    this.hidden = hidden;
    if (this.reduced) {
      this.visibility = hidden ? 0 : 1;
      this.redrawIfIdle();
    } else {
      this.wake();
    }
  }

  setReducedMotion(reduced: boolean): void {
    if (reduced === this.reduced) return;
    this.reduced = reduced;
    if (reduced) {
      this.stop();
      for (const slot of this.lines) this.releaseLine(slot);
      for (const slot of this.rings) this.releaseRing(slot);
      this.fade = 1;
      this.progress = this.progressTarget = this.progressTarget >= 0.5 ? 1 : 0;
      this.visibility = this.hidden ? 0 : 1;
      this.redrawIfIdle();
    } else {
      this.wake();
    }
  }

  get isReducedMotion(): boolean {
    return this.reduced;
  }

  /** True when the loop may stop: the docked knot is fully hidden. */
  private get isIdle(): boolean {
    return this.mode === "dock" && this.hidden && this.visibility < 0.01 && this.progressTarget >= 1;
  }

  /** For measurements: whether the frame loop is running. */
  get isRunning(): boolean {
    return this.running;
  }

  /**
   * For tests: render now and return the share of canvas pixels that are not
   * fully transparent (0–1), plus the current mode. Reads the drawing buffer
   * in the same task as the render, so it works without preserveDrawingBuffer.
   */
  debugCoverage(): { coverage: number; mode: SceneMode; width: number; height: number } {
    this.renderer.render(this.scene, this.camera);
    const gl = this.renderer.getContext();
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    let lit = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) lit++;
    return { coverage: lit / (width * height), mode: this.mode, width, height };
  }

  /** The tab is visible (the owner passes usePageVisible()). */
  setPageVisible(visible: boolean): void {
    this.pageVisible = visible;
    if (visible) this.wake();
    else this.stop();
  }

  /** Start the frame loop if anything could move. */
  private wake(): void {
    if (this.running || this.disposed || this.reduced || !this.ready || !this.pageVisible) return;
    if (this.mode === "dock" && this.hidden && this.visibility < 0.01 && this.progressTarget >= 1) return;
    this.running = true;
    this.lastNow = 0;
    this.renderer.setAnimationLoop(this.loop);
  }

  private stop(): void {
    if (!this.running) return;
    this.running = false;
    this.renderer.setAnimationLoop(null);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.stop();
    this.canvas.removeEventListener("webglcontextlost", this.handleContextLost);
    this.knotGeometry.dispose();
    this.wireMaterial.dispose();
    this.dockGeometry.dispose();
    this.dockWireMaterial.dispose();
    this.pointsGeometry.dispose();
    this.pointsMaterial.dispose();
    this.lineGeometry.dispose();
    this.ringGeometry.dispose();
    for (const slot of this.lines) slot.mat.dispose();
    for (const slot of this.rings) slot.mat.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    this.canvas.remove();
  }

  /* --- Frame ------------------------------------------------------------------- */

  private loop = (now: number) => {
    const dt = this.lastNow ? Math.min(now - this.lastNow, 50) : 16.7;
    this.lastNow = now;
    this.update(dt);
    if (this.visibility > 0.001) this.renderer.render(this.scene, this.camera);
    if (this.isIdle) this.stop();
  };

  private redrawIfIdle(): void {
    if (this.running || !this.ready || this.disposed) return;
    this.update(0);
    this.renderer.render(this.scene, this.camera);
  }

  /** Advance the animation by dt ms (0 = just lay out the current state). */
  private update(dt: number): void {
    const animate = !this.reduced && dt > 0;
    if (animate) this.time += dt;
    const seconds = dt / 1000;

    /* Scroll progress eases toward its target. */
    if (animate) {
      const k = 1 - Math.exp(-seconds * 7);
      this.progress += (this.progressTarget - this.progress) * k;
      if (Math.abs(this.progressTarget - this.progress) < 0.0005) this.progress = this.progressTarget;
      this.fade = Math.min(1, this.fade + dt / CONFIG.fadeInMs);
      const v = this.hidden ? 0 : 1;
      this.visibility += (v - this.visibility) * (1 - Math.exp(-seconds * 10));
      if (Math.abs(v - this.visibility) < 0.005) this.visibility = v;
    }

    const docked = this.progress >= 0.999;
    if (docked !== (this.mode === "dock")) this.applyMode(docked ? "dock" : "full");

    const pe = easeInOutCubic(this.progress);
    const loose = 1 - pe; // how much the free-floating motion applies

    /* Spin, tilt, bob (old site). */
    if (animate) {
      this.spinGroup.rotation.x += seconds * CONFIG.spin * CONFIG.spinXRatio;
      this.spinGroup.rotation.y += seconds * CONFIG.spin;
      const k = 1 - Math.pow(1 - CONFIG.tiltEase, dt / (1000 / 60));
      const tilt = this.tiltGroup.rotation;
      tilt.x += (this.pointer.ny * CONFIG.tilt - tilt.x) * k;
      tilt.y += (this.pointer.nx * CONFIG.tilt - tilt.y) * k;
      this.tiltGroup.position.y = Math.sin(this.time / 1000) * CONFIG.bob;
    }

    /* Camera: mouse parallax + talk dolly, fading out as it docks. */
    const halfH = CONFIG.distance * Math.tan(THREE.MathUtils.degToRad(CONFIG.fov / 2));
    const toScene = halfH / CONFIG.parallaxHalfHeight;
    if (this.reduced) {
      this.camera.position.set(0, 0, CONFIG.distance);
    } else {
      this.camera.position.x = -this.pointer.dx * CONFIG.parallax * toScene * loose;
      this.camera.position.y = -this.pointer.dy * CONFIG.parallax * toScene * loose;
      this.camera.position.z = CONFIG.distance * lerp(1, talkFactor(this.time), loose);
    }

    /* Knot placement: hero centre → dock centre. It shrinks and heads for the
       right-hand margin early (ease-out), then slides down (ease-in-out), so
       mid-way it sits beside the content rather than on top of it. */
    const po = easeOutCubic(this.progress);
    const pxPerUnit = this.viewH / (2 * halfH);
    const heroR = CONFIG.heroRadius(this.viewW, this.viewH);
    const dockR = this.dock.size * CONFIG.dockFill;
    const cx = lerp(this.viewW / 2, this.dock.x + this.dock.size / 2, po);
    const cy = lerp(this.viewH / 2, this.dock.y + this.dock.size / 2, pe);
    const radiusPx = heroR * Math.pow(dockR / heroR, po);
    const halfW = halfH * (this.viewW / this.viewH);
    this.root.position.set((cx / this.viewW) * 2 * halfW - halfW, halfH - (cy / this.viewH) * 2 * halfH, 0);
    this.root.scale.setScalar(radiusPx / pxPerUnit / this.boundRadius);

    /* Sizes follow the knot so the dock is not a blob. */
    const shrink = radiusPx / heroR;
    const pointPx = Math.min(CONFIG.pointPxMax, Math.max(CONFIG.pointPxMin, heroR * CONFIG.pointPxPerRadius));
    this.pointsMaterial.uniforms.uSize.value = pointPx * Math.pow(shrink, 0.55);
    // Detailed wireframe in the hero, coarse one in the dock.
    this.wireMaterial.opacity = CONFIG.wireOpacity * (1 - pe);
    this.dockWireMaterial.opacity = CONFIG.wireOpacityDocked * pe;
    this.dockWire.visible = pe > 0.01;
    this.pointsMaterial.uniforms.uOpacity.value = lerp(CONFIG.pointOpacity, CONFIG.pointOpacityDocked, pe);
    const lineWidth = lerp(CONFIG.lineWidth, 1.25, pe);
    const ringWidth = lerp(CONFIG.ringWidth, 1.25, pe);

    /* Lines and rings. */
    if (animate) {
      if (this.time - this.lastBatch >= CONFIG.batchMs) {
        for (let i = 0; i < CONFIG.linesPerBatch; i++) this.spawnLine();
        this.lastBatch = this.time;
      }
      for (const slot of this.lines) {
        if (!slot.active) continue;
        const elapsed = this.time - slot.start;
        if (elapsed < slot.delay) continue;
        const t = Math.min((elapsed - slot.delay) / CONFIG.lineMs, 1);
        slot.obj.visible = true;
        slot.obj.scale.z = Math.max(1e-4, slot.length * t);
        slot.mat.linewidth = lineWidth;
        slot.mat.opacity =
          t > CONFIG.lineFadeFrom
            ? CONFIG.lineOpacity * (1 - (t - CONFIG.lineFadeFrom) / (1 - CONFIG.lineFadeFrom))
            : CONFIG.lineOpacity;
        if (t >= 1) {
          this.spawnRing(slot.target);
          this.releaseLine(slot);
        }
      }
      for (const slot of this.rings) {
        if (!slot.active) continue;
        const t = Math.min((this.time - slot.start) / CONFIG.ringMs, 1);
        const r0 = CONFIG.ringRadius;
        slot.obj.scale.setScalar(r0 + (r0 * CONFIG.ringGrow - r0) * t);
        slot.mat.linewidth = ringWidth;
        slot.mat.opacity = 1 - t;
        if (t >= 1) this.releaseRing(slot);
      }
    }

    /* Canvas opacity: fade in on start, theme opacity → near-solid when docked. */
    const opacity = this.fade * this.visibility * lerp(this.tokens.sceneOpacity, CONFIG.dockOpacity, pe);
    const rounded = Math.round(opacity * 1000) / 1000;
    if (rounded !== this.lastOpacity) {
      this.lastOpacity = rounded;
      this.canvas.style.opacity = String(rounded);
    }
  }

  private spawnLine(): void {
    const slot = this.lines.find((s) => !s.active);
    if (!slot || this.vertices.length < 2) return;
    const a = Math.floor(Math.random() * this.vertices.length);
    let b = Math.floor(Math.random() * this.vertices.length);
    while (b === a) b = Math.floor(Math.random() * this.vertices.length);
    const va = this.vertices[a];
    const dir = new THREE.Vector3().subVectors(this.vertices[b], va);
    slot.length = dir.length();
    slot.obj.position.copy(va);
    slot.obj.quaternion.setFromUnitVectors(Z_AXIS, dir.normalize());
    slot.obj.scale.set(1, 1, 1e-4);
    slot.obj.visible = false;
    slot.mat.opacity = CONFIG.lineOpacity;
    slot.start = this.time;
    slot.delay = Math.random() * CONFIG.lineMs * CONFIG.lineDelay;
    slot.target = b;
    slot.active = true;
  }

  private releaseLine(slot: LineSlot): void {
    slot.active = false;
    slot.obj.visible = false;
  }

  private spawnRing(vertexIndex: number): void {
    const slot = this.rings.find((s) => !s.active);
    if (!slot) return;
    slot.obj.position.copy(this.vertices[vertexIndex]);
    slot.obj.quaternion.setFromUnitVectors(Z_AXIS, this.normals[vertexIndex]);
    slot.obj.scale.setScalar(CONFIG.ringRadius);
    slot.mat.opacity = 1;
    slot.obj.visible = true;
    slot.start = this.time;
    slot.active = true;
  }

  private releaseRing(slot: RingSlot): void {
    slot.active = false;
    slot.obj.visible = false;
  }

  /* --- Layout ------------------------------------------------------------------ */

  /**
   * Full: the canvas covers the viewport. Dock: the canvas is the dock box and
   * renders that crop of the full view, so switching is invisible.
   */
  private applyMode(mode: SceneMode, force = false): void {
    if (mode === this.mode && !force) return;
    const changed = mode !== this.mode;
    this.mode = mode;
    const style = this.canvas.style;
    let width: number;
    let height: number;
    if (mode === "dock") {
      const { x, y, size } = this.dock;
      width = height = size;
      style.left = `${x}px`;
      style.top = `${y}px`;
      this.camera.setViewOffset(this.viewW, this.viewH, x, y, size, size);
    } else {
      width = this.viewW;
      height = this.viewH;
      style.left = "0px";
      style.top = "0px";
      this.camera.clearViewOffset();
    }
    this.canvas.dataset.mode = mode;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, true);
    for (const slot of this.lines) slot.mat.resolution.set(width, height);
    for (const slot of this.rings) slot.mat.resolution.set(width, height);
    if (changed || force) this.onModeChange?.(mode, { ...this.dock });
  }

  private applyTheme(tokens: ThemeTokens): void {
    this.wireMaterial.color.set(tokens.sceneWire);
    this.dockWireMaterial.color.set(tokens.sceneWire);
    (this.pointsMaterial.uniforms.uColor.value as THREE.Color).set(tokens.scenePoint);
    for (const slot of this.lines) slot.mat.color.set(tokens.sceneLine);
    for (const slot of this.rings) slot.mat.color.set(tokens.sceneRing);
  }
}
