/* ---------------------------------------------------------------------------
   LOADER PROGRESS — how the intro loader and the hero's 3D scene talk.

   The hero reports how far its three.js init has got; the loader reveals
   "N O A H  F I N K E L S T E I N" letter by letter as that climbs, then
   fades out and marks itself done; the hero's text animation starts then.

     Hero (3D init)      reportProgress(0.3) … reportProgress(1)
     Loader overlay      useLoadProgress() → 0..1
                         finishes at progress 1 or LOADER_MAX_MS, whichever
                         is first, then calls markLoaderDone()
                         shouldSkipLoader() → true for reduced motion or a
                         repeat visit this session (call markLoaderDone()
                         right away and render nothing)
                         rememberLoaderShown() once it has played
     Hero (text)         const done = useLoaderDone();  start the scramble
                         when it turns true (it also turns true on its own
                         after `fallbackMs`, so a page without a Loader still
                         animates)

   State is module-level, so it survives client-side navigation: coming back
   to "/" from /projects does not replay the loader.
   --------------------------------------------------------------------------- */

import { useEffect, useState, useSyncExternalStore } from "react";
export const LOADER_SESSION_KEY = "nf-loader-shown";

/** Hard cap on how long the loader may stay up, in ms (fade included). */
export const LOADER_MAX_MS = 1400;

let progress = 0;
let done = false;
const progressListeners = new Set<() => void>();
const doneListeners = new Set<() => void>();

/* --- Progress --------------------------------------------------------------- */

/** Report init progress, 0–1. Never goes backwards. */
export function reportProgress(value: number): void {
  const next = Math.max(progress, Math.min(1, Math.max(0, value)));
  if (next === progress) return;
  progress = next;
  progressListeners.forEach((fn) => fn());
}

export function getProgress(): number {
  return progress;
}

export function subscribeProgress(callback: () => void): () => void {
  progressListeners.add(callback);
  return () => progressListeners.delete(callback);
}

export function useLoadProgress(): number {
  return useSyncExternalStore(subscribeProgress, getProgress, () => 0);
}

/* --- Done ------------------------------------------------------------------- */

export function markLoaderDone(): void {
  if (done) return;
  done = true;
  doneListeners.forEach((fn) => fn());
}

export function isLoaderDone(): boolean {
  return done;
}

/** Calls back once the loader is done (immediately if it already is). */
export function onLoaderDone(callback: () => void): () => void {
  if (done) {
    callback();
    return () => {};
  }
  const once = () => {
    doneListeners.delete(once);
    callback();
  };
  doneListeners.add(once);
  return () => doneListeners.delete(once);
}

function subscribeDone(callback: () => void): () => void {
  doneListeners.add(callback);
  return () => doneListeners.delete(callback);
}

/**
 * True once the loader has finished, or after `fallbackMs` if nothing ever
 * marks it done (a page or preview without a Loader).
 */
export function useLoaderDone(fallbackMs = LOADER_MAX_MS + 600): boolean {
  const isDone = useSyncExternalStore(subscribeDone, isLoaderDone, () => false);
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (isDone) return;
    const id = window.setTimeout(() => setTimedOut(true), fallbackMs);
    return () => window.clearTimeout(id);
  }, [isDone, fallbackMs]);
  return isDone || timedOut;
}

/* --- Session ---------------------------------------------------------------- */

/**
 * True when the loader should not play: reduced motion, or it already played
 * this session. The <head> script sets html[data-loader="skip"] for the same
 * conditions before first paint (globals.css hides [data-loader-overlay]).
 */
export function shouldSkipLoader(): boolean {
  if (typeof document === "undefined") return false;
  if (document.documentElement.getAttribute("data-loader") === "skip") return true;
  try {
    if (sessionStorage.getItem(LOADER_SESSION_KEY)) return true;
  } catch {
    /* storage blocked: fall through */
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Call once the loader has played so it is skipped for the rest of the
 * session (including a full reload). Safe to call before the fade finishes:
 * it only writes sessionStorage.
 */
export function rememberLoaderShown(): void {
  try {
    sessionStorage.setItem(LOADER_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}
