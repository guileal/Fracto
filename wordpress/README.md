# Fracto 3D — WordPress

Cada efeito 3D é um **asset separado**: código e bundle próprios, pasta própria no upload.

## Estrutura

```text
wordpress/
├── packages/                    # código-fonte + build (no Mac)
│   ├── grid-background/         # fundo de quadrados v5
│   └── magic-cube/              # isotipo 3D animado (/v7)
└── uploads/fracto-3d/           # subir para o servidor
    ├── README.md
    ├── grid-background/
    └── magic-cube/
```

No Hostinger:

```text
wp-content/uploads/fracto-3d/
├── grid-background/
└── magic-cube/         ← uma pasta por asset
```

**Por que separado?** Cada `.min.js` traz Three.js (~500 KB). No WP você enfileira só o asset da página — não um bundle gigante com tudo.

## Novo asset no futuro

1. Copie `packages/grid-background/` como modelo → `packages/meu-asset/`
2. Ajuste `vite.config.ts` (`assetId` e pasta de saída)
3. `npm run build` → gera `uploads/fracto-3d/meu-asset/`
4. Enfileire só esse JS/CSS no WordPress

## Build

```bash
cd wordpress/packages/grid-background && npm run build
cd wordpress/packages/magic-cube && npm run build
```

Detalhes: [`packages/grid-background/README.md`](./packages/grid-background/README.md), [`packages/magic-cube/README.md`](./packages/magic-cube/README.md)
