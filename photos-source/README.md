# Photo originals

Full-size photos straight off a phone or camera. Nothing in this folder is
served to visitors — it sits outside `public/`, so it never ships with the site.

Drop a new photo here, then:

```bash
npm run photos
```

That rotates it right way up, shrinks it, writes the web copy to
`public/images/photos/`, and prints a block to paste into
`src/content/photos.ts`. The originals stay here untouched, so you can always
regenerate at a different size.
