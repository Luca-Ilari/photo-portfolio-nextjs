# Luca Ilari — Photo Portfolio

Motorsport photography portfolio. Next.js 15 (App Router), no database: every folder inside
`public/` that contains a `settings.json` becomes a series published at `/<folder-name>`.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript type checking |

## Archive structure

```
public/
├── imola-wec/
│   ├── settings.json
│   ├── DSC01229.jpg
│   └── ...
├── monza-2026-07-25/
│   ├── settings.json
│   └── ...
└── _template-album/        folders starting with "_" are ignored
    └── settings.json
```

Supported formats: `.jpg` `.jpeg` `.png` `.webp` `.avif` `.gif`

To publish an album: create the folder, drop in the photos at the highest resolution you have
(the site generates the lightweight versions itself) and add a `settings.json`. Then reload the
page — nothing needs restarting. You can start from `public/_template-album/settings.json`.

```json
{
  "title": "Monza Historic",
  "preview_image": "DSC01234.jpg",
  "date": "2026-07-25",
  "circuit": "Autodromo Nazionale Monza",
  "blurb": "Short description, shown under the title."
}
```

`title`, `preview_image` and `date` are required — `date` in `YYYY-MM-DD` format, it sorts albums
newest first. `circuit` and `blurb` are optional. Folders starting with `_` or `.`, or without a
valid `settings.json`, are ignored; photos follow the alphabetical order of their filename and are
straightened automatically by reading the EXIF orientation.

Photos are **not versioned** (`public/` is in `.gitignore`): the archive is mounted at runtime.

## Docker

The image is built without photos. The album folder is mounted at `/app/public`.

The Dockerfile sets `NEXT_OUTPUT=standalone`, which enables Next's slim output. Locally that
variable is absent, so `next build` produces the normal output and `npm start` keeps working
(`next start` is not compatible with `output: "standalone"`).

```bash
# use ./public
docker compose up --build

# use an external archive
PHOTOS_DIR=/mnt/nas/photo-portfolio \
NEXT_PUBLIC_SITE_URL=https://lucailari.photo \
docker compose up --build
```

Or with a `.env` file next to `docker-compose.yml`:

```dotenv
PHOTOS_DIR=/mnt/nas/photo-portfolio
NEXT_PUBLIC_SITE_URL=https://lucailari.photo
```

| Variable | Default | What it does |
|---|---|---|
| `PHOTOS_DIR` | `./public` | Host folder mounted read-only at `/app/public` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public URL, used for canonical, Open Graph and sitemap |

The `image-cache` volume keeps the optimized image variants between restarts: don't delete it
unless you want them all regenerated.

## How photos are served

Every image goes through `next/image`, so the browser receives resized AVIF/WebP matching the
real size of its container, never the original JPEG:

- **archive cards** `quality` 82 · **gallery grid** 85 · **strip** 88 · **cover and hero** 90
- **placeholder** — a 24px WebP preview generated with `sharp` and inlined into the HTML, so the
  layout never shifts and there is always something on screen
- **lightbox** — `quality` 92 with an `srcset` up to 3840px: this is where the high resolution
  lands, with the previous and next photo preloaded and a link to the original file

Only the hero loads immediately (~177 KB); the other 39 images on the home page are lazy.

⚠️ **If you add a `transform: scale()` to an image, update its `sizes` too.**
The strip renders photos at `scale(1.16)` for the parallax effect: `sizes` declares 960px
(not 828px) precisely to compensate, otherwise the browser downloads a variant that is too small
and scales it up, with a visible loss of sharpness.

Allowed `quality` values live in the `images.qualities` allowlist in `next.config.mjs`: a value
outside that list is rejected with a 400 rather than silently served badly.

Image dimensions and EXIF orientation are read once and cached in memory, invalidated on file
`mtime` + size: replace a photo and it picks the change up on its own.
