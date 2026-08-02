# Luca Ilari — Photo Portfolio

Portfolio fotografico motorsport. Next.js 15 (App Router), zero database: ogni cartella dentro
`public/` con un `settings.json` diventa una serie pubblicata su `/<nome-cartella>`.

## Sviluppo

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

| Comando | Cosa fa |
|---|---|
| `npm run dev` | Server di sviluppo |
| `npm run build` | Build di produzione |
| `npm start` | Avvia la build di produzione |
| `npm run lint` | ESLint |
| `npm run typecheck` | Controllo dei tipi TypeScript |

## Struttura dell'archivio

```
public/
├── imola-wec/
│   ├── settings.json
│   ├── DSC01229.jpg
│   └── ...
├── monza-2026-07-25/
│   ├── settings.json
│   └── ...
└── _template-album/        cartelle con "_" sono ignorate
    └── settings.json
```

Formati supportati: `.jpg` `.jpeg` `.png` `.webp` `.avif` `.gif`

Per pubblicare un album: crea la cartella, mettici le foto alla massima risoluzione che hai
(le versioni leggere le genera il sito) e aggiungi un `settings.json`. Poi ricarica la pagina,
non serve riavviare niente. Puoi partire da `public/_template-album/settings.json`.

```json
{
  "title": "Monza Historic",
  "preview_image": "DSC01234.jpg",
  "date": "2026-07-25",
  "circuit": "Autodromo Nazionale Monza",
  "blurb": "Descrizione breve, appare sotto il titolo."
}
```

`title`, `preview_image` e `date` sono obbligatori — `date` in formato `YYYY-MM-DD`, ordina gli
album dal più recente. `circuit` e `blurb` sono facoltativi. Le cartelle che iniziano con `_` o `.`,
o senza `settings.json` valido, vengono ignorate; le foto seguono l'ordine alfabetico del nome file
e vengono raddrizzate leggendo l'EXIF.

Le foto **non sono versionate** (`public/` è in `.gitignore`): l'archivio si monta a runtime.

## Docker

L'immagine è costruita senza foto. La cartella con gli album si monta su `/app/public`.

Il Dockerfile imposta `NEXT_OUTPUT=standalone`, che attiva l'output snello di Next. In locale la
variabile non c'è, così `next build` produce l'output normale e `npm start` continua a funzionare
(`next start` non è compatibile con `output: "standalone"`).

```bash
# usa ./public
docker compose up --build

# usa un archivio esterno
PHOTOS_DIR=/mnt/nas/foto-portfolio \
NEXT_PUBLIC_SITE_URL=https://lucailari.photo \
docker compose up --build
```

Oppure con un `.env` accanto al `docker-compose.yml`:

```dotenv
PHOTOS_DIR=/mnt/nas/foto-portfolio
NEXT_PUBLIC_SITE_URL=https://lucailari.photo
```

| Variabile | Default | Cosa fa |
|---|---|---|
| `PHOTOS_DIR` | `./public` | Cartella host montata in sola lettura su `/app/public` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | URL pubblico, usato per canonical, Open Graph e sitemap |

Il volume `image-cache` conserva le versioni ottimizzate delle immagini tra un riavvio e l'altro:
non cancellarlo se non vuoi rigenerarle tutte.

## Come vengono servite le foto

Le immagini passano tutte da `next/image`, quindi il browser riceve AVIF/WebP ridimensionato
sulla misura reale del contenitore, non il JPEG originale:

- **card archivio** `quality` 82 · **griglia galleria** 85 · **strip** 88 · **cover e hero** 90
- **placeholder** — anteprima WebP da 24px generata con `sharp` e incorporata nell'HTML,
  così il layout non salta mai e c'è sempre qualcosa a schermo
- **lightbox** — `quality` 92 con `srcset` fino a 3840px: è qui che arriva l'alta risoluzione,
  con precaricamento della foto precedente e successiva e link al file originale

Solo l'hero si carica subito (~177 KB); le altre 39 immagini della homepage sono lazy.

⚠️ **Se aggiungi un `transform: scale()` a un'immagine, aggiorna anche il suo `sizes`.**
La strip renderizza le foto a `scale(1.16)` per il parallasse: `sizes` dichiara 960px
(non 828px) proprio per compensare, altrimenti il browser scarica una variante troppo
piccola e la ingrandisce, con perdita visibile di nitidezza.

I valori ammessi di `quality` sono nell'allowlist `images.qualities` di `next.config.mjs`:
un valore fuori lista viene rifiutato con 400, non servito male in silenzio.

Dimensioni e orientamento EXIF di ogni foto sono letti una volta sola e tenuti in cache in memoria,
con invalidazione su `mtime` + dimensione del file: sostituisci una foto e riparte da sola.
