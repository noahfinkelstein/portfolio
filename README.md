# Noah Finkelstein — Personal Site

A fast, fully-customizable personal portfolio + blog built with **Next.js**,
**Tailwind CSS**, and **MDX**. Everything you'll commonly want to change lives in
a handful of clearly-commented files — no need to dig through the whole codebase.

---

## Quick start

```bash
npm install      # one time
npm run dev      # start the local dev server
```

Then open **http://localhost:3000**. Edits save and refresh instantly.

To build for production: `npm run build`, then `npm start`.

---

## 🗺️ Where to change things (the important part)

| I want to change... | Edit this file |
| --- | --- |
| **Colors / accent color** | `src/config/theme.config.ts` |
| **Fonts** | `src/app/layout.tsx` (top of file — instructions inline) |
| **Your name, tagline, social links, nav menu** | `src/config/site.config.ts` |
| **About-me text + portrait** | `src/components/sections/About.tsx` |
| **Projects** | `src/config/projects.ts` |
| **Experience / work history** | `src/config/experience.ts` |
| **Photo gallery** | `src/config/gallery.ts` |
| **Blog posts** | add `.mdx` files in `content/blog/` |
| **The animated background** | `src/components/ParticleNetwork.tsx` (tune the `CONFIG` block) |

> Tip: search the codebase for `★` — the most-edited spots are marked.

---

## 🎨 Re-skinning in 10 seconds

Open `src/config/theme.config.ts` and change `accent` to any hex color. That one
value flows through links, buttons, highlights, and the particle network.

Want a different whole vibe? The bottom of that file has ready-made **PRESETS**
(Light & minimal, Terminal/hacker, Cyan tech) — copy one over the `colors` block.

---

## ✍️ Writing a blog post

1. Create a file in `content/blog/`, e.g. `content/blog/my-post.mdx`.
2. Start it with frontmatter:

   ```md
   ---
   title: My Post Title
   date: 2026-07-01
   summary: One line shown in the post list.
   tags: [code, life]
   ---

   Write your post in Markdown here.
   ```

3. Done — it appears automatically at `/blog`.

You can write plain Markdown, embed images (`![alt](/images/blog/pic.png)`), and
because it's MDX you can even use React components inside posts later.

---

## 🖼️ Adding photos

Drop images anywhere under `public/images/` and reference them by path
(see `public/images/README.md`). Every photo slot shows a clean placeholder
until you add a real image, so the site always looks finished.

- **Portrait:** `public/images/me.jpg` → set `PORTRAIT_SRC` in `About.tsx`.
- **Project images:** set `image` in `src/config/projects.ts`.
- **Experience photos:** set `photos` in `src/config/experience.ts`.
- **Gallery:** add entries in `src/config/gallery.ts`.

---

## 🧩 Project structure

```
content/blog/            ← your blog posts (.mdx)
public/images/           ← your photos
src/
  app/                   ← pages (home, /blog, /gallery) + layout
  components/
    sections/            ← the home-page sections (Hero, About, ...)
    ParticleNetwork.tsx  ← the animated background
    SmartImage.tsx       ← image-with-placeholder helper
  config/                ← ★ all your editable content + theme
  lib/blog.ts            ← reads the blog posts
```

---

## 🚀 Deploying (free)

The easiest host is **Vercel**:

1. Push this folder to a new GitHub repo.
2. Go to [vercel.com](https://vercel.com), "Add New Project", import the repo.
3. Click Deploy. That's it — every `git push` auto-deploys.

To use a custom domain (e.g. `noahfinkelstein.com`), add it in the Vercel
project's Domains settings and point your domain's DNS at Vercel.

After deploying, update `url` in `src/config/site.config.ts` to your real domain
so social-share previews and SEO use the correct address.

---

## Notes

- Built from scratch with Next.js App Router + TypeScript.
- Respects "reduce motion" OS settings (animations calm down automatically).
- Mobile-friendly, with a hamburger menu on small screens.
