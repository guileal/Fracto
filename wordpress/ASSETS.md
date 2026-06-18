# Ativos gráficos Fracto — WordPress

Referência para **desenvolvedores** e **editores de conteúdo**. A landing de apresentação (`/home`) mostra o mesmo catálogo com previews e guias de uso.

---

## Resumo

| # | ID | Tipo | Shortcode | Preview Vue |
|---|-----|------|-----------|-------------|
| 1 | `background-grid-black` | 3D fundo | `[fracto3d_grid]` | `/grid-background-black` |
| 2 | `logo-01-black` | 3D objeto | `[fracto3d_logo]` | `/logo-fracto` |
| 3 | `logo-01-light` | 3D objeto | `[fracto3d_logo_light]` | `/logo-fracto-light` |
| 4 | `magic-cube-v8` | 3D objeto | `[fracto3d_magic_cube]` | `/cubo-magico` |
| 5 | `magic-cube-v2` | 3D objeto | `[fracto3d_magic_cube_v2]` | `/cubo-magico-2` |
| 6 | `magic-cube-v8-light` | 3D objeto | `[fracto3d_magic_cube_v8_light]` | `/cubo-magico-light` |
| 7 | `magic-cube-v2-light` | 3D objeto | `[fracto3d_magic_cube_v2_light]` | `/cubo-magico-light-2` |
| 8 | `block-divider` | UI scroll | `[fracto_block_divider]` | `/block-divider` |

**Fonte canónica do catálogo (landing):** `src/lib/wpAssetsCatalog.ts`

---

## Para quem edita o site (WPBakery)

### Onde encontrar

1. **Add Element** → categoria **Fracto Widgets**
2. Ou **fundo de row**: editar row → aba **Background** → **Fracto — Fundo da marca** (só 3D)
3. Ou **classe CSS** na row: aba **Advanced** → **Extra Class Name**

### Regras gerais

- Cada ativo carrega **só o seu bundle** quando aparece na página (performance).
- Widgets 3D de **fundo** e **logo/cubo** podem ser fundo de row; o **divisor de blocos** é sempre um elemento entre duas rows.
- Dropdown de fundo tem **prioridade** sobre classe CSS se ambos estiverem definidos.

---

## Ativos 3D (`assets/3d/`)

Gerados por `npm run build:wp`. Registo em `assets/wp-registry.json`.

### background-grid-black

| Campo | Valor |
|-------|--------|
| WPBakery | Background 3D (Fracto) |
| Classe row | `fracto-background-grid-black` |
| Quando usar | Hero ou row preta com grade interactiva |
| Parâmetros | colunas, linhas, intensidade/cor da luz, low_power |

### logo-01-black / logo-01-light

| | Preto | Claro |
|---|--------|--------|
| Shortcode | `[fracto3d_logo]` | `[fracto3d_logo_light]` |
| Classe row | `fracto-logo-01-black` | `fracto-logo-01-light` |
| Fundo ideal | Claro | Escuro |

### magic-cube-v8 / v2 (+ variantes light)

Cubos narrativos para secções Sobre nós ou manifesto. Layout recomendado: **row 50/50** — texto + canvas 3D.

| ID | Shortcode |
|----|-----------|
| `magic-cube-v8` | `[fracto3d_magic_cube]` |
| `magic-cube-v2` | `[fracto3d_magic_cube_v2]` |
| `magic-cube-v8-light` | `[fracto3d_magic_cube_v8_light]` |
| `magic-cube-v2-light` | `[fracto3d_magic_cube_v2_light]` |

---

## Divisor de blocos (`assets/ui/block-divider/`)

**Não** faz parte do pipeline `fracto3d`. PHP em `inc/fracto-block-divider.php`.

| Campo | Valor |
|-------|--------|
| Shortcode | `[fracto_block_divider variant="default"]` |
| WPBakery | Divisor de blocos (Fracto) |
| Variantes | `default`, `inverted`, `sparse`, `dense` |
| Parâmetros | `variant`, `complete_at` (default `0.4`), `accent_color` |

**Quando usar:** transição entre hero preto e secção branca (como fracto.com.br).

**Onde colocar:** elemento **entre** a row do hero e a primeira row de conteúdo — não como fundo de row.

**Comportamento:** blocos formam com piscar rápido ao scroll; montagem completa aos 40% do percurso até a secção entrar no viewport; reverte ao subir.

**Build:** `npm run build:block-divider` (incluído em `npm run build:wp`).

---

## Para desenvolvedores

### Estrutura no tema

```text
themes/Fracto/
├── inc/
│   ├── fracto-3d.php           ← widgets 3D + registry
│   └── fracto-block-divider.php ← divisor (UI)
├── assets/
│   ├── 3d/<asset-id>/          ← bundles Three.js (~500 KB cada)
│   ├── ui/block-divider/       ← bundle leve (~5 KB)
│   └── wp-registry.json        ← gerado no build
```

### Fluxo de alteração

| Alterar | Onde | Build | Deploy |
|---------|------|-------|--------|
| Cena 3D | `src/three/`, `src/lib/` | `npm run build:wp` | `themes/Fracto/` |
| Divisor | `src/lib/blockDivider/` | `npm run build:wp` | `themes/Fracto/` |
| PHP / shortcodes | `inc/*.php` | — | `themes/Fracto/` |
| Catálogo landing | `src/lib/wpAssetsCatalog.ts` | — | só preview Vue |

### Adicionar novo ativo 3D

1. Cena em `src/three/`
2. `npm run wp:scaffold -- <id> --type grid|logo --route /rota --scene NomeCena`
3. `npm run wp:export -- <id>`
4. `npm run build:wp`
5. Actualizar `src/lib/wpAssetsCatalog.ts` para a landing

### Adicionar ativo UI (sem Three.js)

1. Lógica em `src/lib/`
2. Package em `wordpress/packages/<id>/`
3. PHP dedicado em `inc/`
4. Script em `wordpress/package.json` → `build`
5. Entrada em `wpAssetsCatalog.ts`

### Comandos

```bash
npm run dev              # preview Vue — /home
npm run build:wp         # todos os bundles WP
npm run build:block-divider --prefix wordpress  # só divisor
```

### Hostinger

Deploy **apenas** `wordpress/themes/Fracto/` → `wp-content/themes/Fracto/` (F maiúsculo). Sem Node no servidor.

---

## Ficheiros relacionados

| Ficheiro | Conteúdo |
|----------|----------|
| `AGENTS.md` | Harness do monorepo |
| `wordpress/WORKFLOW.md` | Mac → build → Hostinger |
| `wordpress/wp-assets.catalog.json` | Metadados build 3D |
| `src/lib/wpAssetsCatalog.ts` | Catálogo landing + textos de uso |
