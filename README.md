# noahfinkelstein.com

A personal site: a torus-knot figure in the hero, projects with real screen
recordings, writing, and a printable CV, in four colour themes.

Next.js 15 (App Router), React 19, TypeScript, plain CSS Modules. three.js
draws the knot and loads lazily, only on the home page, pausing when it is off
screen. No CSS framework, no UI library, no animation library.

```bash
npm install
npm run dev      # http://localhost:3000
```

`npm run build && npm start` for the production build.

## Where to change things

Almost everything is a data file under `src/content/`. Editing one is the
normal way to update the site; you should rarely need to open a component.

| To change | Edit |
| --- | --- |
| Name, email, nav, profile links, résumé switch, theme list | `src/content/site.ts` |
| The hero lede, the figure caption, section headings, About text, portrait | `src/content/home.ts` |
| Projects (rows, media, which three are on the home page) | `src/content/projects.ts` |
| Jobs, research, education (home list and `/experience`) | `src/content/experience.ts` |
| Tool logos under Experience and in the CV | `src/content/skills.ts` |
| Press and features in "Latest" | `src/content/featured.ts` |
| LinkedIn posts in "Latest" and on `/blog` | `npm run linkedin` (writes `src/content/linkedin-posts.json`) |
| A blog post | add a file to `content/blog/` |
| Theme colours and shared tokens (type scale, spacing, widths) | `src/app/globals.css` |
| Fonts | `src/app/layout.tsx` (top of the file) |

Every content file starts with a comment that explains its fields.

### Adding a project

Add one block to `projects` in `src/content/projects.ts` (newest first):

```ts
{
  slug: "my-project",              // media lives in public/projects/my-project/
  title: "My Project",
  date: "Oct 2026",
  status: "Live",                  // one or two words: Live, Open source, Unreleased, Course project
  kind: "Built with a friend",     // optional line that adds something the status does not
  blurb: "What it does, then the one interesting thing about how.",
  stack: ["TypeScript", "Python"], // plain list under the blurb
  links: [{ label: "GitHub", href: "https://github.com/..." }], // first = where the title links
  media: {
    type: "video",
    src: "/projects/my-project/loop.mp4",
    poster: "/projects/my-project/loop-poster.webp",
    alt: "What the recording shows.",
    width: 1600,
    height: 1000,
  },
  featured: true,                  // one of the three on the home page
},
```

- Leave out `links` when there is nothing public; the title is then plain text.
- Leave out `media` and the row shows a plain title tile. Never use a
  mock-up. A still works too: `{ type: "image", src, alt, width, height }`.
- The frame is 16:10 and crops to fill, so 1600×1000 recordings fit exactly.
  Videos are muted loops that play only while on screen (never with reduced
  motion; the poster shows instead). Encode them as H.264 MP4, `yuv420p`,
  limited range, with `+faststart`, and keep each under about 3 MB:

  ```bash
  ffmpeg -i in.mov -vf "scale=1600:-2,format=yuv420p" -c:v libx264 -crf 25 \
    -preset slow -movflags +faststart -an public/projects/my-project/loop.mp4
  ```

  A WebM (`srcWebm`) is optional and only worth it when it is smaller. Avoid
  full-range (`yuvj420p` / `pc`) files: in testing, Chrome intermittently
  failed to decode a full-range VP9 loop, and the row fell back to the poster.
- `featured: true` puts a project in "Projects" on the home page (the first
  three featured, in file order). `hidden: true` keeps it in the file but off
  the site.

### Adding a skill

One line in `src/content/skills.ts`:

```ts
{ name: "Rust", icon: "rust" },
```

`icon` is a [Simple Icons](https://simpleicons.org) slug (lowercase, "." is
"dot", "+" is "plus": `nextdotjs`, `cplusplus`). A slug that does not exist
fails the build, so a typo cannot ship. Logos use their brand colour unless it
is too faint on the theme; `color: "#hex"` overrides it. Only list tools that
appear in `experience.ts` or `projects.ts`.

### Adding a LinkedIn post

```bash
npm run linkedin -- add https://www.linkedin.com/posts/...-activity-7234...
npm run linkedin -- import ~/Downloads/Shares.csv   # a LinkedIn data export
npm run linkedin -- list
npm run linkedin -- remove 7234...
```

`add` fetches the post's public embed page once and stores the text, the date
(decoded from the post id) and the preview image. The image is downloaded to
`public/linkedin/<id>.jpg`, because LinkedIn's image links expire; commit it
with the JSON. The site itself never calls LinkedIn. Posts show in "Latest" on
the home page and on `/blog`, linking out to LinkedIn. Run
`node scripts/linkedin.mjs help` for every option.

"Latest" appears on the home page once there are three or more items (blog
posts, LinkedIn posts and press together); fewer than that and the section is
left out, while `/blog` still lists everything.

### Adding a press item

One block in `src/content/featured.ts`:

```ts
{
  title: "What the piece was called",
  date: "2026-05-01",
  description: "One or two sentences on what it covered.",
  href: "https://the-outlet.com/the-piece",
  source: "WPRI 12",                         // optional
},
```

It joins blog and LinkedIn posts in "Latest", sorted by date.

### Writing a post

Add `content/blog/my-post.mdx`:

```md
---
title: The title, in sentence case
date: 2026-09-14
summary: One line, shown on the Writing page.
tags: [math, code]
---

Markdown from here down.
```

It appears on `/blog` (and in "Latest") automatically, newest first. Files
whose names start with `_` are ignored, so `content/blog/_template.mdx` is a
scratch copy you can work from. While there are no posts at all, "Writing"
is left out of the nav.

### Themes

There are four: Night (the default), Cyan, Terminal and Paper. The switcher is
in the nav (and in the phone menu); the choice is saved in `localStorage` and
applied by a small inline script before the first paint, so there is no
flash. The knot, the scrollbar and every colour re-tint live when it changes.

To add a theme:

1. In `src/app/globals.css`, copy a whole `html[data-theme="…"]` block, give
   it the new id and set every token. Tokens that canvas code reads (`--bg`
   to `--border`, `--scene-*`) must stay plain hex. Text colours (`--fg`,
   `--fg-muted`, `--accent-text`) need 4.5:1 contrast on `--bg`, `--bg-2`
   and `--bg-3`; use `--accent` for fills and lines only.
2. In `src/content/site.ts`, add the id to `ThemeId` and a `themes` entry with
   its label and two swatch colours (keep them in sync with the CSS).

To change the default, set `defaultTheme` in `site.ts`.

### The About portrait

```bash
python3 -m pip install --user Pillow   # once
cp ~/Downloads/whatever.jpeg photos-source/
npm run photos
```

That rotates the photo the right way up, shrinks it to 1800px, writes it to
`public/images/photos/` and prints its path and size for `portrait` in
`src/content/home.ts` (`position` there picks which part stays in frame).
Originals stay in `photos-source/`, outside `public/`, so they are never
served.

## Fonts

Both SIL Open Font License, loaded in `src/app/layout.tsx` through
`next/font/google`, which self-hosts them at build time:

| Face | Used for |
| --- | --- |
| STIX Two Text (with italic) | everything: display, body, navigation |
| JetBrains Mono | dates, years, tag lists, code |

STIX is the typeface of mathematics journals, which is the point.

## How it is laid out

```
src/
  app/
    layout.tsx          fonts, no-flash theme script, navbar, footer, metadata
    globals.css         theme tokens (4 themes), type scale, reset, focus, print
    page.tsx            home: hero, projects, latest, about, experience
    projects/           all projects
    blog/               Writing (blog + LinkedIn) and blog/[slug] posts
    experience/         the printable CV
    not-found.tsx       404
  components/
    hero/               the name, the lede, and the three.js torus knot (Fig. 1)
    sections/           section headers, "Latest", the Writing list
    projects/           project row, media frame and video loop, stack list
    about/              About
    experience/         the experience list, tool chips, print button
    layout/             navbar, footer, page title
    ThemeSwitcher.tsx
  content/              ← everything you edit
  lib/                  theme, feed/blog/icons (server-only), hooks
content/blog/           posts (MDX)
public/projects/<slug>/ project videos and posters
public/linkedin/        LinkedIn preview images (created by npm run linkedin)
scripts/                linkedin.mjs, photos.py, favicon.py, og-card.html + og-image.sh
```

Nothing on the page moves on its own except the knot and the project
recordings, and both stop with `prefers-reduced-motion` (a static knot, the
poster instead of the loop). All content is in the server-rendered HTML, so it
works without JavaScript and for crawlers; without WebGL the figure is a
static drawing of the same knot.

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
| add                               | `@`   | A     | `216.150.1.1`                  |
| add                               | `@`   | A     | `216.150.16.1`                 |
| delete the Squarespace one        | `www` | CNAME | `ext-sq.squarespace.com`       |
| add                               | `www` | CNAME | `cname.vercel-dns.com`         |
| keep                              | `@`   | TXT   | `v=spf1 -all`                  |

Those are the values Vercel recommended on 2026-09-21; the older single
`A @ 76.76.21.21` also works. If the project's Settings → Domains page shows
something different, use what it shows.
`npx vercel@latest domains inspect noahfinkelstein.com` reports when the records
have propagated; HTTPS is issued automatically once they have. `url` in
`src/content/site.ts` must match the primary domain so link previews and
canonical URLs are right.

## Notes

- No résumé is published at the moment. To add one, put the PDF at
  `public/resume.pdf` and set `resume.enabled: true` in `src/content/site.ts`;
  a "Résumé" link then appears in the nav before Contact.
- `/experience` is styled to print, so `Cmd-P` (or its "Print / save as PDF"
  button) gives a black-on-white CV without the nav or footer.
- `src/app/opengraph-image.png` is the link preview people see when they share
  the site. Its source is `scripts/og-card.html`: edit that, then
  `sh scripts/og-image.sh` renders it with headless Chrome and overwrites the
  PNG (or screenshot the card at 1200x630 by hand). Keep
  `src/app/opengraph-image.alt.txt` in step with the words on it.
- `src/app/favicon.ico` is a rasterised copy of `src/app/icon.svg` for browsers
  and crawlers that still ask for `/favicon.ico`. Regenerate it with
  `python3 scripts/favicon.py` after changing the SVG.
- `/photos` from an earlier version redirects to the home page
  (`next.config.mjs`). The same file sets the security headers and a one-day
  browser cache for the videos and photos under `public/`.
- `src/app/layout.tsx` emits schema.org Person structured data (name, domain,
  profiles, affiliation) built from `site.ts` and `home.ts`.
- `NEXT_DIST_DIR=.next-foo npx next dev -p 3001` builds into a separate
  folder, so two dev servers or builds can run side by side.

## Licences

The fonts are SIL Open Font License (STIX Two Text, JetBrains Mono). Brand
logos come from Simple Icons (CC0). Everything else here is mine.
