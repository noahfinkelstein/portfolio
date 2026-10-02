# noahfinkelstein.com

A personal site set like a short paper: a trefoil-knot figure in the front
matter, projects with real screen recordings, writing, and a printable CV, in
a light theme (paper) and a dark one (night).

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
| Name, email, running head links, profile links, theme list | `src/content/site.ts` |
| The lede, the Fig. 1 caption, section headings (Work, Writing), the intro paragraphs, the portrait (Fig. 2) | `src/content/home.ts` |
| Projects (rows, media, which three are in "Work" on the home page) | `src/content/projects.ts` |
| Jobs, research, education (the CV at `/cv`) | `src/content/experience.ts` |
| The CV's "Technical" section | `src/content/skills.ts` |
| The CV's "Press" section | `src/content/press.ts` |
| LinkedIn posts on `/blog` | `npm run linkedin` (writes `src/content/linkedin-posts.json`) |
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
  blurb: "What it does, then the one interesting thing about how.",
  stack: ["TypeScript", "Python"], // ends the blurb as "Built with TypeScript and Python."
  links: [{ label: "GitHub", href: "https://github.com/..." }], // first = where the title links
  media: {
    type: "video",
    src: "/projects/my-project/loop.mp4",
    poster: "/projects/my-project/loop-poster.webp",
    alt: "What the recording shows.",
    width: 1600,                   // the poster's real pixel size
    height: 1000,
    caption: "Optional line under the figure.",
  },
  featured: true,                  // one of the three in "Work" on the home page
},
```

- Each row has the date and the status (set lowercase and italic) in the
  margin column, then the title, the blurb and the figure.
- Leave out `links` when there is nothing public; the title is then plain text.
- Leave out `media` and the row has no figure. Never use a mock-up. A still
  works too: `{ type: "image", src, alt, width, height }`.
- Nothing is cropped: each figure keeps the aspect ratio of its `width` and
  `height`, so give the file's real pixel size
  (`sips -g pixelWidth -g pixelHeight file.webp`). Videos are muted loops that play only while on screen (never with reduced
  motion; the poster shows instead). Encode them as H.264 MP4, `yuv420p`,
  limited range, with `+faststart`, and keep each under about 3 MB:

  ```bash
  ffmpeg -i in.mov -vf "scale=1600:-2,format=yuv420p" -c:v libx264 -crf 25 \
    -preset slow -movflags +faststart -an public/projects/my-project/loop.mp4
  ```

  A WebM (`srcWebm`) is optional and only worth it when it is smaller. Avoid
  full-range (`yuvj420p` / `pc`) files: in testing, Chrome intermittently
  failed to decode a full-range VP9 loop, and the row fell back to the poster.
- `featured: true` puts a project in "Work" on the home page (the first
  three featured, in file order). `hidden: true` keeps it in the file but off
  the site.

### Adding a skill

`src/content/skills.ts` is a list of categories, each one row of the CV's
"Technical" section: the label in the margin column, the items after it as one
sentence ("Python, TypeScript, C++, R and Swift.").

```ts
{ label: "Languages", items: ["Python", "TypeScript", "C++", "R", "Swift", "Rust"] },
```

Add a tool to the right `items` list, or a new block for a new category. Only
list tools that appear in `experience.ts` or `projects.ts`.

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
with the JSON. The site itself never calls LinkedIn. Posts show on `/blog`
next to the blog posts, linking out to LinkedIn. Run
`node scripts/linkedin.mjs help` for every option.

### Adding a press item

One block in `src/content/press.ts`:

```ts
{
  outlet: "WPRI 12",
  title: "What the piece was called",
  date: "2026-05-01",
  url: "https://the-outlet.com/the-piece",
  note: "One sentence on what it covered.",   // optional
},
```

Press shows only in the CV's "Press" section, newest first; the section is
left out while the list is empty.

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

It appears on `/blog` and in the "Writing" section of the home page
automatically, newest first. Files whose names start with `_` are ignored, so
`content/blog/_template.mdx` is a scratch copy you can work from. While there
are no posts at all, "Writing" is left out of the running head and the home
page.

### Themes

There are two: Paper (off-white page, dark ink, oxblood links) and Night
(navy page, amber accent). Paper is the default and what the page shows
without JavaScript; a first-time visitor whose system prefers dark gets Night.
The running head ends with a text button that reads "Dark" on Paper and
"Light" on Night. A choice is saved in `localStorage` and applied by a small
inline script before the first paint, so there is no flash; until a visitor
picks, the site follows the system setting. The knot and every colour re-tint
live when it changes.

The colours are in `src/app/globals.css`: Paper on `:root,
html[data-theme="paper"]`, Night on `html[data-theme="night"]`. Tokens that
canvas code reads (`--bg` to `--border`, `--scene-wire`) must stay plain hex.
Text colours (`--fg`, `--fg-muted`, `--accent-text`) need 4.5:1 contrast on
`--bg`, `--bg-2` and `--bg-3`; use `--accent` for fills and lines only.
`--scene-wire` is the knot's ink. The theme ids are in `src/content/site.ts`
(`themes`, `defaultTheme`, `darkTheme`); each theme's `label` is the word the
button shows when it offers that theme.

### The portrait (Fig. 2)

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
| JetBrains Mono | dates, years, the CV's margin labels, code |

STIX is the typeface of mathematics journals, which is the point.

## How it is laid out

```
src/
  app/
    layout.tsx          fonts, no-flash theme script, running head, footer, metadata
    globals.css         theme tokens (paper, night), type scale, reset, focus, print
    page.tsx            home: front matter (hero), Work, Writing
    projects/           Work: every project
    blog/               Writing (blog + LinkedIn) and blog/[slug] posts
    cv/                 the printable CV
    not-found.tsx       404
  components/
    hero/               the front matter: name, lede, intro, links, portrait
                        (Fig. 2) and the three.js trefoil (Fig. 1)
    sections/           section headers, the home Writing list, the /blog list
    projects/           project row, media figure and video loop
    experience/         the CV's role rows and print button
    layout/             running head, colophon footer, page title
    ThemeToggle.tsx     the Dark / Light button
  content/              ← everything you edit
  lib/                  theme, feed/blog (server-only), hooks
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

- The running head is Work (`/#work`), Writing (`/blog`, only when there are
  posts) and CV (`/cv`), then the theme button. It sits at the top of the
  page, not fixed, and wraps under the name on narrow screens.
- `/cv` is styled to print, so `Cmd-P` (or its "Print / save as PDF" button)
  gives a black-on-white CV without the running head, footer or theme button.
  `/experience` redirects there.
- `src/app/opengraph-image.png` is the link preview people see when they share
  the site. Its source is `scripts/og-card.html`: edit that, then
  `sh scripts/og-image.sh` renders it with headless Chrome and overwrites the
  PNG (or screenshot the card at 1200x630 by hand). Keep
  `src/app/opengraph-image.alt.txt` in step with the words on it.
- `src/app/favicon.ico` is a rasterised copy of `src/app/icon.svg` for browsers
  and crawlers that still ask for `/favicon.ico`. Regenerate it with
  `python3 scripts/favicon.py` after changing the SVG.
- `/photos` redirects to the home page and `/experience` to `/cv`
  (`next.config.mjs`). The same file sets the security headers and a one-day
  browser cache for the videos and photos under `public/`.
- `src/app/layout.tsx` emits schema.org Person structured data (name, domain,
  profiles, affiliation) built from `site.ts` and `home.ts`.
- `NEXT_DIST_DIR=.next-foo npx next dev -p 3001` builds into a separate
  folder, so two dev servers or builds can run side by side.

## Licences

The fonts are SIL Open Font License (STIX Two Text, JetBrains Mono).
Everything else here is mine.
