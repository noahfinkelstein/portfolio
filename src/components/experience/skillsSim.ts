/* ---------------------------------------------------------------------------
   The skills physics box: a matter-js world of skill "chips" (logo + name)
   drawn on a 2D canvas by our own render loop.

   Framework-free; SkillsPhysics.tsx creates it once matter-js has been
   dynamically imported and drives it:

     const sim = createSkillsSim({ Matter, canvas, box, skills, tokens, fontFamily });
     sim.setRunning(inViewAndTabVisible);   // the loop only runs while true
     sim.toss();                            // random kick to every chip
     sim.setTokens(tokens);                 // re-tint on theme change
     sim.destroy();

   Chips have a "keel" (see KEEL): they tumble, but come to rest upright more
   often than not, so the labels stay readable.

   Why not Matter.Render / Matter.Mouse:
     - Render has no DPR cap and no way to re-tint sprites per theme.
     - Mouse swallows wheel events and blocks page scrolling on touch screens
       anywhere over the canvas. Here a touch only stops the page scrolling
       when it lands on a chip; swipes on empty space scroll the page.

   Units: the world is in CSS pixels; the canvas backing store is DPR × that,
   DPR capped at 2.
   --------------------------------------------------------------------------- */

import type * as MatterNS from "matter-js";
import type { ResolvedSkill } from "@/lib/icons";
import type { ThemeTokens } from "@/lib/theme";
import { logoColor, mix } from "./color";

type MatterModule = typeof MatterNS;
type Body = MatterNS.Body;
type Constraint = MatterNS.Constraint;

export type SkillsSim = {
  setRunning(running: boolean): void;
  toss(): void;
  setTokens(tokens: ThemeTokens): void;
  destroy(): void;
};

export type SkillsSimOptions = {
  Matter: MatterModule;
  canvas: HTMLCanvasElement;
  /** The element whose content box the world fills (the canvas covers it). */
  box: HTMLElement;
  skills: ResolvedSkill[];
  tokens: ThemeTokens;
  /** Resolved CSS font-family for the chip labels (Montserrat from next/font). */
  fontFamily: string;
};

/* Chip geometry, in CSS px. "compact" is used when the box is narrow. */
type Size = { h: number; icon: number; font: number; padL: number; gap: number; padR: number };
const SIZES: Record<"regular" | "compact", Size> = {
  regular: { h: 46, icon: 22, font: 15, padL: 13, gap: 9, padR: 17 },
  compact: { h: 36, icon: 17, font: 12.5, padL: 10, gap: 7, padR: 13 },
};
const COMPACT_BELOW = 480;
const WALL = 400; // wall thickness; thick so a fast chip cannot tunnel through
const STEP = 1000 / 60;
/* A weighted keel: a small torque toward upright (−sin θ), so chips still
   tumble when tossed but tend to come to rest with their labels readable.
   Upside down is an unstable balance point, upright the stable one. */
const KEEL = 1.2e-5;

type Chip = {
  body: Body;
  skill: ResolvedSkill;
  w: number;
  h: number;
  sprite: HTMLCanvasElement;
};

export function createSkillsSim(opts: SkillsSimOptions): SkillsSim {
  const { Matter, canvas, box, skills, fontFamily } = opts;
  const { Engine, Bodies, Body, Composite, Constraint: C, Query, Sleeping } = Matter;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");

  let tokens = opts.tokens;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let sizeKey: keyof typeof SIZES = "regular";
  let chips: Chip[] = [];
  let walls: Body[] = [];

  let running = false;
  let raf = 0;
  let last = 0;
  let acc = 0;
  let idle = false;
  let destroyed = false;

  const engine = Engine.create({ enableSleeping: true });
  engine.gravity.y = 1;

  /* --- Sprites --------------------------------------------------------------- */

  const labelFont = (s: Size) => `700 ${s.font}px ${fontFamily}`;

  function measureChip(skill: ResolvedSkill, s: Size): number {
    ctx!.font = labelFont(s);
    const tw = ctx!.measureText(skill.name).width;
    return Math.ceil(s.padL + s.icon + s.gap + tw + s.padR);
  }

  function drawSprite(sprite: HTMLCanvasElement, skill: ResolvedSkill, w: number, s: Size): void {
    sprite.width = Math.ceil(w * dpr);
    sprite.height = Math.ceil(s.h * dpr);
    const g = sprite.getContext("2d");
    if (!g) return;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, s.h);

    const surface = tokens.bg3;
    const r = (s.h - 1) / 2;
    g.beginPath();
    g.roundRect(0.5, 0.5, w - 1, s.h - 1, r);
    g.fillStyle = surface;
    g.fill();
    g.lineWidth = 1;
    g.strokeStyle = mix(surface, tokens.fg, tokens.isDark ? 0.16 : 0.22);
    g.stroke();

    g.save();
    g.translate(s.padL, (s.h - s.icon) / 2);
    g.scale(s.icon / 24, s.icon / 24);
    g.fillStyle = logoColor(skill, { surface, fg: tokens.fg, isDark: tokens.isDark });
    g.fill(new Path2D(skill.path));
    g.restore();

    g.font = labelFont(s);
    g.textBaseline = "middle";
    g.fillStyle = tokens.fg;
    g.fillText(skill.name, s.padL + s.icon + s.gap, s.h / 2 + 0.5);
  }

  /* --- World ----------------------------------------------------------------- */

  function buildWalls(): void {
    if (walls.length) Composite.remove(engine.world, walls);
    const o = { isStatic: true, label: "wall", friction: 0.3 };
    walls = [
      Bodies.rectangle(width / 2, height + WALL / 2, width + WALL * 2, WALL, o), // floor
      Bodies.rectangle(width / 2, -WALL / 2, width + WALL * 2, WALL, o), // ceiling
      Bodies.rectangle(-WALL / 2, height / 2, WALL, height + WALL * 2, o), // left
      Bodies.rectangle(width + WALL / 2, height / 2, WALL, height + WALL * 2, o), // right
    ];
    Composite.add(engine.world, walls);
  }

  /** Lay the chips out in rows from the top (shuffled) and let gravity take it. */
  function buildChips(): void {
    if (chips.length) Composite.remove(engine.world, chips.map((c) => c.body));
    const s = SIZES[sizeKey];
    const order = [...skills].sort(() => Math.random() - 0.5);
    const margin = 8;
    let x = margin + Math.random() * 24;
    let y = margin + s.h / 2;
    chips = order.map((skill) => {
      const w = Math.min(measureChip(skill, s), width - margin * 2);
      if (x + w > width - margin) {
        x = margin + Math.random() * 24;
        y += s.h + 6;
      }
      const body = Bodies.rectangle(x + w / 2, Math.min(y, height - s.h / 2), w, s.h, {
        chamfer: { radius: s.h / 2 - 1 },
        restitution: 0.35,
        friction: 0.08,
        frictionAir: 0.012,
        density: 0.0015,
        angle: (Math.random() - 0.5) * 0.3,
        label: skill.slug,
      });
      x += w + 6;
      const sprite = document.createElement("canvas");
      drawSprite(sprite, skill, w, s);
      return { body, skill, w, h: s.h, sprite };
    });
    Composite.add(
      engine.world,
      chips.map((c) => c.body),
    );
  }

  function redrawSprites(): void {
    const s = SIZES[sizeKey];
    for (const c of chips) drawSprite(c.sprite, c.skill, c.w, s);
  }

  /** Put anything that escaped (a hard drag, a resize) back inside. */
  function containChips(): void {
    for (const { body, w, h } of chips) {
      const r = Math.min(w, h) / 2;
      const x = Math.min(Math.max(body.position.x, r), Math.max(r, width - r));
      const y = Math.min(Math.max(body.position.y, r), Math.max(r, height - r));
      if (x !== body.position.x || y !== body.position.y) {
        Body.setPosition(body, { x, y });
        Body.setVelocity(body, { x: 0, y: 0 });
      }
    }
  }

  /* --- Size ------------------------------------------------------------------ */

  function measure(): boolean {
    const w = Math.round(box.clientWidth);
    const h = Math.round(box.clientHeight);
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    if (w === width && h === height && nextDpr === dpr) return false;
    width = w;
    height = h;
    dpr = nextDpr;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    return true;
  }

  function onResize(): void {
    const prevKey = sizeKey;
    const prevDpr = dpr;
    if (!measure() || width === 0 || height === 0) return;
    sizeKey = width < COMPACT_BELOW ? "compact" : "regular";
    buildWalls();
    if (sizeKey !== prevKey || chips.length === 0) {
      buildChips();
    } else {
      if (dpr !== prevDpr) redrawSprites();
      containChips();
      for (const c of chips) Sleeping.set(c.body, false);
    }
    wake();
    draw();
  }

  /* --- Drag ------------------------------------------------------------------ */

  let drag: { pointerId: number; constraint: Constraint; body: Body } | null = null;

  function local(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.min(Math.max(e.clientX - rect.left, 0), width),
      y: Math.min(Math.max(e.clientY - rect.top, 0), height),
    };
  }

  function chipAt(p: { x: number; y: number }): Body | undefined {
    const hits = Query.point(
      chips.map((c) => c.body),
      p,
    );
    return hits[hits.length - 1];
  }

  function onPointerDown(e: PointerEvent): void {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (drag) return;
    const p = local(e);
    const body = chipAt(p);
    if (!body) return;
    e.preventDefault();
    const constraint = C.create({
      pointA: { x: p.x, y: p.y },
      bodyB: body,
      pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
      length: 0.01,
      stiffness: 0.12,
      damping: 0.05,
    });
    Composite.add(engine.world, constraint);
    Sleeping.set(body, false);
    drag = { pointerId: e.pointerId, constraint, body };
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* the pointer may already be gone */
    }
    canvas.style.cursor = "grabbing";
    wake();
  }

  function onPointerMove(e: PointerEvent): void {
    const p = local(e);
    if (drag && e.pointerId === drag.pointerId) {
      drag.constraint.pointA = p;
      Sleeping.set(drag.body, false);
      wake();
      return;
    }
    if (e.pointerType === "mouse") canvas.style.cursor = chipAt(p) ? "grab" : "";
  }

  function endDrag(e?: PointerEvent): void {
    if (!drag || (e && e.pointerId !== drag.pointerId)) return;
    Composite.remove(engine.world, drag.constraint);
    try {
      canvas.releasePointerCapture(drag.pointerId);
    } catch {
      /* already released */
    }
    drag = null;
    canvas.style.cursor = "";
    wake();
  }

  /* Touch: stop the page from scrolling only when the finger lands on a chip. */
  function onTouchStart(e: TouchEvent): void {
    const t = e.touches[0];
    if (e.touches.length === 1 && t && chipAt(local(t))) e.preventDefault();
  }
  function onTouchMove(e: TouchEvent): void {
    if (drag) e.preventDefault();
  }

  const onUp = (e: PointerEvent) => endDrag(e);
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("lostpointercapture", onUp);
  canvas.addEventListener("touchstart", onTouchStart, { passive: false });
  canvas.addEventListener("touchmove", onTouchMove, { passive: false });

  /* --- Loop ------------------------------------------------------------------ */

  function draw(): void {
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);
    for (const c of chips) {
      const { position, angle } = c.body;
      ctx!.save();
      ctx!.translate(position.x, position.y);
      ctx!.rotate(angle);
      if (drag && drag.body === c.body) {
        ctx!.shadowColor = tokens.accent;
        ctx!.shadowBlur = 18;
      }
      ctx!.drawImage(c.sprite, -c.w / 2, -c.h / 2, c.w, c.h);
      ctx!.restore();
    }
  }

  function allAsleep(): boolean {
    return !drag && chips.every((c) => c.body.isSleeping);
  }

  function frame(now: number): void {
    raf = 0;
    if (!running || destroyed) return;
    const dt = Math.min(now - (last || now), 50);
    last = now;
    acc += dt;
    let steps = 0;
    while (acc >= STEP && steps < 3) {
      for (const { body } of chips) {
        if (body.isSleeping || (drag && drag.body === body)) continue;
        body.torque -= KEEL * Math.sin(body.angle) * body.inertia;
      }
      Engine.update(engine, STEP);
      acc -= STEP;
      steps++;
    }
    if (steps === 3) acc = 0;
    containChips();
    draw();
    // Everything has settled: stop until something wakes it (drag, toss, resize).
    if (allAsleep()) {
      idle = true;
      return;
    }
    raf = requestAnimationFrame(frame);
  }

  function wake(): void {
    idle = false;
    if (running && !raf && !destroyed) {
      last = 0;
      acc = STEP; // step on the first frame
      raf = requestAnimationFrame(frame);
    }
  }

  /* --- Setup ----------------------------------------------------------------- */

  const ro = new ResizeObserver(() => onResize());
  ro.observe(box);
  onResize();

  return {
    setRunning(next) {
      running = next;
      if (next) {
        if (!idle || !allAsleep()) wake();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    toss() {
      const kx = Math.max(width, 240) / 55;
      const ky = Math.max(height, 240) / 55;
      for (const { body } of chips) {
        Sleeping.set(body, false);
        const sx = Math.random() < 0.5 ? -1 : 1;
        const sy = Math.random() < 0.65 ? -1 : 1; // mostly upward
        Body.setVelocity(body, {
          x: sx * kx * (0.4 + Math.random() * 0.6),
          y: sy * ky * (0.5 + Math.random() * 0.5),
        });
        Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.24);
      }
      wake();
    },
    setTokens(next) {
      tokens = next;
      redrawSprites();
      draw();
    },
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("lostpointercapture", onUp);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.style.cursor = "";
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      chips = [];
      walls = [];
    },
  };
}
