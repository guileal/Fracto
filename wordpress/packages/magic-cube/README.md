# Asset: `magic-cube`

Isotipo 3D animado da landing v7 (7 cubos, materiais aprovados baked in). Build isolado.

## Build

```bash
cd wordpress/packages/magic-cube
npm install
npm run build
```

Saída: `wordpress/uploads/fracto-3d/magic-cube/`

## WordPress

```php
$base = content_url('/uploads/fracto-3d/magic-cube');
wp_enqueue_style('fracto-3d-magic-cube', $base . '/magic-cube.css', [], '1.0.0');
wp_enqueue_script('fracto-3d-magic-cube', $base . '/magic-cube.min.js', [], '1.0.0', true);
```

WPBakery — bloco **Raw HTML** na coluna do isotipo (ou seção 50/50):

```html
<div data-fracto-3d="magic-cube" aria-hidden="true"></div>
```

A seção precisa de altura definida (ex. `min-height: 70vh` na row). O script cria o `<canvas>` dentro do div.

API: `window.Fracto3d.magicCube` (ou `Fracto3d.assets['magic-cube']`).

Defaults baked (v7): bevel `0.020`, cubos `#000000`, destaque `#f72f00`, materiais físicos conforme `src/lib/magicCubeConfig.ts`.
