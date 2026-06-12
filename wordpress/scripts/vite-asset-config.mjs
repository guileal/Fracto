import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { wordpressDir } from './manifest.mjs'

const repoSrc = resolve(wordpressDir, '../src')
const fractoAlias = { '@fracto': repoSrc }

export function createAssetViteConfig(asset) {
  const assetId = asset.id
  const packageDir = resolve(wordpressDir, asset.packageDir)
  const themeAssetsDir = resolve(wordpressDir, `themes/Fracto/assets/3d/${assetId}`)

  return defineConfig({
    resolve: {
      alias: fractoAlias,
    },
    build: {
      outDir: themeAssetsDir,
      emptyOutDir: true,
      lib: {
        entry: resolve(packageDir, 'src/index.ts'),
        name: asset.iifeName,
        formats: ['iife'],
        fileName: () => `${assetId}.min.js`,
        cssFileName: assetId,
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
          assetFileNames: `${assetId}[extname]`,
        },
      },
      cssCodeSplit: false,
      cssFileName: assetId,
      minify: 'esbuild',
      sourcemap: true,
    },
  })
}
