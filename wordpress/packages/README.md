# Packages WordPress

Glue por asset (`src/index.ts` + `embed.css`). **Catálogo e exports:** `wp-assets.catalog.json` + `wp-assets.exports.json` (índice humano: `wp-assets.INDEX.md`).

```bash
npm run wp:list                              # ver catálogo
npm run wp:scaffold -- <id> --type logo --route /x --scene Nome [--export]
npm run wp:export -- <id>                    # activar na build WP
npm run build:wp                             # compilar + wp-registry.json
```

| Package | Asset | Preview |
|---------|-------|---------|
| [`background-grid-black/`](./background-grid-black/) | Grade preta | `/grid-background-black` |
| [`background-grid-light/`](./background-grid-light/) | Grade clara | `/grid-background-white` |
| [`logo-01-black/`](./logo-01-black/) | Isotipo | `/logo-fracto` |

Novos assets: entrada no catálogo do manifesto → pasta `packages/<id>/` → incluir em `exports`.
