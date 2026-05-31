# Como trabalhar no projeto Fracto

> Harness completo (invariantes, anti-patterns, checklist): [`../AGENTS.md`](../AGENTS.md)

Este repo tem **dois destinos** para o mesmo código 3D:

| Destino | O quê | Onde vive |
|---------|-------|-----------|
| **App Vue** (preview) | Páginas `/v5`, `/v7`, protótipos | `src/` |
| **WordPress** (produção) | Bundles no child theme | `wordpress/themes/Fracto/` |

A cena Three.js tem **uma única fonte**: `src/three/` e `src/lib/`.  
Os packages WordPress só têm *glue* (`index.ts` + `embed.css`).

---

## Estrutura mental

```text
Fracto/
├── src/                              ← EDITA AQUI (cenas 3D)
│   ├── three/
│   │   ├── instancedGridSceneV5.ts   ← grid /v5
│   │   └── MagicCubeScene.ts         ← logo /v7
│   ├── lib/                          ← configs, luz, padrões
│   └── pages/                        ← páginas Vue (layout + UI)
│
├── wordpress/
│   ├── packages/
│   │   ├── background-grid-black/src/
│   │   │   ├── index.ts              ← só glue WP (não editar cena aqui)
│   │   │   └── embed.css
│   │   └── logo-01-black/src/
│   │       ├── index.ts
│   │       └── embed.css
│   └── themes/Fracto/                ← DEPLOY para Hostinger
│       ├── inc/fracto-3d.php         ← shortcodes + WPBakery
│       └── assets/3d/                ← gerado pelo build (não editar)
```

---

## Fluxo do dia a dia

### 1. Desenvolver / preview (Vue)

```bash
npm run dev
```

Abre o browser em `http://localhost:5173` e trabalha nas rotas:

| Rota | O quê testar |
|------|--------------|
| `/v5` | Grid preto do hero (`InstancedGridBackgroundV5`) |
| `/v7` | Isotipo 3D (`MagicCubeScene`) |

**Onde editar:**

- Comportamento da grade → `src/three/instancedGridSceneV5.ts`
- Comportamento do logo → `src/three/MagicCubeScene.ts`
- Cores, luz, defaults → `src/lib/gridLightingV4.ts`, `src/lib/magicCubeConfig.ts`
- Layout da página (texto, botões, seções) → `src/pages/LandingPageV5.vue`, `Page7.vue`

O hot reload atualiza o browser em tempo real. **Não precisas de build para preview.**

---

### 2. Gerar bundles WordPress

Quando a cena estiver como queres e quiseres levar para o WP:

```bash
npm run build:wp
```

Isto compila os dois assets e grava em:

```text
wordpress/themes/Fracto/assets/3d/
├── background-grid-black/
│   ├── background-grid-black.min.js
│   └── background-grid-black.css
└── logo-01-black/
    ├── logo-01-black.min.js
    └── logo-01-black.css
```

**Corre sempre no Mac**, nunca na Hostinger. Demora ~3 segundos.

Build só de um asset:

```bash
npm run build:grid --prefix wordpress   # só o grid
npm run build:logo --prefix wordpress   # só o logo
```

---

### 3. Deploy para Hostinger

Copia a pasta do child theme:

```text
wordpress/themes/Fracto/  →  wp-content/themes/Fracto/
```

Inclui PHP + assets compilados. **Não levas** `src/`, `packages/`, `node_modules/`.

Na Hostinger não precisas de Node, Vite nem alias — só ficheiros estáticos `.js` / `.css`.

---

## O que editar em cada situação

| Quero mudar… | Ficheiro | Depois |
|--------------|----------|--------|
| Movimento / cor dos cubos do grid | `src/three/instancedGridSceneV5.ts` | `npm run dev` → `/v5` → `npm run build:wp` |
| Luz padrão do grid | `src/lib/gridLightingV4.ts` ou defaults em `packages/.../index.ts` | idem |
| Animação do isotipo | `src/three/MagicCubeScene.ts` | `npm run dev` → `/v7` → `npm run build:wp` |
| Cores do cubo (preto/laranja) | `src/lib/magicCubeConfig.ts` | idem |
| Shortcode / WPBakery / enqueue | `wordpress/themes/Fracto/inc/fracto-3d.php` | copiar tema (sem build) |
| Estilos do embed no WP | `packages/*/src/embed.css` | `npm run build:wp` |
| Layout hero Vue (texto, botões) | `src/pages/LandingPageV5.vue` | só `npm run dev` (não afeta WP) |

---

## Regra de ouro

> **Cena 3D → `src/`. Glue WordPress → `packages/*/index.ts`. Produção → `npm run build:wp` → deploy `themes/Fracto/`.**

Nunca copies ficheiros de `src/` para os packages manualmente. O alias `@fracto` faz isso no build.

---

## Comandos rápidos

```bash
npm run dev          # preview Vue (Mac)
npm run build        # build do app Vue (deploy Vercel etc.)
npm run build:wp     # bundles 3D → tema WordPress
```

---

## WordPress no ar

| Shortcode | Asset | HTML |
|-----------|-------|------|
| `[fracto3d_grid]` | `background-grid-black` | `data-fracto-3d="background-grid-black"` |
| `[fracto3d_logo]` | `logo-01-black` | `data-fracto-3d="logo-01-black"` |

Template de demo: **Fracto Showcase** (`template-fracto-showcase.php`).
