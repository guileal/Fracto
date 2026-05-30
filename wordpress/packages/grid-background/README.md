# Asset: `grid-background`

Fundo de quadrados da landing v5 (InstancedMesh + mouse). Build isolado — não mistura com outros assets.

## Build

```bash
cd wordpress/packages/grid-background
npm install
npm run build
```

Saída: `wordpress/uploads/fracto-3d/grid-background/`

## WordPress

```php
$base = content_url('/uploads/fracto-3d/grid-background');
wp_enqueue_style('fracto-3d-grid-background', $base . '/grid-background.css', [], '1.0.0');
wp_enqueue_script('fracto-3d-grid-background', $base . '/grid-background.min.js', [], '1.0.0', true);
```

WPBakery — bloco **Raw HTML** (primeiro na linha da seção):

```html
<div
  data-fracto-3d="grid-background"
  data-cols="15"
  data-rows="15"
  data-light-intensity="0.5"
  data-low-power="true"
  aria-hidden="true"
></div>
```

Linha da seção: `position: relative`. Conteúdo acima: `z-index: 1` (WPBakery costuma fazer sozinho).

API: `window.Fracto3d.gridBackground` (ou `Fracto3d.assets['grid-background']`).
