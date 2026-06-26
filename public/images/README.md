# Images

Put your photos in this folder, then reference them by path (the part after
`/public`). For example, a file at `public/images/me.jpg` is referenced in code
as `/images/me.jpg`.

## Suggested structure

- `me.jpg` — your portrait (used in the About section). Set `PORTRAIT_SRC` in
  `src/components/sections/About.tsx`.
- `projects/` — project screenshots. Reference in `src/config/projects.ts`,
  e.g. `image: "/images/projects/my-app.png"`.
- `experience/` — photos for a job/role. Reference in
  `src/config/experience.ts`, e.g. `photos: ["/images/experience/lab.jpg"]`.
- `gallery/` — general photos. Reference in `src/config/gallery.ts`,
  e.g. `src: "/images/gallery/trip.jpg"`.
- `blog/` — images used inside blog posts, e.g. `![caption](/images/blog/x.png)`.

## Tips

- Any spot that expects a photo shows a tasteful placeholder until you add one,
  so the site always looks complete.
- Good formats: `.jpg` for photos, `.png` for screenshots, `.webp` for smaller
  files. Next.js optimizes them automatically.
