# noahfinkelstein.com

A personal site. Next.js, plain CSS, Markdown posts. No UI framework, no CSS
framework, no animation.

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run build && npm start` for the production build.

## Where to change things

Almost everything is a data file under `src/content/`. Editing one is the
normal way to update the site — you should rarely need to open a page.

| To change | Edit |
| --- | --- |
| Name, nav, email, links, **all colors**, column widths | `src/content/site.ts` |
| Home page paragraphs and portrait | `src/content/home.ts` |
| Jobs, research, education | `src/content/experience.ts` |
| Projects | `src/content/projects.ts` |
| Photos | `src/content/photos.ts` |
| A blog post | add a file to `content/blog/` |
| Fonts | `src/app/layout.tsx` (top of the file) |
| Spacing, type scale, anything visual | `src/app/globals.css` |

### Colors

All six of them are in the `theme` block at the bottom of
`src/content/site.ts`. They become CSS variables, so changing one changes it
everywhere. `accent` is the only color with any saturation — it is the link
color and the current-page marker. Swapping it re-skins the site:

```ts
accent: "#7a2233",   // oxblood (current)
accent: "#2a4b8d",   // ink blue
accent: "#1f5c4c",   // deep green
```

Three things do not follow along. `accentDark` is the hover shade, so pick a
step darker than the new accent by hand. `src/app/icon.svg` (the favicon) and
`scripts/og-card.html` (the link-preview card) both have the accent baked in as
a literal — change those to match, and regenerate the favicon and OG image as
described in Notes below.

### Writing a post

Add `content/blog/my-post.mdx`:

```md
---
title: The title, in sentence case
date: 2026-09-14
summary: One line, shown on the blog index.
tags: [math, code]
---

Markdown from here down.
```

It appears at `/blog` automatically, newest first. Files whose names start with
`_` are ignored, so `content/blog/_template.mdx` is a scratch copy you can
work from.

### Adding a photo

```bash
python3 -m pip install --user Pillow   # once
cp ~/Downloads/whatever.jpeg photos-source/
npm run photos
```

That rotates the photo the right way up (phones record rotation in EXIF, which
is why photos sometimes show up sideways on the web), shrinks it to 1800px,
writes it to `public/images/photos/`, and prints a block to paste into
`src/content/photos.ts`.

Originals stay in `photos-source/`, which is outside `public/` — so the 4 MB
version off your phone is never served to anyone, only the ~400 KB copy.

## How it is laid out

Every list on the site — experience, projects, posts — is a "record": a date in
a fixed left column, content to its right. That is the whole layout idea, and
it is one component, `src/components/Record.tsx`. On a narrow screen the date
moves above the title.

```
src/
  app/            one folder per page + globals.css
  components/     Page (header/footer frame) and Record
  content/        ← everything you edit
  lib/blog.ts     reads content/blog/
content/blog/     posts
photos-source/    full-size originals, never served
public/images/photos/  web-sized copies, generated
```

## Deploying

The site is the Vercel project `noahfinkelstein` (team "Noah Finkelstein's
projects"). From this folder, `npx vercel@latest --prod` builds and deploys the
working tree. To have every push deploy itself instead, push to GitHub and run
`npx vercel@latest git connect` once.

`noahfinkelstein.com` and `www.noahfinkelstein.com` are already attached to
the project, with `www` redirecting to the bare domain. The domain itself is
registered at Squarespace, and Squarespace's nameservers answer for it, so DNS
lives in the Squarespace panel: Domains → noahfinkelstein.com → DNS Settings.
Vercel needs exactly these records, and Squarespace's own defaults must go:

| Do                                | Host  | Type  | Value                          |
| --------------------------------- | ----- | ----- | ------------------------------ |
| delete the four Squarespace ones  | `@`   | A     | `198.185.159.144/145`, `198.49.23.144/145` |
| add                               | `@`   | A     | `76.76.21.21`                  |
| delete the Squarespace one        | `www` | CNAME | `ext-sq.squarespace.com`       |
| add                               | `www` | CNAME | `cname.vercel-dns.com`         |
| keep                              | `@`   | TXT   | `v=spf1 -all`                  |

If Vercel's Settings → Domains page shows different values, use those.
`npx vercel@latest domains inspect noahfinkelstein.com` reports when the records
have propagated; HTTPS is issued automatically once they have. `url` in
`src/content/site.ts` must match the primary domain so link previews and
canonical URLs are right.

## Notes

- No résumé is published at the moment. To add one, put the PDF at
  `public/resume.pdf` and add `{ label: "CV", href: "/resume.pdf" }` to
  `links` in `src/content/site.ts`; it then appears in the contact block and
  the footer.
- The experience page is styled to print, so `Cmd-P` on `/experience` gives a
  reasonable CV without the nav or footer.
- `src/app/opengraph-image.png` is the link preview people see when they share
  the site. Its source is `scripts/og-card.html` — edit that, screenshot the
  card at 1200x630, and overwrite the PNG.
- `src/app/favicon.ico` is a rasterised copy of `src/app/icon.svg` for browsers
  and crawlers that still ask for `/favicon.ico`. Regenerate it with
  `python3 scripts/favicon.py` after changing the SVG.
