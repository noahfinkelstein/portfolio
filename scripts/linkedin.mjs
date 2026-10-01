#!/usr/bin/env node
/* ===========================================================================
   LinkedIn posts → src/content/linkedin-posts.json

   The site shows your LinkedIn posts in "Latest" on the home page and on the
   Writing page. It never calls LinkedIn itself: this script fetches a post
   once and caches its text, date and preview image in the repo.

   USAGE  (npm run linkedin -- <command> …, or node scripts/linkedin.mjs …)

     add <post>             Add one post. <post> can be any post link:
                              https://www.linkedin.com/posts/you_words-activity-7234…-AbCd
                              https://www.linkedin.com/feed/update/urn:li:activity:7234…/
                              https://www.linkedin.com/embed/feed/update/urn:li:share:7234…
                              https://lnkd.in/abc123
                              urn:li:activity:7234…   or just the number 7234…
        --no-image            don't save a preview image
        --remote-image        store LinkedIn's image URL instead of downloading it
                              (not recommended: those links are signed and expire)
        --text "…"            use this text instead of the fetched text
        --date YYYY-MM-DD     use this date instead of the one in the post id
        --force               replace the entry if the post is already there
        --dry-run             print the entry, change nothing

     import <Shares.csv>    Add every post from a LinkedIn data export
                            (Settings → Data privacy → Get a copy of your data →
                            "Posts"; the file is Shares.csv). Only public posts
                            with text are imported unless you pass --all.
        --no-fetch            use only the CSV (no images; nothing requested
                              from linkedin.com)
        --since YYYY-MM-DD    skip older posts
        --all                 include non-public posts and reshares without text
        --force, --dry-run    as above

     list                   Show the cached posts, newest first.
     remove <id>            Remove a post (and its downloaded image).

   WHAT IT STORES (one object per post, newest first):
     { "url", "id", "date": "YYYY-MM-DD", "text", "image"?: "/linkedin/<id>.jpg",
       "urn"?: "share" | "ugcPost" }       // urn only when id is not an activity id

   HOW: it requests LinkedIn's public embed page for the post
   (https://www.linkedin.com/embed/feed/update/urn:li:activity:<id>) with a
   normal browser user agent and reads og:description (the text), og:image
   and og:title, falling back to the post body on the page. The date comes
   from the id itself: LinkedIn ids carry their creation time in the top
   bits, new Date(Number(BigInt(id) >> 22n)). Images are saved to
   public/linkedin/<id>.<ext>. Posts are de-duplicated by id.

   Only public posts can be fetched; for anything else, add it by hand or
   pass --text (and --date if you want).
   =========================================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const JSON_PATH = path.join(ROOT, "src", "content", "linkedin-posts.json");
const IMAGE_DIR = path.join(ROOT, "public", "linkedin");
const IMAGE_URL_PREFIX = "/linkedin/";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const FETCH_TIMEOUT_MS = 20_000;
const IMPORT_DELAY_MS = 1500;

/* --- Arguments -------------------------------------------------------------- */

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const [key, inline] = arg.slice(2).split("=", 2);
      if (["text", "date", "since"].includes(key)) {
        const value = inline ?? argv[++i];
        if (value === undefined) fail(`--${key} needs a value`);
        flags[key] = value;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

function fail(message) {
  console.error(`linkedin: ${message}`);
  process.exit(1);
}

/* --- Post references ----------------------------------------------------------- */

const URN_KINDS = ["activity", "share", "ugcPost"];

/** Any post link / URN / bare id → { kind, id }. Returns null if none found. */
export function parsePostRef(input) {
  let s = String(input).trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    /* keep as is */
  }
  if (/^\d{15,22}$/.test(s)) return { kind: "activity", id: s };
  const urn = /urn:li:(activity|share|ugcPost):(\d{15,22})/i.exec(s);
  if (urn) return { kind: normalizeKind(urn[1]), id: urn[2] };
  // /posts/<slug>_<words>-activity-7054…-iH3M  (also -share- / -ugcPost-)
  const slug = /[-_/](activity|share|ugcPost)[-:](\d{15,22})(?!\d)/i.exec(s);
  if (slug) return { kind: normalizeKind(slug[1]), id: slug[2] };
  return null;
}

function normalizeKind(kind) {
  return URN_KINDS.find((k) => k.toLowerCase() === kind.toLowerCase()) ?? "activity";
}

/** LinkedIn ids are time-ordered: the top bits are milliseconds since 1970. */
export function dateFromId(id) {
  try {
    const ms = Number(BigInt(id) >> 22n);
    const date = new Date(ms);
    const year = date.getUTCFullYear();
    if (!Number.isFinite(ms) || year < 2003 || year > new Date().getUTCFullYear() + 1) return "";
    return date.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

/** A clean link to the post: the input without tracking junk, or a URN link. */
function canonicalUrl(input, ref) {
  try {
    const u = new URL(String(input).trim());
    if (/(^|\.)linkedin\.com$/i.test(u.hostname) && /^\/(posts|feed\/update)\//.test(u.pathname)) {
      return `https://www.linkedin.com${u.pathname}`;
    }
  } catch {
    /* not a URL */
  }
  return `https://www.linkedin.com/feed/update/urn:li:${ref.kind}:${ref.id}/`;
}

function embedUrl(ref) {
  return `https://www.linkedin.com/embed/feed/update/urn:li:${ref.kind}:${ref.id}`;
}

/* --- HTTP ------------------------------------------------------------------------ */

async function get(url, { accept = "text/html,application/xhtml+xml,*/*;q=0.8" } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "en-US,en;q=0.9" },
    });
  } finally {
    clearTimeout(timer);
  }
}

/** lnkd.in short links: follow the redirect (or read the interstitial page). */
async function resolveShortLink(input) {
  let u;
  try {
    u = new URL(input);
  } catch {
    return input;
  }
  if (!/^(www\.)?lnkd\.in$/i.test(u.hostname)) return input;
  const res = await get(input);
  if (parsePostRef(res.url)) return res.url;
  const body = await res.text();
  const found = /https:\/\/www\.linkedin\.com\/(?:posts|feed\/update)\/[^"'<>\s]+/.exec(body);
  return found ? decodeEntities(found[0]) : input;
}

/* --- HTML parsing ------------------------------------------------------------------ */

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", hellip: "…", mdash: "—", ndash: "–", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“" };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return NAMED_ENTITIES[e.toLowerCase()] ?? m;
  });
}

function metaTags(html) {
  const out = {};
  // Attribute-aware, so a ">" inside a quoted content="…" does not end the tag.
  const tagRe = /<meta\b(?:\s+[a-z:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*\s*\/?>/gi;
  for (const [tag] of html.matchAll(tagRe)) {
    const attrs = {};
    for (const [, name, , dq, sq] of tag.matchAll(/([a-z:-]+)\s*=\s*("([\s\S]*?)"|'([\s\S]*?)')/gi)) {
      attrs[name.toLowerCase()] = decodeEntities(dq ?? sq ?? "");
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content !== undefined && !(key in out)) out[key] = attrs.content;
  }
  return out;
}

function htmlToText(html) {
  return decodeEntities(html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""));
}

function normalizeText(s) {
  return String(s ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/ /g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** "Post title… | Name" → "Post title…" */
function stripTitleSuffix(title) {
  return title.replace(/\s+\|\s+[^|]+$/, "").trim();
}

/** Post media, not the author's avatar or LinkedIn's generic logo. */
function pickImage(html, meta) {
  const og = meta["og:image"] || "";
  const urls = Array.from(html.matchAll(/https:\/\/media\.licdn\.com\/dms\/image\/[^"'\s<>)]+/g), (m) =>
    decodeEntities(m[0]),
  );
  const isMedia = (u) => /media\.licdn\.com\/dms\/image\//.test(u) && !/profile-displayphoto|company-logo|profile-framedphoto/.test(u);
  if (isMedia(og)) return og;
  const rank = ["videocover", "feedshare", "articleshare", "image-shrink"];
  for (const key of rank) {
    const hit = urls.find((u) => isMedia(u) && u.includes(key));
    if (hit) return hit;
  }
  // og:image as a last resort, unless it is LinkedIn's static placeholder.
  if (og && !/static\.licdn\.com/.test(og)) return og;
  return "";
}

function parsePostPage(html) {
  const meta = metaTags(html);
  const commentaryHtml =
    /data-test-id="main-feed-activity(?:-embed)?-card__commentary"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1] ?? "";
  const commentary = normalizeText(htmlToText(commentaryHtml));
  const description = normalizeText(meta["og:description"] || meta["description"] || "");
  let articleBody = "";
  const ld = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)?.[1];
  if (ld) {
    try {
      const data = JSON.parse(ld);
      if (typeof data.articleBody === "string") articleBody = normalizeText(data.articleBody);
    } catch {
      /* ignore */
    }
  }
  // The longest of the three is the least truncated.
  const text = [description, commentary, articleBody].sort((a, b) => b.length - a.length)[0] || "";
  const activity =
    /urn:li:activity:(\d{15,22})/.exec(meta["og:url"] || "")?.[1] ??
    /data-entity-urn="urn:li:activity:(\d{15,22})"/.exec(html)?.[1] ??
    "";
  return {
    text,
    title: stripTitleSuffix(meta["og:title"] || ""),
    image: pickImage(html, meta),
    activityId: activity,
  };
}

async function fetchPost(ref, originalInput) {
  const res = await get(embedUrl(ref));
  if (!res.ok) throw new Error(`LinkedIn answered ${res.status} for ${embedUrl(ref)} (is the post public?)`);
  const page = parsePostPage(await res.text());
  // Some embeds carry no text; a public /posts/ link has it in its meta tags.
  if (!page.text && /linkedin\.com\/posts\//.test(originalInput ?? "")) {
    const res2 = await get(String(originalInput).trim());
    if (res2.ok) {
      const page2 = parsePostPage(await res2.text());
      page.text = page2.text;
      page.image ||= page2.image;
    }
  }
  if (!page.text && page.title) page.text = page.title;
  return page;
}

/* --- Images --------------------------------------------------------------------- */

const EXT = { "image/jpeg": "jpg", "image/jpg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

async function downloadImage(url, id) {
  const res = await get(url, { accept: "image/avif,image/webp,image/*,*/*;q=0.8" });
  if (!res.ok) throw new Error(`image request failed (${res.status})`);
  const type = (res.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = EXT[type];
  if (!ext) throw new Error(`not an image (${type || "unknown type"})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  for (const old of listImages(id)) fs.rmSync(path.join(IMAGE_DIR, old));
  const file = `${id}.${ext}`;
  fs.writeFileSync(path.join(IMAGE_DIR, file), bytes);
  if (bytes.length > 600_000) {
    console.warn(`  note: ${file} is ${(bytes.length / 1e6).toFixed(1)} MB; consider shrinking it.`);
  }
  return IMAGE_URL_PREFIX + file;
}

function listImages(id) {
  if (!fs.existsSync(IMAGE_DIR)) return [];
  return fs.readdirSync(IMAGE_DIR).filter((f) => f.startsWith(`${id}.`));
}

/* --- JSON store ----------------------------------------------------------------- */

function readPosts() {
  if (!fs.existsSync(JSON_PATH)) return [];
  const raw = fs.readFileSync(JSON_PATH, "utf8").trim();
  if (!raw) return [];
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) fail(`${path.relative(ROOT, JSON_PATH)} is not a JSON array`);
  return data;
}

function writePosts(posts) {
  const sorted = [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.id).localeCompare(String(a.id)));
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

function entry({ url, id, date, text, image, kind }) {
  const e = { url, id, date, text };
  if (image) e.image = image;
  if (kind && kind !== "activity") e.urn = kind;
  return e;
}

/* --- Commands ------------------------------------------------------------------- */

async function buildEntry(input, flags) {
  if (flags.date && !/^\d{4}-\d{2}-\d{2}$/.test(flags.date)) fail("--date must be YYYY-MM-DD");
  const resolved = await resolveShortLink(input);
  const ref0 = parsePostRef(resolved);
  if (!ref0) fail(`could not find a post id in "${input}"`);

  let ref = ref0;
  let page = { text: "", image: "", activityId: "", title: "" };
  const needFetch = !flags.text || !flags["no-image"];
  if (needFetch) {
    try {
      page = await fetchPost(ref0, resolved);
    } catch (err) {
      if (!flags.text) fail(`${err.message}\n  Pass --text "…" to add it anyway.`);
      console.warn(`  warning: ${err.message}`);
    }
  }
  // Prefer the activity id: it is what LinkedIn's embed and share links use.
  if (ref0.kind !== "activity" && page.activityId) ref = { kind: "activity", id: page.activityId };

  const text = normalizeText(flags.text ?? page.text);
  if (!text) fail("the post has no text (is it public?). Pass --text \"…\" to add it anyway.");
  const date = flags.date || dateFromId(ref.id) || dateFromId(ref0.id);

  let image = "";
  if (!flags["no-image"] && page.image) {
    if (flags["remote-image"] || flags["dry-run"]) {
      image = page.image;
    } else {
      try {
        image = await downloadImage(page.image, ref.id);
      } catch (err) {
        console.warn(`  warning: image not saved (${err.message})`);
      }
    }
  }

  const url = ref0.kind === ref.kind ? canonicalUrl(resolved, ref) : `https://www.linkedin.com/feed/update/urn:li:activity:${ref.id}/`;
  return { ref, ids: new Set([ref0.id, ref.id]), entry: entry({ url, id: ref.id, date, text, image, kind: ref.kind }) };
}

async function cmdAdd(input, flags) {
  if (!input) fail("usage: add <post link, urn or id>");
  const posts = readPosts();
  const probe = parsePostRef(input);
  if (probe && !flags.force && posts.some((p) => p.id === probe.id)) {
    console.log(`Already there: ${probe.id} (use --force to refresh it).`);
    return;
  }
  const { ids, entry: e } = await buildEntry(input, flags);
  const existing = posts.findIndex((p) => ids.has(p.id));
  if (existing >= 0 && !flags.force) {
    console.log(`Already there: ${e.id} (use --force to refresh it).`);
    return;
  }
  if (flags["dry-run"]) {
    console.log(JSON.stringify(e, null, 2));
    return;
  }
  if (existing >= 0) posts.splice(existing, 1, e);
  else posts.push(e);
  writePosts(posts);
  console.log(`${existing >= 0 ? "Updated" : "Added"} ${e.id} (${e.date})${e.image ? ` with image ${e.image}` : ""}`);
  console.log(`  "${preview(e.text, 90)}"`);
}

/** RFC 4180 CSV: quoted fields, "" escapes, commas and newlines inside quotes, CRLF. */
export function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"' && field === "") {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
}

/** LinkedIn's export text format: hashtags and mentions as markup. */
function cleanCommentary(raw) {
  let s = normalizeText(raw)
    .replace(/\{hashtag\|\\?#\|([^}]+)\}/g, "#$1")
    .replace(/@\[([^\]]+)\]\(urn:li:[^)]+\)/g, "$1");
  // Some exports wrap every line in quotes; unwrap only if all of them are.
  const lines = s.split("\n").filter((l) => l.trim() !== "");
  if (lines.length > 1 && lines.every((l) => /^".*"$/.test(l.trim()))) {
    s = s
      .split("\n")
      .map((l) => l.trim().replace(/^"(.*)"$/, "$1"))
      .join("\n");
  }
  return normalizeText(s);
}

async function cmdImport(file, flags) {
  if (!file) fail("usage: import <Shares.csv>");
  if (!fs.existsSync(file)) fail(`no such file: ${file}`);
  if (flags.since && !/^\d{4}-\d{2}-\d{2}$/.test(flags.since)) fail("--since must be YYYY-MM-DD");
  const rows = parseCSV(fs.readFileSync(file, "utf8"));
  if (rows.length < 2) fail("the CSV has no rows");
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const col = (name) => header.indexOf(name.toLowerCase());
  const iDate = col("Date");
  const iLink = col("ShareLink");
  const iText = col("ShareCommentary");
  const iVis = col("Visibility");
  if (iLink < 0) fail(`no ShareLink column (found: ${rows[0].join(", ")})`);

  const posts = readPosts();
  const known = new Set(posts.map((p) => p.id));
  const stats = { added: 0, updated: 0, skipped: 0, existing: 0, failed: 0 };
  const fetchAllowed = !flags["no-fetch"] && !flags["dry-run"];
  let fetched = 0;

  for (const r of rows.slice(1)) {
    const link = r[iLink] ?? "";
    const ref0 = parsePostRef(link);
    if (!ref0) {
      stats.skipped++;
      continue;
    }
    const visibility = iVis >= 0 ? (r[iVis] ?? "").trim() : "";
    if (!flags.all && visibility && !/public|anyone/i.test(visibility)) {
      stats.skipped++;
      continue;
    }
    let text = cleanCommentary(iText >= 0 ? r[iText] : "");
    const csvDate = /^\d{4}-\d{2}-\d{2}/.exec((iDate >= 0 ? r[iDate] : "").trim())?.[0] ?? "";
    const date = csvDate || dateFromId(ref0.id);
    if (flags.since && date && date < flags.since) {
      stats.skipped++;
      continue;
    }
    if (!text && !flags.all) {
      stats.skipped++; // a reshare with no words of your own
      continue;
    }
    if (known.has(ref0.id) && !flags.force) {
      stats.existing++;
      continue;
    }

    let ref = ref0;
    let image = "";
    if (fetchAllowed) {
      if (fetched++ > 0) await new Promise((res) => setTimeout(res, IMPORT_DELAY_MS));
      try {
        const page = await fetchPost(ref0);
        if (ref0.kind !== "activity" && page.activityId) ref = { kind: "activity", id: page.activityId };
        if (!text) text = page.text;
        if (page.image) image = flags["remote-image"] ? page.image : await downloadImage(page.image, ref.id);
      } catch (err) {
        stats.failed++;
        console.warn(`  ${ref0.id}: ${err.message} (kept the CSV text)`);
      }
    }
    if (!text) {
      stats.skipped++;
      continue;
    }
    if (ref.id !== ref0.id && known.has(ref.id) && !flags.force) {
      stats.existing++;
      continue;
    }

    const url = ref.kind === ref0.kind ? canonicalUrl(decodeURIComponent(link), ref) : `https://www.linkedin.com/feed/update/urn:li:activity:${ref.id}/`;
    const e = entry({ url, id: ref.id, date, text, image, kind: ref.kind });
    const at = posts.findIndex((p) => p.id === ref.id || p.id === ref0.id);
    if (flags["dry-run"]) {
      console.log(`${e.date}  ${e.id}  ${preview(e.text, 70)}`);
    } else if (at >= 0) {
      posts.splice(at, 1, e);
      stats.updated++;
    } else {
      posts.push(e);
      stats.added++;
    }
    known.add(ref.id);
    known.add(ref0.id);
  }

  if (!flags["dry-run"]) writePosts(posts);
  console.log(
    `${flags["dry-run"] ? "Dry run. " : ""}Added ${stats.added}, updated ${stats.updated}, already there ${stats.existing}, skipped ${stats.skipped}` +
      (stats.failed ? `, fetch failed ${stats.failed}` : "") +
      ".",
  );
}

function cmdList() {
  const posts = readPosts();
  if (posts.length === 0) return console.log("No LinkedIn posts yet.");
  for (const p of posts) console.log(`${p.date}  ${p.id}${p.image ? "  [img]" : ""}  ${preview(p.text, 70)}`);
}

function cmdRemove(id) {
  if (!id) fail("usage: remove <id>");
  const ref = parsePostRef(id);
  const target = ref?.id ?? id;
  const posts = readPosts();
  const kept = posts.filter((p) => p.id !== target);
  if (kept.length === posts.length) fail(`no post with id ${target}`);
  writePosts(kept);
  for (const f of listImages(target)) fs.rmSync(path.join(IMAGE_DIR, f));
  console.log(`Removed ${target}.`);
}

function preview(text, n) {
  const flat = String(text).replace(/\s+/g, " ").trim();
  return flat.length > n ? `${flat.slice(0, n - 1)}…` : flat;
}

function help() {
  const src = fs.readFileSync(fileURLToPath(import.meta.url), "utf8");
  const block = /\/\* =+\n([\s\S]*?)=+ \*\//.exec(src)?.[1] ?? "";
  console.log(block.replace(/^ {3}/gm, "").trimEnd());
}

/* --- Main ------------------------------------------------------------------------- */

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const [command, ...rest] = process.argv.slice(2);
  const { positional, flags } = parseArgs(rest);
  try {
    switch (command) {
      case "add":
        await cmdAdd(positional[0], flags);
        break;
      case "import":
        await cmdImport(positional[0], flags);
        break;
      case "list":
        cmdList();
        break;
      case "remove":
        cmdRemove(positional[0]);
        break;
      default:
        help();
        if (command && command !== "help" && command !== "--help" && command !== "-h") process.exit(1);
    }
  } catch (err) {
    fail(err?.stack || String(err));
  }
}
