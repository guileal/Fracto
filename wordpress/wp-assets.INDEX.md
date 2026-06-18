# Índice de assets WordPress

**Activar build:** edite `wp-assets.exports.json` ou use `npm run wp:export -- <id>`.

**Novo asset:** `npm run wp:scaffold -- <id> --type grid|logo --route /rota --scene NomeDaCena [--export]`

| ID | Preview | Tipo | Export |
|----|---------|------|--------|
| `background-grid-black` | `/grid-background-black` | grid | sim |
| `logo-01-black` | `/logo-fracto` | logo | sim |
| `magic-cube-v8` | `/cubo-magico` | logo | sim |

Catálogo completo: `wp-assets.catalog.json`. Build: `npm run build:wp`.
