import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { build } from 'vite'
import { loadManifest, wordpressDir } from './manifest.mjs'
import { createAssetViteConfig } from './vite-asset-config.mjs'

function parseOnlyFlag() {
  const idx = process.argv.indexOf('--only')
  if (idx === -1 || !process.argv[idx + 1]) return null
  return process.argv[idx + 1]
}

function buildRegistry(exports) {
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    assets: exports.map((asset) => ({
      id: asset.id,
      label: asset.label,
      description: asset.description ?? '',
      previewRoute: asset.previewRoute ?? '',
      type: asset.type,
      shortcode: asset.shortcode,
      vcName: asset.vcName,
      rowClass: asset.rowClass,
      gridOptions: asset.gridOptions ?? [],
    })),
  }
}

async function main() {
  const only = parseOnlyFlag()
  let { exports } = loadManifest()

  if (only) {
    exports = exports.filter((asset) => asset.id === only)
    if (exports.length === 0) {
      throw new Error(`Asset "${only}" não está em exports do manifesto.`)
    }
  }

  const registryPath = resolve(wordpressDir, 'themes/Fracto/assets/wp-registry.json')

  console.log(`[fracto] Building ${exports.length} asset(s) from wp-assets.manifest.jsonc`)

  for (const asset of exports) {
    console.log(`  → ${asset.id}`)
    await build(createAssetViteConfig(asset))
  }

  if (!only) {
    const registry = buildRegistry(loadManifest().exports)
    writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`)
    console.log(`[fracto] Registry: themes/Fracto/assets/wp-registry.json`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
