# Fracto — Agent Harness

> **Leia isto antes de qualquer alteração.** Este ficheiro é a fonte canónica de contexto do projeto.
> Regras Cursor em `.cursor/rules/` espelham e reforçam estes invariantes.

---

## 1. Missão do projeto

Fracto é um **monorepo híbrido**:

1. **App Vue + Three.js** — protótipos e preview local de landing pages (`/v5`, `/v7`, etc.).
2. **Child theme WordPress (`Fracto`)** — produção na Hostinger com assets 3D standalone via WPBakery.

O mesmo código 3D alimenta **preview (Vue)** e **produção (WordPress)**. Não são dois projetos separados.

---

## 2. Invariantes (NUNCA violar)

| # | Invariante |
|---|------------|
| I1 | **Fonte única 3D:** cenas em `src/three/` e configs em `src/lib/`. Packages WP **não duplicam** cenas. |
| I2 | **Alias `@fracto`:** packages WP importam de `../../src` via Vite. Alias só existe no **build local**. |
| I3 | **Deploy WP:** só `wordpress/themes/Fracto/` vai para Hostinger. Nunca `src/`, `packages/`, `node_modules/`. |
| I4 | **Tema na Hostinger:** pasta **`Fracto`** (F maiúsculo) em `wp-content/themes/Fracto/`. |
| I5 | **Assets no child theme:** `themes/Fracto/assets/3d/` — **não** `wp-content/uploads/`. |
| I6 | **Bundles standalone:** cada asset é IIFE + Three.js embutido (~500 KB). WP enfileira só o da página. |
| I7 | **Carregamento sob demanda:** JS/CSS registados em `wp_register_*`, enfileirados só no shortcode. |
| I8 | **`npm run dev` ≠ WordPress:** dev é preview Vue. WP usa `npm run build:wp`. |
| I9 | **Não criar Page Template duplicado:** já existe `template-fracto-showcase.php` — atualizar, não recriar. |
| I10 | **Packages WP = glue only:** cada package tem só `index.ts` + `embed.css`. |

---

## 3. Mapa de contexto (onde vive o quê)

```text
Fracto/
├── AGENTS.md                         ← ESTE FICHEIRO (harness)
├── src/
│   ├── three/                        ← CENAS 3D (fonte única)
│   │   ├── instancedGridSceneV5.ts   ← grid hero
│   │   └── FractoLogoScene.ts         ← isotipo / logo
│   ├── lib/                          ← configs partilhadas (luz, cores, grid)
│   ├── pages/                        ← layouts Vue (NÃO vão para WP)
│   └── components/                   ← wrappers Vue (lifecycle, props, UI)
│
├── wordpress/
│   ├── WORKFLOW.md                   ← fluxo detalhado Mac → Hostinger
│   ├── package.json                  ← build: ambos os assets
│   ├── packages/
│   │   ├── vite-shared.ts            ← alias @fracto → ../../src
│   │   ├── background-grid-black/    ← glue WP (grid /v5)
│   │   └── logo-01-black/            ← glue WP (logo /v7)
│   └── themes/Fracto/                ← DEPLOY Hostinger
│       ├── functions.php             ← require inc/fracto-3d.php
│       ├── inc/fracto-3d.php         ← shortcodes + WPBakery + enqueue
│       ├── template-fracto-showcase.php
│       └── assets/3d/                ← GERADO (não editar manualmente)
```

---

## 4. Registo de assets 3D

| ID asset | Origem Vue | Package glue | Shortcode | `data-fracto-3d` |
|----------|------------|--------------|-----------|------------------|
| `background-grid-black` | `/v5` hero — `InstancedGridBackgroundV5` | `packages/background-grid-black/` | `[fracto3d_grid]` ou Row → Grid preto | `background-grid-black` |
| `logo-01-black` | `/v7` — `MagicCubeScene` | `packages/logo-01-black/` | `[fracto3d_logo]` ou Row → Logo 3D | `logo-01-black` |

**Defaults baked (grid):** 16×12, luz `#c4d0e8` @ 0.10, fundo `#000`.  
**Defaults baked (logo):** cubo `#000000`, accent `#f72f00` (`DEFAULT_FRACTO_LOGO_CONFIG`).

**Ficheiros gerados por asset:**

```text
assets/3d/<asset-id>/
├── <asset-id>.min.js
├── <asset-id>.css
└── <asset-id>.min.js.map
```

---

## 5. Golden paths (workflows)

### A. Alterar comportamento 3D (grid ou logo)

1. Editar `src/three/` e/ou `src/lib/`
2. `npm run dev` → testar `/v5` ou `/v7`
3. `npm run build:wp`
4. Deploy `wordpress/themes/Fracto/` → Hostinger

### B. Alterar só PHP / shortcode / WPBakery

1. Editar `wordpress/themes/Fracto/inc/fracto-3d.php`
2. Deploy tema (sem build)

### C. Alterar estilos do embed WP

1. Editar `wordpress/packages/*/src/embed.css`
2. `npm run build:wp`
3. Deploy tema

### C2. Fundo da marca na Row (Salient)

**Plano A — dropdown (aba Background):** `Fracto — Fundo da marca` → Grid preto / Logo 3D.

**Plano B — classe CSS (aba Advanced → Extra Class Name):**

| Classe na row | Asset |
|---------------|-------|
| `fracto-background-grid-black` | Grid /v5 |
| `fracto-logo-01-black` | Logo /v7 |

Deixe o dropdown em "Nenhum" e use só a classe. Dropdown tem prioridade se ambos estiverem definidos.

PHP: `inc/fracto-row-background.php`

### D. Alterar layout Vue (texto, botões, seções)

1. Editar `src/pages/*.vue`
2. `npm run dev` — **não afeta WordPress**

### E. Novo asset 3D no futuro

1. Copiar `packages/background-grid-black/` como modelo
2. Novo `assetId` em `vite.config.ts` + `index.ts`
3. Registar em `inc/fracto-3d.php` + `wordpress/package.json`
4. Cena nova em `src/three/` (fonte única)

---

## 6. Comandos

| Comando | Onde | Propósito |
|---------|------|-----------|
| `npm run dev` | raiz | Preview Vue (hot reload) |
| `npm run build` | raiz | Build app Vue (Vercel etc.) |
| `npm run build:wp` | raiz | Compila assets 3D → `themes/Fracto/assets/3d/` |
| `npm run build:grid --prefix wordpress` | raiz | Só grid |
| `npm run build:logo --prefix wordpress` | raiz | Só logo |

**Hostinger:** sem Node, sem Vite, sem alias. Só PHP + `.min.js` + `.css`.

---

## 7. Stack WordPress (produção)

- **Tema pai:** Salient
- **Child theme:** `Fracto`
- **Page builder:** WPBakery Page Builder
- **Dependências WP:** WPBakery activo + child theme activo + `functions.php` a carregar `inc/fracto-3d.php`

---

## 8. Anti-patterns (não fazer)

- Duplicar ficheiros de `src/three/` ou `src/lib/` dentro de `packages/`
- Apontar assets para `wp-content/uploads/fracto-3d/` (legado — abandonado)
- Renomear pasta do tema para `fracto` minúsculo na Hostinger
- Correr `npm run dev` esperando gerar bundles WP
- Editar `assets/3d/*.min.js` manualmente
- Criar segundo template showcase
- Bundle único com todos os assets (cada um traz Three.js — enfileirar só o necessário)
- Commitar secrets (.env, credenciais Hostinger)

---

## 9. Checklist do agente (antes de entregar)

- [ ] Cena 3D alterada **só** em `src/` (não copiada para packages)?
- [ ] Se mudou 3D: `npm run build:wp` correu sem erro?
- [ ] Se mudou PHP: paths usam `get_stylesheet_directory_uri()` + `assets/3d/`?
- [ ] Shortcodes mantêm carregamento sob demanda?
- [ ] Não criei ficheiros/docs não pedidos?
- [ ] Deploy descrito como `themes/Fracto/` (F maiúsculo)?

---

## 10. Documentação relacionada

| Ficheiro | Conteúdo |
|----------|----------|
| `wordpress/WORKFLOW.md` | Fluxo Mac → build → Hostinger (detalhado) |
| `wordpress/README.md` | Estrutura WP + build |
| `.cursor/rules/fracto-*.mdc` | Regras Cursor por domínio |

---

## 11. Glossário

| Termo | Significado |
|-------|-------------|
| **Harness** | Conjunto fixo de invariantes e workflows deste doc |
| **Glue WP** | `index.ts` + `embed.css` — liga DOM/shortcode à cena |
| **Asset standalone** | Bundle IIFE autocontido para uma página WP |
| **Fonte única** | `src/three/` + `src/lib/` — zero duplicação nos packages |
| **Preview** | App Vue local (`npm run dev`) |
| **Produção WP** | Child theme na Hostinger com bundles compilados |
