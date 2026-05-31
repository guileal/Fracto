# Fracto 3D — WordPress

Cada efeito 3D é um **bundle standalone** (IIFE + Three.js embutido).  
A cena Three.js vem de **`src/`** (mesmo código do Vue) via alias `@fracto` no build.

Guia completo de workflow: [`WORKFLOW.md`](./WORKFLOW.md)

## Estrutura

```text
wordpress/
├── WORKFLOW.md
├── package.json
├── packages/
│   ├── vite-shared.ts              # alias @fracto → ../../src
│   ├── background-grid-black/      # glue WP + embed.css
│   └── logo-01-black/
└── themes/Fracto/
    ├── inc/fracto-3d.php
    └── assets/3d/                  # saída do build
```

## Build

```bash
npm run build:wp    # na raiz do repo
```

## Deploy

Copie `themes/Fracto/` → `wp-content/themes/Fracto/` na Hostinger.
