# Packages WordPress

Um diretório por asset 3D. Cada um gera um bundle IIFE standalone em `themes/Fracto/assets/3d/<asset-id>/`.

| Package | Asset | Destino | Origem Vue |
|---------|-------|---------|------------|
| [`background-grid-black/`](./background-grid-black/) | Grade preta do hero | `themes/Fracto/assets/3d/` | `/v5` |
| [`logo-01-black/`](./logo-01-black/) | Isotipo animado | `themes/Fracto/assets/3d/` | `/v7` |
| [`magic-cube/`](./magic-cube/) | Isotipo animado (uploads) | `uploads/fracto-3d/magic-cube/` | `/v7` |

Build de todos: `npm run build:wp` na raiz do repo. Só o embed uploads: `npm run build:magic-cube --prefix wordpress`.
